/**
 * Wraps an async route handler so any thrown error / rejected promise
 * is automatically forwarded to Express's error-handling middleware.
 * Avoids repetitive try/catch in every controller.
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;