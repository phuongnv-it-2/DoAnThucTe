const userService = require("../services/user");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getAll = asyncHandler(async (req, res) => {
    const { search, roleId, status } = req.query;
    const users = await userService.getAll({ search, roleId, status });
    res.json({ success: true, data: users });
});

const getById = asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    res.json({ success: true, data: user });
});

const update = asyncHandler(async (req, res) => {
    const user = await userService.update(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Cập nhật tài khoản thành công", data: user });
});

const setStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status) throw ApiError.badRequest("Vui lòng chọn trạng thái");

    const user = await userService.setStatus(req.params.id, status, req.user);
    res.json({ success: true, message: "Cập nhật trạng thái tài khoản thành công", data: user });
});

const updateEmployee = asyncHandler(async (req, res) => {
    const user = await userService.updateEmployee(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Cập nhật hồ sơ nhân viên thành công", data: user });
});

module.exports = { getAll, getById, update, setStatus, updateEmployee };