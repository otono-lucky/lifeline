// src/docs/openapiRegistry.ts
// Central Dynamic OpenAPI 3.0 Registry & Generator using Zod

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
  standardResponses,
  RoleEnum,
  GenderEnum,
  UserVettingStatusEnum,
  MatchStatusEnum,
  MatchRequestStatusEnum,
  ChurchModelTypeEnum,
  SocialMediaPlatformEnum,
  EventStatusEnum,
  PaginationSchema,
  ErrorResponseSchema,
  z,
} from "../schemas/common.schema";
import {
  LeadRegisterSchema,
  SocialLoginSchema,
  SignupSchema,
  LoginSchema,
  RequestVerificationSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../schemas/auth.schema";
import { DiscoveryQuerySchema } from "../schemas/discovery.schema";
import { SendMatchRequestSchema } from "../schemas/request.schema";
import { EndRelationshipMatchSchema } from "../schemas/match.schema";
import {
  UpdateUserProfileSchema,
  AddSocialMediaHandleSchema,
  UpdateAccountStatusSchema,
} from "../schemas/user.schema";
import {
  CreateCounselorSchema,
  UpdateCounselorSchema,
  UpdateCounselorStatusSchema,
} from "../schemas/counselor.schema";
import {
  VettingReviewSchema,
  DebriefResetSchema,
  UserAppealSchema,
  ReviewAppealSchema,
} from "../schemas/vetting.schema";
import {
  CreateChurchSchema,
  UpdateChurchSchema,
  CreateChurchAdminSchema,
  UpdateChurchAdminSchema,
  AssignCounselorSchema,
} from "../schemas/church.schema";
import {
  SendMessageSchema,
  ProposeCalendarEventSchema,
  RespondCalendarEventSchema,
} from "../schemas/communication.schema";
import { SubscribePlanSchema } from "../schemas/subscription.schema";

export const registry = new OpenAPIRegistry();

// 1. Register Reusable Schemas
registry.register("Role", RoleEnum);
registry.register("Gender", GenderEnum);
registry.register("UserVettingStatus", UserVettingStatusEnum);
registry.register("MatchStatus", MatchStatusEnum);
registry.register("MatchRequestStatus", MatchRequestStatusEnum);
registry.register("ChurchModelType", ChurchModelTypeEnum);
registry.register("SocialMediaPlatform", SocialMediaPlatformEnum);
registry.register("EventStatus", EventStatusEnum);
registry.register("Pagination", PaginationSchema);
registry.register("ErrorResponse", ErrorResponseSchema);

registry.register("LeadRegisterInput", LeadRegisterSchema);
registry.register("SocialLoginInput", SocialLoginSchema);
registry.register("SignupInput", SignupSchema);
registry.register("LoginInput", LoginSchema);
registry.register("SendMatchRequestInput", SendMatchRequestSchema);
registry.register("UpdateUserProfileInput", UpdateUserProfileSchema);
registry.register("CreateCounselorInput", CreateCounselorSchema);
registry.register("VettingReviewInput", VettingReviewSchema);
registry.register("CreateChurchInput", CreateChurchSchema);
registry.register("CreateChurchAdminInput", CreateChurchAdminSchema);

// 2. Register Bearer Security Scheme
const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Enter your JWT token (obtained via /auth/login or /auth/signup)",
});

const bearerSec = [{ [bearerAuth.name]: [] }];

// ==========================================
// 3. Register Routes (Connected directly to Zod)
// ==========================================

// --- AUTH ---
registry.registerPath({
  method: "post",
  path: "/auth/lead-register",
  tags: ["Auth"],
  summary: "Step 1 Lead Registration",
  description: "Captures initial user contact metadata before full credentials setup.",
  request: {
    body: {
      content: { "application/json": { schema: LeadRegisterSchema } },
    },
  },
  responses: standardResponses("Lead registered successfully"),
});

