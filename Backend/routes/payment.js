const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Webhook công khai (SePay gọi từ ngoài) — KHÔNG dùng authenticate,
// bảo mật bằng Apikey header thay vì JWT, xử lý trong controller.
router.post("/webhook/sepay", paymentController.sepayWebhook);

// Xem lịch sử đối soát: ADMIN/MANAGER
router.get("/", authenticate, authorize("ADMIN", "MANAGER"), paymentController.getAll);

module.exports = router;