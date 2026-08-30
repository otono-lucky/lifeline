"use strict";
// src/schemas/common.schema.ts
// Shared Zod schemas and OpenAPI extensions
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardResponses = exports.ErrorResponseSchema = exports.createSuccessResponseSchema = exports.PaginationSchema = exports.EventStatusEnum = exports.SocialMediaPlatformEnum = exports.ChurchModelTypeEnum = exports.MatchRequestStatusEnum = exports.MatchStatusEnum = exports.UserVettingStatusEnum = exports.GenderEnum = exports.RoleEnum = exports.z = void 0;
var zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
var zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
// Extend Zod with .openapi() metadata method
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
// Enums
exports.RoleEnum = zod_1.z.enum(["SuperAdmin", "ChurchAdmin", "Counselor", "User"]).openapi({
    description: "User role for Role-Based Access Control",
    example: "User",
});
exports.GenderEnum = zod_1.z.enum(["Male", "Female"]).openapi({
    description: "User biological gender",
    example: "Male",
});
exports.UserVettingStatusEnum = zod_1.z
    .enum(["DRAFT", "PENDING_VETTING", "VETTED_ACTIVE", "REJECTED", "HARD_BLOCKED", "DEBRIEF_REQUIRED"])
    .openapi({
    description: "Account vetting state machine status",
    example: "VETTED_ACTIVE",
});
exports.MatchStatusEnum = zod_1.z
    .enum(["IN_CONVERSATION", "COURTSHIP", "MARRIED", "ENDED", "DECLINED", "EXPIRED"])
    .openapi({
    description: "Relationship / Match progress status",
    example: "IN_CONVERSATION",
});
exports.MatchRequestStatusEnum = zod_1.z
    .enum(["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "SUPERSEDED"])
    .openapi({
    description: "3-slot match request status",
    example: "PENDING",
});
exports.ChurchModelTypeEnum = zod_1.z.enum(["PARENT_BRANCH", "INDIVIDUAL_PARISH"]).openapi({
    description: "Governance model of the church parish/denomination",
    example: "PARENT_BRANCH",
});
exports.SocialMediaPlatformEnum = zod_1.z.enum(["LinkedIn", "Instagram", "Facebook"]).openapi({
    description: "Verified social media handle platform (2-of-3 rule)",
    example: "LinkedIn",
});
exports.EventStatusEnum = zod_1.z.enum(["PROPOSED", "CONFIRMED", "CANCELLED"]).openapi({
    description: "Dynamic calendar event status",
    example: "CONFIRMED",
});
// Pagination schema
exports.PaginationSchema = zod_1.z
    .object({
    total: zod_1.z.number().int().openapi({ example: 100 }),
    page: zod_1.z.number().int().openapi({ example: 1 }),
    limit: zod_1.z.number().int().openapi({ example: 20 }),
    totalPages: zod_1.z.number().int().openapi({ example: 5 }),
})
    .openapi({
    description: "Standard pagination metadata",
});
// Standard Envelope Schemas
var createSuccessResponseSchema = function (dataSchema) {
    return zod_1.z
        .object({
        success: zod_1.z.literal(true).openapi({ example: true }),
        message: zod_1.z.string().openapi({ example: "Operation completed successfully" }),
        data: dataSchema ? dataSchema.nullable() : zod_1.z.any().nullable(),
        pagination: exports.PaginationSchema.optional().nullable(),
        errors: zod_1.z.null().openapi({ example: null }),
    })
        .openapi({
        description: "Standard Lifeline API Success Envelope",
    });
};
exports.createSuccessResponseSchema = createSuccessResponseSchema;
exports.ErrorResponseSchema = zod_1.z
    .object({
    success: zod_1.z.literal(false).openapi({ example: false }),
    message: zod_1.z.string().openapi({ example: "An error occurred during request processing" }),
    data: zod_1.z.null().openapi({ example: null }),
    errors: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
})
    .openapi({
    description: "Standard Lifeline API Error Envelope",
});
var standardResponses = function (desc, dataSchema) { return ({
    200: {
        description: desc || "Successful response",
        content: {
            "application/json": {
                schema: (0, exports.createSuccessResponseSchema)(dataSchema),
            },
        },
    },
    400: {
        description: "Bad Request / Validation Error",
        content: {
            "application/json": {
                schema: exports.ErrorResponseSchema,
            },
        },
    },
    401: {
        description: "Unauthorized / Missing or Invalid Token",
        content: {
            "application/json": {
                schema: exports.ErrorResponseSchema,
            },
        },
    },
    403: {
        description: "Forbidden / Incomplete Profile or Insufficient Role",
        content: {
            "application/json": {
                schema: exports.ErrorResponseSchema,
            },
        },
    },
    404: {
        description: "Resource Not Found",
        content: {
            "application/json": {
                schema: exports.ErrorResponseSchema,
            },
        },
    },
}); };
exports.standardResponses = standardResponses;
