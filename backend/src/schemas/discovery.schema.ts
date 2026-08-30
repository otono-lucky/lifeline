// src/schemas/discovery.schema.ts
// Zod schemas for candidate discovery

import { z } from "./common.schema";

export const DiscoveryQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1).openapi({ example: 1 }),
    limit: z.coerce.number().int().positive().default(20).openapi({ example: 20 }),
    ageMin: z.coerce.number().int().positive().optional().openapi({ example: 24 }),
    ageMax: z.coerce.number().int().positive().optional().openapi({ example: 35 }),
    churchId: z.string().uuid().optional().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
  })
  .openapi({
    description: "Discovery Filter Query Parameters",
  });
