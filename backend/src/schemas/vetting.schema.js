"use strict";
// src/schemas/vetting.schema.ts
// Zod schemas for Counselor vetting, exit debriefs, and user appeals
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewAppealSchema = exports.UserAppealSchema = exports.DebriefResetSchema = exports.VettingReviewSchema = void 0;
var common_schema_1 = require("./common.schema");
exports.VettingReviewSchema = common_schema_1.z
    .object({
    decision: common_schema_1.z.enum(["APPROVE", "REJECT", "HARD_BLOCK"]).openapi({ example: "APPROVE" }),
    notes: common_schema_1.z.string().optional().openapi({ example: "Verified pastoral testimony and confirmed video identity." }),
})
    .openapi({
    description: "Counselor Vetting Review Decision Payload",
});
exports.DebriefResetSchema = common_schema_1.z
    .object({
    notes: common_schema_1.z.string().optional().openapi({ example: "Completed exit debrief. Candidate is emotionally ready for discovery." }),
})
    .openapi({
    description: "Post-courtship Exit Debrief Reset Payload",
});
exports.UserAppealSchema = common_schema_1.z
    .object({
    reason: common_schema_1.z.string().min(10).openapi({ example: "Misunderstanding regarding parish verification letter; submitted updated letter." }),
})
    .openapi({
    description: "User Appeal Submission Payload",
});
exports.ReviewAppealSchema = common_schema_1.z
    .object({
    decision: common_schema_1.z.enum(["APPROVE", "REJECT"]).openapi({ example: "APPROVE" }),
    notes: common_schema_1.z.string().optional().openapi({ example: "Reviewed parish documentation; restoring candidate." }),
})
    .openapi({
    description: "SuperAdmin Review Appeal Payload",
});
