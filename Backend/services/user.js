const { Op } = require("sequelize");
const { User, Role, Employee } = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

async function getAll({ search, roleId, status } = {}) {
    const where = {};
    if (status) where.status = status;
    if (roleId) where.roleId = roleId;
    if (search) {
        where[Op.or] = [
            { username: { [Op.like]: `%${search}%` } },
            { fullName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
        ];
    }

    const users = await User.findAll({
        where,
        include: [
            { model: Role, as: "role" },
            { model: Employee, as: "employee" },
        ],
        order: [["createdAt", "DESC"]],
    });

    return users.map((u) => u.toSafeJSON());
}

async function getById(id) {
    const user = await User.findByPk(id, {
        include: [
            { model: Role, as: "role" },
            { model: Employee, as: "employee" },
        ],
    });
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
    return user.toSafeJSON();
}

async function update(id, data, actor) {
    const user = await User.findByPk(id);
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

    if (data.email && data.email !== user.email) {
        const existing = await User.findOne({ where: { email: data.email } });
        if (existing) throw ApiError.conflict("Email đã được sử dụng");
    }

    if (data.roleId) {
        const role = await Role.findByPk(data.roleId);
        if (!role) throw ApiError.badRequest("Vai trò không hợp lệ");
    }

    await user.update({
        email: data.email ?? user.email,
        fullName: data.fullName ?? user.fullName,
        roleId: data.roleId ?? user.roleId,
    });

    await logActivity({
        userId: actor.id,
        action: "UPDATE",
        entity: "User",
        entityId: user.id,
        description: `${actor.fullName} đã cập nhật thông tin tài khoản "${user.username}"`,
    });

    return getById(user.id);
}

async function setStatus(id, status, actor) {
    if (!["ACTIVE", "LOCKED"].includes(status)) {
        throw ApiError.badRequest("Trạng thái không hợp lệ. Chỉ chấp nhận: ACTIVE, LOCKED");
    }

    if (Number(id) === actor.id && status === "LOCKED") {
        throw ApiError.badRequest("Không thể tự khóa tài khoản của chính mình");
    }

    const user = await User.findByPk(id);
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

    await user.update({ status });

    const label = status === "LOCKED" ? "khóa" : "mở khóa";
    await logActivity({
        userId: actor.id,
        action: "UPDATE",
        entity: "User",
        entityId: user.id,
        description: `${actor.fullName} đã ${label} tài khoản "${user.username}"`,
    });

    return getById(user.id);
}

async function updateEmployee(userId, data, actor) {
    const employee = await Employee.findOne({ where: { userId } });
    if (!employee) throw ApiError.notFound("Không tìm thấy hồ sơ nhân viên");

    await employee.update({
        phone: data.phone ?? employee.phone,
        address: data.address ?? employee.address,
        avatar: data.avatar ?? employee.avatar,
        gender: data.gender ?? employee.gender,
        dateOfBirth: data.dateOfBirth ?? employee.dateOfBirth,
        hireDate: data.hireDate ?? employee.hireDate,
        status: data.status ?? employee.status,
    });

    await logActivity({
        userId: actor.id,
        action: "UPDATE",
        entity: "Employee",
        entityId: employee.id,
        description: `${actor.fullName} đã cập nhật hồ sơ nhân viên (mã: ${employee.employeeCode})`,
    });

    return getById(userId);
}

module.exports = { getAll, getById, update, setStatus, updateEmployee };