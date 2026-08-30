"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var env_1 = require("../config/env");
var responseHandler_1 = require("../utils/responseHandler");
var errorHandler = function (err, _req, res, next) {
    var _a;
    if (res.headersSent) {
        return next(err);
    }
    var status = err.statusCode || err.status || 500;
    var message = err.message || "Internal server error";
    var errors = (_a = err.errors) !== null && _a !== void 0 ? _a : (env_1.default.nodeEnv !== "production" ? { stack: err.stack } : null);
    console.error("[GlobalErrorHandler]", status, message);
    if (env_1.default.nodeEnv !== "production" && err.stack) {
        console.error(err.stack);
    }
    return res.status(status).json((0, responseHandler_1.errorResponse)(message, errors));
};
exports.errorHandler = errorHandler;