registry.registerPath({
  method: "post",
  path: "/auth/social-login",
  tags: ["Auth"],
  summary: "One-Click OAuth Social Login",
  description: "Authenticates or registers users via verified Google / Apple ID tokens.",
  request: {
    body: {
      content: { "application/json": { schema: SocialLoginSchema } },
    },
  },
  responses: standardResponses("Social login successful"),
});

registry.registerPath({
  method: "post",
  path: "/auth/signup",
  tags: ["Auth"],
  summary: "Full User Account Signup",
  description: "Creates a new user account with church association, password hashing, and initiates email verification.",
  request: {
    body: {
      content: { "application/json": { schema: SignupSchema } },
    },
  },
  responses: standardResponses("Account created successfully"),
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auths"],
  summary: "Account Credentials Login",
  description: "Authenticates any role and returns JWT bearer token.",
  request: {
    body: {
      content: { "application/json": { schema: LoginSchema } },
    },
  },
  responses: standardResponses("Login successful with token"),
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Get Current Authenticated User",
  security: bearerSec,
  responses: standardResponses("Authenticated user profile and permissions"),
});

registry.registerPath({
  method: "get",
  path: "/auth/verify-email/{token}",
  tags: ["Auth"],
  summary: "Verify Email Token",
  request: {
    params: z.object({ token: z.string().openapi({ description: "Email verification token" }) }),
  },
  responses: standardResponses("Email verified successfully"),
});

registry.registerPath({
  method: "post",
  path: "/auth/request-verification",
  tags: ["Auth"],
  summary: "Resend Email Verification Link",
  request: {
    body: {
      content: { "application/json": { schema: RequestVerificationSchema } },
    },
  },
  responses: standardResponses("Verification email dispatched"),
});

registry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  tags: ["Auth"],
  summary: "Request Password Reset Link",
  request: {
    body: {
      content: { "application/json": { schema: ForgotPasswordSchema } },
    },
  },
  responses: standardResponses("Password reset link sent"),
});

registry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Auth"],
  summary: "Reset Password with Token",
  request: {
    body: {
      content: { "application/json": { schema: ResetPasswordSchema } },
    },
  },
  responses: standardResponses("Password reset successfully"),
});

// --- DISCOVERY ---
registry.registerPath({
  method: "get",
  path: "/discovery/feed",
  tags: ["Discovery"],
  summary: "Candidate Discovery Feed",
  security: bearerSec,
  description: "Returns opposite-gender, VETTED_ACTIVE candidates weighted by geo-proximity. Enforces 100% Profile Gate.",
  request: {
    query: DiscoveryQuerySchema,
  },
  responses: standardResponses("Candidate discovery feed"),
});

// --- MATCH REQUESTS ---
registry.registerPath({
  method: "post",
  path: "/requests/send",
  tags: ["Match Requests"],
  summary: "Send Match Request (3-Slot Cap)",
  security: bearerSec,
  request: {
    body: {
      content: { "application/json": { schema: SendMatchRequestSchema } },
    },
  },
  responses: standardResponses("Request sent and slot allocated"),
});

registry.registerPath({
  method: "get",
  path: "/requests/sent",
  tags: ["Match Requests"],
  summary: "List Sent Requests & Slot Availability",
  security: bearerSec,
  description: "Returns sent requests. Redacts receiver identity on non-active statuses for Blind Rejection.",
  responses: standardResponses("Sent requests with blind rejection privacy"),
});

registry.registerPath({
  method: "get",
  path: "/requests/received",
  tags: ["Match Requests"],
  summary: "List Received Match Requests",
  security: bearerSec,
  responses: standardResponses("Received requests list"),
});

registry.registerPath({
  method: "post",
  path: "/requests/{id}/accept",
  tags: ["Match Requests"],
  summary: "Accept Match Request (Atomic Acceptance)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Match established into IN_CONVERSATION and channels created"),
});

