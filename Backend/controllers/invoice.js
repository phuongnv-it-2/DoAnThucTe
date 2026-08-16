const invoiceService = require("../services/invoice");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const create = asyncHandler(async (req, res) => {
    const { shiftId, items } = req.body;
    if (!shiftId || !items) {
        throw ApiError.badRequest("Vui lòng chọn ca làm việc và danh sách sản phẩm");
    }

    const invoice = await invoiceService.createInvoice(req.body, req.user);
    res.status(201).json({
        success: true,
        message: "Tạo hóa đơn thành công",
        data: invoice,
    });
});

const cancel = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.cancelInvoice(req.params.id, req.body, req.user);
    res.json({
        success: true,
        message: "Hủy hóa đơn thành công",
        data: invoice,
    });
});

const getAll = asyncHandler(async (req, res) => {
    const { shiftId, status, userId, fromDate, toDate } = req.query;
    const invoices = await invoiceService.getAll({ shiftId, status, userId, fromDate, toDate });
    res.json({ success: true, data: invoices });
});

const getById = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.getById(req.params.id);
    res.json({ success: true, data: invoice });
});

module.exports = { create, cancel, getAll, getById };