"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
/**
 * Success response
 */
var successResponse = function (message, data, pagination) {
    if (data === void 0) { data = null; }
    return {
        success: true,
        message: message,
        data: data,
        pagination: pagination
    };
};
exports.successResponse = successResponse;
/**
 * Error response
 */
var errorResponse = function (message, errors) {
    if (errors === void 0) { errors = null; }
    return {
        success: false,
        message: message,
        data: null,
        errors: errors,
    };
};
exports.errorResponse = errorResponse;
