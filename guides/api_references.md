# Full API References & Integration Guide - Faith-Based Matchmaking Platform

## 1. Response Formats

All endpoints return a standardized JSON response:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 },
  "errors": null
}
```

---

## 2. Complete Endpoint Directory

### Authentication & Lead Retention
```
POST /api/auth/lead-register          - Step 1 Lead Registration (stores email/phone metadata)
POST /api/auth/social-login           - One-click Google/Apple OAuth login
POST /api/auth/signup                 - Full signup
POST /api/auth/login                  - User & Admin credentials login
GET  /api/auth/me                     - Current authenticated user profile
POST /api/auth/request-verification   - Resend email verification
GET  /api/auth/verify-email/:token    - Verify email
POST /api/auth/forgot-password        - Request password reset link
POST /api/auth/reset-password         - Reset password with token
```

### Match Discovery & Request Engine (3-Slot Limit)
```
GET  /api/discovery/feed              - Geolocation-weighted candidate feed (Opposite gender, active vetted only)
POST /api/requests/send               - Send match request (Cap: maximum 3 active slots)
GET  /api/requests/sent               - List sent requests and remaining active slots
GET  /api/requests/received           - List received pending requests
POST /api/requests/:id/accept         - First-Come Acceptance (auto-supersedes other pending requests & creates channels)
POST /api/requests/:id/decline        - Blind Rejection (sender notified generically of reclaimed slot)
POST /api/requests/:id/cancel         - Cancel pending sent request
```

### User Profiles & Media
```
GET    /api/users                     - List users (scoped by role & privacy firewall)
GET    /api/users/:id                 - Get user profile (Privacy Firewall: salary/address visible only to self & assigned counselor)
PUT    /api/users/:id                 - Update user profile (recalculates 100% completion score)
POST   /api/users/:id/photos          - Upload profile photo (order: 1, 2, or 3)
PATCH  /api/users/:id/status          - Suspend/activate user account (SuperAdmin)
GET    /api/users/:id/socials         - List verified social handles
POST   /api/users/:id/socials         - Add social handle (LinkedIn, Instagram, Facebook; 2-of-3 rule)
DELETE /api/users/:id/socials/:socialId - Remove social handle
```

### Counselor Vetting, Debriefs & Appeals
```
POST /api/vetting/users/:userId/review        - Counselor vetting review (APPROVE, REJECT, HARD_BLOCK)
POST /api/vetting/users/:userId/debrief-reset - Counselor exit debrief (resets user status to VETTED_ACTIVE & discovery)
POST /api/vetting/appeal                      - Submit appeal for hard-blocked account (User)
POST /api/vetting/appeals/:appealId/review    - Review appeal request (SuperAdmin)
GET  /api/counselor/dashboard                 - Counselor stats & assigned users
GET  /api/counselor/assigned-users            - Filter assigned users
GET  /api/counselor/:id                       - Counselor profile
PUT  /api/counselor/:id                       - Update counselor bio
```

### Church Governance (1:1 ChurchAdmin & Pastoral Title)
```
POST /api/churches                            - Create church (SuperAdmin)
GET  /api/churches                            - List churches (with Parent-Branch & Individual Parish filters)
GET  /api/churches/public                     - Public active churches list for registration dropdown
GET  /api/churches/:id                        - Get church details
PUT  /api/churches/:id                        - Update church
GET  /api/churches/:id/members                - List church members (Privacy-filtered)
POST /api/church-admin/create                 - Create 1:1 ChurchAdmin with optional title (SuperAdmin)
GET  /api/church-admin/dashboard              - ChurchAdmin dashboard (Restricted Analytics table)
POST /api/church-admin/assign-counselor       - Assign member to counselor
GET  /api/church-admin                        - List church admins (SuperAdmin)
GET  /api/church-admin/:id                    - Get church admin details
PUT  /api/church-admin/:id                    - Update church admin title/details
```

### In-App Communications & Dynamic Calendar
```
GET   /api/communications/conversations                             - List user channels (Private Couple + Counselor Group)
GET   /api/communications/conversations/:conversationId/messages    - Get message history
POST  /api/communications/conversations/:conversationId/messages    - Send message
POST  /api/communications/matches/:matchId/events                   - Propose meeting event
PATCH /api/communications/events/:eventId/respond                   - Respond to meeting (CONFIRMED auto-adds to calendar)
```

---

## 3. Key Request & Response Payloads

### Step-1 Lead Registration
`POST /api/auth/lead-register`
```json
{
  "email": "john.doe@example.com",
  "phone": "+2348012345678",
  "firstName": "John",
  "lastName": "Doe",
  "password": "Password123!",
  "gender": "Male"
}
```

### Send Match Request (3-Slot Cap)
`POST /api/requests/send`
```json
{
  "receiverUserId": "c6a23ef2-b5e1-4560-8bbd-98651c6b3e34"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Match request sent successfully",
  "data": {
    "requestId": "942b0f44-8da1-4467-939e-d3091e4695b2",
    "status": "PENDING",
    "slotsUsed": 2,
    "slotsRemaining": 1,
    "createdAt": "2026-08-28T09:00:00.000Z"
  },
  "errors": null
}
```

### First-Come Acceptance
`POST /api/requests/:id/accept`
```json
// Headers: Authorization: Bearer <token>
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Match request accepted! Private and Counselor channels have been initialized.",
  "data": {
    "matchId": "5fa238c1-1e94-4d89-9a29-cfa094892c90",
    "coupleConversationId": "91a2719a-9e59-4d6f-a957-c81b9538c821",
    "counselorConversationId": "d718a29b-8c41-45ef-bca2-817290a19c72"
  },
  "errors": null
}
```

### Counselor Exit Debrief Reset
`POST /api/vetting/users/:userId/debrief-reset`
```json
{
  "notes": "Conducted debrief after relationship conclusion. Member is aligned and ready to re-enter discovery.",
  "readinessScore": 9
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Debrief completed successfully. Member has been re-indexed into the discovery pool.",
  "data": {
    "debriefId": "8b9a10c2-9e41-419b-a019-d910a9182390",
    "vettingStatus": "VETTED_ACTIVE"
  },
  "errors": null
}
```
