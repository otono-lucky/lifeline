# System Architecture Document
## Faith-Based Matchmaking Platform — Full Rebuild Specification

**Purpose of this document:** This is the complete technical source of truth for rebuilding this platform from scratch — data model, every screen, every endpoint with request/response shapes, state machines, and business rules. Anyone (human or AI agent) should be able to build the entire system from this document alone.

**How to read it:** Sections are ordered so each builds on the last. Business-rule sections (church structure, vetting, discovery/matching) come before the screen and endpoint inventories, because the endpoints only make sense once the rules are understood.

---

## 1. System Overview

Three components, one backend:

```
┌────────────────────┐      ┌─────────────────────────┐
│    Mobile App        │      │   Admin Web App          │
│  (Daters / Users)     │      │  (SuperAdmin,             │
│  React Native/Expo    │─────▶│   Unified Church          │────▶  Backend API
└────────────────────┘      │   Dashboard: ChurchAdmin, │      (Node/Express/
                              │   Counselor, Pastor)      │       Prisma/Postgres)
                              └─────────────────────────┘
```

All API responses use one envelope:
```json
{ "success": true, "message": "string", "data": {}, "errors": null }
```

---

## 2. User Roles & RBAC Matrix

| Role | Created By | Has Dating Profile? | Appears in Discovery? | Portal |
|---|---|---|---|---|
| **SuperAdmin** | Seeded | No | No | Admin Web |
| **ChurchAdmin** | SuperAdmin | No | No | Admin Web (Unified Dashboard) |
| **Counselor** | ChurchAdmin/SuperAdmin | No | No | Admin Web (Unified Dashboard) |
| **Pastor** | Captured at church onboarding, account created by ChurchAdmin/SuperAdmin | No | **No — structurally excluded** (Pastors have no row in the discovery-source table, so exclusion is guaranteed, not flag-based) | Admin Web (Unified Dashboard, read/audit-level access equal to Counselor) |
| **User** | Self sign-up | Yes | Yes, once `vetted_active` | Mobile App |

**Permission summary inside the Unified Church Dashboard:**

| Data/Action | ChurchAdmin | Counselor | Pastor |
|---|---|---|---|
| Basic directory (name/photo) | ✅ | ✅ | ✅ |
| Aggregated match counts | ✅ | ✅ | ✅ |
| Search/match preferences | ❌ | ✅ (assigned users only) | ✅ |
| External-church match partner identity | ❌ (hidden) | ✅ (assigned users only) | ✅ |
| Salary, address, full social handles | ❌ | ✅ (assigned users only) | ✅ |
| Assign member to counselor | ✅ | ❌ | ❌ |
| Create/manage counselors | ✅ | ❌ | ❌ |
| Run vetting decisions | ❌ | ✅ (assigned) | ✅ (any, as auditor) |
| Excluded from being a match prospect | N/A | N/A | ✅ (by design) |

---

## 3. Data Model (Prisma-style schema)

### 3.1 Enums

```prisma
enum Role { SuperAdmin ChurchAdmin Counselor Pastor User }
enum AccountStatus { active suspended }
enum ChurchOnboardingType { ParentBranch Independent }
enum ChurchStatus { pending active suspended }
enum Gender { Male Female }
enum IncomeRange { range_0_100k range_100k_500k range_500k_1m range_1m_plus }
enum MatchScope { church_only other_churches_only church_plus_other }
enum ProfileStatus { draft pending_vetting vetted_active denied hard_blocked }
enum VettingDecision { approved denied hard_blocked }
enum MatchRequestStatus { pending accepted rejected expired no_longer_available }
enum MatchStatus { active ended reset_pending }
enum ChatChannelType { private counselor_group }
enum ResetStatus { pending_debrief completed denied }
enum AppealStatus { open approved denied }
enum SubscriptionTier { monthly yearly }
enum SubscriptionStatus { active expired canceled }
```

### 3.2 Auth & Role Tables

