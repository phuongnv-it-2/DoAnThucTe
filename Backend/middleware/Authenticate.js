const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const { User, Role } = require("../models");

/**
 * Verifies the Bearer token from the Authorization header,
 * loads the current user (with role) from DB, and attaches it to req.user.
 * Rejects locked accounts as well as invalid/expired tokens.
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw ApiError.unauthorized("Không tìm thấy token xác thực");
        }

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            throw ApiError.unauthorized("Token không hợp lệ hoặc đã hết hạn");
        }

        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role, as: "role" }],
        });

        if (!user) {
            throw ApiError.unauthorized("Tài khoản không tồn tại");
        }

        if (user.status === "LOCKED") {
            throw ApiError.forbidden("Tài khoản đã bị khóa");
        }

        req.user = {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role?.name,
            roleId: user.roleId,
        };

        next();
    } catch (err) {
        next(err);
    }
}

module.exports = authenticate;