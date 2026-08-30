"use strict";
// src/schemas/user.schema.ts
// Zod schemas for user profiles, media, and social media handles
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAccountStatusSchema = exports.AddSocialMediaHandleSchema = exports.UpdateUserProfileSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.UpdateUserProfileSchema = common_schema_1.z
    .object({
    occupation: common_schema_1.z.string().optional().openapi({ example: "Software Engineer" }),
    interests: common_schema_1.z.array(common_schema_1.z.string()).min(3).optional().openapi({ example: ["Music", "Bible Study", "Technology"] }),
    matchPreference: common_schema_1.z.enum(["DENOMINATION_ONLY", "ANY_CHRISTIAN"]).optional().openapi({ example: "DENOMINATION_ONLY" }),
    salaryRange: common_schema_1.z.string().optional().openapi({ example: "MID_INCOME" }),
    videoIntroUrl: common_schema_1.z.string().url().optional().openapi({ example: "https://cloudinary.com/video.mp4" }),
    videoDurationSeconds: common_schema_1.z.number().int().min(1).max(60).optional().openapi({ example: 45 }),
    originCountry: common_schema_1.z.string().optional().openapi({ example: "Nigeria" }),
    originState: common_schema_1.z.string().optional().openapi({ example: "Lagos" }),
    originLga: common_schema_1.z.string().optional().openapi({ example: "Ikeja" }),
    residenceCountry: common_schema_1.z.string().optional().openapi({ example: "Nigeria" }),
    residenceState: common_schema_1.z.string().optional().openapi({ example: "Lagos" }),
    residenceCity: common_schema_1.z.string().optional().openapi({ example: "Ikeja" }),
    residenceAddress: common_schema_1.z.string().optional().openapi({ example: "123 Faithful Avenue" }),
})
    .openapi({
    description: "Update User Profile Payload (Recalculates completion score)",
});
exports.AddSocialMediaHandleSchema = common_schema_1.z
    .object({
    platform: common_schema_1.SocialMediaPlatformEnum,
    handleOrUrl: common_schema_1.z.string().min(3).openapi({ example: "https://linkedin.com/in/johndoe" }),
})
    .openapi({
    description: "Add Social Handle Payload (2-of-3 rule required)",
});
exports.UpdateAccountStatusSchema = common_schema_1.z
    .object({
    status: common_schema_1.z.enum(["active", "suspended", "pending", "deleted"]).openapi({ example: "active" }),
})
    .openapi({
    description: "SuperAdmin Account Status Mutation Payload",
});
