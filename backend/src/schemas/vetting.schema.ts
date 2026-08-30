// src/schemas/vetting.schema.ts
// Zod schemas for Counselor vetting, exit debriefs, and user appeals

import { z } from "./common.schema";

export const VettingReviewSchema = z
  .object({
    decision: z.enum(["APPROVE", "REJECT", "HARD_BLOCK"]).openapi({ example: "APPROVE" }),
    notes: z.string().optional().openapi({ example: "Verified pastoral testimony and confirmed video identity." }),
  })
  .openapi({
    description: "Counselor Vetting Review Decision Payload",
  });

export const DebriefResetSchema = z
  .object({
    notes: z.string().optional().openapi({ example: "Completed exit debrief. Candidate is emotionally ready for discovery." }),
  })
  .openapi({
    description: "Post-courtship Exit Debrief Reset Payload",
  });

export const UserAppealSchema = z
  .object({
    reason: z.string().min(10).openapi({ example: "Misunderstanding regarding parish verification letter; submitted updated letter." }),
  })
  .openapi({
    description: "User Appeal Submission Payload",
  });

export const ReviewAppealSchema = z
  .object({
    decision: z.enum(["APPROVE", "REJECT"]).openapi({ example: "APPROVE" }),
    notes: z.string().optional().openapi({ example: "Reviewed parish documentation; restoring candidate." }),
  })
  .openapi({
    description: "SuperAdmin Review Appeal Payload",
  });
