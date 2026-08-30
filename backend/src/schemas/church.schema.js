"use strict";
// src/schemas/church.schema.ts
// Zod schemas for Church registry and 1:1 ChurchAdmin governance
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignCounselorSchema = exports.UpdateChurchAdminSchema = exports.CreateChurchAdminSchema = exports.UpdateChurchSchema = exports.CreateChurchSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.CreateChurchSchema = common_schema_1.z
    .object({
    officialName: common_schema_1.z.string().min(2).openapi({ example: "Redeemed Christian Church of God" }),
    aka: common_schema_1.z.string().optional().openapi({ example: "RCCG" }),
    country: common_schema_1.z.string().min(2).openapi({ example: "Nigeria" }),
    state: common_schema_1.z.string().min(2).openapi({ example: "Lagos" }),
    city: common_schema_1.z.string().optional().openapi({ example: "Ikeja" }),
    address: common_schema_1.z.string().optional().openapi({ example: "Km 46 Lagos-Ibadan Expressway" }),
    modelType: common_schema_1.ChurchModelTypeEnum,
})
    .openapi({
    description: "Create Church Payload",
});
exports.UpdateChurchSchema = common_schema_1.z
    .object({
    officialName: common_schema_1.z.string().optional().openapi({ example: "RCCG City of David" }),
    aka: common_schema_1.z.string().optional().openapi({ example: "City of David" }),
    address: common_schema_1.z.string().optional().openapi({ example: "Victoria Island, Lagos" }),
    status: common_schema_1.z.enum(["active", "suspended", "pending"]).optional().openapi({ example: "active" }),
})
    .openapi({
    description: "Update Church Payload",
});
exports.CreateChurchAdminSchema = common_schema_1.z
    .object({
    email: common_schema_1.z.string().email().openapi({ example: "admin@rccgcityofdavid.org" }),
    password: common_schema_1.z.string().min(8).openapi({ example: "AdminPassword123!" }),
    firstName: common_schema_1.z.string().min(2).openapi({ example: "Idowu" }),
    lastName: common_schema_1.z.string().min(2).openapi({ example: "Iluyomade" }),
    phone: common_schema_1.z.string().optional().openapi({ example: "+2348011223344" }),
    churchId: common_schema_1.z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
    title: common_schema_1.z.string().optional().openapi({ example: "Senior Pastor" }),
})
    .openapi({
    description: "Create 1:1 ChurchAdmin with Pastoral Title Payload",
});
exports.UpdateChurchAdminSchema = common_schema_1.z
    .object({
    firstName: common_schema_1.z.string().optional().openapi({ example: "Idowu" }),
    lastName: common_schema_1.z.string().optional().openapi({ example: "Iluyomade" }),
    phone: common_schema_1.z.string().optional().openapi({ example: "+2348011223344" }),
    title: common_schema_1.z.string().optional().openapi({ example: "Resident Pastor" }),
})
    .openapi({
    description: "Update ChurchAdmin Profile / Title Payload",
});
exports.AssignCounselorSchema = common_schema_1.z
    .object({
    userId: common_schema_1.z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
    counselorId: common_schema_1.z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
})
    .openapi({
    description: "Assign Member to Counselor Payload",
});
