const inventoryService = require("../services/inventory");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const create = asyncHandler(async (req, res) => {
    const { productId, type } = req.body;
    if (!productId || !type) {
        throw ApiError.badRequest("Vui lòng chọn sản phẩm và loại giao dịch");
    }

    const transaction = await inventoryService.createTransaction(req.body, req.user);
    res.status(201).json({
        success: true,
        message: "Ghi nhận giao dịch kho thành công",
        data: transaction,
    });
});

const getAll = asyncHandler(async (req, res) => {
    const { productId, type, fromDate, toDate } = req.query;
    const transactions = await inventoryService.getAll({ productId, type, fromDate, toDate });
    res.json({ success: true, data: transactions });
});

const getById = asyncHandler(async (req, res) => {
    const transaction = await inventoryService.getById(req.params.id);
    res.json({ success: true, data: transaction });
});

module.exports = { create, getAll, getById };