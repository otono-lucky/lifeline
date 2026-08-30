"use strict";
// src/schemas/counselor.schema.ts
// Zod schemas for counselor management
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCounselorStatusSchema = exports.UpdateCounselorSchema = exports.CreateCounselorSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.CreateCounselorSchema = common_schema_1.z
    .object({
    email: common_schema_1.z.string().email().openapi({ example: "counselor@church.org" }),
    password: common_schema_1.z.string().min(8).openapi({ example: "CounselorPass123!" }),
    firstName: common_schema_1.z.string().min(2).openapi({ example: "Pastor David" }),
    lastName: common_schema_1.z.string().min(2).openapi({ example: "Okonkwo" }),
    phone: common_schema_1.z.string().optional().openapi({ example: "+2348033334444" }),
    churchId: common_schema_1.z.string().uuid().optional().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
})
    .openapi({
    description: "Create Counselor Account Payload",
});
exports.UpdateCounselorSchema = common_schema_1.z
    .object({
    firstName: common_schema_1.z.string().optional().openapi({ example: "David" }),
    lastName: common_schema_1.z.string().optional().openapi({ example: "Okonkwo" }),
    phone: common_schema_1.z.string().optional().openapi({ example: "+2348033334444" }),
})
    .openapi({
    description: "Update Counselor Profile Payload",
});
exports.UpdateCounselorStatusSchema = common_schema_1.z
    .object({
    status: common_schema_1.z.enum(["active", "suspended", "pending"]).openapi({ example: "active" }),
})
    .openapi({
    description: "Update Counselor Status Payload",
});
