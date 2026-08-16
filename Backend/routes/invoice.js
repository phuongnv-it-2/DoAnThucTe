const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoice");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Mọi tài khoản đã đăng nhập đều xem được hóa đơn
router.get("/", authenticate, invoiceController.getAll);
router.get("/:id", authenticate, invoiceController.getById);

// Bán hàng: ADMIN/MANAGER/STAFF đều được (thu ngân là STAFF)
router.post("/", authenticate, authorize("ADMIN", "MANAGER", "STAFF"), invoiceController.create);

// Hủy hóa đơn: chỉ ADMIN/MANAGER (ảnh hưởng doanh thu + tồn kho)
router.post("/:id/cancel", authenticate, authorize("ADMIN", "MANAGER"), invoiceController.cancel);

module.exports = router;