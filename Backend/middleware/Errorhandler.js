const ApiError = require("../utils/ApiError");

/**
 * Converts Sequelize validation/unique errors into a clean 400/409 response.
 */
function normalizeError(err) {
    if (err instanceof ApiError) return err;

    if (err.name === "SequelizeUniqueConstraintError") {
        const fields = err.errors?.map((e) => e.path).join(", ");
        return ApiError.conflict(`Dữ liệu đã tồn tại (trùng: ${fields})`);
    }

    if (err.name === "SequelizeValidationError") {
        const message = err.errors?.map((e) => e.message).join(", ");
        return ApiError.badRequest(message || "Dữ liệu không hợp lệ");
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
        return ApiError.badRequest("Dữ liệu tham chiếu không hợp lệ");
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return ApiError.unauthorized("Token không hợp lệ hoặc đã hết hạn");
    }

    return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const normalized = normalizeError(err);
    const statusCode = normalized?.statusCode || err.statusCode || 500;
    const message = normalized?.message || err.message || "Lỗi hệ thống";

    if (statusCode === 500) {
        // eslint-disable-next-line no-console
        console.error("[UNHANDLED ERROR]", err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        details: normalized?.details || undefined,
    });
}

function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Không tìm thấy route: ${req.method} ${req.originalUrl}`,
    });
}

module.exports = { errorHandler, notFoundHandler }; 