const { Op } = require("sequelize");
const { sequelize, Shift, ShiftAssignment, Employee, User } = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

function generateShiftCode() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(100 + Math.random() * 900);
    return `CA${y}${m}${d}${rand}`;
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

async function openShift(data, actor) {
    const active = await Shift.findOne({ where: { status: "IN_PROGRESS" } });
    if (active) {
        throw ApiError.conflict(
            `Đã có ca đang mở (mã: ${active.shiftCode}). Vui lòng đóng ca hiện tại trước khi mở ca mới`
        );
    }

    const { name, date, startTime, endTime } = data;
    if (!name || !date || !startTime || !endTime) {
        throw ApiError.badRequest("Vui lòng nhập đầy đủ tên ca, ngày, giờ bắt đầu và giờ kết thúc dự kiến");
    }

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

    const shift = await Shift.create({
        shiftCode,
        name,
        date,
        startTime,
        endTime,
        actualStartAt: new Date(),
        status: "IN_PROGRESS",
    });

    await logActivity({
        userId: actor.id,
        action: "CREATE",
        entity: "Shift",
        entityId: shift.id,
        description: `${actor.fullName} đã mở ca "${shift.name}" (${shift.shiftCode})`,
    });

    return shift;
}

async function closeShift(id, data, actor) {
    const { actualCash, note } = data;
    if (actualCash === undefined || Number.isNaN(Number(actualCash))) {
        throw ApiError.badRequest("Vui lòng nhập số tiền mặt thực tế đếm được");
    }

    const shift = await Shift.findByPk(id);
    if (!shift) throw ApiError.notFound("Không tìm thấy ca làm việc");
    if (shift.status !== "IN_PROGRESS") {
        throw ApiError.badRequest("Chỉ có thể đóng ca đang mở (IN_PROGRESS)");
    }

    return sequelize.transaction(async (t) => {
        // Tự động check-out các nhân viên còn đang CHECKED_IN, tránh treo trạng thái
        await ShiftAssignment.update(
            { checkOutAt: new Date(), status: "CHECKED_OUT" },
            { where: { shiftId: id, status: "CHECKED_IN" }, transaction: t }
        );

        const difference = Number(actualCash) - Number(shift.cashAmount);

        await shift.update(
            {
                status: "COMPLETED",
                actualEndAt: new Date(),
                actualCash,
                difference,
                note: note || shift.note,
                closedBy: actor.id,
            },
            { transaction: t }
        );

        return shift.id;
    }).then(async (shiftId) => {
        const closed = await getById(shiftId);

        await logActivity({
            userId: actor.id,
            action: "UPDATE",
            entity: "Shift",
            entityId: closed.id,
            description: `${actor.fullName} đã đóng ca "${closed.name}" (${closed.shiftCode}). Chênh lệch quỹ: ${closed.difference}`,
        });

        return closed;
    });
}

async function assignEmployee(shiftId, data, actor) {
    const { employeeId, role } = data;
    if (!employeeId) throw ApiError.badRequest("Vui lòng chọn nhân viên");

    const shift = await Shift.findByPk(shiftId);
    if (!shift) throw ApiError.notFound("Không tìm thấy ca làm việc");
    if (shift.status === "COMPLETED") {
        throw ApiError.badRequest("Không thể phân công vào ca đã đóng");
    }

    const employee = await Employee.findByPk(employeeId, {
        include: [{ model: User, as: "user", attributes: ["id", "fullName"] }],
    });
    if (!employee) throw ApiError.notFound("Không tìm thấy nhân viên");
    if (employee.status !== "ACTIVE") {
        throw ApiError.badRequest("Nhân viên này hiện không hoạt động");
    }

    const existing = await ShiftAssignment.findOne({ where: { shiftId, employeeId } });
    if (existing) throw ApiError.conflict("Nhân viên đã được phân công vào ca này");

    const assignment = await ShiftAssignment.create({
        shiftId,
        employeeId,
        role: role || "CASHIER",
        status: "ASSIGNED",
    });

    await logActivity({
        userId: actor.id,
        action: "CREATE",
        entity: "Shift",
        entityId: Number(shiftId),
        description: `${actor.fullName} đã phân công "${employee.user?.fullName}" vào ca "${shift.name}"`,
    });

    return assignment;
}

async function checkIn(shiftId, employeeId, actor) {
    const assignment = await ShiftAssignment.findOne({
        where: { shiftId, employeeId },
        include: [{ model: Employee, as: "employee", include: [{ model: User, as: "user", attributes: ["fullName"] }] }],
    });
    if (!assignment) throw ApiError.notFound("Không tìm thấy phân công cho nhân viên này trong ca");
    if (assignment.status !== "ASSIGNED") {
        throw ApiError.badRequest("Nhân viên đã check-in hoặc đã check-out trước đó");
    }

    await assignment.update({ checkInAt: new Date(), status: "CHECKED_IN" });

    await logActivity({
        userId: actor.id,
        action: "OTHER",
        entity: "Shift",
        entityId: Number(shiftId),
        description: `${actor.fullName} đã check-in cho "${assignment.employee?.user?.fullName}"`,
    });

    return assignment;
}

async function checkOut(shiftId, employeeId, actor) {
    const assignment = await ShiftAssignment.findOne({
        where: { shiftId, employeeId },
        include: [{ model: Employee, as: "employee", include: [{ model: User, as: "user", attributes: ["fullName"] }] }],
    });
    if (!assignment) throw ApiError.notFound("Không tìm thấy phân công cho nhân viên này trong ca");
    if (assignment.status !== "CHECKED_IN") {
        throw ApiError.badRequest("Nhân viên chưa check-in hoặc đã check-out trước đó");
    }

    await assignment.update({ checkOutAt: new Date(), status: "CHECKED_OUT" });

    await logActivity({
        userId: actor.id,
        action: "OTHER",
        entity: "Shift",
        entityId: Number(shiftId),
        description: `${actor.fullName} đã check-out cho "${assignment.employee?.user?.fullName}"`,
    });

    return assignment;
}

async function removeAssignment(shiftId, employeeId, actor) {
    const assignment = await ShiftAssignment.findOne({ where: { shiftId, employeeId } });
    if (!assignment) throw ApiError.notFound("Không tìm thấy phân công cho nhân viên này trong ca");
    if (assignment.status !== "ASSIGNED") {
        throw ApiError.badRequest("Không thể xóa phân công đã check-in/check-out");
    }

    await assignment.destroy();

    await logActivity({
        userId: actor.id,
        action: "DELETE",
        entity: "Shift",
        entityId: Number(shiftId),
        description: `${actor.fullName} đã hủy phân công nhân viên (id: ${employeeId}) khỏi ca`,
    });

    return { removed: true };
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
    const shift = await Shift.findOne({
        where: { status: "IN_PROGRESS" },
        include: [assignmentInclude],
    });
    return shift; // có thể null nếu không có ca nào đang mở
}

module.exports = {
    openShift,
    closeShift,
    assignEmployee,
    checkIn,
    checkOut,
    removeAssignment,
    getAll,
    getById,
    getCurrent,
};