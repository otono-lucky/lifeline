"use strict";
// src/schemas/discovery.schema.ts
// Zod schemas for candidate discovery
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryQuerySchema = void 0;
var common_schema_1 = require("./common.schema");
exports.DiscoveryQuerySchema = common_schema_1.z
    .object({
    page: common_schema_1.z.coerce.number().int().positive().default(1).openapi({ example: 1 }),
    limit: common_schema_1.z.coerce.number().int().positive().default(20).openapi({ example: 20 }),
    ageMin: common_schema_1.z.coerce.number().int().positive().optional().openapi({ example: 24 }),
    ageMax: common_schema_1.z.coerce.number().int().positive().optional().openapi({ example: 35 }),
    churchId: common_schema_1.z.string().uuid().optional().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
})
    .openapi({
    description: "Discovery Filter Query Parameters",
});
