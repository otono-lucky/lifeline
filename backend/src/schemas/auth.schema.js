"use strict";
// src/schemas/auth.schema.ts
// Zod validation schemas for Authentication & Onboarding
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.RequestVerificationSchema = exports.LoginSchema = exports.SignupSchema = exports.SocialLoginSchema = exports.LeadRegisterSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.LeadRegisterSchema = common_schema_1.z
    .object({
    email: common_schema_1.z.string().email().openapi({ example: "lead.user@example.com" }),
    firstName: common_schema_1.z.string().min(2).openapi({ example: "Grace" }),
    lastName: common_schema_1.z.string().min(2).openapi({ example: "Adeyemi" }),
    phone: common_schema_1.z.string().optional().openapi({ example: "+2348012345678" }),
    password: common_schema_1.z.string().optional().openapi({ example: "OptionalPass123!" }),
    authProvider: common_schema_1.z.string().optional().openapi({ example: "local" }),
    authProviderId: common_schema_1.z.string().optional(),
    gender: common_schema_1.GenderEnum.optional(),
})
    .openapi({
    description: "Step 1 Lead Registration Payload",
});
exports.SocialLoginSchema = common_schema_1.z
    .object({
    provider: common_schema_1.z.enum(["google", "apple"]).openapi({ example: "google" }),
    token: common_schema_1.z.string().min(10).openapi({ example: "oauth_id_token_string" }),
})
    .openapi({
    description: "Social OAuth Token Payload",
});
exports.SignupSchema = common_schema_1.z
    .object({
    email: common_schema_1.z.string().email().openapi({ example: "john.doe@example.com" }),
    password: common_schema_1.z.string().min(8).openapi({ example: "StrongPassword123!" }),
    firstName: common_schema_1.z.string().min(2).openapi({ example: "John" }),
    lastName: common_schema_1.z.string().min(2).openapi({ example: "Doe" }),
    phone: common_schema_1.z.string().optional().openapi({ example: "+2348012345678" }),
    gender: common_schema_1.GenderEnum,
    dateOfBirth: common_schema_1.z.string().date().openapi({ example: "1995-06-15" }),
    churchId: common_schema_1.z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
    parishBranch: common_schema_1.z.string().optional().openapi({ example: "City of David Parish" }),
})
    .openapi({
    description: "User Registration Payload",
});
exports.LoginSchema = common_schema_1.z
    .object({
    email: common_schema_1.z.string().email().openapi({ example: "john.doe@example.com" }),
    password: common_schema_1.z.string().min(1).openapi({ example: "StrongPassword123!" }),
})
    .openapi({
    description: "Login Credentials Payload",
});
exports.RequestVerificationSchema = common_schema_1.z
    .object({
    email: common_schema_1.z.string().email().openapi({ example: "john.doe@example.com" }),
})
    .openapi({
    description: "Resend Verification Email Request",
});
exports.ForgotPasswordSchema = common_schema_1.z
    .object({
    email: common_schema_1.z.string().email().openapi({ example: "john.doe@example.com" }),
})
    .openapi({
    description: "Forgot Password Request",
});
exports.ResetPasswordSchema = common_schema_1.z
    .object({
    token: common_schema_1.z.string().min(1).openapi({ example: "reset_token_hex" }),
    newPassword: common_schema_1.z.string().min(8).openapi({ example: "NewSecurePassword456!" }),
})
    .openapi({
    description: "Reset Password Confirmation Payload",
});