```prisma
model Account {
  id        String   @id @default(uuid())
  email     String?  @unique
  phone     String?  @unique
  password  String?                     // nullable — social-auth-only accounts have none
  firstName String
  lastName  String
  role      Role
  status    AccountStatus @default(active)

  socialProvider   String?              // 'google' | 'apple' | 'facebook'
  socialProviderId String?

  isEmailVerified          Boolean   @default(false)
  emailVerificationToken   String?   @unique
  emailVerificationExpiry  DateTime?
  passwordResetToken       String?   @unique
  passwordResetExpiry      DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  superAdmin  SuperAdmin?
  churchAdmin ChurchAdmin?
  counselor   Counselor?
  pastor      Pastor?
  user        UserProfile?
}

model SuperAdmin {
  id        String  @id @default(uuid())
  accountId String  @unique
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  churchesCreated Church[]
}

model ChurchAdmin {
  id        String  @id @default(uuid())
  accountId String  @unique
  churchId  String
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  church    Church  @relation(fields: [churchId], references: [id], onDelete: Cascade)
}

model Counselor {
  id        String  @id @default(uuid())
  accountId String  @unique
  churchId  String
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  church    Church  @relation(fields: [churchId], references: [id], onDelete: Cascade)

  assignedUsers UserProfile[]  @relation("CounselorAssignments")
  vettingLogs   VettingLog[]
}

model Pastor {
  id        String  @id @default(uuid())
  accountId String  @unique
  churchId  String
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  church    Church  @relation(fields: [churchId], references: [id], onDelete: Cascade)
  // No dating profile relation — structurally cannot appear in discovery.
}
```

### 3.3 Church

```prisma
model Church {
  id             String @id @default(uuid())
  name           String                       // for Independent: the specific parish name
  onboardingType ChurchOnboardingType
  isParentOrg    Boolean @default(false)       // true only for e.g. "RCCG" top-level record

  email   String? @unique
  phone   String?
  state   String
  lga     String?
  city    String?
  address String?
  latitude  Float?
  longitude Float?

  // Senior Pastor details captured at onboarding time
  pastorName  String?
  pastorEmail String?
  pastorPhone String?

  status    ChurchStatus @default(pending)
  createdBy String
  creator   SuperAdmin   @relation(fields: [createdBy], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  churchAdmins ChurchAdmin[]
  counselors   Counselor[]
  pastors      Pastor[]
  members      UserProfile[]
}
```

**Design resolution — Parent-Branch model:** the PRD states the parent org (e.g. RCCG) is onboarded *once*. This means there is exactly one `Church` row for RCCG. Individual users select RCCG from a dropdown and free-type their branch/parish name into `UserProfile.branchName` (below) — there is no separate `Church` row per RCCG branch. Consequently, ChurchAdmins/Counselors attached to the RCCG `Church` row serve *all* RCCG members platform-wide, regardless of branch. For `Independent` churches (Catholic, Anglican, Baptist), each parish is onboarded as its own `Church` row with its own dedicated ChurchAdmin/Counselor pool, giving exact local mapping. This is the mechanism the PRD is describing when contrasting "standardized" vs "individual" onboarding.

### 3.4 User Profile (the dating profile)

```prisma
model UserProfile {
  id        String  @id @default(uuid())
  accountId String  @unique
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)

  gender      Gender
  dateOfBirth DateTime

  // Church mapping
  churchId   String?
  church     Church? @relation(fields: [churchId], references: [id])
  branchName String?           // free text — only used/required when church.onboardingType = ParentBranch

  // Address (Map API integrated)
  addressState   String?
  addressLga     String?
  addressCity    String?
  addressLine    String?
  latitude       Float?
  longitude      Float?

  // Dual-phone
  voicePhone    String?
  whatsappPhone String?

  // Social identity (2-of-3 gate enforced in service layer)
  linkedinHandle  String?
  instagramHandle String?
  facebookHandle  String?

  // Financial & professional (Privacy Firewall — hidden from matches, visible only to assigned counselor)
  occupation  String?
  incomeRange IncomeRange?

  // Media
  photoUrls    Json?            // exactly 3 URLs, validated at completion-check time
  introVideoUrl String?         // liveness video, <1 min

  // Matching preferences
  matchScope MatchScope?

  // Profile completion / gating
  isProfileComplete Boolean @default(false)   // computed & cached whenever a section is updated

  // Vetting state machine
  status              ProfileStatus @default(draft)
  deniedReason        String?
  hardBlockedReason   String?
  assignedCounselorId String?
  assignedCounselor   Counselor? @relation("CounselorAssignments", fields: [assignedCounselorId], references: [id])
  vettedAt            DateTime?
  vettedBy            String?    // counselorId

  // Subscription
  subscription Subscription?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sentRequests     MatchRequest[] @relation("SentRequests")
  receivedRequests MatchRequest[] @relation("ReceivedRequests")
  vettingLogs      VettingLog[]
  appeals          AppealCase[]
}
```

