// src/schemas/subscription.schema.ts
// Zod schemas for user subscription plans

import { z } from "./common.schema";

export const SubscribePlanSchema = z
  .object({
    planTier: z.enum(["BASIC", "PREMIUM", "LIFETIME"]).openapi({ example: "PREMIUM" }),
    paymentReference: z.string().optional().openapi({ example: "PAY-123456789" }),
  })
  .openapi({
    description: "Create or Upgrade Subscription Payload",
  });
