const { Op } = require("sequelize");
const { Product, Category } = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

async function getAll({ search, categoryId, status, lowStock } = {}) {
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { sku: { [Op.like]: `%${search}%` } },
            { barcode: { [Op.like]: `%${search}%` } },
        ];
    }

    const products = await Product.findAll({
        where,
        include: [{ model: Category, as: "category" }],
        order: [["name", "ASC"]],
    });

    if (lowStock === "true") {
        return products.filter((p) => p.stock <= p.minStock);
    }
    return products;
}

async function getById(id) {
    const product = await Product.findByPk(id, {
        include: [{ model: Category, as: "category" }],
    });
    if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");
    return product;
}

async function create(data, actor) {
    const existingSku = await Product.findOne({ where: { sku: data.sku } });
    if (existingSku) throw ApiError.conflict("Mã SKU đã tồn tại");

    if (data.barcode) {
        const existingBarcode = await Product.findOne({ where: { barcode: data.barcode } });
        if (existingBarcode) throw ApiError.conflict("Mã vạch đã tồn tại");
    }

    const category = await Category.findByPk(data.categoryId);
    if (!category) throw ApiError.badRequest("Danh mục không hợp lệ");

    const product = await Product.create({
        name: data.name,
        sku: data.sku,
        barcode: data.barcode || null,
        categoryId: data.categoryId,
        costPrice: data.costPrice || 0,
        sellingPrice: data.sellingPrice || 0,
        stock: data.stock || 0,
        minStock: data.minStock ?? 5,
        unit: data.unit || "cái",
        description: data.description || null,
        image: data.image || null,
    });

    await logActivity({
        userId: actor.id,
        action: "CREATE",
        entity: "Product",
        entityId: product.id,
        description: `${actor.fullName} đã tạo sản phẩm "${product.name}" (SKU: ${product.sku})`,
    });

    return getById(product.id);
}

async function update(id, data, actor) {
    const product = await Product.findByPk(id);
    if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");

    if (data.sku && data.sku !== product.sku) {
        const existing = await Product.findOne({ where: { sku: data.sku } });
        if (existing) throw ApiError.conflict("Mã SKU đã tồn tại");
    }

    if (data.barcode && data.barcode !== product.barcode) {
        const existing = await Product.findOne({ where: { barcode: data.barcode } });
        if (existing) throw ApiError.conflict("Mã vạch đã tồn tại");
    }

    if (data.categoryId) {
        const category = await Category.findByPk(data.categoryId);
        if (!category) throw ApiError.badRequest("Danh mục không hợp lệ");
    }

    // Không cho sửa "stock" trực tiếp — thay đổi tồn kho phải đi qua
    // InventoryTransaction để giữ lịch sử nhập/xuất.
    const { stock, ...safeData } = data;

    await product.update(safeData);

    await logActivity({
        userId: actor.id,
        action: "UPDATE",
        entity: "Product",
        entityId: product.id,
        description: `${actor.fullName} đã cập nhật sản phẩm "${product.name}"`,
    });

    return getById(product.id);
}

async function remove(id, actor) {
    const product = await Product.findByPk(id);
    if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");

    await product.update({ status: "INACTIVE" });

    await logActivity({
        userId: actor.id,
        action: "DELETE",
        entity: "Product",
        entityId: product.id,
        description: `${actor.fullName} đã vô hiệu hóa sản phẩm "${product.name}"`,
    });

    return product;
}

module.exports = { getAll, getById, create, update, remove };