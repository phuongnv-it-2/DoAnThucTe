const authService = require("../services/auth");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw ApiError.badRequest("Vui lòng nhập tên đăng nhập và mật khẩu");
    }

    const ipAddress = req.ip;
    const result = await authService.login({ username, password }, ipAddress);

    res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: result,
    });
});

const register = asyncHandler(async (req, res) => {
    const { username, email, password, fullName, roleName, phone } = req.body;

    if (!username || !password || !fullName) {
        throw ApiError.badRequest("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }

    if (password.length < 6) {
        throw ApiError.badRequest("Mật khẩu phải có ít nhất 6 ký tự");
    }

    const result = await authService.register({
        username,
        email,
        password,
        fullName,
        roleName,
        phone,
    });

    res.status(201).json({
        success: true,
        message: "Tạo tài khoản thành công",
        data: result,
    });
});

const me = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, { currentPassword, newPassword });

    res.status(200).json({
        success: true,
        message: result.message,
    });
});
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json({ success: true, message: result.message });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword({ token, newPassword });
    res.json({ success: true, message: result.message });
});

module.exports = { login, register, me, changePassword, forgotPassword, resetPassword };