registry.registerPath({
  method: "post",
  path: "/requests/{id}/decline",
  tags: ["Match Requests"],
  summary: "Decline Match Request (Blind Rejection)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Request declined and sender notified of available slot"),
});

registry.registerPath({
  method: "post",
  path: "/requests/{id}/cancel",
  tags: ["Match Requests"],
  summary: "Cancel Sent Match Request",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Request cancelled and slot reclaimed"),
});

// --- MATCHES ---
registry.registerPath({
  method: "get",
  path: "/matches/active",
  tags: ["Matches"],
  summary: "Get Current Active Match",
  security: bearerSec,
  responses: standardResponses("Active match details"),
});

registry.registerPath({
  method: "get",
  path: "/matches/history",
  tags: ["Matches"],
  summary: "Get Match History",
  security: bearerSec,
  responses: standardResponses("Historical matches"),
});

registry.registerPath({
  method: "post",
  path: "/matches/{matchId}/end",
  tags: ["Matches"],
  summary: "End Active Relationship / Match",
  security: bearerSec,
  description: "Transitions match to ENDED, sets users to DEBRIEF_REQUIRED, and de-indexes from discovery.",
  request: {
    params: z.object({ matchId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: EndRelationshipMatchSchema } },
    },
  },
  responses: standardResponses("Match ended and debrief required"),
});

registry.registerPath({
  method: "get",
  path: "/matches/{matchId}",
  tags: ["Matches"],
  summary: "Get Match Details by ID",
  security: bearerSec,
  request: {
    params: z.object({ matchId: z.string().uuid() }),
  },
  responses: standardResponses("Match details"),
});

registry.registerPath({
  method: "get",
  path: "/matches/{matchId}/profile/{accountId}",
  tags: ["Matches"],
  summary: "Get Matched Partner Profile",
  security: bearerSec,
  request: {
    params: z.object({ matchId: z.string().uuid(), accountId: z.string().uuid() }),
  },
  responses: standardResponses("Matched partner public profile"),
});

registry.registerPath({
  method: "get",
  path: "/matches/public-profile/{accountId}",
  tags: ["Matches"],
  summary: "Get Public Profile within Match Context",
  security: bearerSec,
  request: {
    params: z.object({ accountId: z.string().uuid() }),
  },
  responses: standardResponses("Public profile data"),
});

registry.registerPath({
  method: "get",
  path: "/matches/active/{accountId}",
  tags: ["Matches"],
  summary: "View User Active Match (Counselor / Admin)",
  security: bearerSec,
  request: {
    params: z.object({ accountId: z.string().uuid() }),
  },
  responses: standardResponses("User active match"),
});

registry.registerPath({
  method: "get",
  path: "/matches/history/{accountId}",
  tags: ["Matches"],
  summary: "View User Match History (Counselor / Admin)",
  security: bearerSec,
  request: {
    params: z.object({ accountId: z.string().uuid() }),
  },
  responses: standardResponses("User match history"),
});

registry.registerPath({
  method: "get",
  path: "/matches",
  tags: ["Matches"],
  summary: "List All Matches (Counselor / Admin)",
  security: bearerSec,
  request: {
    query: z.object({
      status: z.string().optional(),
      page: z.coerce.number().int().default(1),
      limit: z.coerce.number().int().default(20),
    }),
  },
  responses: standardResponses("Paginated matches list"),
});

// --- USERS & PROFILES ---
registry.registerPath({
  method: "get",
  path: "/users",
  tags: ["Users & Profiles"],
  summary: "List Users (Scoped by Role & Privacy Firewall)",
  security: bearerSec,
  request: {
    query: z.object({
      page: z.coerce.number().int().default(1),
      limit: z.coerce.number().int().default(20),
      search: z.string().optional(),
      status: z.string().optional(),
      churchId: z.string().uuid().optional(),
    }),
  },
  responses: standardResponses("User directory with role-based privacy filters"),
});

registry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["Users & Profiles"],
  summary: "Get User Profile (Privacy Firewall Enforced)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("User profile"),
});