**Profile completion gate — required fields for `isProfileComplete = true`:**
`gender, dateOfBirth, churchId, (branchName if ParentBranch church), addressState, addressLine, voicePhone, whatsappPhone, incomeRange, matchScope, photoUrls (exactly 3), introVideoUrl`, **and** at least 2 of `{linkedinHandle, instagramHandle, facebookHandle}` non-null.

### 3.5 Vetting

```prisma
model VettingLog {
  id          String @id @default(uuid())
  userId      String
  counselorId String
  decision    VettingDecision
  reason      String?
  createdAt   DateTime @default(now())

  user      UserProfile @relation(fields: [userId], references: [id])
  counselor Counselor   @relation(fields: [counselorId], references: [id])
}

model AppealCase {
  id         String @id @default(uuid())
  userId     String
  reason     String
  status     AppealStatus @default(open)
  reviewedBy String?              // SuperAdmin accountId
  resolution String?
  createdAt  DateTime @default(now())
  resolvedAt DateTime?

  user UserProfile @relation(fields: [userId], references: [id])
}
```

### 3.6 Discovery, Requests & Matching

```prisma
model MatchRequest {
  id          String @id @default(uuid())
  requesterId String
  recipientId String
  status      MatchRequestStatus @default(pending)
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?

  requester UserProfile @relation("SentRequests", fields: [requesterId], references: [id])
  recipient UserProfile @relation("ReceivedRequests", fields: [recipientId], references: [id])

  match Match?
}

model Match {
  id             String @id @default(uuid())
  matchRequestId String @unique
  userAId        String
  userBId        String
  status         MatchStatus @default(active)

  privateChatId String? @unique
  groupChatId   String? @unique

  endedAt    DateTime?
  endedBy    String?
  endedReason String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  matchRequest        MatchRequest @relation(fields: [matchRequestId], references: [id])
  statusResetRequests StatusResetRequest[]
}
```

**Business rules encoded here, not in the schema:**
- **3-slot limit:** a user may have at most 3 `MatchRequest` rows with `status = pending` where they are `requester`. Enforced in the create-request service, not a DB constraint.
- **Blind rejection:** when a recipient rejects, `MatchRequest.status → rejected`. The requester-facing API **never** returns the recipient's identity for a rejected request — only a slot-count delta.
- **First-come acceptance / concurrency resolution:** when any one of a user's sent requests is accepted, all *other* pending requests **sent by that same user** are transitioned to `no_longer_available` in the same transaction, and a `Match` row is created for the accepted one.

### 3.7 Communication

```prisma
model ChatChannel {
  id        String @id @default(uuid())
  matchId   String
  type      ChatChannelType
  createdAt DateTime @default(now())

  participants ChatParticipant[]
  messages     ChatMessage[]
  events       CalendarEvent[]
}

model ChatParticipant {
  id            String @id @default(uuid())
  chatChannelId String
  accountId     String
  role          Role

  chatChannel ChatChannel @relation(fields: [chatChannelId], references: [id])
}

model ChatMessage {
  id            String @id @default(uuid())
  chatChannelId String
  senderId      String     // accountId
  content       String?
  attachmentUrl String?
  sentAt        DateTime @default(now())

  chatChannel ChatChannel @relation(fields: [chatChannelId], references: [id])
}

model CalendarEvent {
  id             String @id @default(uuid())
  chatChannelId  String
  proposedBy     String            // accountId
  title          String
  scheduledAt    DateTime
  status         String            // proposed | confirmed | canceled
  participantIds Json              // auto-populated with both accountIds on confirm
  createdAt      DateTime @default(now())

  chatChannel ChatChannel @relation(fields: [chatChannelId], references: [id])
}
```

