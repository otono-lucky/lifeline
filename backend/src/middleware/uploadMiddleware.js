"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadSingle = exports.profileImageUpload = void 0;
var multer_1 = require("multer");
var responseHandler_1 = require("../utils/responseHandler");
var MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
var storage = multer_1.default.memoryStorage();
var imageFileFilter = function (_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files are allowed"));
        return;
    }
    cb(null, true);
};
exports.profileImageUpload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: imageFileFilter,
});
exports.uploadSingle = exports.profileImageUpload.single("image");
var handleUploadError = function (err, _req, res, next) {
    if (!err)
        return next();
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res
                .status(400)
                .json((0, responseHandler_1.errorResponse)("Image too large. Maximum allowed size is 5MB."));
        }
        return res.status(400).json((0, responseHandler_1.errorResponse)(err.message));
    }
    return res.status(400).json((0, responseHandler_1.errorResponse)(err.message || "Invalid upload"));
};
exports.handleUploadError = handleUploadError;
