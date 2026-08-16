const express = require("express");
const router = express.Router();

const shiftController = require("../controllers/shift");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Xem: mọi tài khoản đã đăng nhập
router.get("/", authenticate, shiftController.getAll);
router.get("/current", authenticate, shiftController.getCurrent); // phải đặt TRƯỚC "/:id"
router.get("/:id", authenticate, shiftController.getById);

// Mở/đóng ca: chỉ ADMIN/MANAGER
router.post("/open", authenticate, authorize("ADMIN", "MANAGER"), shiftController.open);
router.post("/:id/close", authenticate, authorize("ADMIN", "MANAGER"), shiftController.close);

// Phân công / check-in / check-out: chỉ ADMIN/MANAGER
router.post("/:id/assignments", authenticate, authorize("ADMIN", "MANAGER"), shiftController.assign);
router.post(
    "/:id/assignments/:employeeId/check-in",
    authenticate,
    authorize("ADMIN", "MANAGER"),
    shiftController.checkIn
);
router.post(
    "/:id/assignments/:employeeId/check-out",
    authenticate,
    authorize("ADMIN", "MANAGER"),
    shiftController.checkOut
);
router.delete(
    "/:id/assignments/:employeeId",
    authenticate,
    authorize("ADMIN", "MANAGER"),
    shiftController.removeAssignment
);

module.exports = router;