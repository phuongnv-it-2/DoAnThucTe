const express = require("express");
const router = express.Router();

const shiftController = require("../controllers/shift");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.get("/", authenticate, shiftController.getAll);
router.get("/current", authenticate, shiftController.getCurrent);
router.get("/employees", authenticate, shiftController.listEmployees);

// Báo cáo lương tháng: chỉ ADMIN/MANAGER
router.get("/payroll", authenticate, authorize("ADMIN", "MANAGER"), shiftController.payroll);
router.get("/payroll/export", authenticate, authorize("ADMIN", "MANAGER"), shiftController.exportPayroll);

router.get("/:id", authenticate, shiftController.getById);

// Nhân viên tự mở/đóng ca
router.post("/open", authenticate, authorize("ADMIN", "MANAGER", "STAFF"), shiftController.open);
router.post("/:id/close", authenticate, authorize("ADMIN", "MANAGER", "STAFF"), shiftController.close);

module.exports = router;