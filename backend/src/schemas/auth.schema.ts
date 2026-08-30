// src/schemas/auth.schema.ts
// Zod validation schemas for Authentication & Onboarding

import { z, GenderEnum } from "./common.schema";

export const LeadRegisterSchema = z
  .object({
    email: z.string().email().openapi({ example: "lead.user@example.com" }),
    firstName: z.string().min(2).openapi({ example: "Grace" }),
    lastName: z.string().min(2).openapi({ example: "Adeyemi" }),
    phone: z.string().optional().openapi({ example: "+2348012345678" }),
    password: z.string().optional().openapi({ example: "OptionalPass123!" }),
    authProvider: z.string().optional().openapi({ example: "local" }),
    authProviderId: z.string().optional(),
    gender: GenderEnum.optional(),
  })
  .openapi({
    description: "Step 1 Lead Registration Payload",
  });

export const SocialLoginSchema = z
  .object({
    provider: z.enum(["google", "apple"]).openapi({ example: "google" }),
    token: z.string().min(10).openapi({ example: "oauth_id_token_string" }),
  })
  .openapi({
    description: "Social OAuth Token Payload",
  });

export const SignupSchema = z
  .object({
    email: z.string().email().openapi({ example: "john.doe@example.com" }),
    password: z.string().min(8).openapi({ example: "StrongPassword123!" }),
    firstName: z.string().min(2).openapi({ example: "John" }),
    lastName: z.string().min(2).openapi({ example: "Doe" }),
    phone: z.string().optional().openapi({ example: "+2348012345678" }),
    gender: GenderEnum,
    dateOfBirth: z.string().date().openapi({ example: "1995-06-15" }),
    churchId: z.string().uuid().openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
    parishBranch: z.string().optional().openapi({ example: "City of David Parish" }),
  })
  .openapi({
    description: "User Registration Payload",
  });

export const LoginSchema = z
  .object({
    email: z.string().email().openapi({ example: "john.doe@example.com" }),
    password: z.string().min(1).openapi({ example: "StrongPassword123!" }),
  })
  .openapi({
    description: "Login Credentials Payload",
  });

export const RequestVerificationSchema = z
  .object({
    email: z.string().email().openapi({ example: "john.doe@example.com" }),
  })
  .openapi({
    description: "Resend Verification Email Request",
  });

export const ForgotPasswordSchema = z
  .object({
    email: z.string().email().openapi({ example: "john.doe@example.com" }),
  })
  .openapi({
    description: "Forgot Password Request",
  });

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1).openapi({ example: "reset_token_hex" }),
    newPassword: z.string().min(8).openapi({ example: "NewSecurePassword456!" }),
  })
  .openapi({
    description: "Reset Password Confirmation Payload",
  });
