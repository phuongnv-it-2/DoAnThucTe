const express = require("express");
const router = express.Router();

const printOrderController = require("../controllers/printOrder");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.get("/", authenticate, printOrderController.getAll);
router.get("/:id", authenticate, printOrderController.getById);

// Tạo đơn: ADMIN/MANAGER/STAFF đều được (thu ngân trực tiếp nhận đơn)
router.post("/", authenticate, authorize("ADMIN", "MANAGER", "STAFF"), printOrderController.create);

// Cập nhật trạng thái: ADMIN/MANAGER/STAFF đều được (người xử lý đơn)
router.put("/:id/status", authenticate, authorize("ADMIN", "MANAGER", "STAFF"), printOrderController.updateStatus);

module.exports = router;