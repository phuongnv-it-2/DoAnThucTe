const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const { ShiftAssignment, Shift, Employee, User } = require("../models");
const ApiError = require("../utils/ApiError");

function monthRange(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")) {
        throw ApiError.badRequest("Vui lòng nhập tháng dạng YYYY-MM");
    }
    const [y, m] = month.split("-").map(Number);
    return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

const round2 = (n) => Math.round(n * 100) / 100;

async function getMonthlyPayroll(month) {
    const { start, end } = monthRange(month);

    const rows = await ShiftAssignment.findAll({
        where: { status: "CHECKED_OUT", checkInAt: { [Op.gte]: start, [Op.lt]: end } },
        include: [
            { model: Shift, as: "shift", attributes: ["id", "shiftCode", "name", "date"] },
            {
                model: Employee,
                as: "employee",
                include: [{ model: User, as: "user", attributes: ["fullName"] }],
            },
        ],
        order: [["checkInAt", "ASC"]],
    });

    const byEmployee = new Map();
    for (const r of rows) {
        const rate = Number(r.hourlyRateSnapshot);
        const pay = Math.round((r.workedMinutes * rate) / 60);

        if (!byEmployee.has(r.employeeId)) {
            byEmployee.set(r.employeeId, {
                employeeId: r.employeeId,
                employeeCode: r.employee?.employeeCode || "",
                fullName: r.employee?.user?.fullName || "",
                shiftCount: 0,
                totalMinutes: 0,
                totalPay: 0,
                details: [],
            });
        }
        const e = byEmployee.get(r.employeeId);
        e.shiftCount += 1;
        e.totalMinutes += r.workedMinutes;
        e.totalPay += pay;
        e.details.push({
            shiftCode: r.shift?.shiftCode,
            shiftName: r.shift?.name,
            date: r.shift?.date,
            checkInAt: r.checkInAt,
            checkOutAt: r.checkOutAt,
            minutes: r.workedMinutes,
            hourlyRate: rate,
            pay,
        });
    }

    const employees = [...byEmployee.values()]
        .map((e) => ({ ...e, totalHours: round2(e.totalMinutes / 60) }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"));

    const totalMinutes = employees.reduce((s, e) => s + e.totalMinutes, 0);
    const totalPay = employees.reduce((s, e) => s + e.totalPay, 0);

    return { month, employees, totalMinutes, totalHours: round2(totalMinutes / 60), totalPay };
}

async function exportMonthlyPayroll(month) {
    const data = await getMonthlyPayroll(month);
    const fmt = (d) => (d ? new Date(d).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "");

    const workbook = new ExcelJS.Workbook();

    const summary = workbook.addWorksheet("Tổng hợp lương");
    summary.columns = [
        { header: "STT", key: "stt", width: 6 },
        { header: "Mã NV", key: "code", width: 12 },
        { header: "Họ tên", key: "name", width: 26 },
        { header: "Số ca", key: "shifts", width: 8 },
        { header: "Tổng giờ", key: "hours", width: 12 },
        { header: "Tiền lương (VND)", key: "pay", width: 18 },
    ];
    summary.getRow(1).font = { bold: true };
    data.employees.forEach((e, i) => {
        summary.addRow({
            stt: i + 1,
            code: e.employeeCode,
            name: e.fullName,
            shifts: e.shiftCount,
            hours: e.totalHours,
            pay: e.totalPay,
        });
    });
    const totalRow = summary.addRow({ name: "TỔNG CỘNG", hours: data.totalHours, pay: data.totalPay });
    totalRow.font = { bold: true };
    summary.getColumn("hours").numFmt = "0.00";
    summary.getColumn("pay").numFmt = "#,##0";

    const detail = workbook.addWorksheet("Chi tiết");
    detail.columns = [
        { header: "Mã NV", key: "code", width: 12 },
        { header: "Họ tên", key: "name", width: 26 },
        { header: "Ca", key: "shift", width: 14 },
        { header: "Mã ca", key: "shiftCode", width: 18 },
        { header: "Giờ vào", key: "in", width: 20 },
        { header: "Giờ ra", key: "out", width: 20 },
        { header: "Số giờ", key: "hours", width: 10 },
        { header: "Lương/giờ", key: "rate", width: 12 },
        { header: "Thành tiền", key: "pay", width: 14 },
    ];
    detail.getRow(1).font = { bold: true };
    data.employees.forEach((e) => {
        e.details.forEach((d) => {
            detail.addRow({
                code: e.employeeCode,
                name: e.fullName,
                shift: d.shiftName,
                shiftCode: d.shiftCode,
                in: fmt(d.checkInAt),
                out: fmt(d.checkOutAt),
                hours: round2(d.minutes / 60),
                rate: d.hourlyRate,
                pay: d.pay,
            });
        });
    });
    detail.getColumn("hours").numFmt = "0.00";
    detail.getColumn("rate").numFmt = "#,##0";
    detail.getColumn("pay").numFmt = "#,##0";

    return workbook;
}

module.exports = { getMonthlyPayroll, exportMonthlyPayroll };