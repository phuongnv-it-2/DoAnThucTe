const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/upload");
const upload = require("../middleware/upload");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "MANAGER"),
    upload.single("image"),
    uploadController.uploadImage
);

module.exports = router;