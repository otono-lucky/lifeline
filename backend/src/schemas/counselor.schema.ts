// src/schemas/counselor.schema.ts
// Zod schemas for counselor management

import { z } from "./common.schema";

export const CreateCounselorSchema = z
  .object({
    email: z.string().email().openapi({ example: "counselor@church.org" }),
    password: z.string().min(8).openapi({ example: "CounselorPass123!" }),
    firstName: z.string().min(2).openapi({ example: "Pastor David" }),
    lastName: z.string().min(2).openapi({ example: "Okonkwo" }),
    phone: z.string().optional().openapi({ example: "+2348033334444" }),
    churchId: z.string().uuid().optional().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
  })
  .openapi({
    description: "Create Counselor Account Payload",
  });

export const UpdateCounselorSchema = z
  .object({
    firstName: z.string().optional().openapi({ example: "David" }),
    lastName: z.string().optional().openapi({ example: "Okonkwo" }),
    phone: z.string().optional().openapi({ example: "+2348033334444" }),
  })
  .openapi({
    description: "Update Counselor Profile Payload",
  });

export const UpdateCounselorStatusSchema = z
  .object({
    status: z.enum(["active", "suspended", "pending"]).openapi({ example: "active" }),
  })
  .openapi({
    description: "Update Counselor Status Payload",
  });
