// src/schemas/request.schema.ts
// Zod schemas for 3-slot match request lifecycle

import { z } from "./common.schema";

export const SendMatchRequestSchema = z
  .object({
    receiverId: z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
  })
  .openapi({
    description: "Send Match Request Payload (Allocates 1 of 3 slots)",
  });
