# Faith-Based Matchmaking Platform: Full Backend Architecture Specification

## 1. Executive Architecture Overview

The platform is a multi-tenant, faith-based matchmaking and relationship mentoring ecosystem designed around three core pillars:
1. **High-Trust Church Governance**: 1-to-1 Church-to-ChurchAdmin mapping with pastoral leadership titles (e.g., Pastor, Reverend, Priest), local counselor assignments, and multi-tier privacy firewalls.
2. **Psychological Safety & Controlled Intentionality**: "Shame-Free" 3-slot request cap, blind rejections, and first-come acceptance concurrency resolution.
3. **Progressive Onboarding & Vetting**: Step-1 lead capture for retention drip campaigns, a 100% profile update gate, multi-stage vetting (Counselor calls, 3 photos, <1 min liveness video, 2-of-3 verified socials), and post-match counselor-mediated debrief resets.

---

## 2. Role-Based Access Control (RBAC) & Entity Topology

### Role Hierarchy & 1-to-1 Church Governance
- **`SuperAdmin`**: Platform operator. Manages churches, global configurations, subscription plans, appeals, and system metrics.
- **`ChurchAdmin` (1-to-1 with Church)**:
  - Each `Church` has exactly **ONE** `ChurchAdmin` (1:1 relationship).
  - Contains an optional `title` field (e.g., `Pastor`, `Reverend`, `Priest`, `Bishop`, `Elder`).
  - Acts as the church auditor and supervisor.
  - Excluded programmatically from matchmaking discovery pools.
  - Governed by the **Restricted Analytics Privacy Tier** (can view basic directory and aggregate stats, but cannot see salary, residence address, match preferences, or external match identities).
- **`Counselor`**:
  - Belongs to a specific church (1:N from Church).
  - Assigned to users for verification vetting, relationship oversight, and debrief resets.
  - Granted full "Whole Data" access (Salary, Address, History) **only** for their assigned users and active moderated matches.
- **`User`**:
  - Registered member seeking courtship/marriage.
  - Subject to the 100% profile gate, 3-slot active request limits, and post-match debrief requirements.

---

## 3. Database Schema Blueprint (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// ============= ENUMS =============

enum Role {
  SuperAdmin
  ChurchAdmin
  Counselor
  User
}

enum ChurchModelType {
  PARENT_BRANCH       // e.g., RCCG with custom parish/branch input
  INDIVIDUAL_PARISH   // e.g., Catholic, Anglican, Baptist with designated local counselor
}

enum GenderType {
  Male
  Female
}

enum MatchPreferenceType {
  my_church
  my_church_plus
  other_churches
}

enum SalaryRange {
  RANGE_0_100K        // 0 - 100k
  RANGE_100K_500K     // 100k - 500k
  RANGE_500K_1M       // 500k - 1M
  RANGE_1M_PLUS       // 1M+
}

enum SubscriptionTierType {
  free
  premium
}

enum SubscriptionPlanInterval {
  MONTHLY
  YEARLY
}

enum SubscriptionStatusType {
  active
  past_due
  expired
  canceled
}

enum StatusType {
  pending
  active
  suspended
  deleted
}

enum UserVettingStatus {
  DRAFT               // Profile incomplete (< 100%)
  PENDING_VETTING     // 100% complete, awaiting counselor call
  VETTED_ACTIVE       // Counselor approved, active in discovery
  REJECTED            // Counselor logged rejection reason
  HARD_BLOCKED        // Non-serious / troll account; appeals process enabled
  DEBRIEF_REQUIRED    // Exited a match, must complete counselor debrief before re-indexing
}

enum MatchStatus {
  AWAITING_DECISIONS
  WAITING_FOR_OTHER
  MUTUAL_ACCEPTED
  IN_CONVERSATION
  COURTSHIP
  MARRIED
  ENDED
  DECLINED
  EXPIRED
}

enum MatchRequestStatus {
  PENDING
  ACCEPTED
  DECLINED
  CANCELLED
  SUPERSEDED          // Auto-cancelled when either party accepts another request
}

enum ChannelType {
  COUPLE_PRIVATE      // Direct encrypted chat between matched couple
  COUNSELOR_GROUP     // 4-party channel (Couple + Counselor A + Counselor B)
}

enum EventStatus {
  PROPOSED
  CONFIRMED
  CANCELLED
  COMPLETED
}

// ============= CORE AUTH =============