registry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: ["Users & Profiles"],
  summary: "Update User Profile",
  security: bearerSec,
  description: "Updates user profile and recalculates completion score. Promotes DRAFT/REJECTED to PENDING_VETTING upon 100%.",
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: UpdateUserProfileSchema } },
    },
  },
  responses: standardResponses("Profile updated and score recalculated"),
});

registry.registerPath({
  method: "post",
  path: "/users/{id}/photos",
  tags: ["Users & Profiles"],
  summary: "Upload Profile Photo",
  security: bearerSec,
  description: "Uploads an image (max 3 photos, order 1-3). Recalculates profile score.",
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.string().openapi({ type: "string", format: "binary" }),
            order: z.coerce.number().int().min(1).max(3).openapi({ example: 1 }),
          }),
        },
      },
    },
  },
  responses: standardResponses("Photo uploaded and indexed"),
});

registry.registerPath({
  method: "patch",
  path: "/users/{id}/status",
  tags: ["Users & Profiles"],
  summary: "Update User Account Status (SuperAdmin)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: UpdateAccountStatusSchema } },
    },
  },
  responses: standardResponses("Account status updated"),
});

registry.registerPath({
  method: "get",
  path: "/users/{id}/socials",
  tags: ["Users & Profiles"],
  summary: "List User Social Handles",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Verified social handles"),
});

registry.registerPath({
  method: "post",
  path: "/users/{id}/socials",
  tags: ["Users & Profiles"],
  summary: "Add Verified Social Media Handle",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: AddSocialMediaHandleSchema } },
    },
  },
  responses: standardResponses("Social handle added"),
});

registry.registerPath({
  method: "delete",
  path: "/users/{id}/socials/{socialId}",
  tags: ["Users & Profiles"],
  summary: "Remove Social Media Handle",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid(), socialId: z.string().uuid() }),
  },
  responses: standardResponses("Social handle removed"),
});

// --- COUNSELOR MANAGEMENT ---
registry.registerPath({
  method: "get",
  path: "/counselor/dashboard",
  tags: ["Counselor Management"],
  summary: "Counselor Dashboard Metrics",
  security: bearerSec,
  responses: standardResponses("Counselor dashboard data"),
});

registry.registerPath({
  method: "get",
  path: "/counselor/{id}/dashboard",
  tags: ["Counselor Management"],
  summary: "View Counselor Dashboard by ID (Admin)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Counselor dashboard"),
});

registry.registerPath({
  method: "get",
  path: "/counselor/assigned-users",
  tags: ["Counselor Management"],
  summary: "List Counselor Assigned Members",
  security: bearerSec,
  responses: standardResponses("Full candidate profiles for assigned users"),
});

registry.registerPath({
  method: "get",
  path: "/counselor/{id}/assigned-users",
  tags: ["Counselor Management"],
  summary: "List Assigned Users for Counselor ID (Admin)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Assigned users"),
});

registry.registerPath({
  method: "post",
  path: "/counselor/create",
  tags: ["Counselor Management"],
  summary: "Create Counselor Account (ChurchAdmin / SuperAdmin)",
  security: bearerSec,
  request: {
    body: {
      content: { "application/json": { schema: CreateCounselorSchema } },
    },
  },
  responses: standardResponses("Counselor created"),
});

registry.registerPath({
  method: "get",
  path: "/counselor/list-all",
  tags: ["Counselor Management"],
  summary: "List All Counselors Platform-wide (SuperAdmin)",
  security: bearerSec,
  responses: standardResponses("All counselors list"),
});

registry.registerPath({
  method: "get",
  path: "/counselor/list",
  tags: ["Counselor Management"],
  summary: "List Counselors by Church Scope (Admins)",
  security: bearerSec,
  responses: standardResponses("Church counselors"),
});

registry.registerPath({
  method: "get",
  path: "/counselor/{id}",
  tags: ["Counselor Management"],
  summary: "Get Counselor Details",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Counselor details"),
});

