"use strict";
// src/schemas/subscription.schema.ts
// Zod schemas for user subscription plans
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribePlanSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.SubscribePlanSchema = common_schema_1.z
    .object({
    planTier: common_schema_1.z.enum(["BASIC", "PREMIUM", "LIFETIME"]).openapi({ example: "PREMIUM" }),
    paymentReference: common_schema_1.z.string().optional().openapi({ example: "PAY-123456789" }),
})
    .openapi({
    description: "Create or Upgrade Subscription Payload",
});
