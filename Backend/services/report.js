const { Op, fn, col, literal } = require("sequelize");
const { sequelize, Invoice, InvoiceDetail, PrintOrder, Product, Category } = require("../models");
const ApiError = require("../utils/ApiError");


function buildDateWhere(fromDate, toDate) {
    const where = {};
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
        if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }
    return where;
}

/**
 * Doanh thu tổng hợp: gộp Invoice (bán hàng) + PrintOrder (dịch vụ in ấn)
 * đã hoàn tất, không tính đơn đã hủy.
 */
async function getRevenueSummary({ fromDate, toDate, groupBy } = {}) {
    if (!fromDate || !toDate) {
        throw ApiError.badRequest("Vui lòng cung cấp fromDate và toDate");
    }

    const dateWhere = buildDateWhere(fromDate, toDate);

    const invoiceWhere = { ...dateWhere, status: "COMPLETED" };
    const printOrderWhere = { ...dateWhere, status: { [Op.in]: ["COMPLETED", "DELIVERED"] } };

    const [invoiceTotal, printOrderTotal, invoiceCount, printOrderCount] = await Promise.all([
        Invoice.sum("total", { where: invoiceWhere }),
        PrintOrder.sum("totalAmount", { where: printOrderWhere }),
        Invoice.count({ where: invoiceWhere }),
        PrintOrder.count({ where: printOrderWhere }),
    ]);

    const summary = {
        fromDate,
        toDate,
        invoiceRevenue: Number(invoiceTotal) || 0,
        printOrderRevenue: Number(printOrderTotal) || 0,
        totalRevenue: (Number(invoiceTotal) || 0) + (Number(printOrderTotal) || 0),
        invoiceCount: invoiceCount || 0,
        printOrderCount: printOrderCount || 0,
    };

    if (groupBy === "day") {
        const dailyInvoice = await Invoice.findAll({
            where: invoiceWhere,
            attributes: [
                [fn("DATE", col("createdAt")), "date"],
                [fn("SUM", col("total")), "revenue"],
                [fn("COUNT", col("id")), "count"],
            ],
            group: [literal("DATE(createdAt)")],
            raw: true,
        });

        const dailyPrintOrder = await PrintOrder.findAll({
            where: printOrderWhere,
            attributes: [
                [fn("DATE", col("createdAt")), "date"],
                [fn("SUM", col("totalAmount")), "revenue"],
                [fn("COUNT", col("id")), "count"],
            ],
            group: [literal("DATE(createdAt)")],
            raw: true,
        });

        const byDate = {};
        for (const row of dailyInvoice) {
            const d = row.date;
            byDate[d] = byDate[d] || { date: d, invoiceRevenue: 0, printOrderRevenue: 0 };
            byDate[d].invoiceRevenue = Number(row.revenue) || 0;
        }
        for (const row of dailyPrintOrder) {
            const d = row.date;
            byDate[d] = byDate[d] || { date: d, invoiceRevenue: 0, printOrderRevenue: 0 };
            byDate[d].printOrderRevenue = Number(row.revenue) || 0;
        }

        summary.daily = Object.values(byDate)
            .map((row) => ({
                ...row,
                totalRevenue: row.invoiceRevenue + row.printOrderRevenue,
            }))
            .sort((a, b) => (a.date > b.date ? 1 : -1));
    }

    return summary;
}

/**
 * Top sản phẩm bán chạy trong khoảng thời gian, tính theo InvoiceDetail
 * của các hóa đơn COMPLETED (không tính hóa đơn đã hủy).
 */
async function getTopProducts({ fromDate, toDate, limit } = {}) {
    if (!fromDate || !toDate) {
        throw ApiError.badRequest("Vui lòng cung cấp fromDate và toDate");
    }

    const rows = await InvoiceDetail.findAll({
        attributes: [
            "productId",
            "productName",
            [fn("SUM", col("InvoiceDetail.quantity")), "totalQuantity"],
            [fn("SUM", col("InvoiceDetail.total")), "totalRevenue"],
        ],
        include: [
            {
                model: Invoice,
                as: "invoice",
                attributes: [],
                where: {
                    status: "COMPLETED",
                    createdAt: { [Op.gte]: new Date(fromDate), [Op.lte]: new Date(toDate) },
                },
            },
        ],
        group: ["productId", "productName"],
        order: [[literal("totalQuantity"), "DESC"]],
        limit: limit ? Number(limit) : 10,
        raw: true,
    });

    return rows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        totalQuantity: Number(r.totalQuantity),
        totalRevenue: Number(r.totalRevenue),
    }));
}

/**
 * Danh sách sản phẩm đang có tồn kho <= ngưỡng tối thiểu (minStock),
 * dùng để cảnh báo nhập hàng.
 */
async function getLowStockProducts() {
    const products = await Product.findAll({
        where: {
            status: "ACTIVE",
            stock: { [Op.lte]: col("minStock") },
        },
        include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
        order: [["stock", "ASC"]],
    });

    return products;
}
const ExcelJS = require("exceljs");
const BankTransactionModel = require("../models").BankTransaction;

async function exportDailyTransactions({ fromDate, toDate }) {
    if (!fromDate || !toDate) {
        throw ApiError.badRequest("Vui lòng cung cấp fromDate và toDate");
    }

    const { Op } = require("sequelize");
    const transactions = await BankTransactionModel.findAll({
        where: {
            transactionDate: { [Op.gte]: new Date(fromDate), [Op.lte]: new Date(toDate) },
        },
        include: [{ model: Invoice, as: "invoice", attributes: ["invoiceCode"] }],
        order: [["transactionDate", "ASC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Giao dịch chuyển khoản");

    sheet.columns = [
        { header: "STT", key: "stt", width: 6 },
        { header: "Mã đơn", key: "invoiceCode", width: 14 },
        { header: "Thời gian", key: "time", width: 12 },
        { header: "Nội dung CK", key: "content", width: 30 },
        { header: "Số tiền", key: "amount", width: 15 },
        { header: "Ngân hàng", key: "gateway", width: 16 },
        { header: "Mã giao dịch", key: "referenceCode", width: 16 },
        { header: "Trạng thái", key: "status", width: 14 },
    ];
    sheet.getRow(1).font = { bold: true };

    const STATUS_LABEL = {
        MATCHED: "Đã khớp",
        UNMATCHED: "Chưa khớp",
        AMOUNT_MISMATCH: "Sai số tiền",
    };

    transactions.forEach((t, i) => {
        sheet.addRow({
            stt: i + 1,
            invoiceCode: t.invoice?.invoiceCode || "—",
            time: new Date(t.transactionDate).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            content: t.content || "",
            amount: Number(t.transferAmount),
            gateway: t.gateway || "",
            referenceCode: t.referenceCode || "",
            status: STATUS_LABEL[t.matchStatus] || t.matchStatus,
        });
    });

    sheet.getColumn("amount").numFmt = "#,##0";

    return workbook;
}

module.exports = { getRevenueSummary, getTopProducts, getLowStockProducts, exportDailyTransactions };