registry.registerPath({
  method: "put",
  path: "/counselor/{id}",
  tags: ["Counselor Management"],
  summary: "Update Counselor Profile",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: UpdateCounselorSchema } },
    },
  },
  responses: standardResponses("Counselor updated"),
});

registry.registerPath({
  method: "patch",
  path: "/counselor/{id}/status",
  tags: ["Counselor Management"],
  summary: "Update Counselor Status (Admins)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: UpdateCounselorStatusSchema } },
    },
  },
  responses: standardResponses("Counselor status updated"),
});

// --- VETTING & DEBRIEFS ---
registry.registerPath({
  method: "post",
  path: "/vetting/users/{userId}/review",
  tags: ["Vetting & Debriefs"],
  summary: "Counselor Vetting Review (Canonical)",
  security: bearerSec,
  description: "Executes vetting decision (APPROVE, REJECT, HARD_BLOCK). Records an immutable VettingLog entry.",
  request: {
    params: z.object({ userId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: VettingReviewSchema } },
    },
  },
  responses: standardResponses("Vetting decision recorded"),
});

registry.registerPath({
  method: "post",
  path: "/vetting/users/{userId}/debrief-reset",
  tags: ["Vetting & Debriefs"],
  summary: "Counselor Exit Debrief Status Reset",
  security: bearerSec,
  description: "Resets candidate to VETTED_ACTIVE and re-enables discovery index after exit debrief session.",
  request: {
    params: z.object({ userId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: DebriefResetSchema } },
    },
  },
  responses: standardResponses("User restored to VETTED_ACTIVE"),
});

registry.registerPath({
  method: "post",
  path: "/vetting/appeal",
  tags: ["Vetting & Debriefs"],
  summary: "Submit Appeal for Hard-Blocked Account (User)",
  security: bearerSec,
  request: {
    body: {
      content: { "application/json": { schema: UserAppealSchema } },
    },
  },
  responses: standardResponses("Appeal submitted"),
});

registry.registerPath({
  method: "post",
  path: "/vetting/appeals/{appealId}/review",
  tags: ["Vetting & Debriefs"],
  summary: "Review Appeal Request (SuperAdmin)",
  security: bearerSec,
  request: {
    params: z.object({ appealId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: ReviewAppealSchema } },
    },
  },
  responses: standardResponses("Appeal review applied"),
});

// --- CHURCHES ---
registry.registerPath({
  method: "get",
  path: "/churches/public",
  tags: ["Churches"],
  summary: "Public Active Churches List",
  description: "Unauthenticated endpoint for signup dropdowns.",
  responses: standardResponses("Active churches list"),
});

registry.registerPath({
  method: "get",
  path: "/churches",
  tags: ["Churches"],
  summary: "List All Churches (SuperAdmin)",
  security: bearerSec,
  request: {
    query: z.object({
      modelType: ChurchModelTypeEnum.optional(),
      page: z.coerce.number().int().default(1),
      limit: z.coerce.number().int().default(20),
    }),
  },
  responses: standardResponses("Registered churches"),
});

registry.registerPath({
  method: "post",
  path: "/churches",
  tags: ["Churches"],
  summary: "Register New Church (SuperAdmin)",
  security: bearerSec,
  request: {
    body: {
      content: { "application/json": { schema: CreateChurchSchema } },
    },
  },
  responses: standardResponses("Church registered"),
});

registry.registerPath({
  method: "get",
  path: "/churches/{id}",
  tags: ["Churches"],
  summary: "Get Church Details (Admins)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Church details"),
});

registry.registerPath({
  method: "put",
  path: "/churches/{id}",
  tags: ["Churches"],
  summary: "Update Church Details (SuperAdmin)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: UpdateChurchSchema } },
    },
  },
  responses: standardResponses("Church updated"),
});

