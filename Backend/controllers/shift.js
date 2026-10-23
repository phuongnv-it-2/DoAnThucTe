const shiftService = require("../services/shift");
const payrollService = require("../services/payroll");
const asyncHandler = require("../utils/asyncHandler");

const open = asyncHandler(async (req, res) => {
    const shift = await shiftService.openShift(req.body, req.user);
    res.status(201).json({ success: true, message: "Mở ca thành công", data: shift });
});

const close = asyncHandler(async (req, res) => {
    const shift = await shiftService.closeShift(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Đóng ca thành công", data: shift });
});

const listEmployees = asyncHandler(async (req, res) => {
    const employees = await shiftService.listActiveEmployees();
    res.json({ success: true, data: employees });
});

const getAll = asyncHandler(async (req, res) => {
    const { status, date } = req.query;
    const shifts = await shiftService.getAll({ status, date });
    res.json({ success: true, data: shifts });
});

const getById = asyncHandler(async (req, res) => {
    const shift = await shiftService.getById(req.params.id);
    res.json({ success: true, data: shift });
});

const getCurrent = asyncHandler(async (req, res) => {
    const shift = await shiftService.getCurrent();
    res.json({ success: true, data: shift });
});

const payroll = asyncHandler(async (req, res) => {
    const data = await payrollService.getMonthlyPayroll(req.query.month);
    res.json({ success: true, data });
});

const exportPayroll = asyncHandler(async (req, res) => {
    const { month } = req.query;
    const workbook = await payrollService.exportMonthlyPayroll(month);
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="luong-${month}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
});

module.exports = { open, close, listEmployees, getAll, getById, getCurrent, payroll, exportPayroll };