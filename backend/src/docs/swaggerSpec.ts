// src/docs/swaggerSpec.ts
// OpenAPI 3.0.0 Specification for Lifeline API — Faith-Based Matchmaking Platform

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Lifeline API — Faith-Based Matchmaking Platform",
    version: "1.0.0",
    description: `## Lifeline Matchmaking Backend API Documentation
Where Faith meets Logic.

### Core Architectural Principles:
1. **Standardized Response Envelope**:
   All responses follow the canonical envelope:
   \`\`\`json
   {
     "success": true,
     "message": "Operation completed successfully",
     "data": { ... },
     "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 },
     "errors": null
   }
   \`\`\`
2. **Security & RBAC**:
   Endpoints are protected via JWT Bearer authentication (\`Authorization: Bearer <token>\`) and gated by role (\`User\`, \`Counselor\`, \`ChurchAdmin\`, \`SuperAdmin\`).
3. **100% Profile Completion Gate**:
   Discovery candidate feed and match requests require verified 100% profile score and verified liveness video intro (≤ 60s).
4. **3-Slot Discovery System & Blind Rejection**:
   Users are capped at 3 active pending outgoing requests. Declining a request notifies the sender generically without disclosing receiver identity.
5. **Atomic First-Come Acceptance**:
   Acceptance immediately pairs users in an \`IN_CONVERSATION\` match and supersedes all other pending requests.
6. **Strict Privacy Firewall**:
   Sensitive financial data (salary), precise residence address, and matchmaking preferences are restricted from Church Admins and non-assigned personnel.
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
  tags: [
    { name: "Auth", description: "Authentication, Lead Capture, Email Verification, Password Reset" },
    { name: "Discovery", description: "Candidate Discovery Feed & Geo-Weighted Matching" },
    { name: "Match Requests", description: "3-Slot Match Request Lifecycle (Send, Accept, Blind Decline, Cancel)" },
    { name: "Matches", description: "Active Matches, History, Match Details & Relationship Termination" },
    { name: "Users & Profiles", description: "User Profile Management, Media Uploads, Social Handles & Privacy Firewall" },
    { name: "Counselor Management", description: "Counselor Dashboard, Member Assignments & Counselor Profiles" },
    { name: "Vetting & Debriefs", description: "User Vetting Reviews, Exit Debrief Resets & Suspensions/Appeals" },
    { name: "Churches", description: "Church Registry (Parent-Branch & Individual Parish models) & Member Lists" },
    { name: "Church Admins", description: "1:1 Church Administrator Governance & Counselor Delegations" },
    { name: "SuperAdmin Core", description: "Platform-wide Metrics, Analytics & System Overviews" },
    { name: "Communications & Calendar", description: "In-App Conversations, Messaging & Dynamic Calendar Events" },
    { name: "Subscriptions", description: "Tiered User Subscriptions & Account Access Plans" },
    { name: "System", description: "API Health and Root Status" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
    },
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object", nullable: true },
          pagination: {
            type: "object",
            nullable: true,
            properties: {
              total: { type: "integer", example: 100 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              totalPages: { type: "integer", example: 5 },
            },
          },
          errors: { type: "object", nullable: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error explanation message" },
          data: { type: "null", example: null },
          errors: { type: "object", nullable: true },
        },
      },
      Role: {
        type: "string",
        enum: ["SuperAdmin", "ChurchAdmin", "Counselor", "User"],
      },
      GenderType: {
        type: "string",
        enum: ["Male", "Female"],
      },
      UserVettingStatus: {
        type: "string",
        enum: ["DRAFT", "PENDING_VETTING", "VETTED_ACTIVE", "REJECTED", "HARD_BLOCKED", "DEBRIEF_REQUIRED"],
      },
      MatchStatus: {
        type: "string",
        enum: ["IN_CONVERSATION", "COURTSHIP", "MARRIED", "ENDED", "DECLINED", "EXPIRED"],
      },
      MatchRequestStatus: {
        type: "string",
        enum: ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "SUPERSEDED"],
      },
      ChurchModelType: {
        type: "string",
        enum: ["PARENT_BRANCH", "INDIVIDUAL_PARISH"],
      },
      SocialMediaPlatform: {
        type: "string",
        enum: ["LinkedIn", "Instagram", "Facebook"],
      },
      EventStatus: {
        type: "string",
        enum: ["PROPOSED", "CONFIRMED", "CANCELLED"],
      },
    },
  },
  paths: {
    "/auth/lead-register": {
      post: {
        tags: ["Auth"],
        summary: "Step 1 Lead Registration",
        description: "Captures initial user contact metadata before full credentials setup.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "firstName", "lastName"],
                properties: {
                  email: { type: "string", format: "email", example: "lead.user@example.com" },
                  firstName: { type: "string", example: "Grace" },
                  lastName: { type: "string", example: "Adeyemi" },
                  phone: { type: "string", example: "+2348012345678" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Lead captured successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          400: {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/social-login": {
      post: {
        tags: ["Auth"],
        summary: "One-Click OAuth Social Login",
        description: "Authenticates or registers users via verified Google / Apple ID tokens.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["provider", "token"],
                properties: {
                  provider: { type: "string", enum: ["google", "apple"], example: "google" },
                  token: { type: "string", example: "oauth_id_token_string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Social login successful",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          400: {
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Full User Account Signup",
        description: "Creates a new user account with church association, password hashing, and initiates email verification.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "firstName", "lastName", "gender", "dateOfBirth", "churchId"],
                properties: {
                  email: { type: "string", format: "email", example: "john.doe@example.com" },
                  password: { type: "string", format: "password", example: "StrongPassword123!" },
                  firstName: { type: "string", example: "John" },
                  lastName: { type: "string", example: "Doe" },
                  phone: { type: "string", example: "+2348012345678" },
                  gender: { type: "string", enum: ["Male", "Female"], example: "Male" },
                  dateOfBirth: { type: "string", format: "date", example: "1995-06-15" },
                  churchId: { type: "string", format: "uuid", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" },
                  parishBranch: { type: "string", example: "City of David Parish" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Account created successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          400: {
            description: "Registration failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Account Credentials Login",
        description: "Authenticates any role (User, Counselor, ChurchAdmin, SuperAdmin) and returns JWT bearer token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "john.doe@example.com" },
                  password: { type: "string", format: "password", example: "StrongPassword123!" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          401: {
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get Current Authenticated User Session",
        security: [{ bearerAuth: [] }],
        description: "Returns account profile, active role, profile completion status, and permissions.",
        responses: {
          200: {
            description: "Current session data",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/verify-email/{token}": {
      get: {
        tags: ["Auth"],
        summary: "Verify Email Token",
        parameters: [
          { name: "token", in: "path", required: true, schema: { type: "string" }, description: "Verification token from email" },
        ],
        responses: {
          200: {
            description: "Email verified successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          400: {
            description: "Invalid or expired token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/request-verification": {
      post: {
        tags: ["Auth"],
        summary: "Resend Email Verification Link",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email", example: "john.doe@example.com" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Verification link sent",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request Password Reset Link",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email", example: "john.doe@example.com" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset instructions sent",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset Password with Token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "newPassword"],
                properties: {
                  token: { type: "string", example: "reset_token_hex" },
                  newPassword: { type: "string", format: "password", example: "NewSecurePassword456!" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset successful",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          400: {
            description: "Invalid token or password requirements not met",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },

    "/discovery/feed": {
      get: {
        tags: ["Discovery"],
        summary: "Candidate Discovery Feed",
        security: [{ bearerAuth: [] }],
        description: "Returns opposite-gender, VETTED_ACTIVE candidates weighted by proximity and compatibility. Gated by 100% profile completion.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "ageMin", in: "query", schema: { type: "integer" } },
          { name: "ageMax", in: "query", schema: { type: "integer" } },
          { name: "churchId", in: "query", schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: {
            description: "Discovery feed candidate cards",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          403: {
            description: "Profile incomplete (Gate blocks discovery until 100%)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },

    "/requests/send": {
      post: {
        tags: ["Match Requests"],
        summary: "Send Match Request (Max 3 Active Slots)",
        security: [{ bearerAuth: [] }],
        description: "Allocates 1 of 3 active request slots to express interest in a candidate.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["receiverId"],
                properties: { receiverId: { type: "string", format: "uuid", description: "Target User ID" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Match request sent successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
          400: {
            description: "Slot limit reached (3 active slots maximum) or already requested",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/requests/sent": {
      get: {
        tags: ["Match Requests"],
        summary: "List Sent Requests & Slot Availability",
        security: [{ bearerAuth: [] }],
        description: "Returns sent requests and slot counts. Receiver profile is redacted on non-active statuses for Blind Rejection privacy.",
        responses: {
          200: {
            description: "Sent requests and slot counters",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/requests/received": {
      get: {
        tags: ["Match Requests"],
        summary: "List Received Match Requests",
        security: [{ bearerAuth: [] }],
        description: "Returns pending incoming requests.",
        responses: {
          200: {
            description: "Received requests list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/requests/{id}/accept": {
      post: {
        tags: ["Match Requests"],
        summary: "Accept Match Request (Atomic Pairing)",
        security: [{ bearerAuth: [] }],
        description: "Atomically transitions match to IN_CONVERSATION, provisions couple channel, and auto-supersedes other pending requests.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Match established successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/requests/{id}/decline": {
      post: {
        tags: ["Match Requests"],
        summary: "Decline Match Request (Blind Rejection)",
        security: [{ bearerAuth: [] }],
        description: "Declines incoming request. Sender is notified generically of freed slot without revealing who declined.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Request declined and sender notified generically",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/requests/{id}/cancel": {
      post: {
        tags: ["Match Requests"],
        summary: "Cancel Sent Match Request",
        security: [{ bearerAuth: [] }],
        description: "Cancels a pending request and reclaims 1 request slot.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Request cancelled and slot freed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/matches/active": {
      get: {
        tags: ["Matches"],
        summary: "Get Current Active Match",
        security: [{ bearerAuth: [] }],
        description: "Returns active match details, partner profile, and counselor information for authenticated user.",
        responses: {
          200: {
            description: "Active match object",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/matches/history": {
      get: {
        tags: ["Matches"],
        summary: "Get Match History",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Match history list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/matches/{matchId}/end": {
      post: {
        tags: ["Matches"],
        summary: "End Active Relationship / Courtship",
        security: [{ bearerAuth: [] }],
        description: "Transitions match to ENDED, sets both users to DEBRIEF_REQUIRED, and de-indexes from discovery until counselor debrief.",
        parameters: [{ name: "matchId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { reason: { type: "string", example: "Mutual discernment to conclude courtship" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Match ended and debrief required",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/matches/{matchId}": {
      get: {
        tags: ["Matches"],
        summary: "Get Match Details by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "matchId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Match details",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/matches/{matchId}/profile/{accountId}": {
      get: {
        tags: ["Matches"],
        summary: "Get Matched Partner Profile",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "matchId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "accountId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: {
            description: "Partner profile within match context",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/matches/public-profile/{accountId}": {
      get: {
        tags: ["Matches"],
        summary: "Get Public Profile within Match Context",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "accountId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Public profile",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/matches/active/{accountId}": {
      get: {
        tags: ["Matches"],
        summary: "View User Active Match (Counselor / Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "accountId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "User active match",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/matches/history/{accountId}": {
      get: {
        tags: ["Matches"],
        summary: "View User Match History (Counselor / Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "accountId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "User match history",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/matches": {
      get: {
        tags: ["Matches"],
        summary: "List All Matches (Counselor / Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "List of matches",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/users": {
      get: {
        tags: ["Users & Profiles"],
        summary: "List Users (Scoped by Role & Privacy Firewall)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "churchId", in: "query", schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: {
            description: "Paginated user list with role-scoped privacy filtration",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users & Profiles"],
        summary: "Get User Profile (Privacy Firewall Enforced)",
        security: [{ bearerAuth: [] }],
        description: "Returns profile. Redacts salary range, address, and match preferences from Church Admins.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "User profile data",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
      put: {
        tags: ["Users & Profiles"],
        summary: "Update User Profile",
        security: [{ bearerAuth: [] }],
        description: "Updates user profile and recalculates completion score. Promotes DRAFT/REJECTED to PENDING_VETTING upon 100%.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  occupation: { type: "string", example: "Software Engineer" },
                  interests: { type: "array", items: { type: "string" }, example: ["Music", "Bible Study", "Technology"] },
                  matchPreference: { type: "string", enum: ["DENOMINATION_ONLY", "ANY_CHRISTIAN"], example: "DENOMINATION_ONLY" },
                  salaryRange: { type: "string", example: "MID_INCOME" },
                  videoIntroUrl: { type: "string", format: "uri", example: "https://cloudinary.com/video.mp4" },
                  videoDurationSeconds: { type: "integer", maximum: 60, example: 45 },
                  originCountry: { type: "string", example: "Nigeria" },
                  originState: { type: "string", example: "Lagos" },
                  originLga: { type: "string", example: "Ikeja" },
                  residenceCountry: { type: "string", example: "Nigeria" },
                  residenceState: { type: "string", example: "Lagos" },
                  residenceCity: { type: "string", example: "Ikeja" },
                  residenceAddress: { type: "string", example: "123 Faithful Avenue" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated and completion percentage recalculated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/users/{id}/photos": {
      post: {
        tags: ["Users & Profiles"],
        summary: "Upload Profile Photo",
        security: [{ bearerAuth: [] }],
        description: "Uploads an image (max 3 photos, order 1-3). Recalculates profile score.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file", "order"],
                properties: {
                  file: { type: "string", format: "binary" },
                  order: { type: "integer", minimum: 1, maximum: 3, example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Photo uploaded and saved",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/users/{id}/status": {
      patch: {
        tags: ["Users & Profiles"],
        summary: "Update User Account Status (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: { status: { type: "string", enum: ["active", "suspended", "pending", "deleted"], example: "active" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Account status updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/users/{id}/socials": {
      get: {
        tags: ["Users & Profiles"],
        summary: "List User Social Handles",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Verified social handles list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
      post: {
        tags: ["Users & Profiles"],
        summary: "Add Verified Social Media Handle",
        security: [{ bearerAuth: [] }],
        description: "Adds LinkedIn, Instagram, or Facebook handle (min 2, max 4 required for 100% completion).",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["platform", "handleOrUrl"],
                properties: {
                  platform: { type: "string", enum: ["LinkedIn", "Instagram", "Facebook"], example: "LinkedIn" },
                  handleOrUrl: { type: "string", example: "https://linkedin.com/in/johndoe" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Social media handle saved",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/users/{id}/socials/{socialId}": {
      delete: {
        tags: ["Users & Profiles"],
        summary: "Remove Social Media Handle",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "socialId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: {
            description: "Social handle deleted",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/counselor/dashboard": {
      get: {
        tags: ["Counselor Management"],
        summary: "Counselor Dashboard Metrics",
        security: [{ bearerAuth: [] }],
        description: "Returns statistics on assigned candidates, pending vetting queues, active matches, and debrief requests.",
        responses: {
          200: {
            description: "Counselor dashboard summary",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/counselor/{id}/dashboard": {
      get: {
        tags: ["Counselor Management"],
        summary: "View Counselor Dashboard by ID (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Counselor metrics",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/counselor/assigned-users": {
      get: {
        tags: ["Counselor Management"],
        summary: "List Counselor Assigned Members",
        security: [{ bearerAuth: [] }],
        description: "Returns unredacted candidate profiles assigned to authenticated counselor for verification.",
        responses: {
          200: {
            description: "Assigned candidate members list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/counselor/{id}/assigned-users": {
      get: {
        tags: ["Counselor Management"],
        summary: "List Assigned Users for Counselor ID (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Assigned users list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/counselor/create": {
      post: {
        tags: ["Counselor Management"],
        summary: "Create Counselor Account (ChurchAdmin / SuperAdmin)",
        security: [{ bearerAuth: [] }],
        description: "Provisions a verified counselor tied to a church parish.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "firstName", "lastName"],
                properties: {
                  email: { type: "string", format: "email", example: "counselor@church.org" },
                  password: { type: "string", format: "password", example: "CounselorPass123!" },
                  firstName: { type: "string", example: "Pastor David" },
                  lastName: { type: "string", example: "Okonkwo" },
                  phone: { type: "string", example: "+2348033334444" },
                  churchId: { type: "string", format: "uuid", description: "Required for SuperAdmin; inferred for ChurchAdmin" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Counselor account created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/counselor/list-all": {
      get: {
        tags: ["Counselor Management"],
        summary: "List All Counselors Platform-wide (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "All platform counselors",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/counselor/list": {
      get: {
        tags: ["Counselor Management"],
        summary: "List Counselors by Church Scope (Admins)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Church-scoped counselors",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/counselor/{id}": {
      get: {
        tags: ["Counselor Management"],
        summary: "Get Counselor Details",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Counselor profile details",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
      put: {
        tags: ["Counselor Management"],
        summary: "Update Counselor Profile",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Counselor profile updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/counselor/{id}/status": {
      patch: {
        tags: ["Counselor Management"],
        summary: "Update Counselor Status (Admins)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: { status: { type: "string", enum: ["active", "suspended", "pending"] } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Counselor status updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/vetting/users/{userId}/review": {
      post: {
        tags: ["Vetting & Debriefs"],
        summary: "Counselor Vetting Review (Canonical)",
        security: [{ bearerAuth: [] }],
        description: "Executes vetting decision (APPROVE, REJECT, HARD_BLOCK). Records an immutable VettingLog audit entry.",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["decision"],
                properties: {
                  decision: { type: "string", enum: ["APPROVE", "REJECT", "HARD_BLOCK"], example: "APPROVE" },
                  notes: { type: "string", example: "Verified pastoral testimony and confirmed video identity." },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Vetting review recorded and status updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/vetting/users/{userId}/debrief-reset": {
      post: {
        tags: ["Vetting & Debriefs"],
        summary: "Counselor Exit Debrief Status Reset",
        security: [{ bearerAuth: [] }],
        description: "Following a relationship exit debrief, resets user to VETTED_ACTIVE and re-enables discovery indexing.",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { notes: { type: "string", example: "Completed exit debrief. Ready for discovery." } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User reset to VETTED_ACTIVE and discovery re-indexed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/vetting/appeal": {
      post: {
        tags: ["Vetting & Debriefs"],
        summary: "Submit Appeal for Hard-Blocked Account (User)",
        security: [{ bearerAuth: [] }],
        description: "Allows a hard-blocked user to submit an appeal to SuperAdmin for reconsidering account status.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["reason"],
                properties: {
                  reason: { type: "string", example: "Misunderstanding regarding parish verification letter; submitted updated letter." },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Appeal submitted for review",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/vetting/appeals/{appealId}/review": {
      post: {
        tags: ["Vetting & Debriefs"],
        summary: "Review Appeal Request (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        description: "SuperAdmin approves or rejects a user appeal.",
        parameters: [{ name: "appealId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["decision"],
                properties: {
                  decision: { type: "string", enum: ["APPROVE", "REJECT"], example: "APPROVE" },
                  notes: { type: "string", example: "Reviewed parish credentials; restoring candidate." },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Appeal decision applied",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/churches/public": {
      get: {
        tags: ["Churches"],
        summary: "Public Active Churches List",
        description: "Unauthenticated endpoint used for registration dropdowns.",
        responses: {
          200: {
            description: "List of active churches",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/churches": {
      get: {
        tags: ["Churches"],
        summary: "List All Churches (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "modelType", in: "query", schema: { type: "string", enum: ["PARENT_BRANCH", "INDIVIDUAL_PARISH"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "List of registered churches",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
      post: {
        tags: ["Churches"],
        summary: "Register New Church (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["officialName", "country", "state", "modelType"],
                properties: {
                  officialName: { type: "string", example: "Redeemed Christian Church of God" },
                  aka: { type: "string", example: "RCCG" },
                  country: { type: "string", example: "Nigeria" },
                  state: { type: "string", example: "Lagos" },
                  city: { type: "string", example: "Ikeja" },
                  address: { type: "string", example: "Km 46 Lagos-Ibadan Expressway" },
                  modelType: { type: "string", enum: ["PARENT_BRANCH", "INDIVIDUAL_PARISH"], example: "PARENT_BRANCH" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Church created successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/churches/{id}": {
      get: {
        tags: ["Churches"],
        summary: "Get Church Details (Admins)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Church details",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
      put: {
        tags: ["Churches"],
        summary: "Update Church Details (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  officialName: { type: "string" },
                  aka: { type: "string" },
                  address: { type: "string" },
                  status: { type: "string", enum: ["active", "suspended", "pending"] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Church updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/churches/{id}/status": {
      patch: {
        tags: ["Churches"],
        summary: "Update Church Status (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: { status: { type: "string", enum: ["active", "suspended", "pending"] } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Church status updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/churches/{id}/members": {
      get: {
        tags: ["Churches"],
        summary: "List Church Members (Privacy Filtered)",
        security: [{ bearerAuth: [] }],
        description: "Privacy Firewall: Salary, exact address, and preferences redacted for ChurchAdmin view.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Church member list with privacy restrictions",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/church-admin/dashboard": {
      get: {
        tags: ["Church Admins"],
        summary: "ChurchAdmin Dashboard",
        security: [{ bearerAuth: [] }],
        description: "Scoped analytics and members overview for authenticated ChurchAdmin.",
        responses: {
          200: {
            description: "Church admin dashboard metrics",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/church-admin/dashboard/{id}": {
      get: {
        tags: ["Church Admins"],
        summary: "View ChurchAdmin Dashboard by ID (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Dashboard metrics",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/church-admin/assign-counselor": {
      post: {
        tags: ["Church Admins"],
        summary: "Assign Church Member to Counselor",
        security: [{ bearerAuth: [] }],
        description: "Assigns a registered parish member to an active counselor for verification.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "counselorId"],
                properties: {
                  userId: { type: "string", format: "uuid" },
                  counselorId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User assigned to counselor",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/church-admin/create": {
      post: {
        tags: ["Church Admins"],
        summary: "Create 1:1 ChurchAdmin with Pastoral Title (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        description: "Creates primary admin for a church. Enforces 1:1 uniqueness constraint.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "firstName", "lastName", "churchId"],
                properties: {
                  email: { type: "string", format: "email", example: "admin@rccgcityofdavid.org" },
                  password: { type: "string", format: "password", example: "AdminPassword123!" },
                  firstName: { type: "string", example: "Idowu" },
                  lastName: { type: "string", example: "Iluyomade" },
                  phone: { type: "string", example: "+2348011223344" },
                  churchId: { type: "string", format: "uuid" },
                  title: { type: "string", example: "Senior Pastor" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Church admin created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/church-admin": {
      get: {
        tags: ["Church Admins"],
        summary: "List Church Admins (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of church admins",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/church-admin/{id}": {
      get: {
        tags: ["Church Admins"],
        summary: "Get Church Admin Details",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Church admin details",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
      put: {
        tags: ["Church Admins"],
        summary: "Update Church Admin Profile / Title",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  phone: { type: "string" },
                  title: { type: "string", example: "Resident Pastor" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Church admin updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/admin/dashboard": {
      get: {
        tags: ["SuperAdmin Core"],
        summary: "Platform-wide Executive Dashboard (SuperAdmin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Platform totals, verification queues, match health, and revenue overview",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/admin/stats": {
      get: {
        tags: ["SuperAdmin Core"],
        summary: "System Performance & Aggregate Statistics",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Aggregated platform metrics",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/communications/conversations": {
      get: {
        tags: ["Communications & Calendar"],
        summary: "List In-App Conversations (Private Couple + Counselor Group)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Conversation channels list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/communications/conversations/{conversationId}/messages": {
      get: {
        tags: ["Communications & Calendar"],
        summary: "Get Conversation Message History",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "conversationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
        ],
        responses: {
          200: {
            description: "Messages list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
      post: {
        tags: ["Communications & Calendar"],
        summary: "Send In-App Message",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "conversationId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: { content: { type: "string", example: "Hello! Looking forward to connecting." } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Message sent",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/communications/matches/{matchId}/events": {
      post: {
        tags: ["Communications & Calendar"],
        summary: "Propose Meeting Event (Dynamic Calendar)",
        security: [{ bearerAuth: [] }],
        description: "Proposes a meeting or counseling session within a match.",
        parameters: [{ name: "matchId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "scheduledAt"],
                properties: {
                  title: { type: "string", example: "Pre-marital Virtual Coffee Date" },
                  scheduledAt: { type: "string", format: "date-time", example: "2026-09-05T15:00:00Z" },
                  locationOrUrl: { type: "string", example: "https://meet.google.com/abc-defg-hij" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Event proposed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/communications/events/{eventId}/respond": {
      patch: {
        tags: ["Communications & Calendar"],
        summary: "Respond to Calendar Meeting Event",
        security: [{ bearerAuth: [] }],
        description: "Accept or decline proposed meeting. Confirmation synchronizes event status.",
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["response"],
                properties: { response: { type: "string", enum: ["CONFIRMED", "CANCELLED"], example: "CONFIRMED" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Event response recorded",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/subscriptions/status": {
      get: {
        tags: ["Subscriptions"],
        summary: "Get Subscription Status",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current user tier and active subscription details",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/subscriptions/subscribe": {
      post: {
        tags: ["Subscriptions"],
        summary: "Create or Upgrade Subscription",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["planTier"],
                properties: {
                  planTier: { type: "string", enum: ["BASIC", "PREMIUM", "LIFETIME"], example: "PREMIUM" },
                  paymentReference: { type: "string", example: "PAY-123456789" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Subscription activated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/subscriptions/cancel": {
      post: {
        tags: ["Subscriptions"],
        summary: "Cancel Subscription Plan",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Subscription set to cancel at end of billing cycle",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },

    "/health": {
      get: {
        tags: ["System"],
        summary: "API Health Check",
        responses: {
          200: {
            description: "API is online",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "Lifeline API is online" } },
                },
              },
            },
          },
        },
      },
    },
    "/": {
      get: {
        tags: ["System"],
        summary: "API Root Welcome",
        responses: {
          200: {
            description: "Welcome message",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string", example: "Welcome to Lifeline API - Where Faith meets Logic." } },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
