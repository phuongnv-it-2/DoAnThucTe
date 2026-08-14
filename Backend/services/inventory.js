const { Op } = require("sequelize");
const { sequelize, Product, InventoryTransaction, User } = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

const ALLOWED_TYPES = ["IMPORT", "EXPORT", "ADJUST"];

/**
 * IMPORT: cộng thêm `quantity` vào stock hiện tại (nhập hàng mới về).
 * EXPORT: trừ `quantity` khỏi stock hiện tại (hao hụt, chuyển kho thủ công...).
 * ADJUST: đặt stock về đúng giá trị `newStock` sau khi kiểm kê thực tế
 *         (hệ thống tự tính chênh lệch, không cần người dùng tự trừ/cộng).
 */
async function createTransaction(data, actor) {
    const { productId, type, note, referenceType, referenceId } = data;

    if (!ALLOWED_TYPES.includes(type)) {
        throw ApiError.badRequest(
            `Loại giao dịch không hợp lệ. Chỉ chấp nhận: ${ALLOWED_TYPES.join(", ")}`
        );
    }

    return sequelize.transaction(async (t) => {
        // Khóa dòng Product để tránh 2 giao dịch cùng lúc đọc sai stock cũ
        // (race condition khi nhiều người cùng nhập/xuất 1 sản phẩm).
        const product = await Product.findByPk(productId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
        });
        if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");

        const beforeStock = product.stock;
        let afterStock;
        let quantity;

        if (type === "IMPORT") {
            quantity = Number(data.quantity);
            if (!quantity || quantity <= 0) {
                throw ApiError.badRequest("Số lượng nhập phải lớn hơn 0");
            }
            afterStock = beforeStock + quantity;
        } else if (type === "EXPORT") {
            quantity = Number(data.quantity);
            if (!quantity || quantity <= 0) {
                throw ApiError.badRequest("Số lượng xuất phải lớn hơn 0");
            }
            if (quantity > beforeStock) {
                throw ApiError.badRequest(
                    `Không đủ tồn kho để xuất. Tồn hiện tại: ${beforeStock}`
                );
            }
            afterStock = beforeStock - quantity;
        } else {
            // ADJUST: người dùng nhập số lượng thực tế đếm được (newStock),
            // hệ thống tự tính chênh lệch so với stock hệ thống đang lưu.
            const newStock = Number(data.newStock);
            if (data.newStock === undefined || Number.isNaN(newStock) || newStock < 0) {
                throw ApiError.badRequest("Vui lòng nhập số lượng kiểm kê thực tế hợp lệ");
            }
            afterStock = newStock;
            quantity = Math.abs(afterStock - beforeStock);

            if (quantity === 0) {
                throw ApiError.badRequest("Số lượng kiểm kê trùng với tồn kho hiện tại, không có gì để điều chỉnh");
            }
        }

        await product.update({ stock: afterStock }, { transaction: t });

        const transaction = await InventoryTransaction.create(
            {
                productId,
                type,
                quantity,
                beforeStock,
                afterStock,
                note: note || null,
                referenceType: referenceType || "MANUAL",
                referenceId: referenceId || null,
                userId: actor.id,
            },
            { transaction: t }
        );

        return transaction;
    }).then(async (transaction) => {
        const product = await Product.findByPk(productId);
        const typeLabel = { IMPORT: "nhập kho", EXPORT: "xuất kho", ADJUST: "điều chỉnh tồn kho" }[type];

        await logActivity({
            userId: actor.id,
            action: "OTHER",
            entity: "InventoryTransaction",
            entityId: transaction.id,
            description: `${actor.fullName} đã ${typeLabel} sản phẩm "${product?.name}" (${transaction.beforeStock} → ${transaction.afterStock})`,
        });

        return getById(transaction.id);
    });
}

async function getAll({ productId, type, fromDate, toDate } = {}) {
    const where = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
        if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    return InventoryTransaction.findAll({
        where,
        include: [
            { model: Product, as: "product", attributes: ["id", "name", "sku", "unit"] },
            { model: User, as: "user", attributes: ["id", "fullName", "username"] },
        ],
        order: [["createdAt", "DESC"]],
    });
}

async function getById(id) {
    const transaction = await InventoryTransaction.findByPk(id, {
        include: [
            { model: Product, as: "product", attributes: ["id", "name", "sku", "unit"] },
            { model: User, as: "user", attributes: ["id", "fullName", "username"] },
        ],
    });
    if (!transaction) throw ApiError.notFound("Không tìm thấy giao dịch kho");
    return transaction;
}

module.exports = { createTransaction, getAll, getById };