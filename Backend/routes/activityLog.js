const express = require("express");
const router = express.Router();

const activityLogController = require("../controllers/activityLog");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.get("/", authenticate, authorize("ADMIN"), activityLogController.getAll);

module.exports = router;