Every `Match` creates exactly 2 `ChatChannel`s: one `private` (the couple only) and one `counselor_group` (the couple + both assigned counselors), per §6.

### 3.8 Post-Match Governance

```prisma
model StatusResetRequest {
  id           String @id @default(uuid())
  userId       String
  counselorId  String
  matchId      String
  status       ResetStatus @default(pending_debrief)
  debriefNotes String?
  createdAt    DateTime @default(now())
  resolvedAt   DateTime?

  match Match @relation(fields: [matchId], references: [id])
}
```

A user whose match `ended` cannot re-enter discovery until their `StatusResetRequest` reaches `completed`.

### 3.9 Subscription & Notifications

```prisma
model Subscription {
  id        String @id @default(uuid())
  userId    String @unique
  tier      SubscriptionTier
  status    SubscriptionStatus @default(active)
  startedAt DateTime @default(now())
  expiresAt DateTime
  autoRenew Boolean @default(true)

  user UserProfile @relation(fields: [userId], references: [id])
}

model Notification {
  id        String  @id @default(uuid())
  accountId String
  type      String            // see Notification Matrix, §9
  title     String
  body      String
  isRead    Boolean @default(false)
  metadata  Json?
  createdAt DateTime @default(now())
}
```

---

## 4. Church Onboarding Logic

| Step | Actor | Detail |
|---|---|---|
| 1 | SuperAdmin | Creates `Church` — picks `onboardingType`. If `ParentBranch`, sets `isParentOrg = true` (one-time, e.g. "RCCG"). If `Independent`, one row per physical parish. |
| 2 | SuperAdmin | Captures Senior Pastor details on the same form (`pastorName/Email/Phone`). |
| 3 | SuperAdmin | Creates the first `ChurchAdmin` account for that church directly (sets credentials). |
| 4 | ChurchAdmin | Logs in, creates `Counselor` account(s) directly. |
| 5 | ChurchAdmin or SuperAdmin | Creates the `Pastor` account, linked to the captured pastor details, with Counselor-equivalent dashboard permissions. |

---

## 5. Onboarding & Profile Completion Gate (User/Mobile)

**Lead capture (low friction):**
1. Social auth (one-tap) *or* minimal email/phone + password signup.
2. On this first step alone, `Account` is created and an abandonment-recovery email/SMS drip is scheduled (background job, triggers if `UserProfile.isProfileComplete` remains `false` after N hours).

**Progressive enrichment (each step is a separate, resumable API call):**
Basic info → Church selection → Address → Phones → Social handles → Income → Photos (3) → Intro video → Match preferences → Review.

**The Gate:** `Search`, `Discovery`, and `MatchRequest` endpoints all check `UserProfile.isProfileComplete === true` **and** `status === vetted_active` before allowing access. Incomplete or unvetted users get a `403` with a specific `data.reason` code (`profile_incomplete` | `pending_vetting` | `denied` | `hard_blocked`) so the mobile app can route to the correct waiting/lock screen.

---

## 6. Vetting State Machine

```
draft ──(100% complete)──▶ pending_vetting ──(counselor approves)──▶ vetted_active ──▶ [discovery pool]
                                   │
                                   ├──(counselor denies + reason)──▶ denied ──(user edits & resubmits)──▶ pending_vetting
                                   │
                                   └──(counselor hard-blocks + reason)──▶ hard_blocked ──(user appeals)──▶ AppealCase(open)
                                                                                              │
                                                                                   SuperAdmin resolves:
                                                                              approved → back to pending_vetting
                                                                              denied   → stays hard_blocked
```

Only a `Counselor` (or `Pastor`, as auditor) assigned to the user can action `pending_vetting`. Only a `SuperAdmin` can resolve an `AppealCase`.

---

## 7. Discovery & Matching Engine

