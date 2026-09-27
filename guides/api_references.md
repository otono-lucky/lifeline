# Lifeline Platform — Comprehensive API References & Integration Specification

> **Source of Truth Reference**:
> This document specifies all RESTful API endpoints for the Lifeline faith-based matchmaking platform. It reflects the live Express backend controllers, Zod validation schemas, and Prisma database models, supporting both the **Web Administrative Portals** (`SuperAdmin`, `ChurchAdmin`, `Counselor`) and the **Native Mobile Application** (`User` daters).

---

## Table of Contents
1. [Global API Standards & Architecture](#1-global-api-standards--architecture)
   - [1.1 Base URL & Environment Configuration](#11-base-url--environment-configuration)
   - [1.2 Authentication & Authorization Protocols](#12-authentication--authorization-protocols)
   - [1.3 Standard Response & Error Envelopes](#13-standard-response--error-envelopes)
   - [1.4 Standard HTTP Status Codes](#14-standard-http-status-codes)
   - [1.5 Platform Safeguarding Guards & Firewalls](#15-platform-safeguarding-guards--firewalls)
2. [Module 1: Authentication & Lead Acquisition (`/api/auth`)](#module-1-authentication--lead-acquisition-apiauth)
3. [Module 2: User Profiles & Verification Media (`/api/users`)](#module-2-user-profiles--verification-media-apiusers)
4. [Module 3: Match Discovery & Request Engine (`/api/discovery` & `/api/requests`)](#module-3-match-discovery--request-engine-apidiscovery--apirequests)
5. [Module 4: Relationship Courtship & Matching Lifecycle (`/api/matches`)](#module-4-relationship-courtship--matching-lifecycle-apimatches)
6. [Module 5: In-App Communications & Dynamic Calendar (`/api/communications`)](#module-5-in-app-communications--dynamic-calendar-apicommunications)
7. [Module 6: Pastoral Vetting, Debriefs & Appeals (`/api/vetting`)](#module-6-pastoral-vetting-debriefs--appeals-apivetting)
8. [Module 7: Church Registry & Governance (`/api/churches`)](#module-7-church-registry--governance-apichurches)
9. [Module 8: ChurchAdmin 1:1 Governance (`/api/church-admin`)](#module-8-churchadmin-11-governance-apichurch-admin)
10. [Module 9: Counselor Operations & Caseload (`/api/counselor`)](#module-9-counselor-operations--caseload-apicounselor)
11. [Module 10: Platform SuperAdmin Overview (`/api/admin`)](#module-10-platform-superadmin-overview-apiadmin)
12. [Module 11: Subscriptions & Payment Processing (`/api/subscriptions`)](#module-11-subscriptions--payment-processing-apisubscriptions)

---

## 1. Global API Standards & Architecture

### 1.1 Base URL & Environment Configuration
- **Local Development**: `http://localhost:5000/api`
- **Staging / Production**: `https://api.lifeline.app/api`
- All requests must include the header: `Content-Type: application/json` (except media uploads which use `multipart/form-data`).

### 1.2 Authentication & Authorization Protocols
- **Token Type**: Bearer JSON Web Token (JWT).
- **Header Format**: `Authorization: Bearer <jwt_token>`
- **RBAC Roles**: `SuperAdmin`, `ChurchAdmin`, `Counselor`, `User`.
- Tokens expire in 7 days and encode: `{ id: string, email: string, role: Role, firstName: string }`.

### 1.3 Standard Response & Error Envelopes

#### Success Envelope (200 OK / 201 Created)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  },
  "errors": null
}
```

#### Error Envelope (400, 401, 403, 404, 409, 500)
```json
{
  "success": false,
  "message": "Validation failed: required fields are missing",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

### 1.4 Standard HTTP Status Codes
| Status Code | Meaning | Usage |
|---|---|---|
| **`200 OK`** | Success | Standard response for successful GET, PUT, PATCH requests. |
| **`201 Created`** | Created | Successful entity creation (e.g. signup, create church, send request). |
| **`400 Bad Request`** | Client Error | Malformed body, failed Zod validation, or business rule violation. |
| **`401 Unauthorized`** | Authentication Missing | Missing, invalid, or expired Bearer token. |
| **`403 Forbidden`** | Permission Denied | Authenticated role lacks permission (e.g. Dater accessing `/admin`). |
| **`404 Not Found`** | Resource Not Found | Target UUID does not exist in the database. |
| **`409 Conflict`** | Conflict | Duplicate unique field (e.g. email exists, church already has ChurchAdmin). |
| **`500 Internal Error`**| Server Error | Unhandled server exception. |

### 1.5 Platform Safeguarding Guards & Firewalls
1. **100% Profile Completion Gate (`requireProfileComplete`)**:
   Daters cannot access discovery feed, send match requests, or accept suitors until their profile satisfies all 10 completion weights (`profileCompletionPercentage === 100`).
2. **3-Slot Concurrent Match Request Limit**:
   Daters can have at most **3 active sent requests** (`PENDING`) simultaneously. Attempting to send a 4th request returns `400 Bad Request`.
3. **Administrative Safeguarding Firewall**:
   When `ChurchAdmin` inspects a member dossier via `GET /api/users/:id`, sensitive fields (`salaryRange`, exact street address, and `matchPreference`) are **automatically redacted** to protect member dignity within their home parish.

---

## Module 1: Authentication & Lead Acquisition (`/api/auth`)

### 1.1 Step-1 Low-Friction Lead Registration
- **Path**: `POST /api/auth/lead-register`
- **Access**: Public
- **Description**: Rapidly captures candidate identity before the full profiling questionnaire to reduce mobile registration drop-off.
- **Request Body**:
  ```json
  {
    "firstName": "Chinedu",
    "lastName": "Eze",
    "email": "chinedu.eze@example.com",
    "phone": "+2348012345678",
    "gender": "Male",
    "password": "SecurePassword123!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Lead registered successfully. Verification token generated.",
    "data": {
      "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "chinedu.eze@example.com",
      "requiresEmailVerification": true
    }
  }
  ```

---

### 1.2 Social Authentication (Google / Apple)
- **Path**: `POST /api/auth/social-login`
- **Access**: Public
- **Description**: Authenticates OAuth mobile daters, automatically provisioning an `Account` and `User` record if new.
- **Request Body**:
  ```json
  {
    "provider": "google",
    "token": "oauth_id_token_string",
    "gender": "Male"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "email": "user@gmail.com",
        "role": "User",
        "vettingStatus": "DRAFT"
      }
    }
  }
  ```

---

### 1.3 Full User Signup
- **Path**: `POST /api/auth/signup`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "firstName": "Grace",
    "lastName": "Oladipo",
    "email": "grace@example.com",
    "phone": "+2348022223333",
    "password": "Password123!",
    "gender": "Female"
  }
  ```

---

### 1.4 Unified Credential Login
- **Path**: `POST /api/auth/login`
- **Access**: Public (Supports `SuperAdmin`, `ChurchAdmin`, `Counselor`, `User`)
- **Request Body**:
  ```json
  {
    "email": "pastor.david@covenant.org",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "c6a23ef2-b5e1-4560-8bbd-98651c6b3e34",
        "email": "pastor.david@covenant.org",
        "role": "ChurchAdmin",
        "title": "Resident Pastor",
        "churchId": "91a2719a-9e59-4d6f-a957-c81b9538c821",
        "firstName": "David",
        "lastName": "Oyekunle"
      }
    }
  }
  ```

---

### 1.5 Current User Session (`/me`)
- **Path**: `GET /api/auth/me`
- **Access**: Bearer JWT (All Roles)
- **Description**: Returns authenticated profile, role, title, and current `vettingStatus`.

---

### 1.6 Request Email Verification
- **Path**: `POST /api/auth/request-verification`
- **Access**: Public / Authenticated
- **Request Body**: `{ "email": "candidate@example.com" }`

---

### 1.7 Verify Email with Token
- **Path**: `GET /api/auth/verify-email/:token`
- **Access**: Public

---

### 1.8 Password Recovery & Reset
- **Request Link**: `POST /api/auth/forgot-password` (`{ "email": "..." }`)
- **Validate Token**: `GET /api/auth/reset-password/:token`
- **Set New Password**: `POST /api/auth/reset-password` (`{ "token": "...", "password": "..." }`)

---

## Module 2: User Profiles & Verification Media (`/api/users`)

### 2.1 List Platform Users
- **Path**: `GET /api/users`
- **Access**: Bearer JWT (`SuperAdmin`, `ChurchAdmin`, `Counselor`)
- **Query Parameters**:
  - `page`: `number` (default: 1)
  - `limit`: `number` (default: 20)
  - `status`: `StatusType` (`active` | `suspended` | `pending`)
  - `vettingStatus`: `UserVettingStatus` (`DRAFT`, `PENDING_VETTING`, `VETTED_ACTIVE`, `REJECTED`, `HARD_BLOCKED`)
  - `search`: `string` (name or email)

---

### 2.2 Get User Profile (Safeguarding Firewall Enforced)
- **Path**: `GET /api/users/:id`
- **Access**: Bearer JWT (Self, `SuperAdmin`, `ChurchAdmin`, `Counselor`)
- **Privacy Firewall Enforcement**:
  - **If Requester is `ChurchAdmin`**: `salaryRange`, `residenceAddress`, and `matchPreference` are redacted from the response envelope.
  - **If Requester is assigned `Counselor` or `SuperAdmin`**: Returns complete spiritual dossier including confidential salary bracket and verification history.
- **Response (200 OK - Privileged Dossier)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "userId": "c6a23ef2-b5e1-4560-8bbd-98651c6b3e34",
        "accountId": "942b0f44-8da1-4467-939e-d3091e4695b2",
        "firstName": "Emmanuel",
        "lastName": "Okonkwo",
        "email": "emmanuel@example.com",
        "gender": "Male",
        "age": 29,
        "occupation": "Petroleum Engineer",
        "salaryRange": "RANGE_1M_PLUS",
        "residenceCity": "Lekki",
        "residenceAddress": "Block 4, Admiralty Way",
        "vettingStatus": "VETTED_ACTIVE",
        "profileCompletionPercentage": 100,
        "church": {
          "id": "uuid",
          "officialName": "Elevation Church",
          "branchName": "Pistis Annex"
        },
        "assignedCounselor": {
          "accountId": "uuid",
          "firstName": "Pastor",
          "lastName": "Godman"
        },
        "photos": [
          { "order": 1, "url": "https://res.cloudinary.com/.../p1.jpg" },
          { "order": 2, "url": "https://res.cloudinary.com/.../p2.jpg" },
          { "order": 3, "url": "https://res.cloudinary.com/.../p3.jpg" }
        ],
        "videoIntroUrl": "https://res.cloudinary.com/.../video.mp4"
      }
    }
  }
  ```

---

### 2.3 Update User Profile
- **Path**: `PUT /api/users/:id`
- **Access**: Bearer JWT (Self, `SuperAdmin`)
- **Description**: Updates profile attributes and automatically recalculates `profileCompletionPercentage` (0–100%).
- **Request Body**:
  ```json
  {
    "originCountry": "Nigeria",
    "originState": "Delta",
    "originLga": "Warri South",
    "residenceCountry": "Nigeria",
    "residenceState": "Lagos",
    "residenceCity": "Lekki",
    "residenceAddress": "Admiralty Way, Lekki",
    "residenceLatitude": 6.4474,
    "residenceLongitude": 3.4842,
    "occupation": "Senior Architect",
    "salaryRange": "RANGE_500K_1M",
    "churchId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "branchName": "City of David",
    "matchPreference": "my_church_plus",
    "interests": ["Choir", "Youth Mentorship", "Tennis"],
    "whatsappNumber": "+2348011112222"
  }
  ```

---

### 2.4 Upload Verification Photo (Order 1–3)
- **Path**: `POST /api/users/:id/photos`
- **Access**: Bearer JWT (Self, `SuperAdmin`)
- **Headers**: `Content-Type: multipart/form-data`
- **Form Fields**:
  - `image`: Binary file (JPEG/PNG, max 10MB)
  - `order`: `1` (Headshot Portrait) | `2` (Full Body) | `3` (Lifestyle/Modest Activity)

---

### 2.5 Suspend / Activate User Account
- **Path**: `PATCH /api/users/:id/status`
- **Access**: Bearer JWT (`SuperAdmin`)
- **Request Body**: `{ "status": "active" | "suspended" }`

---

### 2.6 Social Handles Verification (2-of-3 Rule)
- **List Socials**: `GET /api/users/:id/socials`
- **Add Social**: `POST /api/users/:id/socials`
  - **Body**: `{ "platform": "LinkedIn" | "Instagram" | "Facebook", "handleOrUrl": "https://..." }`
- **Delete Social**: `DELETE /api/users/:id/socials/:socialId`

---

## Module 3: Match Discovery & Request Engine (`/api/discovery` & `/api/requests`)

### 3.1 Geolocation-Weighted Candidate Discovery Feed
- **Path**: `GET /api/discovery/feed`
- **Access**: Bearer JWT (`User` with 100% completed profile)
- **Guards**: `requireProfileComplete` middleware.
- **Algorithm Rules**:
  - Binary opposite gender filter.
  - Vetting status filter: `VETTED_ACTIVE` only.
  - Proximity weighted using Haversine calculation based on candidate coordinates.
  - Respects `matchPreference` boundary (`my_church`, `my_church_plus`, `other_churches`).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "candidates": [
        {
          "userId": "uuid",
          "firstName": "Ruth",
          "age": 26,
          "occupation": "Pharmacist",
          "residenceCity": "Victoria Island",
          "distanceKm": 3.8,
          "church": { "officialName": "House on the Rock" },
          "photos": [ ... ]
        }
      ],
      "meta": { "totalCandidates": 34 }
    }
  }
  ```

---

### 3.2 Send Match Request (3-Slot Active Cap)
- **Path**: `POST /api/requests/send`
- **Access**: Bearer JWT (`User`)
- **Business Rule**: Enforces `COUNT(active_requests) < 3`. Rejects 4th attempt with `400 Bad Request`.
- **Request Body**:
  ```json
  {
    "receiverUserId": "c6a23ef2-b5e1-4560-8bbd-98651c6b3e34"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Match request sent successfully",
    "data": {
      "requestId": "942b0f44-8da1-4467-939e-d3091e4695b2",
      "status": "PENDING",
      "slotsUsed": 2,
      "slotsRemaining": 1
    }
  }
  ```

---

### 3.3 List Sent Requests & Slot Counter
- **Path**: `GET /api/requests/sent`
- **Access**: Bearer JWT (`User`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "requests": [ ... ],
      "slotsUsed": 2,
      "slotsRemaining": 1
    }
  }
  ```

---

### 3.4 List Received Requests
- **Path**: `GET /api/requests/received`
- **Access**: Bearer JWT (`User`)

---

### 3.5 First-Come Match Acceptance
- **Path**: `POST /api/requests/:id/accept`
- **Access**: Bearer JWT (`User` - recipient of request)
- **State Machine Transitions**:
  1. Target request transitions to `ACCEPTED`.
  2. New `Match` record initialized with `status: "IN_CONVERSATION"`.
  3. **Auto-Supersession**: All other active pending requests involving either party transition to `SUPERSEDED`, instantly reclaiming slots for other suitors.
  4. Automatically provisions two `Conversation` channels:
     - `COUPLE_PRIVATE`: 1:1 chat between couple.
     - `COUNSELOR_GROUP`: 3-way monitored thread with assigned pastoral counselor.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Match request accepted. Private and counselor channels initialized.",
    "data": {
      "matchId": "5fa238c1-1e94-4d89-9a29-cfa094892c90",
      "coupleConversationId": "91a2719a-9e59-4d6f-a957-c81b9538c821",
      "counselorConversationId": "d718a29b-8c41-45ef-bca2-817290a19c72"
    }
  }
  ```

---

### 3.6 Blind Match Rejection
- **Path**: `POST /api/requests/:id/decline`
- **Access**: Bearer JWT (`User`)
- **Business Rule**: Sender is notified generically without negative feedback; sender's active slot is immediately reclaimed.

---

### 3.7 Cancel Match Request
- **Path**: `POST /api/requests/:id/cancel`
- **Access**: Bearer JWT (`User` - sender of request)

---

## Module 4: Relationship Courtship & Matching Lifecycle (`/api/matches`)

### 4.1 Get Own Active Courtship
- **Path**: `GET /api/matches/active`
- **Access**: Bearer JWT (`User`)

### 4.2 Get Own Match History
- **Path**: `GET /api/matches/history`
- **Access**: Bearer JWT (`User`)

### 4.3 Get Match Details
- **Path**: `GET /api/matches/:matchId`
- **Access**: Bearer JWT (Match Participants, Staff)

### 4.4 Conclude Courtship & Mandate Pastoral Debrief
- **Path**: `POST /api/matches/:matchId/end`
- **Access**: Bearer JWT (Match Participants, `Counselor`)
- **Business Rule**:
  - `Match.status` transitions to `ENDED`.
  - Both candidates have `vettingStatus` updated to `DEBRIEF_REQUIRED`.
  - Both candidates are locked from discovery until counselor debrief is logged on Web.
- **Request Body**:
  ```json
  {
    "reason": "Mutually agreed that long-term ministry visions were not aligned.",
    "feedback": "Grateful for the intentionality."
  }
  ```

### 4.5 Staff List All Matches
- **Path**: `GET /api/matches`
- **Access**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)

---

## Module 5: In-App Communications & Dynamic Calendar (`/api/communications`)

### 5.1 List User Conversations
- **Path**: `GET /api/communications/conversations`
- **Access**: Bearer JWT (All Roles)
- **Query Parameters**: `channelType`: `COUPLE_PRIVATE` | `COUNSELOR_GROUP`

### 5.2 Get Conversation Messages
- **Path**: `GET /api/communications/conversations/:conversationId/messages`
- **Access**: Bearer JWT (Channel Members)
- **Query Parameters**: `page`: `number`, `limit`: `number` (default: 50)

### 5.3 Send Message
- **Path**: `POST /api/communications/conversations/:conversationId/messages`
- **Access**: Bearer JWT (Channel Members)
- **Request Body**:
  ```json
  {
    "content": "Looking forward to our church fellowship meeting on Saturday!",
    "mediaUrl": null
  }
  ```

### 5.4 Propose Date Meetup Event
- **Path**: `POST /api/communications/matches/:matchId/events`
- **Access**: Bearer JWT (`User` - Match Participant)
- **Request Body**:
  ```json
  {
    "title": "Coffee Check-in & Faith Discussion",
    "description": "Public meetup at Cafe Neo, Lekki Phase 1.",
    "startTime": "2026-10-03T14:00:00Z",
    "endTime": "2026-10-03T15:30:00Z"
  }
  ```

### 5.5 Respond to Date Meetup (Candidate & Counselor)
- **Path**: `PATCH /api/communications/events/:eventId/respond`
- **Access**: Bearer JWT (Match Participant, `Counselor`)
- **Request Body**: `{ "status": "CONFIRMED" | "CANCELLED" }`

---

## Module 6: Pastoral Vetting, Debriefs & Appeals (`/api/vetting`)

### 6.1 Counselor Vetting Decision
- **Path**: `POST /api/vetting/users/:userId/review`
- **Access**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)
- **Request Body**:
  ```json
  {
    "decision": "APPROVE" | "REJECT" | "HARD_BLOCK",
    "notes": "Verified video intro and church baptism testimony. Approved for discovery.",
    "checklist": {
      "identityConfirmed": true,
      "videoIntroVerified": true,
      "churchBranchConfirmed": true,
      "pastoralTestimony": true
    }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Candidate approved and indexed into the discovery pool.",
    "data": { "vettingStatus": "VETTED_ACTIVE" }
  }
  ```

---

### 6.2 Counselor Post-Courtship Exit Debrief Reset
- **Path**: `POST /api/vetting/users/:userId/debrief-reset`
- **Access**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)
- **Description**: Conducts pastoral interview after relationship conclusion and resets candidate's status to `VETTED_ACTIVE`.
- **Request Body**:
  ```json
  {
    "notes": "Pastoral exit interview conducted. Candidate has processed closure maturely.",
    "readinessScore": 9
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Debrief completed successfully. Member re-indexed into discovery.",
    "data": {
      "debriefId": "uuid",
      "vettingStatus": "VETTED_ACTIVE"
    }
  }
  ```

---

### 6.3 Submit Appeal for Hard-Blocked Account
- **Path**: `POST /api/vetting/appeal`
- **Access**: Bearer JWT (`User` with `vettingStatus: HARD_BLOCKED`)
- **Request Body**:
  ```json
  {
    "appealReason": "I submitted certified government identification resolving the name discrepancy."
  }
  ```

---

### 6.4 SuperAdmin List Appeals Queue
- **Path**: `GET /api/vetting/appeals`
- **Access**: Bearer JWT (`SuperAdmin`)
- **Query Parameters**: `status`: `PENDING` | `APPROVED` | `REJECTED`

---

### 6.5 SuperAdmin Review Appeal
- **Path**: `POST /api/vetting/appeals/:appealId/review`
- **Access**: Bearer JWT (`SuperAdmin`)
- **Request Body**:
  ```json
  {
    "decision": "APPROVE" | "REJECT",
    "notes": "Identity documentation verified with church registry. Restored to pending review."
  }
  ```

---

## Module 7: Church Registry & Governance (`/api/churches`)

### 7.1 Onboard Church (SuperAdmin)
- **Path**: `POST /api/churches`
- **Access**: Bearer JWT (`SuperAdmin`)
- **Request Body**:
  ```json
  {
    "officialName": "Redeemed Christian Church of God, City of David",
    "aka": "City of David",
    "country": "Nigeria",
    "state": "Lagos",
    "city": "Victoria Island",
    "address": "COD Road, Dedeisha",
    "modelType": "PARENT_BRANCH",
    "email": "hq@cityofdavidng.org",
    "phone": "+2348011223344",
    "pastorName": "Pastor Idowu Iluyomade",
    "pastorEmail": "pastor@cityofdavidng.org",
    "pastorPhone": "+2348011223344"
  }
  ```

### 7.2 Public Active Churches List
- **Path**: `GET /api/churches/public`
- **Access**: Public (Unauthenticated dropdown on mobile)

### 7.3 List Churches (Directory)
- **Path**: `GET /api/churches`
- **Access**: Bearer JWT (`SuperAdmin`)
- **Query Parameters**: `page`: `number`, `limit`: `number`, `status`: `active` | `pending` | `suspended`, `churchModel`: `PARENT_BRANCH` | `INDIVIDUAL_PARISH`

### 7.4 Get Church Details (360 Governance View)
- **Path**: `GET /api/churches/:id`
- **Access**: Bearer JWT (`SuperAdmin`, `ChurchAdmin`, `Counselor`)

### 7.5 Update Church Details
- **Path**: `PUT /api/churches/:id`
- **Access**: Bearer JWT (`SuperAdmin`, `ChurchAdmin`)

### 7.6 Suspend / Activate Church
- **Path**: `PATCH /api/churches/:id/status`
- **Access**: Bearer JWT (`SuperAdmin`)
- **Request Body**: `{ "status": "active" | "suspended" }`

### 7.7 List Church Members
- **Path**: `GET /api/churches/:id/members`
- **Access**: Bearer JWT (`SuperAdmin`, `ChurchAdmin`, `Counselor`)

---

## Module 8: ChurchAdmin 1:1 Governance (`/api/church-admin`)

### 8.1 Create 1:1 ChurchAdmin Account
- **Path**: `POST /api/church-admin/create`
- **Access**: Bearer JWT (`SuperAdmin`)
- **Business Rule**: Enforces strictly **one** ChurchAdmin per church. Rejects if church already has an assigned administrator with `400 Bad Request`.
- **Request Body**:
  ```json
  {
    "churchId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "pastor.john@parish.org",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Adeyemi",
    "phone": "+2348055554444",
    "title": "Senior Pastor"
  }
  ```

### 8.2 Get ChurchAdmin Dashboard Metrics
- **Path**: `GET /api/church-admin/dashboard`
- **Access**: Bearer JWT (`ChurchAdmin`, `SuperAdmin`)

### 8.3 SuperAdmin View Parish Dashboard
- **Path**: `GET /api/church-admin/dashboard/:id`
- **Access**: Bearer JWT (`SuperAdmin`)

### 8.4 Assign Member to Staff Counselor
- **Path**: `POST /api/church-admin/assign-counselor`
- **Access**: Bearer JWT (`ChurchAdmin`)
- **Request Body**:
  ```json
  {
    "userId": "c6a23ef2-b5e1-4560-8bbd-98651c6b3e34",
    "counselorId": "d718a29b-8c41-45ef-bca2-817290a19c72"
  }
  ```

### 8.5 List Church Administrators
- **Path**: `GET /api/church-admin`
- **Access**: Bearer JWT (`SuperAdmin`)

### 8.6 Get / Update ChurchAdmin Profile & Title
- **Get**: `GET /api/church-admin/:id`
- **Update**: `PUT /api/church-admin/:id`
  - **Body**: `{ "title": "Resident Minister", "phone": "..." }`

---

## Module 9: Counselor Operations & Caseload (`/api/counselor`)

### 9.1 Get Counselor Dashboard
- **Path**: `GET /api/counselor/dashboard`
- **Access**: Bearer JWT (`Counselor`, `SuperAdmin`)

### 9.2 Get Assigned Users
- **Path**: `GET /api/counselor/assigned-users`
- **Access**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)
- **Query Parameters**: `vettingStatus`: `PENDING_VETTING` | `DEBRIEF_REQUIRED` | `VETTED_ACTIVE`

### 9.3 Create Counselor Account
- **Path**: `POST /api/counselor/create`
- **Access**: Bearer JWT (`ChurchAdmin`, `SuperAdmin`)
- **Request Body**:
  ```json
  {
    "churchId": "uuid",
    "email": "counselor.sarah@parish.org",
    "password": "Password123!",
    "firstName": "Sarah",
    "lastName": "Balogun",
    "phone": "+2348077778888",
    "bio": "Certified Christian family counselor with 7 years experience in premarital counseling."
  }
  ```

### 9.4 List All Counselors
- **Path**: `GET /api/counselor/list-all`
- **Access**: Bearer JWT (`SuperAdmin`)

### 9.5 Get / Update Counselor Profile
- **Get**: `GET /api/counselor/:id`
- **Update**: `PUT /api/counselor/:id` (`{ "bio": "..." }`)

---

## Module 10: Platform SuperAdmin Overview (`/api/admin`)

### 10.1 Global Executive Dashboard
- **Path**: `GET /api/admin/dashboard`
- **Access**: Bearer JWT (`SuperAdmin`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "overview": {
        "totalChurches": 28,
        "activeChurches": 25,
        "totalUsers": 1850,
        "vettedUsers": 1320,
        "activeMatches": 94,
        "pendingAppeals": 3
      }
    }
  }
  ```

### 10.2 Platform Growth Statistics
- **Path**: `GET /api/admin/stats`
- **Access**: Bearer JWT (`SuperAdmin`)

---

## Module 11: Subscriptions & Payment Processing (`/api/subscriptions`)

### 11.1 Get Subscription Status
- **Path**: `GET /api/subscriptions/status`
- **Access**: Bearer JWT (`User`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "subscription": {
        "subscriptionTier": "premium",
        "subscriptionInterval": "MONTHLY",
        "subscriptionStatus": "active",
        "subscriptionExpiresAt": "2026-10-27T00:00:00Z"
      }
    }
  }
  ```

### 11.2 Initialize Subscription Plan (Paystack)
- **Path**: `POST /api/subscriptions/subscribe`
- **Access**: Bearer JWT (`User`)
- **Request Body**:
  ```json
  {
    "interval": "MONTHLY" | "YEARLY"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "authorizationUrl": "https://checkout.paystack.com/...",
      "reference": "pstk_ref_94829103"
    }
  }
  ```

### 11.3 Cancel Subscription
- **Path**: `POST /api/subscriptions/cancel`
- **Access**: Bearer JWT (`User`)

---

*Document committed to repository as `guides/api_references.md`.*
