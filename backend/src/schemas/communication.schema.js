"use strict";
// src/schemas/communication.schema.ts
// Zod schemas for In-App Messaging and Dynamic Calendar Events
Object.defineProperty(exports, "__esModule", { value: true });
exports.RespondCalendarEventSchema = exports.ProposeCalendarEventSchema = exports.SendMessageSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.SendMessageSchema = common_schema_1.z
    .object({
    content: common_schema_1.z.string().min(1).openapi({ example: "Hello! Looking forward to our conversation." }),
})
    .openapi({
    description: "Send Message Payload",
});
exports.ProposeCalendarEventSchema = common_schema_1.z
    .object({
    title: common_schema_1.z.string().min(2).openapi({ example: "Pre-marital Virtual Coffee Date" }),
    scheduledAt: common_schema_1.z.string().datetime().openapi({ example: "2026-09-05T15:00:00Z" }),
    locationOrUrl: common_schema_1.z.string().optional().openapi({ example: "https://meet.google.com/abc-defg-hij" }),
})
    .openapi({
    description: "Propose Calendar Meeting Event Payload",
});
exports.RespondCalendarEventSchema = common_schema_1.z
    .object({
    response: common_schema_1.z.enum(["CONFIRMED", "CANCELLED"]).openapi({ example: "CONFIRMED" }),
})
    .openapi({
    description: "Respond to Calendar Event Payload",
});
