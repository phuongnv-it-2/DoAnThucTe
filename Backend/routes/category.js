const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.get("/", authenticate, categoryController.getAll);
router.get("/:id", authenticate, categoryController.getById);

router.post("/", authenticate, authorize("ADMIN", "MANAGER"), categoryController.create);
router.put("/:id", authenticate, authorize("ADMIN", "MANAGER"), categoryController.update);
router.delete("/:id", authenticate, authorize("ADMIN", "MANAGER"), categoryController.remove);

module.exports = router;