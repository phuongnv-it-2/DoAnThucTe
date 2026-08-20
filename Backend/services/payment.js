const { sequelize, BankTransaction, Invoice, Shift } = require("../models");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("./activityLog");

/**
 * Tìm mã hóa đơn (VD: HD2508191234) trong nội dung chuyển khoản.
 * Khớp theo prefix "HD" + số, không phân biệt hoa/thường, bỏ khoảng trắng.
 */
function extractInvoiceCode(content) {
    if (!content) return null;
    const cleaned = content.toUpperCase().replace(/\s+/g, "");
    const match = cleaned.match(/HD\d{6,}/);
    return match ? match[0] : null;
}

/**
 * Xử lý 1 webhook giao dịch từ SePay.
 * Idempotent: nếu referenceCode đã tồn tại (SePay gửi lại do timeout/retry),
 * bỏ qua, không tạo bản ghi trùng và không cộng doanh thu 2 lần.
 */
async function processSepayWebhook(payload) {
    const {
        id: sepayId,
        gateway,
        transactionDate,
        accountNumber,
        content,
        transferType,
        transferAmount,
        referenceCode,
    } = payload;

    if (!transferAmount || transferType !== "in") {
        // Chỉ quan tâm giao dịch tiền VÀO; bỏ qua giao dịch ra để tránh nhiễu đối soát
        return { skipped: true };
    }

    if (referenceCode) {
        const existing = await BankTransaction.findOne({ where: { referenceCode } });
        if (existing) {
            return { duplicated: true, transaction: existing };
        }
    }

    const invoiceCode = extractInvoiceCode(content);
    let matchedInvoice = null;
    let matchStatus = "UNMATCHED";

    if (invoiceCode) {
        matchedInvoice = await Invoice.findOne({ where: { invoiceCode } });
        if (matchedInvoice) {
            matchStatus =
                Number(matchedInvoice.total) === Number(transferAmount)
                    ? "MATCHED"
                    : "AMOUNT_MISMATCH";
        }
    }

    const transaction = await BankTransaction.create({
        gateway: gateway || null,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        accountNumber: accountNumber || null,
        content: content || null,
        transferType,
        transferAmount,
        referenceCode: referenceCode || null,
        sepayId: sepayId ? String(sepayId) : null,
        invoiceId: matchedInvoice?.id || null,
        matchStatus,
        rawPayload: JSON.stringify(payload),
    });

    if (matchStatus === "MATCHED") {
        await logActivity({
            userId: null,
            action: "OTHER",
            entity: "BankTransaction",
            entityId: transaction.id,
            description: `Hệ thống tự động đối soát chuyển khoản khớp hóa đơn ${matchedInvoice.invoiceCode} (${Number(
                transferAmount
            ).toLocaleString("vi-VN")}đ)`,
        });
    }

    return { transaction, matchStatus, matchedInvoice };
}

async function getAll({ fromDate, toDate, matchStatus } = {}) {
    const { Op } = require("sequelize");
    const where = {};
    if (matchStatus) where.matchStatus = matchStatus;
    if (fromDate || toDate) {
        where.transactionDate = {};
        if (fromDate) where.transactionDate[Op.gte] = new Date(fromDate);
        if (toDate) where.transactionDate[Op.lte] = new Date(toDate);
    }

    return BankTransaction.findAll({
        where,
        include: [{ model: Invoice, as: "invoice", attributes: ["id", "invoiceCode", "total"] }],
        order: [["transactionDate", "DESC"]],
    });
}

module.exports = { processSepayWebhook, extractInvoiceCode, getAll };