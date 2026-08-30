// src/schemas/common.schema.ts
// Shared Zod schemas and OpenAPI extensions

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with .openapi() metadata method
extendZodWithOpenApi(z);

export { z };

// Enums
export const RoleEnum = z.enum(["SuperAdmin", "ChurchAdmin", "Counselor", "User"]).openapi({
  description: "User role for Role-Based Access Control",
  example: "User",
});

export const GenderEnum = z.enum(["Male", "Female"]).openapi({
  description: "User biological gender",
  example: "Male",
});

export const UserVettingStatusEnum = z
  .enum(["DRAFT", "PENDING_VETTING", "VETTED_ACTIVE", "REJECTED", "HARD_BLOCKED", "DEBRIEF_REQUIRED"])
  .openapi({
    description: "Account vetting state machine status",
    example: "VETTED_ACTIVE",
  });

export const MatchStatusEnum = z
  .enum(["IN_CONVERSATION", "COURTSHIP", "MARRIED", "ENDED", "DECLINED", "EXPIRED"])
  .openapi({
    description: "Relationship / Match progress status",
    example: "IN_CONVERSATION",
  });

export const MatchRequestStatusEnum = z
  .enum(["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "SUPERSEDED"])
  .openapi({
    description: "3-slot match request status",
    example: "PENDING",
  });

export const ChurchModelTypeEnum = z.enum(["PARENT_BRANCH", "INDIVIDUAL_PARISH"]).openapi({
  description: "Governance model of the church parish/denomination",
  example: "PARENT_BRANCH",
});

export const SocialMediaPlatformEnum = z.enum(["LinkedIn", "Instagram", "Facebook"]).openapi({
  description: "Verified social media handle platform (2-of-3 rule)",
  example: "LinkedIn",
});

export const EventStatusEnum = z.enum(["PROPOSED", "CONFIRMED", "CANCELLED"]).openapi({
  description: "Dynamic calendar event status",
  example: "CONFIRMED",
});

// Pagination schema
export const PaginationSchema = z
  .object({
    total: z.number().int().openapi({ example: 100 }),
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 20 }),
    totalPages: z.number().int().openapi({ example: 5 }),
  })
  .openapi({
    description: "Standard pagination metadata",
  });

// Standard Envelope Schemas
export const createSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
  z
    .object({
      success: z.literal(true).openapi({ example: true }),
      message: z.string().openapi({ example: "Operation completed successfully" }),
      data: dataSchema ? dataSchema.nullable() : z.any().nullable(),
      pagination: PaginationSchema.optional().nullable(),
      errors: z.null().openapi({ example: null }),
    })
    .openapi({
      description: "Standard Lifeline API Success Envelope",
    });

export const ErrorResponseSchema = z
  .object({
    success: z.literal(false).openapi({ example: false }),
    message: z.string().openapi({ example: "An error occurred during request processing" }),
    data: z.null().openapi({ example: null }),
    errors: z.record(z.string(), z.any()).optional().nullable(),
  })
  .openapi({
    description: "Standard Lifeline API Error Envelope",
  });

export const standardResponses = (desc?: string, dataSchema?: z.ZodTypeAny) => ({
  200: {
    description: desc || "Successful response",
    content: {
      "application/json": {
        schema: createSuccessResponseSchema(dataSchema),
      },
    },
  },
  400: {
    description: "Bad Request / Validation Error",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  401: {
    description: "Unauthorized / Missing or Invalid Token",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  403: {
    description: "Forbidden / Incomplete Profile or Insufficient Role",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  404: {
    description: "Resource Not Found",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
});
