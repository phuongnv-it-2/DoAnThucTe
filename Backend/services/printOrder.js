const { sequelize, PrintOrder, PrintOrderDetail, Shift, User } = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

const SERVICE_LABELS = {
    PHOTOCOPY: "Photocopy",
    PRINT_BLACK_WHITE: "In đen trắng",
    PRINT_COLOR: "In màu",
    SCAN: "Scan",
    BINDING: "Đóng gáy",
    LAMINATING: "Ép plastic",
};

const VALID_TRANSITIONS = {
    PENDING: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["COMPLETED", "CANCELLED"],
    COMPLETED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
};

function generateOrderCode() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `DH${y}${m}${d}${rand}`;
}

async function createOrder(data, actor) {
    const {
        customerName,
        customerPhone,
        serviceType,
        paperSize,
        colorMode,
        numberOfPages,
        numberOfCopies,
        unitPrice,
        shiftId,
        note,
        items,
    } = data;

    if (!serviceType) throw ApiError.badRequest("Vui lòng chọn loại dịch vụ chính");
    if (unitPrice === undefined || Number(unitPrice) < 0) {
        throw ApiError.badRequest("Vui lòng nhập đơn giá hợp lệ cho dịch vụ chính");
    }

    let shift = null;
    if (shiftId) {
        shift = await Shift.findByPk(shiftId);
        if (!shift) throw ApiError.notFound("Không tìm thấy ca làm việc");
        if (shift.status !== "IN_PROGRESS") {
            throw ApiError.badRequest("Chỉ có thể tạo đơn trong ca đang mở (IN_PROGRESS)");
        }
    }

    return sequelize.transaction(async (t) => {
        let orderCode;
        for (let i = 0; i < 3; i++) {
            const candidate = generateOrderCode();
            const existing = await PrintOrder.findOne({ where: { orderCode: candidate }, transaction: t });
            if (!existing) {
                orderCode = candidate;
                break;
            }
        }
        if (!orderCode) throw ApiError.internal("Không thể tạo mã đơn, vui lòng thử lại");

        const pages = Number(numberOfPages) || 1;
        const copies = Number(numberOfCopies) || 1;
        const price = Number(unitPrice);
        const mainTotal = pages * copies * price;

        const order = await PrintOrder.create(
            {
                orderCode,
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                serviceType,
                paperSize: paperSize || null,
                colorMode: colorMode || "BLACK_WHITE",
                numberOfPages: pages,
                numberOfCopies: copies,
                unitPrice: price,
                totalAmount: 0,
                status: "PENDING",
                shiftId: shiftId || null,
                note: note || null,
                createdBy: actor.id,
            },
            { transaction: t }
        );

        const mainLabel = SERVICE_LABELS[serviceType] || serviceType;
        await PrintOrderDetail.create(
            {
                printOrderId: order.id,
                description: `${mainLabel}${paperSize ? ` ${paperSize}` : ""} - ${pages} trang x ${copies} bản`,
                quantity: 1,
                unitPrice: mainTotal,
                total: mainTotal,
            },
            { transaction: t }
        );

        let totalAmount = mainTotal;

        if (Array.isArray(items)) {
            for (const item of items) {
                if (!item.description || !item.quantity) {
                    throw ApiError.badRequest("Mỗi dịch vụ phụ cần có mô tả và số lượng");
                }
                const qty = Number(item.quantity);
                const price2 = Number(item.unitPrice) || 0;
                const lineTotal = qty * price2;

                await PrintOrderDetail.create(
                    {
                        printOrderId: order.id,
                        description: item.description,
                        quantity: qty,
                        unitPrice: price2,
                        total: lineTotal,
                    },
                    { transaction: t }
                );

                totalAmount += lineTotal;
            }
        }

        await order.update({ totalAmount }, { transaction: t });

        return order.id;
    }).then(async (orderId) => {
        const order = await getById(orderId);

        await logActivity({
            userId: actor.id,
            action: "CREATE",
            entity: "PrintOrder",
            entityId: order.id,
            description: `${actor.fullName} đã tạo đơn dịch vụ ${order.orderCode} (${Number(order.totalAmount).toLocaleString("vi-VN")}đ)`,
        });

        return order;
    });
}

async function updateStatus(id, { status }, actor) {
    if (!status) throw ApiError.badRequest("Vui lòng chọn trạng thái mới");

    const order = await PrintOrder.findByPk(id);
    if (!order) throw ApiError.notFound("Không tìm thấy đơn dịch vụ");

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
        throw ApiError.badRequest(
            `Không thể chuyển trạng thái từ ${order.status} sang ${status}. Cho phép: ${allowed.join(", ") || "(không có)"}`
        );
    }

    return sequelize.transaction(async (t) => {
        // Doanh thu chỉ ghi nhận đúng 1 lần, đúng lúc chuyển PROCESSING -> COMPLETED
        if (status === "COMPLETED" && order.shiftId) {
            const shift = await Shift.findByPk(order.shiftId, { transaction: t, lock: t.LOCK.UPDATE });
            if (shift && shift.status === "IN_PROGRESS") {
                await shift.update(
                    { totalRevenue: Number(shift.totalRevenue) + Number(order.totalAmount) },
                    { transaction: t }
                );
            }
        }

        await order.update({ status }, { transaction: t });
        return order.id;
    }).then(async (orderId) => {
        const updated = await getById(orderId);

        await logActivity({
            userId: actor.id,
            action: "UPDATE",
            entity: "PrintOrder",
            entityId: updated.id,
            description: `${actor.fullName} đã chuyển đơn ${updated.orderCode} sang trạng thái ${status}`,
        });

        return updated;
    });
}

async function getAll({ status, shiftId, fromDate, toDate } = {}) {
    const { Op } = require("sequelize");
    const where = {};
    if (status) where.status = status;
    if (shiftId) where.shiftId = shiftId;
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
        if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    return PrintOrder.findAll({
        where,
        include: [{ model: User, as: "creator", attributes: ["id", "fullName", "username"] }],
        order: [["createdAt", "DESC"]],
    });
}

async function getById(id) {
    const order = await PrintOrder.findByPk(id, {
        include: [
            { model: PrintOrderDetail, as: "details" },
            { model: User, as: "creator", attributes: ["id", "fullName", "username"] },
        ],
    });
    if (!order) throw ApiError.notFound("Không tìm thấy đơn dịch vụ");
    return order;
}

module.exports = { createOrder, updateStatus, getAll, getById };