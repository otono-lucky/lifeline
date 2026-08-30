"use strict";
// src/schemas/match.schema.ts
// Zod schemas for matches and relationship debriefs
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndRelationshipMatchSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.EndRelationshipMatchSchema = common_schema_1.z
    .object({
    reason: common_schema_1.z.string().optional().openapi({ example: "Mutual discernment to conclude courtship" }),
})
    .openapi({
    description: "End Match Payload (Flags DEBRIEF_REQUIRED state)",
});
