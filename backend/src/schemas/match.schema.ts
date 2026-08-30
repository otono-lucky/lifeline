// src/schemas/match.schema.ts
// Zod schemas for matches and relationship debriefs

import { z } from "./common.schema";

export const EndRelationshipMatchSchema = z
  .object({
    reason: z.string().optional().openapi({ example: "Mutual discernment to conclude courtship" }),
  })
  .openapi({
    description: "End Match Payload (Flags DEBRIEF_REQUIRED state)",
  });
