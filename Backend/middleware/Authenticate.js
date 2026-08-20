const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const { User, Role } = require("../models");

async function authenticate(req, res, next) {
    try {
        console.log("\n========== AUTH DEBUG ==========");

        console.log("METHOD:", req.method);
        console.log("URL:", req.originalUrl);
        console.log("ORIGIN:", req.headers.origin);
        console.log("AUTH HEADER:", req.headers.authorization);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("❌ KHÔNG CÓ BEARER TOKEN");

            throw ApiError.unauthorized(
                "Không tìm thấy token xác thực"
            );
        }

        const token = authHeader.split(" ")[1];

        console.log(
            "TOKEN:",
            token ? `${token.substring(0, 20)}...` : "NULL"
        );

        let decoded;

        try {
            decoded = verifyToken(token);

            console.log("✅ JWT DECODED:", decoded);
        } catch (err) {
            console.log("❌ JWT VERIFY ERROR:", err.message);

            throw ApiError.unauthorized(
                "Token không hợp lệ hoặc đã hết hạn"
            );
        }

        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role, as: "role" }],
        });

        console.log(
            "USER:",
            user
                ? {
                    id: user.id,
                    username: user.username,
                    status: user.status,
                    role: user.role?.name,
                }
                : null
        );

        if (!user) {
            console.log("❌ USER KHÔNG TỒN TẠI");

            throw ApiError.unauthorized(
                "Tài khoản không tồn tại"
            );
        }

        if (user.status === "LOCKED") {
            console.log("❌ USER BỊ KHÓA");

            throw ApiError.forbidden(
                "Tài khoản đã bị khóa"
            );
        }

        req.user = {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role?.name,
            roleId: user.roleId,
        };

        console.log("✅ AUTHENTICATED:", req.user);
        console.log("================================\n");

        next();
    } catch (err) {
        console.log("❌ AUTH ERROR:", err.message);
        next(err);
    }
}
module.exports = authenticate;