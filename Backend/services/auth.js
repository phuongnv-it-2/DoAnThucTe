const { User, Role, Employee } = require("../models");
const { signToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

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

module.exports = { login, register, getMe };