const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { uploadImageBuffer } = require("../services/upload");

const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("Vui lòng chọn file ảnh");

    const folder = req.query.folder || "shmart/products";
    const result = await uploadImageBuffer(req.file.buffer, folder);

    res.status(201).json({
        success: true,
        message: "Tải ảnh lên thành công",
        data: {
            url: result.secure_url,
            publicId: result.public_id,
        },
    });
});

module.exports = { uploadImage };