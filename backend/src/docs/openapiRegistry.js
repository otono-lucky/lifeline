"use strict";
// src/docs/openapiRegistry.ts
// Central Dynamic OpenAPI 3.0 Registry & Generator using Zod
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenApiDocument = exports.registry = void 0;
var zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
var common_schema_1 = require("../schemas/common.schema");
var auth_schema_1 = require("../schemas/auth.schema");
var discovery_schema_1 = require("../schemas/discovery.schema");
var request_schema_1 = require("../schemas/request.schema");
var match_schema_1 = require("../schemas/match.schema");
var user_schema_1 = require("../schemas/user.schema");
var counselor_schema_1 = require("../schemas/counselor.schema");
var vetting_schema_1 = require("../schemas/vetting.schema");
var church_schema_1 = require("../schemas/church.schema");
var communication_schema_1 = require("../schemas/communication.schema");
var subscription_schema_1 = require("../schemas/subscription.schema");
exports.registry = new zod_to_openapi_1.OpenAPIRegistry();
// 1. Register Reusable Schemas
exports.registry.register("Role", common_schema_1.RoleEnum);
exports.registry.register("Gender", common_schema_1.GenderEnum);
exports.registry.register("UserVettingStatus", common_schema_1.UserVettingStatusEnum);
exports.registry.register("MatchStatus", common_schema_1.MatchStatusEnum);
exports.registry.register("MatchRequestStatus", common_schema_1.MatchRequestStatusEnum);
exports.registry.register("ChurchModelType", common_schema_1.ChurchModelTypeEnum);
exports.registry.register("SocialMediaPlatform", common_schema_1.SocialMediaPlatformEnum);
exports.registry.register("EventStatus", common_schema_1.EventStatusEnum);
exports.registry.register("Pagination", common_schema_1.PaginationSchema);
exports.registry.register("ErrorResponse", common_schema_1.ErrorResponseSchema);
exports.registry.register("LeadRegisterInput", auth_schema_1.LeadRegisterSchema);
exports.registry.register("SocialLoginInput", auth_schema_1.SocialLoginSchema);
exports.registry.register("SignupInput", auth_schema_1.SignupSchema);
exports.registry.register("LoginInput", auth_schema_1.LoginSchema);
exports.registry.register("SendMatchRequestInput", request_schema_1.SendMatchRequestSchema);
exports.registry.register("UpdateUserProfileInput", user_schema_1.UpdateUserProfileSchema);
exports.registry.register("CreateCounselorInput", counselor_schema_1.CreateCounselorSchema);
exports.registry.register("VettingReviewInput", vetting_schema_1.VettingReviewSchema);
exports.registry.register("CreateChurchInput", church_schema_1.CreateChurchSchema);
exports.registry.register("CreateChurchAdminInput", church_schema_1.CreateChurchAdminSchema);
// 2. Register Bearer Security Scheme
var bearerAuth = exports.registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Enter your JWT token (obtained via /auth/login or /auth/signup)",
});
var bearerSec = [(_a = {}, _a[bearerAuth.name] = [], _a)];
// ==========================================
// 3. Register Routes (Connected directly to Zod)
// ==========================================
// --- AUTH ---
exports.registry.registerPath({
    method: "post",
    path: "/auth/lead-register",
    tags: ["Auth"],
    summary: "Step 1 Lead Registration",
    description: "Captures initial user contact metadata before full credentials setup.",
    request: {
        body: {
            content: { "application/json": { schema: auth_schema_1.LeadRegisterSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Lead registered successfully"),
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/social-login",
    tags: ["Auth"],
    summary: "One-Click OAuth Social Login",
    description: "Authenticates or registers users via verified Google / Apple ID tokens.",
    request: {
        body: {
            content: { "application/json": { schema: auth_schema_1.SocialLoginSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Social login successful"),
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/signup",
    tags: ["Auth"],
    summary: "Full User Account Signup",
    description: "Creates a new user account with church association, password hashing, and initiates email verification.",
    request: {
        body: {
            content: { "application/json": { schema: auth_schema_1.SignupSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Account created successfully"),
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "Account Credentials Login",
    description: "Authenticates any role and returns JWT bearer token.",
    request: {
        body: {
            content: { "application/json": { schema: auth_schema_1.LoginSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Login successful with token"),
});
exports.registry.registerPath({
    method: "get",
    path: "/auth/me",
    tags: ["Auth"],
    summary: "Get Current Authenticated User",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Authenticated user profile and permissions"),
});
exports.registry.registerPath({
    method: "get",
    path: "/auth/verify-email/{token}",
    tags: ["Auth"],
    summary: "Verify Email Token",
    request: {
        params: common_schema_1.z.object({ token: common_schema_1.z.string().openapi({ description: "Email verification token" }) }),
    },
    responses: (0, common_schema_1.standardResponses)("Email verified successfully"),
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/request-verification",
    tags: ["Auth"],
    summary: "Resend Email Verification Link",
    request: {
        body: {
            content: { "application/json": { schema: auth_schema_1.RequestVerificationSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Verification email dispatched"),
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/forgot-password",
    tags: ["Auth"],
    summary: "Request Password Reset Link",
    request: {
        body: {
            content: { "application/json": { schema: auth_schema_1.ForgotPasswordSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Password reset link sent"),
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/reset-password",
    tags: ["Auth"],
    summary: "Reset Password with Token",
    request: {
        body: {
            content: { "application/json": { schema: auth_schema_1.ResetPasswordSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Password reset successfully"),
});
// --- DISCOVERY ---
exports.registry.registerPath({
    method: "get",
    path: "/discovery/feed",
    tags: ["Discovery"],
    summary: "Candidate Discovery Feed",
    security: bearerSec,
    description: "Returns opposite-gender, VETTED_ACTIVE candidates weighted by geo-proximity. Enforces 100% Profile Gate.",
    request: {
        query: discovery_schema_1.DiscoveryQuerySchema,
    },
    responses: (0, common_schema_1.standardResponses)("Candidate discovery feed"),
});
// --- MATCH REQUESTS ---
exports.registry.registerPath({
    method: "post",
    path: "/requests/send",
    tags: ["Match Requests"],
    summary: "Send Match Request (3-Slot Cap)",
    security: bearerSec,
    request: {
        body: {
            content: { "application/json": { schema: request_schema_1.SendMatchRequestSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Request sent and slot allocated"),
});
exports.registry.registerPath({
    method: "get",
    path: "/requests/sent",
    tags: ["Match Requests"],
    summary: "List Sent Requests & Slot Availability",
    security: bearerSec,
    description: "Returns sent requests. Redacts receiver identity on non-active statuses for Blind Rejection.",
    responses: (0, common_schema_1.standardResponses)("Sent requests with blind rejection privacy"),
});
exports.registry.registerPath({
    method: "get",
    path: "/requests/received",
    tags: ["Match Requests"],
    summary: "List Received Match Requests",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Received requests list"),
});
exports.registry.registerPath({
    method: "post",
    path: "/requests/{id}/accept",
    tags: ["Match Requests"],
    summary: "Accept Match Request (Atomic Acceptance)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Match established into IN_CONVERSATION and channels created"),
});
exports.registry.registerPath({
    method: "post",
    path: "/requests/{id}/decline",
    tags: ["Match Requests"],
    summary: "Decline Match Request (Blind Rejection)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Request declined and sender notified of available slot"),
});
exports.registry.registerPath({
    method: "post",
    path: "/requests/{id}/cancel",
    tags: ["Match Requests"],
    summary: "Cancel Sent Match Request",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Request cancelled and slot reclaimed"),
});
// --- MATCHES ---
exports.registry.registerPath({
    method: "get",
    path: "/matches/active",
    tags: ["Matches"],
    summary: "Get Current Active Match",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Active match details"),
});
exports.registry.registerPath({
    method: "get",
    path: "/matches/history",
    tags: ["Matches"],
    summary: "Get Match History",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Historical matches"),
});
exports.registry.registerPath({
    method: "post",
    path: "/matches/{matchId}/end",
    tags: ["Matches"],
    summary: "End Active Relationship / Match",
    security: bearerSec,
    description: "Transitions match to ENDED, sets users to DEBRIEF_REQUIRED, and de-indexes from discovery.",
    request: {
        params: common_schema_1.z.object({ matchId: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: match_schema_1.EndRelationshipMatchSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Match ended and debrief required"),
});
exports.registry.registerPath({
    method: "get",
    path: "/matches/{matchId}",
    tags: ["Matches"],
    summary: "Get Match Details by ID",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ matchId: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Match details"),
});
exports.registry.registerPath({
    method: "get",
    path: "/matches/{matchId}/profile/{accountId}",
    tags: ["Matches"],
    summary: "Get Matched Partner Profile",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ matchId: common_schema_1.z.string().uuid(), accountId: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Matched partner public profile"),
});
exports.registry.registerPath({
    method: "get",
    path: "/matches/public-profile/{accountId}",
    tags: ["Matches"],
    summary: "Get Public Profile within Match Context",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ accountId: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Public profile data"),
});
exports.registry.registerPath({
    method: "get",
    path: "/matches/active/{accountId}",
    tags: ["Matches"],
    summary: "View User Active Match (Counselor / Admin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ accountId: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("User active match"),
});
exports.registry.registerPath({
    method: "get",
    path: "/matches/history/{accountId}",
    tags: ["Matches"],
    summary: "View User Match History (Counselor / Admin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ accountId: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("User match history"),
});
exports.registry.registerPath({
    method: "get",
    path: "/matches",
    tags: ["Matches"],
    summary: "List All Matches (Counselor / Admin)",
    security: bearerSec,
    request: {
        query: common_schema_1.z.object({
            status: common_schema_1.z.string().optional(),
            page: common_schema_1.z.coerce.number().int().default(1),
            limit: common_schema_1.z.coerce.number().int().default(20),
        }),
    },
    responses: (0, common_schema_1.standardResponses)("Paginated matches list"),
});
// --- USERS & PROFILES ---
exports.registry.registerPath({
    method: "get",
    path: "/users",
    tags: ["Users & Profiles"],
    summary: "List Users (Scoped by Role & Privacy Firewall)",
    security: bearerSec,
    request: {
        query: common_schema_1.z.object({
            page: common_schema_1.z.coerce.number().int().default(1),
            limit: common_schema_1.z.coerce.number().int().default(20),
            search: common_schema_1.z.string().optional(),
            status: common_schema_1.z.string().optional(),
            churchId: common_schema_1.z.string().uuid().optional(),
        }),
    },
    responses: (0, common_schema_1.standardResponses)("User directory with role-based privacy filters"),
});
exports.registry.registerPath({
    method: "get",
    path: "/users/{id}",
    tags: ["Users & Profiles"],
    summary: "Get User Profile (Privacy Firewall Enforced)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("User profile"),
});
exports.registry.registerPath({
    method: "put",
    path: "/users/{id}",
    tags: ["Users & Profiles"],
    summary: "Update User Profile",
    security: bearerSec,
    description: "Updates user profile and recalculates completion score. Promotes DRAFT/REJECTED to PENDING_VETTING upon 100%.",
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: user_schema_1.UpdateUserProfileSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Profile updated and score recalculated"),
});
exports.registry.registerPath({
    method: "post",
    path: "/users/{id}/photos",
    tags: ["Users & Profiles"],
    summary: "Upload Profile Photo",
    security: bearerSec,
    description: "Uploads an image (max 3 photos, order 1-3). Recalculates profile score.",
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: {
                "multipart/form-data": {
                    schema: common_schema_1.z.object({
                        file: common_schema_1.z.string().openapi({ type: "string", format: "binary" }),
                        order: common_schema_1.z.coerce.number().int().min(1).max(3).openapi({ example: 1 }),
                    }),
                },
            },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Photo uploaded and indexed"),
});
exports.registry.registerPath({
    method: "patch",
    path: "/users/{id}/status",
    tags: ["Users & Profiles"],
    summary: "Update User Account Status (SuperAdmin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: user_schema_1.UpdateAccountStatusSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Account status updated"),
});
exports.registry.registerPath({
    method: "get",
    path: "/users/{id}/socials",
    tags: ["Users & Profiles"],
    summary: "List User Social Handles",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Verified social handles"),
});
exports.registry.registerPath({
    method: "post",
    path: "/users/{id}/socials",
    tags: ["Users & Profiles"],
    summary: "Add Verified Social Media Handle",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: user_schema_1.AddSocialMediaHandleSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Social handle added"),
});
exports.registry.registerPath({
    method: "delete",
    path: "/users/{id}/socials/{socialId}",
    tags: ["Users & Profiles"],
    summary: "Remove Social Media Handle",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid(), socialId: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Social handle removed"),
});
// --- COUNSELOR MANAGEMENT ---
exports.registry.registerPath({
    method: "get",
    path: "/counselor/dashboard",
    tags: ["Counselor Management"],
    summary: "Counselor Dashboard Metrics",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Counselor dashboard data"),
});
exports.registry.registerPath({
    method: "get",
    path: "/counselor/{id}/dashboard",
    tags: ["Counselor Management"],
    summary: "View Counselor Dashboard by ID (Admin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Counselor dashboard"),
});
exports.registry.registerPath({
    method: "get",
    path: "/counselor/assigned-users",
    tags: ["Counselor Management"],
    summary: "List Counselor Assigned Members",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Full candidate profiles for assigned users"),
});
exports.registry.registerPath({
    method: "get",
    path: "/counselor/{id}/assigned-users",
    tags: ["Counselor Management"],
    summary: "List Assigned Users for Counselor ID (Admin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Assigned users"),
});
exports.registry.registerPath({
    method: "post",
    path: "/counselor/create",
    tags: ["Counselor Management"],
    summary: "Create Counselor Account (ChurchAdmin / SuperAdmin)",
    security: bearerSec,
    request: {
        body: {
            content: { "application/json": { schema: counselor_schema_1.CreateCounselorSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Counselor created"),
});
exports.registry.registerPath({
    method: "get",
    path: "/counselor/list-all",
    tags: ["Counselor Management"],
    summary: "List All Counselors Platform-wide (SuperAdmin)",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("All counselors list"),
});
exports.registry.registerPath({
    method: "get",
    path: "/counselor/list",
    tags: ["Counselor Management"],
    summary: "List Counselors by Church Scope (Admins)",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Church counselors"),
});
exports.registry.registerPath({
    method: "get",
    path: "/counselor/{id}",
    tags: ["Counselor Management"],
    summary: "Get Counselor Details",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Counselor details"),
});
exports.registry.registerPath({
    method: "put",
    path: "/counselor/{id}",
    tags: ["Counselor Management"],
    summary: "Update Counselor Profile",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: counselor_schema_1.UpdateCounselorSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Counselor updated"),
});
exports.registry.registerPath({
    method: "patch",
    path: "/counselor/{id}/status",
    tags: ["Counselor Management"],
    summary: "Update Counselor Status (Admins)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: counselor_schema_1.UpdateCounselorStatusSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Counselor status updated"),
});
// --- VETTING & DEBRIEFS ---
exports.registry.registerPath({
    method: "post",
    path: "/vetting/users/{userId}/review",
    tags: ["Vetting & Debriefs"],
    summary: "Counselor Vetting Review (Canonical)",
    security: bearerSec,
    description: "Executes vetting decision (APPROVE, REJECT, HARD_BLOCK). Records an immutable VettingLog entry.",
    request: {
        params: common_schema_1.z.object({ userId: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: vetting_schema_1.VettingReviewSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Vetting decision recorded"),
});
exports.registry.registerPath({
    method: "post",
    path: "/vetting/users/{userId}/debrief-reset",
    tags: ["Vetting & Debriefs"],
    summary: "Counselor Exit Debrief Status Reset",
    security: bearerSec,
    description: "Resets candidate to VETTED_ACTIVE and re-enables discovery index after exit debrief session.",
    request: {
        params: common_schema_1.z.object({ userId: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: vetting_schema_1.DebriefResetSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("User restored to VETTED_ACTIVE"),
});
exports.registry.registerPath({
    method: "post",
    path: "/vetting/appeal",
    tags: ["Vetting & Debriefs"],
    summary: "Submit Appeal for Hard-Blocked Account (User)",
    security: bearerSec,
    request: {
        body: {
            content: { "application/json": { schema: vetting_schema_1.UserAppealSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Appeal submitted"),
});
exports.registry.registerPath({
    method: "post",
    path: "/vetting/appeals/{appealId}/review",
    tags: ["Vetting & Debriefs"],
    summary: "Review Appeal Request (SuperAdmin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ appealId: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: vetting_schema_1.ReviewAppealSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Appeal review applied"),
});
// --- CHURCHES ---
exports.registry.registerPath({
    method: "get",
    path: "/churches/public",
    tags: ["Churches"],
    summary: "Public Active Churches List",
    description: "Unauthenticated endpoint for signup dropdowns.",
    responses: (0, common_schema_1.standardResponses)("Active churches list"),
});
exports.registry.registerPath({
    method: "get",
    path: "/churches",
    tags: ["Churches"],
    summary: "List All Churches (SuperAdmin)",
    security: bearerSec,
    request: {
        query: common_schema_1.z.object({
            modelType: common_schema_1.ChurchModelTypeEnum.optional(),
            page: common_schema_1.z.coerce.number().int().default(1),
            limit: common_schema_1.z.coerce.number().int().default(20),
        }),
    },
    responses: (0, common_schema_1.standardResponses)("Registered churches"),
});
exports.registry.registerPath({
    method: "post",
    path: "/churches",
    tags: ["Churches"],
    summary: "Register New Church (SuperAdmin)",
    security: bearerSec,
    request: {
        body: {
            content: { "application/json": { schema: church_schema_1.CreateChurchSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Church registered"),
});
exports.registry.registerPath({
    method: "get",
    path: "/churches/{id}",
    tags: ["Churches"],
    summary: "Get Church Details (Admins)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Church details"),
});
exports.registry.registerPath({
    method: "put",
    path: "/churches/{id}",
    tags: ["Churches"],
    summary: "Update Church Details (SuperAdmin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: church_schema_1.UpdateChurchSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Church updated"),
});
exports.registry.registerPath({
    method: "patch",
    path: "/churches/{id}/status",
    tags: ["Churches"],
    summary: "Update Church Status (SuperAdmin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: {
                "application/json": {
                    schema: common_schema_1.z.object({ status: common_schema_1.z.enum(["active", "suspended", "pending"]) }),
                },
            },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Church status updated"),
});
exports.registry.registerPath({
    method: "get",
    path: "/churches/{id}/members",
    tags: ["Churches"],
    summary: "List Church Members (Privacy Filtered)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Church members with privacy restrictions"),
});
// --- CHURCH ADMINS ---
exports.registry.registerPath({
    method: "get",
    path: "/church-admin/dashboard",
    tags: ["Church Admins"],
    summary: "ChurchAdmin Dashboard",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Church admin metrics and members summary"),
});
exports.registry.registerPath({
    method: "get",
    path: "/church-admin/dashboard/{id}",
    tags: ["Church Admins"],
    summary: "View ChurchAdmin Dashboard by ID (SuperAdmin)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Dashboard metrics"),
});
exports.registry.registerPath({
    method: "post",
    path: "/church-admin/assign-counselor",
    tags: ["Church Admins"],
    summary: "Assign Church Member to Counselor",
    security: bearerSec,
    request: {
        body: {
            content: { "application/json": { schema: church_schema_1.AssignCounselorSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Member assigned to counselor"),
});
exports.registry.registerPath({
    method: "post",
    path: "/church-admin/create",
    tags: ["Church Admins"],
    summary: "Create 1:1 ChurchAdmin with Pastoral Title (SuperAdmin)",
    security: bearerSec,
    request: {
        body: {
            content: { "application/json": { schema: church_schema_1.CreateChurchAdminSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Church admin created"),
});
exports.registry.registerPath({
    method: "get",
    path: "/church-admin",
    tags: ["Church Admins"],
    summary: "List Church Admins (SuperAdmin)",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Church admins list"),
});
exports.registry.registerPath({
    method: "get",
    path: "/church-admin/{id}",
    tags: ["Church Admins"],
    summary: "Get Church Admin Details",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
    },
    responses: (0, common_schema_1.standardResponses)("Church admin details"),
});
exports.registry.registerPath({
    method: "put",
    path: "/church-admin/{id}",
    tags: ["Church Admins"],
    summary: "Update Church Admin Profile / Title",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ id: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: church_schema_1.UpdateChurchAdminSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Church admin updated"),
});
// --- SUPERADMIN CORE ---
exports.registry.registerPath({
    method: "get",
    path: "/admin/dashboard",
    tags: ["SuperAdmin Core"],
    summary: "Platform-wide Executive Dashboard (SuperAdmin)",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Executive dashboard analytics"),
});
exports.registry.registerPath({
    method: "get",
    path: "/admin/stats",
    tags: ["SuperAdmin Core"],
    summary: "System Performance & Aggregate Statistics",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Aggregate system stats"),
});
// --- COMMUNICATIONS & CALENDAR ---
exports.registry.registerPath({
    method: "get",
    path: "/communications/conversations",
    tags: ["Communications & Calendar"],
    summary: "List In-App Conversations (Private Couple + Counselor Group)",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Conversation channels"),
});
exports.registry.registerPath({
    method: "get",
    path: "/communications/conversations/{conversationId}/messages",
    tags: ["Communications & Calendar"],
    summary: "Get Conversation Message History",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ conversationId: common_schema_1.z.string().uuid() }),
        query: common_schema_1.z.object({ limit: common_schema_1.z.coerce.number().int().default(50) }),
    },
    responses: (0, common_schema_1.standardResponses)("Message history"),
});
exports.registry.registerPath({
    method: "post",
    path: "/communications/conversations/{conversationId}/messages",
    tags: ["Communications & Calendar"],
    summary: "Send In-App Message",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ conversationId: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: communication_schema_1.SendMessageSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Message sent"),
});
exports.registry.registerPath({
    method: "post",
    path: "/communications/matches/{matchId}/events",
    tags: ["Communications & Calendar"],
    summary: "Propose Meeting Event (Dynamic Calendar)",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ matchId: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: communication_schema_1.ProposeCalendarEventSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Calendar event proposed"),
});
exports.registry.registerPath({
    method: "patch",
    path: "/communications/events/{eventId}/respond",
    tags: ["Communications & Calendar"],
    summary: "Respond to Calendar Meeting Event",
    security: bearerSec,
    request: {
        params: common_schema_1.z.object({ eventId: common_schema_1.z.string().uuid() }),
        body: {
            content: { "application/json": { schema: communication_schema_1.RespondCalendarEventSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Event response recorded"),
});
// --- SUBSCRIPTIONS ---
exports.registry.registerPath({
    method: "get",
    path: "/subscriptions/status",
    tags: ["Subscriptions"],
    summary: "Get Subscription Status",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Subscription details"),
});
exports.registry.registerPath({
    method: "post",
    path: "/subscriptions/subscribe",
    tags: ["Subscriptions"],
    summary: "Create or Upgrade Subscription",
    security: bearerSec,
    request: {
        body: {
            content: { "application/json": { schema: subscription_schema_1.SubscribePlanSchema } },
        },
    },
    responses: (0, common_schema_1.standardResponses)("Subscription activated"),
});
exports.registry.registerPath({
    method: "post",
    path: "/subscriptions/cancel",
    tags: ["Subscriptions"],
    summary: "Cancel Subscription Plan",
    security: bearerSec,
    responses: (0, common_schema_1.standardResponses)("Subscription cancelled"),
});
// --- SYSTEM ---
exports.registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["System"],
    summary: "API Health Check",
    responses: {
        200: {
            description: "API is online",
            content: {
                "application/json": {
                    schema: common_schema_1.z.object({ status: common_schema_1.z.string().openapi({ example: "Lifeline API is online" }) }),
                },
            },
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/",
    tags: ["System"],
    summary: "API Root Welcome",
    responses: {
        200: {
            description: "Welcome message",
            content: {
                "application/json": {
                    schema: common_schema_1.z.object({ message: common_schema_1.z.string().openapi({ example: "Welcome to Lifeline API - Where Faith meets Logic." }) }),
                },
            },
        },
    },
});
// ==========================================
// 4. Dynamic OpenAPI Document Generator
// ==========================================
var generateOpenApiDocument = function () {
    var generator = new zod_to_openapi_1.OpenApiGeneratorV3(exports.registry.definitions);
    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            title: "Lifeline API — Faith-Based Matchmaking Platform",
            version: "1.0.0",
            description: "## Lifeline Matchmaking Backend API Documentation (Generated Dynamically via Zod)\nWhere Faith meets Logic.\n\n### Core Architectural Principles:\n1. **Dynamic Zod Schemas**: Every route and payload is defined via runtime Zod schemas. Changes in code reflect automatically in this documentation.\n2. **Standardized Response Envelope**: All API endpoints return `{ success, message, data, pagination?, errors? }`.\n3. **Security & RBAC**: Endpoints are protected via JWT Bearer authentication (`Authorization: Bearer <token>`).\n4. **100% Profile Completion Gate**: Discovery and requests require verified profile score and video liveness (\u2264 60s).\n5. **3-Slot Discovery System & Blind Rejection**: Active match requests capped at 3 slots. Rejections notify sender generically of reclaimed slots.\n6. **Atomic First-Come Acceptance**: Mutual acceptance pairs users in an `IN_CONVERSATION` match and supersedes other pending requests.\n7. **Strict Privacy Firewall**: Salary, exact address, and match preferences are isolated from Church Admins and unauthorized personnel.\n",
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
exports.generateOpenApiDocument = generateOpenApiDocument;
exports.default = exports.generateOpenApiDocument;
