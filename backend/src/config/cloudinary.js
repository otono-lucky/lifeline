"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCloudinaryConfigured = exports.cloudinary = void 0;
var cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
var env_1 = require("./env");
var isCloudinaryConfigured = Boolean(env_1.default.cloudinary.cloudName &&
    env_1.default.cloudinary.apiKey &&
    env_1.default.cloudinary.apiSecret);
exports.isCloudinaryConfigured = isCloudinaryConfigured;
if (isCloudinaryConfigured) {
    cloudinary_1.v2.config({
        cloud_name: env_1.default.cloudinary.cloudName,
        api_key: env_1.default.cloudinary.apiKey,
        api_secret: env_1.default.cloudinary.apiSecret,
    });
}