- **Eligibility:** only `status = vetted_active` profiles of the **opposite gender** are returned, filtered by `matchScope` (church_only / other_churches_only / church_plus_other) with geographic weighting applied (closer `latitude/longitude` ranks higher, regardless of scope).
- **Slot limit:** a requester may have at most **3** simultaneously `pending` sent requests. The send-request endpoint rejects a 4th with a specific error until one resolves.
- **Blind rejection:** rejection responses to the requester never include recipient identity — only `{ "slotsAvailable": 1 }`.
- **Concurrency resolution:** accepting one request auto-transitions all of that requester's other `pending` sent requests to `no_longer_available` and creates the `Match` + both chat channels in one transaction.

---

## 8. Post-Match Governance

On `Match` creation:
1. Notify both users and **both their assigned counselors** (see Notification Matrix, §9).
2. Create `ChatChannel(type=private)` for the couple.
3. Create `ChatChannel(type=counselor_group)` with participants = both users + both counselors.
4. Either party may propose a `CalendarEvent` inside either chat; on `status → confirmed`, both accountIds are auto-added to `participantIds` ("Auto-Add" logic).
5. If the match ends, the ending user must submit a `StatusResetRequest`; only after their counselor marks it `completed` does `UserProfile.status` return to `vetted_active` and re-enter discovery.

---

## 9. Notification Matrix

| Event | Notified | Type |
|---|---|---|
| Signup abandoned (profile incomplete after threshold) | User (email/SMS) | `lead_recovery` |
| Vetting approved | User | `vetting_approved` |
| Vetting denied | User | `vetting_denied` |
| Hard-blocked | User | `hard_blocked` |
| Appeal resolved | User | `appeal_resolved` |
| Request received | Recipient | `request_received` |
| Request accepted (match formed) | Both users, both counselors | `match_formed` |
| Request rejected | Requester (blind — no identity) | `request_rejected_blind` |
| Other requests auto-closed (concurrency) | Requester | `requests_no_longer_available` |
| Calendar event proposed | Other chat participant(s) | `event_proposed` |
| Calendar event confirmed | All participants | `event_confirmed` |
| Match ended | Both users, both counselors | `match_ended` |
| Status reset completed | User | `reset_completed` |
| Subscription expiring soon | User | `subscription_expiring` |

---

## 10. Mobile App — Screen Inventory

### A. Auth & Lead Capture
1. Splash 2. Welcome/Value-Prop Carousel 3. Social Auth Signup 4. Minimal Email/Phone Signup 5. Login 6. Forgot Password 7. Reset Password 8. Email Verification Prompt

### B. Profile Enrichment (resumable, gated)
9. Onboarding Hub (shows completion %, resumes where left off) 10. Basic Info 11. Church Selection — Parent+Branch variant 11b. Church Selection — Parish Search variant 12. Address + Map Confirmation 13. Phone Numbers (voice + WhatsApp) 14. Social Handles (2-of-3 gate UI) 15. Income Range 16. Photo Upload (exactly 3) 17. Intro Video Recording (liveness, <1 min, timer UI) 18. Match Preferences (scope selector) 19. Review & Submit

### C. Gated / Waiting States
20. Read-Only Lock Screen 21. Pending Vetting Waiting Screen 22. Denied Screen (reason + edit CTA) 23. Hard-Blocked Screen 24. Appeal Submission Form 25. Appeal Status Screen

### D. Discovery & Requests
26. Discovery Feed 27. Profile Detail View 28. Send-Request Confirmation (slot count shown) 29. Sent Requests List 30. Received Requests List (accept/reject) 31. Slots-Full Blocking Screen

### E. Match & Communication
32. Match Celebration 33. Private Chat 34. Counselor Group Chat 35. Propose Meeting (calendar-in-chat) 36. Meeting Confirmation 37. Relationship Status / Mark Ended 38. Status Reset Request Flow

### F. Subscription
39. Plans (Monthly/Yearly) 40. Checkout 41. Manage Subscription 42. Billing History

