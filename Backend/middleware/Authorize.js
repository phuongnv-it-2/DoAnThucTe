const ApiError = require("../utils/ApiError");

/**
 * Role-based access control middleware factory.
 * Usage:
 *   router.get("/", authenticate, authorize("ADMIN"), controller)
 *   router.get("/", authenticate, authorize("ADMIN", "MANAGER"), controller)
 *
 * Must run AFTER `authenticate`, since it relies on req.user.role.
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return next(ApiError.unauthorized("Chưa xác thực"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                ApiError.forbidden("Bạn không có quyền thực hiện thao tác này")
            );
        }

        next();
    };
}

module.exports = authorize;