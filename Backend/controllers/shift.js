const shiftService = require("../services/shift");
const asyncHandler = require("../utils/asyncHandler");

const open = asyncHandler(async (req, res) => {
    const shift = await shiftService.openShift(req.body, req.user);
    res.status(201).json({ success: true, message: "Mở ca thành công", data: shift });
});

const close = asyncHandler(async (req, res) => {
    const shift = await shiftService.closeShift(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Đóng ca thành công", data: shift });
});

const assign = asyncHandler(async (req, res) => {
    const assignment = await shiftService.assignEmployee(req.params.id, req.body, req.user);
    res.status(201).json({ success: true, message: "Phân công nhân viên thành công", data: assignment });
});

const checkIn = asyncHandler(async (req, res) => {
    const assignment = await shiftService.checkIn(req.params.id, req.params.employeeId, req.user);
    res.json({ success: true, message: "Check-in thành công", data: assignment });
});

const checkOut = asyncHandler(async (req, res) => {
    const assignment = await shiftService.checkOut(req.params.id, req.params.employeeId, req.user);
    res.json({ success: true, message: "Check-out thành công", data: assignment });
});

const removeAssignment = asyncHandler(async (req, res) => {
    await shiftService.removeAssignment(req.params.id, req.params.employeeId, req.user);
    res.json({ success: true, message: "Đã hủy phân công nhân viên" });
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

module.exports = { open, close, assign, checkIn, checkOut, removeAssignment, getAll, getById, getCurrent };