const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Báo cáo: chỉ ADMIN/MANAGER được xem
router.get("/revenue", authenticate, authorize("ADMIN", "MANAGER"), reportController.revenueSummary);
router.get("/top-products", authenticate, authorize("ADMIN", "MANAGER"), reportController.topProducts);
router.get("/low-stock", authenticate, authorize("ADMIN", "MANAGER"), reportController.lowStock);
router.get("/export-transactions", authenticate, authorize("ADMIN", "MANAGER"), reportController.exportTransactions);
module.exports = router;