const paymentService = require("../services/payment");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

/**
 * SePay gọi webhook này mỗi khi có giao dịch mới trên tài khoản đã kết nối.
 * Xác thực bằng header: Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>
 */
const sepayWebhook = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization || "";
    const expected = `Apikey ${process.env.SEPAY_WEBHOOK_API_KEY}`;

    if (!process.env.SEPAY_WEBHOOK_API_KEY || authHeader !== expected) {
        throw ApiError.unauthorized("Webhook không hợp lệ");
    }

    const result = await paymentService.processSepayWebhook(req.body);

    // Luôn trả 200 cho SePay để tránh nó retry vô hạn, kể cả khi không khớp hóa đơn
    res.status(200).json({ success: true, ...result, transaction: undefined });
});

const getAll = asyncHandler(async (req, res) => {
    const { fromDate, toDate, matchStatus } = req.query;
    const transactions = await paymentService.getAll({ fromDate, toDate, matchStatus });
    res.json({ success: true, data: transactions });
});

module.exports = { sepayWebhook, getAll };