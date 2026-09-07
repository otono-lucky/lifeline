// src/schemas/user.schema.ts
// Zod schemas for user profiles, media, and social media handles

import { z, SocialMediaPlatformEnum } from "./common.schema";

export const UpdateUserProfileSchema = z
  .object({
    occupation: z.string().optional().openapi({ example: "Software Engineer" }),
    interests: z.array(z.string()).min(3).optional().openapi({ example: ["Music", "Bible Study", "Technology"] }),
    matchPreference: z.enum(["my_church", "my_church_plus", "other_churches"]).optional().openapi({ example: "my_church" }),
    salaryRange: z.enum(["RANGE_0_100K", "RANGE_100K_500K", "RANGE_500K_1M", "RANGE_1M_PLUS"]).optional().openapi({ example: "RANGE_100K_500K" }),
    churchId: z.string().optional(),
    church: z.string().optional(),
    branchName: z.string().optional(),
    whatsappNumber: z.string().optional(),
    dateOfBirth: z.string().or(z.date()).optional(),
    videoIntroUrl: z.string().optional().openapi({ example: "https://cloudinary.com/video.mp4" }),
    videoDurationSeconds: z.number().int().min(1).max(60).optional().openapi({ example: 45 }),
    originCountry: z.string().optional().openapi({ example: "Nigeria" }),
    originState: z.string().optional().openapi({ example: "Lagos" }),
    originLga: z.string().optional().openapi({ example: "Ikeja" }),
    residenceCountry: z.string().optional().openapi({ example: "Nigeria" }),
    residenceState: z.string().optional().openapi({ example: "Lagos" }),
    residenceCity: z.string().optional().openapi({ example: "Ikeja" }),
    residenceAddress: z.string().optional().openapi({ example: "123 Faithful Avenue" }),
    residenceFormattedAddress: z.string().optional(),
    residenceLatitude: z.number().nullable().optional(),
    residenceLongitude: z.number().nullable().optional(),
    residencePlaceId: z.string().nullable().optional(),
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