### G. Profile & Settings
43. My Profile 44. Edit Profile (deep-links into B steps) 45. Notification Settings 46. "Who Can See My Data" (informational privacy screen) 47. Account Settings (password, logout, delete)

---

## 11. Admin Web App — Screen Inventory

### A. Auth
1. Login (shared, role read from response) 2. Forgot/Reset Password

### B. SuperAdmin
3. Platform Dashboard 4. Church List 5. Create Church (onboarding-type selector + Pastor capture) 6. Church Detail/Edit 7. Create ChurchAdmin 8. Appeals Queue 9. Appeal Detail & Resolution 10. Subscription/Revenue Analytics

### C. Unified Church Dashboard (shared shell — content gated by role per §2 permission matrix)
11. Dashboard Home 12. Member Directory 13. Member Profile Detail (fields shown vary by role) 14. Assign Counselor (ChurchAdmin) 15. Counselor Management (ChurchAdmin) 16. Pastor Assignment (ChurchAdmin/SuperAdmin) 17. Vetting Queue (Counselor/Pastor) 18. Vetting Review & Decision (Counselor/Pastor) 19. Active Matches Oversight (Counselor) 20. Counselor Group Chat (Counselor side) 21. Status Reset Debrief Queue (Counselor) 22. Church Profile Settings

---

## 12. API Reference

All endpoints require `Authorization: Bearer {token}` unless marked **Public**. All list endpoints support `?page=&limit=`.

### 12.1 Auth
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/social` | Public | Social provider token exchange → creates/logs in Account |
| POST | `/auth/signup` | Public | Minimal fields: email/phone, password |
| POST | `/auth/login` | Public | Shared across all roles |
| POST | `/auth/forgot-password` | Public | |
| POST | `/auth/reset-password` | Public | |
| GET | `/auth/verify-email/:token` | Public | |
| POST | `/auth/request-verification` | Public | |
| GET | `/auth/me` | Any | |

### 12.2 Churches (SuperAdmin)
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/churches` | SuperAdmin | See §12.6 for body |
| GET | `/churches` | SuperAdmin | `?onboardingType=&status=` |
| GET | `/churches/parent-orgs` | Public | Dropdown source for ParentBranch signup step |
| GET | `/churches/search?q=` | Public | Parish search for Independent signup step |
| GET | `/churches/:id` | SuperAdmin, own ChurchAdmin/Counselor/Pastor | |
| PUT | `/churches/:id` | SuperAdmin | |
| POST | `/churches/:id/church-admins` | SuperAdmin | Direct creation, see §12.6 |
| POST | `/churches/:id/counselors` | ChurchAdmin, SuperAdmin | Direct creation |
| POST | `/churches/:id/pastors` | ChurchAdmin, SuperAdmin | Direct creation |

### 12.3 User Profile (Onboarding steps — each PUT is one resumable step)
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/profile/me` | User | Returns full profile + `completionStatus` breakdown |
| PUT | `/profile/basic-info` | User | gender, dateOfBirth |
| PUT | `/profile/church` | User | churchId (+ branchName if ParentBranch) |
| PUT | `/profile/address` | User | address fields + lat/lng |
| PUT | `/profile/phones` | User | voicePhone, whatsappPhone |
| PUT | `/profile/social-handles` | User | 2-of-3 validated server-side |
| PUT | `/profile/income` | User | incomeRange |
| POST | `/profile/photos` | User | multipart, exactly 3 total enforced |
| POST | `/profile/intro-video` | User | multipart, <1 min enforced |
| PUT | `/profile/match-preferences` | User | matchScope |
| POST | `/profile/submit` | User | Locks in — flips `pending_vetting` if 100% complete |

### 12.4 Vetting
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/vetting/queue` | Counselor, Pastor | Assigned users with `status=pending_vetting` |
| GET | `/vetting/:userId` | Counselor, Pastor | Full profile incl. hidden fields |
| POST | `/vetting/:userId/decide` | Counselor, Pastor | See §12.6 |
| POST | `/appeals` | User | Submit appeal while `hard_blocked` |
| GET | `/appeals` | SuperAdmin | Queue |
| POST | `/appeals/:id/resolve` | SuperAdmin | approve/deny |

