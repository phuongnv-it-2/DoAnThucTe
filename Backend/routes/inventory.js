const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventory");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Xem lịch sử kho: mọi tài khoản đã đăng nhập
router.get("/", authenticate, inventoryController.getAll);
router.get("/:id", authenticate, inventoryController.getById);

// Tạo giao dịch kho (nhập/xuất/điều chỉnh): chỉ ADMIN/MANAGER
router.post("/", authenticate, authorize("ADMIN", "MANAGER"), inventoryController.create);

module.exports = router;