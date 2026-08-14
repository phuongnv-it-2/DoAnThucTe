const productService = require("../services/product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getAll = asyncHandler(async (req, res) => {
    const { search, categoryId, status, lowStock } = req.query;
    const products = await productService.getAll({ search, categoryId, status, lowStock });
    res.json({ success: true, data: products });
});

const getById = asyncHandler(async (req, res) => {
    const product = await productService.getById(req.params.id);
    res.json({ success: true, data: product });
});

const create = asyncHandler(async (req, res) => {
    const { name, sku, categoryId } = req.body;
    if (!name || !sku || !categoryId) {
        throw ApiError.badRequest("Vui lòng nhập đầy đủ tên, SKU và danh mục");
    }

    const product = await productService.create(req.body, req.user);
    res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: product,
    });
});

const update = asyncHandler(async (req, res) => {
    const product = await productService.update(req.params.id, req.body, req.user);
    res.json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: product,
    });
});

const remove = asyncHandler(async (req, res) => {
    await productService.remove(req.params.id, req.user);
    res.json({ success: true, message: "Đã vô hiệu hóa sản phẩm" });
});

module.exports = { getAll, getById, create, update, remove };