### 12.5 Discovery, Requests, Matches
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/discovery/feed` | User (gated) | Opposite gender, `vetted_active`, scope + geo-weighted |
| GET | `/discovery/:userId` | User (gated) | Profile detail (no hidden fields) |
| POST | `/match-requests` | User (gated) | See §12.6 — enforces 3-slot limit |
| GET | `/match-requests/sent` | User | |
| GET | `/match-requests/received` | User | |
| POST | `/match-requests/:id/accept` | User | Triggers Match + concurrency resolution |
| POST | `/match-requests/:id/reject` | User | Blind — response to requester has no identity |
| GET | `/matches/:id` | User (participant), Counselor (assigned) | |
| POST | `/matches/:id/end` | User (participant) | |
| POST | `/matches/:id/reset-request` | User (participant) | Creates `StatusResetRequest` |
| POST | `/reset-requests/:id/complete` | Counselor | Debrief done → user re-enters pool |

### 12.6 Chat & Calendar
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/chats/:matchId` | Participants (user/counselor per channel type) | Returns both channel IDs |
| GET | `/chats/channel/:channelId/messages` | Channel participants | |
| POST | `/chats/channel/:channelId/messages` | Channel participants | |
| POST | `/chats/channel/:channelId/events` | Channel participants | Propose meeting |
| POST | `/events/:id/confirm` | Other participant | Auto-Add logic fires |
| POST | `/events/:id/cancel` | Either participant | |

### 12.7 Subscriptions
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/subscriptions/plans` | Public | |
| POST | `/subscriptions/checkout` | User | |
| GET | `/subscriptions/me` | User | |
| POST | `/subscriptions/cancel` | User | |
| GET | `/subscriptions/billing-history` | User | |

### 12.8 Church Admin / Counselor / Pastor Dashboard
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/church-admin/dashboard` | ChurchAdmin | |
| GET | `/church-admin/members` | ChurchAdmin | Basic-directory fields only per privacy tier |
| POST | `/church-admin/assign-counselor` | ChurchAdmin | body: `{userId, counselorId}` |
| GET | `/counselor/dashboard` | Counselor, Pastor | |
| GET | `/counselor/assigned-users` | Counselor | Pastor uses `/counselor/all-users` (auditor, church-wide) |
| GET | `/counselor/active-matches` | Counselor | |
| GET | `/admin/dashboard` | SuperAdmin | Platform-wide stats |

---

## 13. Detailed Request/Response Contracts

**These are the payloads worth spelling out in full because they carry non-obvious business logic. All other endpoints follow standard CRUD shapes using the same field names as the schema in §3, wrapped in the standard envelope.**

### Create Church
`POST /churches`
```json
{
  "name": "RCCG",
  "onboardingType": "ParentBranch",
  "isParentOrg": true,
  "state": "Lagos",
  "pastorName": "Pastor Enoch A.",
  "pastorEmail": "pastor@rccg.org",
  "pastorPhone": "+2348012345678"
}
```
Response `data`: `{ "church": { "id": "...", "status": "pending", ... } }`

### Submit Match Preferences → Church Step (ParentBranch example)
`PUT /profile/church`
```json
{ "churchId": "rccg-uuid", "branchName": "City of David Parish, Lekki" }
```

### Send Match Request
`POST /match-requests`
```json
{ "recipientId": "user-uuid" }
```
Success:
```json
{
  "success": true,
  "message": "Request sent",
  "data": { "requestId": "...", "slotsRemaining": 2 }
}
```
Slot-limit error:
```json
{
  "success": false,
  "message": "You have used all 3 request slots. Free a slot before sending another.",
  "data": null,
  "errors": { "code": "slot_limit_reached" }
}
```

### Reject Match Request (blind, from recipient side)
`POST /match-requests/:id/reject`
```json
{ "reason": "optional, internal only — never shown to requester" }
```
What the **requester** sees on their next fetch of `/match-requests/sent`:
```json
{
  "id": "...",
  "status": "rejected",
  "recipient": null,
  "message": "You have 1 slot available."
}
```
Note: `recipient` is deliberately nulled out for `rejected` requests in the requester-facing serializer — this is the Blind Rejection System.