registry.registerPath({
  method: "patch",
  path: "/churches/{id}/status",
  tags: ["Churches"],
  summary: "Update Church Status (SuperAdmin)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ status: z.enum(["active", "suspended", "pending"]) }),
        },
      },
    },
  },
  responses: standardResponses("Church status updated"),
});

registry.registerPath({
  method: "get",
  path: "/churches/{id}/members",
  tags: ["Churches"],
  summary: "List Church Members (Privacy Filtered)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Church members with privacy restrictions"),
});

// --- CHURCH ADMINS ---
registry.registerPath({
  method: "get",
  path: "/church-admin/dashboard",
  tags: ["Church Admins"],
  summary: "ChurchAdmin Dashboard",
  security: bearerSec,
  responses: standardResponses("Church admin metrics and members summary"),
});

registry.registerPath({
  method: "get",
  path: "/church-admin/dashboard/{id}",
  tags: ["Church Admins"],
  summary: "View ChurchAdmin Dashboard by ID (SuperAdmin)",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Dashboard metrics"),
});

registry.registerPath({
  method: "post",
  path: "/church-admin/assign-counselor",
  tags: ["Church Admins"],
  summary: "Assign Church Member to Counselor",
  security: bearerSec,
  request: {
    body: {
      content: { "application/json": { schema: AssignCounselorSchema } },
    },
  },
  responses: standardResponses("Member assigned to counselor"),
});

registry.registerPath({
  method: "post",
  path: "/church-admin/create",
  tags: ["Church Admins"],
  summary: "Create 1:1 ChurchAdmin with Pastoral Title (SuperAdmin)",
  security: bearerSec,
  request: {
    body: {
      content: { "application/json": { schema: CreateChurchAdminSchema } },
    },
  },
  responses: standardResponses("Church admin created"),
});

registry.registerPath({
  method: "get",
  path: "/church-admin",
  tags: ["Church Admins"],
  summary: "List Church Admins (SuperAdmin)",
  security: bearerSec,
  responses: standardResponses("Church admins list"),
});

registry.registerPath({
  method: "get",
  path: "/church-admin/{id}",
  tags: ["Church Admins"],
  summary: "Get Church Admin Details",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: standardResponses("Church admin details"),
});

registry.registerPath({
  method: "put",
  path: "/church-admin/{id}",
  tags: ["Church Admins"],
  summary: "Update Church Admin Profile / Title",
  security: bearerSec,
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: UpdateChurchAdminSchema } },
    },
  },
  responses: standardResponses("Church admin updated"),
});

// --- SUPERADMIN CORE ---
registry.registerPath({
  method: "get",
  path: "/admin/dashboard",
  tags: ["SuperAdmin Core"],
  summary: "Platform-wide Executive Dashboard (SuperAdmin)",
  security: bearerSec,
  responses: standardResponses("Executive dashboard analytics"),
});

registry.registerPath({
  method: "get",
  path: "/admin/stats",
  tags: ["SuperAdmin Core"],
  summary: "System Performance & Aggregate Statistics",
  security: bearerSec,
  responses: standardResponses("Aggregate system stats"),
});

// --- COMMUNICATIONS & CALENDAR ---
registry.registerPath({
  method: "get",
  path: "/communications/conversations",
  tags: ["Communications & Calendar"],
  summary: "List In-App Conversations (Private Couple + Counselor Group)",
  security: bearerSec,
  responses: standardResponses("Conversation channels"),
});

registry.registerPath({
  method: "get",
  path: "/communications/conversations/{conversationId}/messages",
  tags: ["Communications & Calendar"],
  summary: "Get Conversation Message History",
  security: bearerSec,
  request: {
    params: z.object({ conversationId: z.string().uuid() }),
    query: z.object({ limit: z.coerce.number().int().default(50) }),
  },
  responses: standardResponses("Message history"),
});

