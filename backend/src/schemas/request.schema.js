"use strict";
// src/schemas/request.schema.ts
// Zod schemas for 3-slot match request lifecycle
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMatchRequestSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.SendMatchRequestSchema = common_schema_1.z
    .object({
    receiverId: common_schema_1.z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
})
    .openapi({
    description: "Send Match Request Payload (Allocates 1 of 3 slots)",
});