### Accept Match Request (concurrency resolution)
`POST /match-requests/:id/accept`

Server transaction:
1. `MatchRequest.status → accepted`
2. All **other** `pending` requests where `requesterId = this request's requesterId` → `no_longer_available`
3. Create `Match`, `ChatChannel(private)`, `ChatChannel(counselor_group)`
4. Fire `match_formed` notifications to both users + both counselors

Response:
```json
{
  "success": true,
  "message": "Match created",
  "data": {
    "matchId": "...",
    "privateChatId": "...",
    "groupChatId": "..."
  }
}
```

### Vetting Decision
`POST /vetting/:userId/decide`
```json
{ "decision": "denied", "reason": "Incomplete work history — please clarify current employer." }
```
```json
{ "decision": "approved" }
```
```json
{ "decision": "hard_blocked", "reason": "Profile appears non-serious / joke submission." }
```
Effect: updates `UserProfile.status`, writes a `VettingLog` row, fires the matching notification from §9.

### Confirm Calendar Event (Auto-Add)
`POST /events/:id/confirm`
Response:
```json
{
  "success": true,
  "message": "Meeting confirmed and added to both calendars",
  "data": { "eventId": "...", "participantIds": ["accId1", "accId2"], "status": "confirmed" }
}
```

---

## 14. Non-Functional Requirements & Tech Stack

| Layer | Choice |
|---|---|
| Backend | TypeScript, Express, Prisma, PostgreSQL |
| Auth | JWT + bcrypt; social auth via OAuth provider SDKs |
| Media storage | Object storage (S3-compatible) for photos/video, signed URLs |
| Maps | Google Maps / Mapbox Places API for address autocomplete + geocoding |
| Realtime | WebSocket layer (e.g. Socket.IO) for chat + notifications |
| Payments | Paystack/Stripe for NGN subscriptions |
| Mobile | React Native (Expo), Expo Router, Zustand, React Hook Form + Zod |
| Admin Web | React (TypeScript), same response envelope |
| Background jobs | Queue (e.g. BullMQ) for lead-recovery drip emails/SMS, subscription-expiry checks |

---

## 15. Suggested Build Sequencing

1. **Foundation:** Auth, Church CRUD (both onboarding types), ChurchAdmin/Counselor/Pastor direct creation
2. **Profile enrichment:** All onboarding step endpoints + completion-gate logic + mobile onboarding screens
3. **Vetting:** Queue, decision endpoint, state machine, denied/hard-blocked/appeal flows
4. **Discovery & Matching:** Feed, slot-limited requests, blind rejection, concurrency resolution
5. **Post-match:** Chat channels, calendar/Auto-Add, status reset flow
6. **Subscriptions & Analytics:** Payment integration, SuperAdmin revenue dashboard, privacy-tiered church analytics
7. **Notification matrix + background jobs** (lead recovery, subscription expiry) — can be layered in throughout, but functionally depends on steps above existing first

---

## 16. Open Design Decisions (flagged, not resolved by the source PRD)

- **ParentBranch counselor assignment:** since branch is free text, all counselors for a ParentBranch org (e.g. RCCG) form one shared pool. If this needs to scale (RCCG has thousands of parishes), a future phase should consider formalizing branches as child `Church` records with `parentChurchId` — the schema in §3.3 deliberately avoids this for MVP per the PRD's "onboarded once" instruction, but the migration path exists if needed.
- **Pastor's own marital status:** the PRD doesn't address whether a Pastor account can *also* independently hold a `UserProfile` (e.g. an unmarried pastor). Current design: Pastor role has no profile relation at all — if this is wrong, it needs explicit product sign-off since it changes the schema.
- **Subscription enforcement point:** the source PRD mandates subscription for "uninterrupted access" during vetting/matching but doesn't specify exactly which endpoints are paywalled pre-vetting vs post-vetting. Recommend: subscription required starting at `pending_vetting → vetted_active` transition (i.e., you can build your profile for free, but need an active subscription to enter discovery) — confirm before building payment gating.