model Account {
  id                      String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email                   String    @unique
  password                String?   // Optional for OAuth users
  authProvider            String    @default("local") // local, google, apple
  authProviderId          String?
  firstName               String
  lastName                String
  phone                   String?
  role                    Role
  status                  StatusType @default(pending)

  // Verification & Security
  isEmailVerified         Boolean   @default(false)
  emailVerificationToken  String?   @unique
  emailVerificationExpiry DateTime?
  passwordResetToken      String?   @unique
  passwordResetExpiry     DateTime?

  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  // 1:1 Role Profiles
  superAdmin              SuperAdmin?
  churchAdmin             ChurchAdmin?
  counselor               Counselor?
  user                    User?

  // Relations
  invitesCreated          Invite[]  @relation("CreatedBy")
  messagesSent            Message[]
  eventsProposed          CalendarEvent[] @relation("ProposedBy")

  @@map("accounts")
}

// ============= ROLE PROFILES =============

model SuperAdmin {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  accountId String   @unique @db.Uuid
  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  churchesCreated Church[]

  @@map("super_admins")
}

model ChurchAdmin {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  accountId String   @unique @db.Uuid
  churchId  String   @unique @db.Uuid // STRICT 1:1 WITH CHURCH
  title     String?  // Optional: Pastor, Reverend, Priest, Bishop, Elder

  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  church    Church   @relation(fields: [churchId], references: [id], onDelete: Cascade)

  @@map("church_admins")
}

model Counselor {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  accountId      String    @unique @db.Uuid
  churchId       String    @db.Uuid
  bio            String?

  account        Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
  church         Church    @relation(fields: [churchId], references: [id], onDelete: Cascade)
  assignedUsers  User[]    @relation("AssignedCounselor")
  createdMatches Match[]   @relation("CounselorMatches")
  vettingLogs    VettingLog[]
  debriefs       CounselorDebrief[]

  @@index([churchId])
  @@map("counselors")
}

model User {
  id                          String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  accountId                   String             @unique @db.Uuid
  gender                      GenderType
  dateOfBirth                 DateTime?

  // Progressive Onboarding & Profile Gate
  onboardingStep              Int                @default(1)
  profileCompletionPercentage Int                @default(0)
  isDiscoveryIndexed          Boolean            @default(false)
  vettingStatus               UserVettingStatus  @default(DRAFT)
  whatsappNumber              String?

  // Church Selection
  churchId                    String?            @db.Uuid
  church                      Church?            @relation("ChurchMembers", fields: [churchId], references: [id])
  branchName                  String?            // For Parent-Branch models (e.g. RCCG Parish Name)

  // Financial & Professional Integrity (Privacy Firewall)
  occupation                  String?
  salaryRange                 SalaryRange?       // VISIBLE ONLY TO COUNSELOR

  // Geographic & Physical Footprint
  originCountry               String?
  originState                 String?
  originLga                   String?
  residenceCountry            String?
  residenceState              String?
  residenceCity               String?
  residenceAddress            String?
  residenceLatitude           Float?
  residenceLongitude          Float?
  residencePlaceId            String?
  residenceFormattedAddress   String?

  // Dating & Preferences
  interests                   Json?
  matchPreference             MatchPreferenceType?
  videoIntroUrl               String?
  videoDurationSeconds        Int?

  // Subscription
  subscriptionTier            SubscriptionTierType     @default(free)
  subscriptionInterval        SubscriptionPlanInterval?
  subscriptionStatus          SubscriptionStatusType   @default(active)
  subscriptionExpiresAt       DateTime?

  // Counselor Assignment
  assignedCounselorId         String?            @db.Uuid
  assignedCounselor           Counselor?         @relation("AssignedCounselor", fields: [assignedCounselorId], references: [id])
  verifiedAt                  DateTime?

  // Relations
  account                     Account            @relation(fields: [accountId], references: [id], onDelete: Cascade)
  photos                      UserPhoto[]
  socialMediaHandles          UserSocialMedia[]
  sentRequests                MatchRequest[]     @relation("SentRequests")
  receivedRequests            MatchRequest[]     @relation("ReceivedRequests")
  matchParticipations         MatchParticipant[]
  vettingLogs                 VettingLog[]
  appealRequests              AppealRequest[]
  debriefs                    CounselorDebrief[]

  @@index([churchId])
  @@index([vettingStatus])
  @@index([isDiscoveryIndexed])
  @@map("users")
}

