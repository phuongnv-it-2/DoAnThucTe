const crypto = require("crypto");
const { Op } = require("sequelize");
const { User, Role, Employee } = require("../models");
const { signToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");
const { sendResetPasswordEmail } = require("../utils/email");

/**
 * Authenticate a user by username + password, return a signed JWT + safe user info.
 */
async function login({ username, password }, ipAddress) {
    const user = await User.findOne({
        where: { username },
        include: [{ model: Role, as: "role" }],
    });

    if (!user) {
        throw ApiError.unauthorized("Tài khoản hoặc mật khẩu không đúng");
    }

    if (user.status === "LOCKED") {
        throw ApiError.forbidden("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw ApiError.unauthorized("Tài khoản hoặc mật khẩu không đúng");
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken({
        id: user.id,
        username: user.username,
        role: user.role.name,
    });

    await logActivity({
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
        description: `${user.fullName} đã đăng nhập vào hệ thống`,
        ipAddress,
    });

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role.name,
            status: user.status,
        },
    };
}

/**
 * Register a new user account.
 * NOTE: In production this endpoint should itself be protected (ADMIN only)
 * so random visitors cannot self-register as STAFF/MANAGER/ADMIN.
 * We enforce that at the route level with authenticate + authorize("ADMIN").
 */
async function register({ username, email, password, fullName, roleName, phone }) {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
        throw ApiError.conflict("Tên đăng nhập đã tồn tại");
    }

    const role = await Role.findOne({ where: { name: roleName || "STAFF" } });
    if (!role) {
        throw ApiError.badRequest("Vai trò không hợp lệ");
    }

    const user = await User.create({
        username,
        email,
        password,
        fullName,
        roleId: role.id,
    });

    const employeeCode = `NV${String(user.id).padStart(4, "0")}`;
    await Employee.create({
        userId: user.id,
        employeeCode,
        phone: phone || null,
    });

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: role.name,
    };
}

/**
 * Return the current authenticated user's full profile.
 */
async function getMe(userId) {
    const user = await User.findByPk(userId, {
        include: [
            { model: Role, as: "role" },
            { model: Employee, as: "employee" },
        ],
    });

    if (!user) {
        throw ApiError.notFound("Không tìm thấy người dùng");
    }

    return user.toSafeJSON();
}

/**
 * Change the current authenticated user's own password.
 * Requires the correct current password before allowing the change.
 */
async function changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
        throw ApiError.badRequest("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới");
    }

    if (newPassword.length < 6) {
        throw ApiError.badRequest("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    const user = await User.findByPk(userId);
    if (!user) {
        throw ApiError.notFound("Không tìm thấy người dùng");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw ApiError.unauthorized("Mật khẩu hiện tại không đúng");
    }

    if (currentPassword === newPassword) {
        throw ApiError.badRequest("Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
        userId: user.id,
        action: "UPDATE",
        entity: "User",
        entityId: user.id,
        description: `${user.fullName} đã đổi mật khẩu tài khoản`,
    });

    return { message: "Đổi mật khẩu thành công" };
}

/**
 * Generate a reset token, store its hash + expiry, email the raw token as a link.
 * Always responds success even if email not found, to avoid leaking which
 * emails are registered.
 */
async function forgotPassword(email) {
    if (!email) throw ApiError.badRequest("Vui lòng nhập email");

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return { message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi" };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    await sendResetPasswordEmail(user.email, user.fullName, resetUrl);

    return { message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi" };
}

/**
 * Verify the raw token from the email link, set a new password if valid & not expired.
 */
async function resetPassword({ token, newPassword }) {
    if (!token || !newPassword) {
        throw ApiError.badRequest("Vui lòng cung cấp token và mật khẩu mới");
    }
    if (newPassword.length < 6) {
        throw ApiError.badRequest("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { [Op.gt]: new Date() },
        },
    });

    if (!user) {
        throw ApiError.badRequest("Token không hợp lệ hoặc đã hết hạn");
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await logActivity({
        userId: user.id,
        action: "UPDATE",
        entity: "User",
        entityId: user.id,
        description: `${user.fullName} đã đặt lại mật khẩu qua email`,
    });

    return { message: "Đặt lại mật khẩu thành công" };
}

module.exports = { login, register, getMe, changePassword, forgotPassword, resetPassword };