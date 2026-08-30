"use strict";
// src/middleware/validate.ts
// Reusable Zod Request Validation Middleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
var responseHandler_1 = require("../utils/responseHandler");
/**
 * Formats a ZodError into a clean key-value map of field errors
 */
var formatZodErrors = function (error) {
    return error.errors.reduce(function (acc, err) {
        var field = err.path.join(".") || "error";
        acc[field] = err.message;
        return acc;
    }, {});
};
/**
 * Validates request body against a Zod schema
 */
var validateBody = function (schema) {
    return function (req, res, next) {
        var result = schema.safeParse(req.body);
        if (!result.success) {
            var errors = formatZodErrors(result.error);
            return res.status(400).json((0, responseHandler_1.errorResponse)("Validation failed", errors));
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
/**
 * Validates request query parameters against a Zod schema
 */
var validateQuery = function (schema) {
    return function (req, res, next) {
        var result = schema.safeParse(req.query);
        if (!result.success) {
            var errors = formatZodErrors(result.error);
            return res.status(400).json((0, responseHandler_1.errorResponse)("Invalid query parameters", errors));
        }
        req.query = result.data;
        next();
    };
};
exports.validateQuery = validateQuery;
/**
 * Validates request path parameters against a Zod schema
 */
var validateParams = function (schema) {
    return function (req, res, next) {
        var result = schema.safeParse(req.params);
        if (!result.success) {
            var errors = formatZodErrors(result.error);
            return res.status(400).json((0, responseHandler_1.errorResponse)("Invalid URL parameters", errors));
        }
        req.params = result.data;
        next();
    };
};
exports.validateParams = validateParams;
/**
 * Validates body, query, and/or params simultaneously
 */
var validateRequest = function (schemas) {
    return function (req, res, next) {
        if (schemas.params) {
            var result = schemas.params.safeParse(req.params);
            if (!result.success) {
                return res.status(400).json((0, responseHandler_1.errorResponse)("Invalid URL parameters", formatZodErrors(result.error)));
            }
            req.params = result.data;
        }
        if (schemas.query) {
            var result = schemas.query.safeParse(req.query);
            if (!result.success) {
                return res.status(400).json((0, responseHandler_1.errorResponse)("Invalid query parameters", formatZodErrors(result.error)));
            }
            req.query = result.data;
        }
        if (schemas.body) {
            var result = schemas.body.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json((0, responseHandler_1.errorResponse)("Validation failed", formatZodErrors(result.error)));
            }
            req.body = result.data;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
exports.default = exports.validateBody;
