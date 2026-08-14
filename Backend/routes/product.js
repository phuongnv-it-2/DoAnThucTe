const express = require("express");
const router = express.Router();

const productController = require("../controllers/product");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.get("/", authenticate, productController.getAll);
router.get("/:id", authenticate, productController.getById);

router.post("/", authenticate, authorize("ADMIN", "MANAGER"), productController.create);
router.put("/:id", authenticate, authorize("ADMIN", "MANAGER"), productController.update);
router.delete("/:id", authenticate, authorize("ADMIN", "MANAGER"), productController.remove);

module.exports = router;