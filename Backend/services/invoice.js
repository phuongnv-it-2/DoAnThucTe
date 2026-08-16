const { Op } = require("sequelize");
const {
    sequelize,
    Invoice,
    InvoiceDetail,
    Product,
    InventoryTransaction,
    Shift,
    User,
} = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

function generateInvoiceCode() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `HD${y}${m}${d}${rand}`;
}

async function createInvoice(data, actor) {
    const { shiftId, items, customerName, customerPhone, paymentMethod, discount, note } = data;

    if (!shiftId) throw ApiError.badRequest("Vui lòng chọn ca làm việc");
    if (!Array.isArray(items) || items.length === 0) {
        throw ApiError.badRequest("Hóa đơn phải có ít nhất 1 sản phẩm");
    }

    const shift = await Shift.findByPk(shiftId);
    if (!shift) throw ApiError.notFound("Không tìm thấy ca làm việc");
    if (shift.status !== "IN_PROGRESS") {
        throw ApiError.badRequest("Chỉ có thể tạo hóa đơn trong ca đang mở (IN_PROGRESS)");
    }

    return sequelize.transaction(async (t) => {
        // Sinh mã hóa đơn, thử lại tối đa 3 lần nếu trùng (rất hiếm khi xảy ra)
        let invoiceCode;
        for (let i = 0; i < 3; i++) {
            const candidate = generateInvoiceCode();
            const existing = await Invoice.findOne({ where: { invoiceCode: candidate }, transaction: t });
            if (!existing) {
                invoiceCode = candidate;
                break;
            }
        }
        if (!invoiceCode) throw ApiError.internal("Không thể tạo mã hóa đơn, vui lòng thử lại");

        const invoice = await Invoice.create(
            {
                invoiceCode,
                userId: actor.id,
                shiftId,
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                subtotal: 0,
                discount: discount || 0,
                total: 0,
                paymentMethod: paymentMethod || "CASH",
                status: "COMPLETED",
                note: note || null,
            },
            { transaction: t }
        );

        let subtotal = 0;

        for (const item of items) {
            const { productId, quantity } = item;
            if (!productId || !quantity || quantity <= 0) {
                throw ApiError.badRequest("Mỗi sản phẩm cần có productId và quantity hợp lệ");
            }

            // Khóa row Product để tránh 2 hóa đơn cùng lúc bán quá số tồn kho thực tế
            const product = await Product.findByPk(productId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!product) throw ApiError.notFound(`Không tìm thấy sản phẩm (id: ${productId})`);
            if (product.stock < quantity) {
                throw ApiError.badRequest(
                    `"${product.name}" không đủ tồn kho. Còn lại: ${product.stock}, yêu cầu: ${quantity}`
                );
            }

            const unitPrice = item.unitPrice != null ? Number(item.unitPrice) : Number(product.sellingPrice);
            const lineDiscount = item.discount ? Number(item.discount) : 0;
            const lineTotal = quantity * unitPrice - lineDiscount;

            await InvoiceDetail.create(
                {
                    invoiceId: invoice.id,
                    productId: product.id,
                    productName: product.name,
                    quantity,
                    unitPrice,
                    discount: lineDiscount,
                    total: lineTotal,
                },
                { transaction: t }
            );

            const beforeStock = product.stock;
            const afterStock = beforeStock - quantity;
            await product.update({ stock: afterStock }, { transaction: t });

            await InventoryTransaction.create(
                {
                    productId: product.id,
                    type: "SALE",
                    quantity,
                    beforeStock,
                    afterStock,
                    note: `Bán hàng theo hóa đơn ${invoiceCode}`,
                    referenceType: "INVOICE",
                    referenceId: invoice.id,
                    userId: actor.id,
                },
                { transaction: t }
            );

            subtotal += quantity * unitPrice;
        }

        const invoiceDiscount = discount || 0;
        const total = subtotal - invoiceDiscount;

        await invoice.update({ subtotal, total }, { transaction: t });

        // Cập nhật tổng hợp ca làm việc
        const cashDelta = invoice.paymentMethod === "CASH" ? total : 0;
        const transferDelta = invoice.paymentMethod === "TRANSFER" ? total : 0;
        await shift.update(
            {
                totalRevenue: Number(shift.totalRevenue) + total,
                invoiceCount: shift.invoiceCount + 1,
                cashAmount: Number(shift.cashAmount) + cashDelta,
                transferAmount: Number(shift.transferAmount) + transferDelta,
            },
            { transaction: t }
        );

        return invoice.id;
    }).then(async (invoiceId) => {
        const invoice = await getById(invoiceId);

        await logActivity({
            userId: actor.id,
            action: "CREATE",
            entity: "Invoice",
            entityId: invoice.id,
            description: `${actor.fullName} đã tạo hóa đơn ${invoice.invoiceCode} (${invoice.total.toLocaleString("vi-VN")}đ)`,
        });

        return invoice;
    });
}