model UserPhoto {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @db.Uuid
  url         String
  order       Int      // 1, 2, or 3 (Exactly 3 photos required)
  publicId    String?
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, order])
  @@map("user_photos")
}

// ============= CHURCH MODEL =============

model Church {
  id           String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  officialName String
  aka          String?
  churchModel  ChurchModelType @default(INDIVIDUAL_PARISH)
  email        String          @unique
  phone        String

  // Address & Geocoding
  state        String
  lga          String?
  city         String?
  address      String?

  status       StatusType      @default(pending)
  createdBy    String          @db.Uuid
  creator      SuperAdmin      @relation(fields: [createdBy], references: [id])

  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  // 1:1 ChurchAdmin, 1:N Counselors & Members
  churchAdmin  ChurchAdmin?    // STRICT 1:1
  counselors   Counselor[]
  members      User[]          @relation("ChurchMembers")
  invites      Invite[]

  @@map("churches")
}

// ============= MATCHMAKING & REQUEST ENGINE =============

model MatchRequest {
  id           String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  senderId     String             @db.Uuid
  receiverId   String             @db.Uuid
  status       MatchRequestStatus @default(PENDING)
  declinedAt   DateTime?
  supersededAt DateTime?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  sender       User               @relation("SentRequests", fields: [senderId], references: [id], onDelete: Cascade)
  receiver     User               @relation("ReceivedRequests", fields: [receiverId], references: [id], onDelete: Cascade)

  @@index([senderId, status])
  @@index([receiverId, status])
  @@map("match_requests")
}

model Match {
  id                 String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  status             MatchStatus        @default(IN_CONVERSATION)
  counselorId        String?            @db.Uuid
  createdAt          DateTime           @default(now())
  endedAt            DateTime?
  compatibilityScore Int?

  counselor          Counselor?         @relation("CounselorMatches", fields: [counselorId], references: [id], onDelete: SetNull)
  participants       MatchParticipant[]
  conversations      Conversation[]
  calendarEvents     CalendarEvent[]
  debriefs           CounselorDebrief[]

  @@index([status])
  @@index([counselorId])
  @@map("matches")
}

model MatchParticipant {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  matchId    String   @db.Uuid
  userId     String   @db.Uuid
  feedback   String?
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  match      Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([matchId, userId])
  @@index([userId])
  @@map("match_participants")
}

// ============= COMMUNICATIONS & CALENDAR =============

model Conversation {
  id           String                    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  matchId      String                    @db.Uuid
  type         ChannelType
  createdAt    DateTime                  @default(now())
  updatedAt    DateTime                  @updatedAt

  match        Match                     @relation(fields: [matchId], references: [id], onDelete: Cascade)
  participants ConversationParticipant[]
  messages     Message[]

  @@index([matchId])
  @@map("conversations")
}

model ConversationParticipant {
  id             String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  conversationId String       @db.Uuid
  accountId      String       @db.Uuid
  roleInChat     String       // COUPLE_MEMBER, COUNSELOR, OBSERVER
  joinedAt       DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@unique([conversationId, accountId])
  @@map("conversation_participants")
}

model Message {
  id             String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  conversationId String       @db.Uuid
  senderId       String       @db.Uuid
  content        String
  mediaUrl       String?
  readAt         DateTime?
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         Account      @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@map("messages")
}

model CalendarEvent {
  id             String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  matchId        String      @db.Uuid
  proposedById   String      @db.Uuid
  title          String
  description    String?
  startTime      DateTime
  endTime        DateTime
  status         EventStatus @default(PROPOSED)
  meetingLink    String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  match          Match       @relation(fields: [matchId], references: [id], onDelete: Cascade)
  proposedBy     Account     @relation("ProposedBy", fields: [proposedById], references: [id], onDelete: Cascade)

  @@index([matchId])
  @@map("calendar_events")
}

// ============= VETTING, APPEALS & DEBRIEF =============

model VettingLog {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @db.Uuid
  counselorId String   @db.Uuid
  action      String   // APPROVED, REJECTED, HARD_BLOCKED
  reason      String?
  notes       String?
  createdAt   DateTime @default(now())

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  counselor   Counselor @relation(fields: [counselorId], references: [id], onDelete: Cascade)

  @@map("vetting_logs")
}

model AppealRequest {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId                 String   @db.Uuid
  appealReason           String
  status                 String   @default("PENDING") // PENDING, APPROVED, REJECTED
  reviewedBySuperAdminId String?  @db.Uuid
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("appeal_requests")
}

