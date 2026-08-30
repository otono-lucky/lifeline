// src/schemas/user.schema.ts
// Zod schemas for user profiles, media, and social media handles

import { z, SocialMediaPlatformEnum } from "./common.schema";

export const UpdateUserProfileSchema = z
  .object({
    occupation: z.string().optional().openapi({ example: "Software Engineer" }),
    interests: z.array(z.string()).min(3).optional().openapi({ example: ["Music", "Bible Study", "Technology"] }),
    matchPreference: z.enum(["DENOMINATION_ONLY", "ANY_CHRISTIAN"]).optional().openapi({ example: "DENOMINATION_ONLY" }),
    salaryRange: z.string().optional().openapi({ example: "MID_INCOME" }),
    videoIntroUrl: z.string().url().optional().openapi({ example: "https://cloudinary.com/video.mp4" }),
    videoDurationSeconds: z.number().int().min(1).max(60).optional().openapi({ example: 45 }),
    originCountry: z.string().optional().openapi({ example: "Nigeria" }),
    originState: z.string().optional().openapi({ example: "Lagos" }),
    originLga: z.string().optional().openapi({ example: "Ikeja" }),
    residenceCountry: z.string().optional().openapi({ example: "Nigeria" }),
    residenceState: z.string().optional().openapi({ example: "Lagos" }),
    residenceCity: z.string().optional().openapi({ example: "Ikeja" }),
    residenceAddress: z.string().optional().openapi({ example: "123 Faithful Avenue" }),
  })
  .openapi({
    description: "Update User Profile Payload (Recalculates completion score)",
  });

export const AddSocialMediaHandleSchema = z
  .object({
    platform: SocialMediaPlatformEnum,
    handleOrUrl: z.string().min(3).openapi({ example: "https://linkedin.com/in/johndoe" }),
  })
  .openapi({
    description: "Add Social Handle Payload (2-of-3 rule required)",
  });

export const UpdateAccountStatusSchema = z
  .object({
    status: z.enum(["active", "suspended", "pending", "deleted"]).openapi({ example: "active" }),
  })
  .openapi({
    description: "SuperAdmin Account Status Mutation Payload",
  });