async function cancelInvoice(id, { reason }, actor) {
    const invoice = await Invoice.findByPk(id, {
        include: [{ model: InvoiceDetail, as: "details" }],
    });
    if (!invoice) throw ApiError.notFound("Không tìm thấy hóa đơn");
    if (invoice.status === "CANCELLED") {
        throw ApiError.badRequest("Hóa đơn đã được hủy trước đó");
    }

    return sequelize.transaction(async (t) => {
        for (const detail of invoice.details) {
            const product = await Product.findByPk(detail.productId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            // Sản phẩm có thể đã bị xóa/vô hiệu hóa sau khi bán — vẫn hoàn kho nếu còn tồn tại
            if (product) {
                const beforeStock = product.stock;
                const afterStock = beforeStock + detail.quantity;
                await product.update({ stock: afterStock }, { transaction: t });

                await InventoryTransaction.create(
                    {
                        productId: product.id,
                        type: "CANCEL_SALE",
                        quantity: detail.quantity,
                        beforeStock,
                        afterStock,
                        note: `Hoàn kho do hủy hóa đơn ${invoice.invoiceCode}`,
                        referenceType: "INVOICE",
                        referenceId: invoice.id,
                        userId: actor.id,
                    },
                    { transaction: t }
                );
            }
        }

        await invoice.update(
            {
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancelledBy: actor.id,
                cancelReason: reason || null,
            },
            { transaction: t }
        );

        // Trừ lại doanh thu ca làm việc tương ứng
        if (invoice.shiftId) {
            const shift = await Shift.findByPk(invoice.shiftId, { transaction: t });
            if (shift) {
                const cashDelta = invoice.paymentMethod === "CASH" ? Number(invoice.total) : 0;
                const transferDelta = invoice.paymentMethod === "TRANSFER" ? Number(invoice.total) : 0;
                await shift.update(
                    {
                        totalRevenue: Math.max(0, Number(shift.totalRevenue) - Number(invoice.total)),
                        invoiceCount: Math.max(0, shift.invoiceCount - 1),
                        cashAmount: Math.max(0, Number(shift.cashAmount) - cashDelta),
                        transferAmount: Math.max(0, Number(shift.transferAmount) - transferDelta),
                    },
                    { transaction: t }
                );
            }
        }

        return invoice.id;
    }).then(async (invoiceId) => {
        const cancelled = await getById(invoiceId);

        await logActivity({
            userId: actor.id,
            action: "UPDATE",
            entity: "Invoice",
            entityId: cancelled.id,
            description: `${actor.fullName} đã hủy hóa đơn ${cancelled.invoiceCode}${reason ? ` (Lý do: ${reason})` : ""}`,
        });

        return cancelled;
    });
}

async function getAll({ shiftId, status, userId, fromDate, toDate } = {}) {
    const where = {};
    if (shiftId) where.shiftId = shiftId;
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
        if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    return Invoice.findAll({
        where,
        include: [{ model: User, as: "employee", attributes: ["id", "fullName", "username"] }],
        order: [["createdAt", "DESC"]],
    });
}

async function getById(id) {
    const invoice = await Invoice.findByPk(id, {
        include: [
            { model: InvoiceDetail, as: "details" },
            { model: User, as: "employee", attributes: ["id", "fullName", "username"] },
            { model: User, as: "cancelledByUser", attributes: ["id", "fullName", "username"] },
        ],
    });
    if (!invoice) throw ApiError.notFound("Không tìm thấy hóa đơn");
    return invoice;
}

module.exports = { createInvoice, cancelInvoice, getAll, getById };