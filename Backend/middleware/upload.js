const multer = require("multer");
const ApiError = require("../utils/ApiError");

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
        return cb(ApiError.badRequest("Chỉ chấp nhận file ảnh (jpeg, png, webp, gif)"));
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;