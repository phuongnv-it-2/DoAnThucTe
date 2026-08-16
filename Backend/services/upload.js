const cloudinary = require("../utils/cloudinary");
const ApiError = require("../utils/ApiError");

function uploadImageBuffer(buffer, folder = "shmart") {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                if (error) return reject(ApiError.internal("Tải ảnh lên thất bại: " + error.message));
                resolve(result);
            }
        );
        stream.end(buffer);
    });
}

module.exports = { uploadImageBuffer };