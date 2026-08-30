// src/schemas/communication.schema.ts
// Zod schemas for In-App Messaging and Dynamic Calendar Events

import { z } from "./common.schema";

export const SendMessageSchema = z
  .object({
    content: z.string().min(1).openapi({ example: "Hello! Looking forward to our conversation." }),
  })
  .openapi({
    description: "Send Message Payload",
  });

export const ProposeCalendarEventSchema = z
  .object({
    title: z.string().min(2).openapi({ example: "Pre-marital Virtual Coffee Date" }),
    scheduledAt: z.string().datetime().openapi({ example: "2026-09-05T15:00:00Z" }),
    locationOrUrl: z.string().optional().openapi({ example: "https://meet.google.com/abc-defg-hij" }),
  })
  .openapi({
    description: "Propose Calendar Meeting Event Payload",
  });

export const RespondCalendarEventSchema = z
  .object({
    response: z.enum(["CONFIRMED", "CANCELLED"]).openapi({ example: "CONFIRMED" }),
  })
  .openapi({
    description: "Respond to Calendar Event Payload",
  });
