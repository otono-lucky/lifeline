// src/schemas/church.schema.ts
// Zod schemas for Church registry and 1:1 ChurchAdmin governance

import { z, ChurchModelTypeEnum } from "./common.schema";

export const CreateChurchSchema = z
  .object({
    officialName: z.string().min(2).openapi({ example: "Redeemed Christian Church of God" }),
    aka: z.string().optional().openapi({ example: "RCCG" }),
    country: z.string().min(2).openapi({ example: "Nigeria" }),
    state: z.string().min(2).openapi({ example: "Lagos" }),
    city: z.string().optional().openapi({ example: "Ikeja" }),
    address: z.string().optional().openapi({ example: "Km 46 Lagos-Ibadan Expressway" }),
    modelType: ChurchModelTypeEnum,
  })
  .openapi({
    description: "Create Church Payload",
  });

export const UpdateChurchSchema = z
  .object({
    officialName: z.string().optional().openapi({ example: "RCCG City of David" }),
    aka: z.string().optional().openapi({ example: "City of David" }),
    address: z.string().optional().openapi({ example: "Victoria Island, Lagos" }),
    status: z.enum(["active", "suspended", "pending"]).optional().openapi({ example: "active" }),
  })
  .openapi({
    description: "Update Church Payload",
  });

export const CreateChurchAdminSchema = z
  .object({
    email: z.string().email().openapi({ example: "admin@rccgcityofdavid.org" }),
    password: z.string().min(8).openapi({ example: "AdminPassword123!" }),
    firstName: z.string().min(2).openapi({ example: "Idowu" }),
    lastName: z.string().min(2).openapi({ example: "Iluyomade" }),
    phone: z.string().optional().openapi({ example: "+2348011223344" }),
    churchId: z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
    title: z.string().optional().openapi({ example: "Senior Pastor" }),
  })
  .openapi({
    description: "Create 1:1 ChurchAdmin with Pastoral Title Payload",
  });

export const UpdateChurchAdminSchema = z
  .object({
    firstName: z.string().optional().openapi({ example: "Idowu" }),
    lastName: z.string().optional().openapi({ example: "Iluyomade" }),
    phone: z.string().optional().openapi({ example: "+2348011223344" }),
    title: z.string().optional().openapi({ example: "Resident Pastor" }),
  })
  .openapi({
    description: "Update ChurchAdmin Profile / Title Payload",
  });

export const AssignCounselorSchema = z
  .object({
    userId: z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
    counselorId: z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
  })
  .openapi({
    description: "Assign Member to Counselor Payload",
  });
