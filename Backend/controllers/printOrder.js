const printOrderService = require("../services/printOrder");
const asyncHandler = require("../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
    const order = await printOrderService.createOrder(req.body, req.user);
    res.status(201).json({ success: true, message: "Tạo đơn dịch vụ thành công", data: order });
});

const updateStatus = asyncHandler(async (req, res) => {
    const order = await printOrderService.updateStatus(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Cập nhật trạng thái thành công", data: order });
});

const getAll = asyncHandler(async (req, res) => {
    const { status, shiftId, fromDate, toDate } = req.query;
    const orders = await printOrderService.getAll({ status, shiftId, fromDate, toDate });
    res.json({ success: true, data: orders });
});

const getById = asyncHandler(async (req, res) => {
    const order = await printOrderService.getById(req.params.id);
    res.json({ success: true, data: order });
});

module.exports = { create, updateStatus, getAll, getById };