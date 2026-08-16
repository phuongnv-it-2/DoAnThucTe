const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.get("/", authenticate, authorize("ADMIN"), userController.getAll);
router.get("/:id", authenticate, authorize("ADMIN"), userController.getById);
router.put("/:id", authenticate, authorize("ADMIN"), userController.update);
router.put("/:id/status", authenticate, authorize("ADMIN"), userController.setStatus);
router.put("/:id/employee", authenticate, authorize("ADMIN"), userController.updateEmployee);

module.exports = router;