registry.registerPath({
  method: "post",
  path: "/communications/conversations/{conversationId}/messages",
  tags: ["Communications & Calendar"],
  summary: "Send In-App Message",
  security: bearerSec,
  request: {
    params: z.object({ conversationId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: SendMessageSchema } },
    },
  },
  responses: standardResponses("Message sent"),
});

registry.registerPath({
  method: "post",
  path: "/communications/matches/{matchId}/events",
  tags: ["Communications & Calendar"],
  summary: "Propose Meeting Event (Dynamic Calendar)",
  security: bearerSec,
  request: {
    params: z.object({ matchId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: ProposeCalendarEventSchema } },
    },
  },
  responses: standardResponses("Calendar event proposed"),
});

registry.registerPath({
  method: "patch",
  path: "/communications/events/{eventId}/respond",
  tags: ["Communications & Calendar"],
  summary: "Respond to Calendar Meeting Event",
  security: bearerSec,
  request: {
    params: z.object({ eventId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: RespondCalendarEventSchema } },
    },
  },
  responses: standardResponses("Event response recorded"),
});

// --- SUBSCRIPTIONS ---
registry.registerPath({
  method: "get",
  path: "/subscriptions/status",
  tags: ["Subscriptions"],
  summary: "Get Subscription Status",
  security: bearerSec,
  responses: standardResponses("Subscription details"),
});

registry.registerPath({
  method: "post",
  path: "/subscriptions/subscribe",
  tags: ["Subscriptions"],
  summary: "Create or Upgrade Subscription",
  security: bearerSec,
  request: {
    body: {
      content: { "application/json": { schema: SubscribePlanSchema } },
    },
  },
  responses: standardResponses("Subscription activated"),
});

registry.registerPath({
  method: "post",
  path: "/subscriptions/cancel",
  tags: ["Subscriptions"],
  summary: "Cancel Subscription Plan",
  security: bearerSec,
  responses: standardResponses("Subscription cancelled"),
});

// --- SYSTEM ---
registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "API Health Check",
  responses: {
    200: {
      description: "API is online",
      content: {
        "application/json": {
          schema: z.object({ status: z.string().openapi({ example: "Lifeline API is online" }) }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/",
  tags: ["System"],
  summary: "API Root Welcome",
  responses: {
    200: {
      description: "Welcome message",
      content: {
        "application/json": {
          schema: z.object({ message: z.string().openapi({ example: "Welcome to Lifeline API - Where Faith meets Logic." }) }),
        },
      },
    },
  },
});

// ==========================================
// 4. Dynamic OpenAPI Document Generator
// ==========================================
export const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Lifeline API — Faith-Based Matchmaking Platform",
      version: "1.0.0",
      description: `## Lifeline Matchmaking Backend API Documentation (Generated Dynamically via Zod)
Where Faith meets Logic.

### Core Architectural Principles:
1. **Dynamic Zod Schemas**: Every route and payload is defined via runtime Zod schemas. Changes in code reflect automatically in this documentation.
2. **Standardized Response Envelope**: All API endpoints return \`{ success, message, data, pagination?, errors? }\`.
3. **Security & RBAC**: Endpoints are protected via JWT Bearer authentication (\`Authorization: Bearer <token>\`).
4. **100% Profile Completion Gate**: Discovery and requests require verified profile score and video liveness (≤ 60s).
5. **3-Slot Discovery System & Blind Rejection**: Active match requests capped at 3 slots. Rejections notify sender generically of reclaimed slots.
6. **Atomic First-Come Acceptance**: Mutual acceptance pairs users in an \`IN_CONVERSATION\` match and supersedes other pending requests.
7. **Strict Privacy Firewall**: Salary, exact address, and match preferences are isolated from Church Admins and unauthorized personnel.
`,
      contact: {
        name: "Lifeline Platform Engineering",
        url: "https://lifeline.app",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API Gateway Base Path (/api)",
      },
      {
        url: "http://localhost:5000/api",
        description: "Local Development Server",
      },
    ],
  });
};

export default generateOpenApiDocument;
