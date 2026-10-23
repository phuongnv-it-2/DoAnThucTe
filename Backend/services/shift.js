const { Op } = require("sequelize");
const { sequelize, Shift, ShiftAssignment, Employee, User } = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

const SHIFT_TYPES = {
    MORNING: { name: "Ca sáng", start: "06:30", end: "12:00" },
    AFTERNOON: { name: "Ca chiều", start: "12:00", end: "17:00" },
    EVENING: { name: "Ca tối", start: "17:00", end: "23:30" },
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function todayISO() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function generateShiftCode() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(100 + Math.random() * 900);
    return `CA${y}${m}${d}${rand}`;
}

function toDateTime(date, time) {
    const d = new Date(`${date}T${time}:00`);
    if (Number.isNaN(d.getTime())) throw ApiError.badRequest(`Ngày giờ không hợp lệ: ${date} ${time}`);
    return d;
}

const assignmentInclude = {
    model: ShiftAssignment,
    as: "assignments",
    include: [
        {
            model: Employee,
            as: "employee",
            include: [{ model: User, as: "user", attributes: ["id", "fullName", "username"] }],
        },
    ],
};

/**
 * Mở ca. data = {
 *   type: "MORNING" | "AFTERNOON" | "EVENING",
 *   date?: "YYYY-MM-DD" (mặc định hôm nay),
 *   employees: [{ employeeId, startTime?: "HH:mm", endTime?: "HH:mm" }]  // 1-5 người
 * }
 */
async function openShift(data, actor) {
    const { type, employees } = data;

    const preset = SHIFT_TYPES[type];
    if (!preset) throw ApiError.badRequest("Ca không hợp lệ. Chọn: MORNING, AFTERNOON hoặc EVENING");

    const date = data.date || todayISO();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw ApiError.badRequest("Ngày không hợp lệ (YYYY-MM-DD)");

    if (!Array.isArray(employees) || employees.length < 1 || employees.length > 5) {
        throw ApiError.badRequest("Mỗi ca cần từ 1 đến 5 nhân viên");
    }

    const rows = employees.map((e) => {
        const employeeId = Number(e.employeeId);
        if (!employeeId) throw ApiError.badRequest("Thiếu employeeId");

        const startTime = e.startTime || preset.start;
        const endTime = e.endTime || preset.end;
        if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
            throw ApiError.badRequest("Giờ vào/ra phải có dạng HH:mm");
        }

        const plannedStartAt = toDateTime(date, startTime);
        const plannedEndAt = toDateTime(date, endTime);
        if (plannedEndAt <= plannedStartAt) throw ApiError.badRequest("Giờ ra phải sau giờ vào");

        return { employeeId, plannedStartAt, plannedEndAt };
    });

    const ids = rows.map((r) => r.employeeId);
    if (new Set(ids).size !== ids.length) {
        throw ApiError.badRequest("Một nhân viên không được chọn 2 lần trong cùng ca");
    }

    const active = await Shift.findOne({ where: { status: "IN_PROGRESS" } });
    if (active) {
        throw ApiError.conflict(
            `Đã có ca đang mở (mã: ${active.shiftCode}). Vui lòng đóng ca hiện tại trước khi mở ca mới`
        );
    }

    const found = await Employee.findAll({ where: { id: ids, status: "ACTIVE" } });
    if (found.length !== ids.length) {
        throw ApiError.badRequest("Có nhân viên không tồn tại hoặc đã ngừng làm việc");
    }
    const rateById = Object.fromEntries(found.map((e) => [e.id, Number(e.hourlyRate)]));

    let shiftCode;
    for (let i = 0; i < 3; i++) {
        const candidate = generateShiftCode();
        const existing = await Shift.findOne({ where: { shiftCode: candidate } });
        if (!existing) {
            shiftCode = candidate;
            break;
        }
    }
    if (!shiftCode) throw ApiError.internal("Không thể tạo mã ca, vui lòng thử lại");

    const shiftId = await sequelize.transaction(async (t) => {
        const shift = await Shift.create(
            {
                shiftCode,
                name: preset.name,
                date,
                startTime: preset.start,
                endTime: preset.end,
                actualStartAt: new Date(),
                status: "IN_PROGRESS",
            },
            { transaction: t }
        );

        await ShiftAssignment.bulkCreate(
            rows.map((r) => ({
                shiftId: shift.id,
                employeeId: r.employeeId,
                role: "CASHIER",
                plannedStartAt: r.plannedStartAt,
                plannedEndAt: r.plannedEndAt,
                checkInAt: r.plannedStartAt,
                status: "CHECKED_IN",
                hourlyRateSnapshot: rateById[r.employeeId],
            })),
            { transaction: t }
        );

        return shift.id;
    });

    const shift = await getById(shiftId);

    await logActivity({
        userId: actor.id,
        action: "CREATE",
        entity: "Shift",
        entityId: shift.id,
        description: `${actor.fullName} đã mở ${shift.name} (${shift.shiftCode}) với ${rows.length} nhân viên`,
    });

    return shift;
}

