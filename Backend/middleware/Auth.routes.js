const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Public
router.post("/login", authController.login);

// Only ADMIN can create new accounts (prevents public self-registration
// as MANAGER/STAFF). The very first ADMIN account is created via the seeder.
router.post(
    "/register",
    authenticate,
    authorize("ADMIN"),
    authController.register
);

// Any authenticated user can read their own profile
router.get("/me", authenticate, authController.me);

module.exports = router;