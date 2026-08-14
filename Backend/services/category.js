const { Category } = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

async function getAll({ status } = {}) {
    const where = {};
    if (status) where.status = status;
    return Category.findAll({ where, order: [["name", "ASC"]] });
}

async function getById(id) {
    const category = await Category.findByPk(id);
    if (!category) throw ApiError.notFound("Không tìm thấy danh mục");
    return category;
}

async function create(data, actor) {
    const existing = await Category.findOne({ where: { name: data.name } });
    if (existing) throw ApiError.conflict("Tên danh mục đã tồn tại");

    const category = await Category.create({
        name: data.name,
        description: data.description || null,
    });

    await logActivity({
        userId: actor.id,
        action: "CREATE",
        entity: "Category",
        entityId: category.id,
        description: `${actor.fullName} đã tạo danh mục "${category.name}"`,
    });

    return category;
}

async function update(id, data, actor) {
    const category = await getById(id);

    if (data.name && data.name !== category.name) {
        const existing = await Category.findOne({ where: { name: data.name } });
        if (existing) throw ApiError.conflict("Tên danh mục đã tồn tại");
    }

    await category.update({
        name: data.name ?? category.name,
        description: data.description ?? category.description,
        status: data.status ?? category.status,
    });

    await logActivity({
        userId: actor.id,
        action: "UPDATE",
        entity: "Category",
        entityId: category.id,
        description: `${actor.fullName} đã cập nhật danh mục "${category.name}"`,
    });

    return category;
}

async function remove(id, actor) {
    const category = await getById(id);

    await category.update({ status: "INACTIVE" });

    await logActivity({
        userId: actor.id,
        action: "DELETE",
        entity: "Category",
        entityId: category.id,
        description: `${actor.fullName} đã vô hiệu hóa danh mục "${category.name}"`,
    });

    return category;
}

module.exports = { getAll, getById, create, update, remove };