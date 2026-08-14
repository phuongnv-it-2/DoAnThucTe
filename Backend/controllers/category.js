const categoryService = require("../services/category");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getAll = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const categories = await categoryService.getAll({ status });
    res.json({ success: true, data: categories });
});

const getById = asyncHandler(async (req, res) => {
    const category = await categoryService.getById(req.params.id);
    res.json({ success: true, data: category });
});

const create = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) throw ApiError.badRequest("Vui lòng nhập tên danh mục");

    const category = await categoryService.create(req.body, req.user);
    res.status(201).json({
        success: true,
        message: "Tạo danh mục thành công",
        data: category,
    });
});

const update = asyncHandler(async (req, res) => {
    const category = await categoryService.update(req.params.id, req.body, req.user);
    res.json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: category,
    });
});

const remove = asyncHandler(async (req, res) => {
    await categoryService.remove(req.params.id, req.user);
    res.json({ success: true, message: "Đã vô hiệu hóa danh mục" });
});

module.exports = { getAll, getById, create, update, remove };