model CounselorDebrief {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  matchId              String    @db.Uuid
  userId               String    @db.Uuid
  counselorId          String    @db.Uuid
  notes                String
  readinessScore       Int?      // 1 - 10
  clearedForDiscoveryAt DateTime?
  createdAt            DateTime  @default(now())

  match                Match     @relation(fields: [matchId], references: [id], onDelete: Cascade)
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  counselor            Counselor @relation(fields: [counselorId], references: [id], onDelete: Cascade)

  @@map("counselor_debriefs")
}

model UserSocialMedia {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @db.Uuid
  platform    String   // LinkedIn, Instagram, Facebook
  handleOrUrl String
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_social_media")
}

model Invite {
  id                 String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  token              String     @unique
  type               String     // ChurchAdmin, Counselor
  email              String
  churchId           String?    @db.Uuid
  createdByAccountId String     @db.Uuid
  used               Boolean    @default(false)
  usedAt             DateTime?
  expiresAt          DateTime
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  church             Church?    @relation(fields: [churchId], references: [id], onDelete: Cascade)
  createdBy          Account    @relation("CreatedBy", fields: [createdByAccountId], references: [id])

  @@map("invites")
}
```

---

## 4. Key Architectural Subsystems & Workflows

### 1. 1-to-1 Church-Admin & Pastoral Title Governance
- Each Church record is strictly linked to a single `ChurchAdmin`.
- When creating/updating a ChurchAdmin:
  - Input payload includes `title` (e.g. "Pastor", "Reverend", "Priest", "Bishop").
  - The Church Admin can view the church congregation directory and aggregated analytics.
  - The Church Admin account is barred from appearing in matchmaking feeds (`Role != 'User'`).

### 2. Progressive Onboarding & 100% Profile Gate
- **Step-1 Capture**: `/api/auth/lead-register` immediately captures contact info (`email`, `phone`, `firstName`, `lastName`).
- **Profile Completeness Engine**:
  - Calculates score across: Demographics (DOB, Gender), Origin & Residence (Geocoded), Exact 3 Photos, Video Intro (<1 min), Standardized Salary Band, Match Preference, 2-of-3 Social Handles (LinkedIn, Instagram, Facebook).
- **Gate Middleware (`requireProfileComplete`)**:
  - Automatically intercepts calls to `/discovery`, `/requests`, and `/matches`.
  - Rejects incomplete users with a structured list of remaining required items.
  - When completion hits 100%, user status updates to `PENDING_VETTING`.

### 3. Match Discovery & "Shame-Free" 3-Slot Request Logic
- **Discovery Engine (`GET /api/discovery/feed`)**:
  - Filter: Opposite gender, `VETTED_ACTIVE`, `isDiscoveryIndexed = true`.
  - Geographic Weighting: Haversine distance calculated against candidate coordinates.
  - Church scope filter applied according to `MatchPreferenceType`.
- **Request Engine (`POST /api/requests/send`)**:
  - Checks if user has `< 3` active pending requests. If `= 3`, throws `400 Bad Request`.
- **Blind Rejection (`POST /api/requests/:id/decline`)**:
  - Receiver declines request.
  - Sender receives generic notification *"You have 1 request slot available"* (target identity is redacted).
- **First-Come Acceptance Resolution (`POST /api/requests/:id/accept`)**:
  - Atomic Prisma `$transaction`:
    1. Creates `Match` (`status: IN_CONVERSATION`).
    2. Initializes `COUPLE_PRIVATE` and `COUNSELOR_GROUP` conversation channels.
    3. Auto-cancels (`status: SUPERSEDED`) all other pending requests sent or received by both parties.
    4. Sets both users' `isDiscoveryIndexed = false`.

### 5. Counselor-Mediated Status Reset
- When a relationship terminates (`POST /api/matches/:id/end`):
  - Both users enter `DEBRIEF_REQUIRED` status and remain unindexed.
  - The assigned counselor reviews the case via `POST /api/counselor/users/:userId/debrief-reset`.
  - Upon debrief completion, counselor resets status to `VETTED_ACTIVE` and restores discovery indexing.

### 6. Data Privacy Firewall & Restricted Analytics
- **Church Admin (Auditor)**:
  - Allowed: Member names, photos, join date, verification status, aggregate match counts.
  - Redacted: Salary range, exact residential address, match preference, and identity of external match partners.
- **Counselor**:
  - Full "Whole Data" access (Salary, Address, History) strictly limited to their assigned users.