/**
 * Đóng ca. data = {
 *   actualCash, note?,
 *   assignments?: [{ employeeId, checkOutTime: "HH:mm" }]  // sửa giờ ra từng người, mặc định = giờ ra dự kiến
 * }
 */
async function closeShift(id, data, actor) {
    const { actualCash, note, assignments } = data;
    if (actualCash === undefined || actualCash === "" || Number.isNaN(Number(actualCash))) {
        throw ApiError.badRequest("Vui lòng nhập số tiền mặt thực tế đếm được");
    }

    const shift = await Shift.findByPk(id, { include: [{ model: ShiftAssignment, as: "assignments" }] });
    if (!shift) throw ApiError.notFound("Không tìm thấy ca làm việc");
    if (shift.status !== "IN_PROGRESS") {
        throw ApiError.badRequest("Chỉ có thể đóng ca đang mở (IN_PROGRESS)");
    }

    const overrides = new Map(
        (Array.isArray(assignments) ? assignments : []).map((a) => [Number(a.employeeId), a.checkOutTime])
    );

    await sequelize.transaction(async (t) => {
        for (const a of shift.assignments) {
            if (!a.checkInAt) {
                await a.update({ status: "CHECKED_OUT", workedMinutes: 0 }, { transaction: t });
                continue;
            }

            const timeStr = overrides.get(a.employeeId);
            let checkOutAt = a.plannedEndAt;
            if (timeStr) {
                if (!TIME_RE.test(timeStr)) throw ApiError.badRequest("Giờ ra phải có dạng HH:mm");
                checkOutAt = toDateTime(shift.date, timeStr);
            }
            if (!checkOutAt || checkOutAt <= a.checkInAt) {
                throw ApiError.badRequest("Giờ ra của mỗi nhân viên phải sau giờ vào");
            }

            await a.update(
                {
                    checkOutAt,
                    workedMinutes: Math.round((checkOutAt - a.checkInAt) / 60000),
                    status: "CHECKED_OUT",
                },
                { transaction: t }
            );
        }

        await shift.update(
            {
                status: "COMPLETED",
                actualEndAt: new Date(),
                actualCash,
                difference: Number(actualCash) - Number(shift.cashAmount),
                note: note || shift.note,
                closedBy: actor.id,
            },
            { transaction: t }
        );
    });

    const closed = await getById(shift.id);

    await logActivity({
        userId: actor.id,
        action: "UPDATE",
        entity: "Shift",
        entityId: closed.id,
        description: `${actor.fullName} đã đóng ${closed.name} (${closed.shiftCode}). Chênh lệch quỹ: ${closed.difference}`,
    });

    return closed;
}

// Danh sách nhân viên đang làm việc để chọn vào ca (không trả lương, STAFF cũng gọi được)
async function listActiveEmployees() {
    const employees = await Employee.findAll({
        where: { status: "ACTIVE" },
        include: [{ model: User, as: "user", attributes: ["fullName"] }],
        order: [["employeeCode", "ASC"]],
    });
    return employees.map((e) => ({
        id: e.id,
        employeeCode: e.employeeCode,
        fullName: e.user?.fullName || e.employeeCode,
    }));
}

async function getAll({ status, date } = {}) {
    const where = {};
    if (status) where.status = status;
    if (date) where.date = date;

    return Shift.findAll({
        where,
        include: [{ model: User, as: "closedByUser", attributes: ["id", "fullName"] }],
        order: [["date", "DESC"], ["id", "DESC"]],
    });
}

async function getById(id) {
    const shift = await Shift.findByPk(id, {
        include: [assignmentInclude, { model: User, as: "closedByUser", attributes: ["id", "fullName"] }],
    });
    if (!shift) throw ApiError.notFound("Không tìm thấy ca làm việc");
    return shift;
}

async function getCurrent() {
    return Shift.findOne({
        where: { status: "IN_PROGRESS" },
        include: [assignmentInclude],
    });
}

module.exports = { openShift, closeShift, listActiveEmployees, getAll, getById, getCurrent };