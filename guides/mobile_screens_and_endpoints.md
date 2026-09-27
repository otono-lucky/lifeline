# Lifeline Platform — Mobile Application Screens, Usecases & Supporting Endpoints Directory

> **Architectural Boundary Notice**:
> Under the Lifeline platform architecture, the **Mobile Application (`mobile/` - React Native / Expo)** is dedicated exclusively to **regular daters (`User`)**. 
> All candidate onboarding, profile completion, discovery feed browsing, 3-slot match requests, private chats, dynamic date scheduling, and Paystack subscriptions run natively on mobile. 
> Administrative governance and pastoral staff operations (`SuperAdmin`, `ChurchAdmin`, `Counselor`) operate on the web frontend (`frontend/`).

---

## Table of Contents
1. [Mobile Navigation Architecture & Lifecycle Router](#1-mobile-navigation-architecture--lifecycle-router)
2. [Part I: Authentication & Lead Acquisition (`(auth)`)](#part-i-authentication--lead-acquisition-auth)
   - [Screen 1: Step-1 Low-Friction Lead Registration](#screen-1-step-1-low-friction-lead-registration)
   - [Screen 2: Credentials & Social Login](#screen-2-credentials--social-login)
   - [Screen 3: Email Verification & OTP Validation](#screen-3-email-verification--otp-validation)
   - [Screen 4: Password Recovery Request](#screen-4-password-recovery-request)
3. [Part II: Progressive Onboarding & 100% Completion Gate (`(onboarding)`)](#part-ii-progressive-onboarding--100-completion-gate-onboarding)
   - [Screen 5: Geographic Footprint & Residential Address](#screen-5-geographic-footprint--residential-address)
   - [Screen 6: Church Selection & Denomination Affiliation](#screen-6-church-selection--denomination-affiliation)
   - [Screen 7: Career, Education & Financial Bracket (Safeguarded)](#screen-7-career-education--financial-bracket-safeguarded)
   - [Screen 8: Partner Preferences & Lifestyle Values](#screen-8-partner-preferences--lifestyle-values)
   - [Screen 9: Social Identity Verification (2-of-3 Rule)](#screen-9-social-identity-verification-2-of-3-rule)
   - [Screen 10: Mandatory Media Upload (3 Photos + Video Intro)](#screen-10-mandatory-media-upload-3-photos--video-intro)
   - [Screen 11: 10-Point Completion Review & Pastoral Submission](#screen-11-10-point-completion-review--pastoral-submission)
4. [Part III: Pastoral Vetting & Safeguarding Gates (`(vetting)`)](#part-iii-pastoral-vetting--safeguarding-gates-vetting)
   - [Screen 12: Pastoral Review Pending Holding Screen](#screen-12-pastoral-review-pending-holding-screen)
   - [Screen 13: Pastoral Adjustment Feedback & Correction Screen](#screen-13-pastoral-adjustment-feedback--correction-screen)
   - [Screen 14: Disqualification & Formal Appeal Workspace](#screen-14-disqualification--formal-appeal-workspace)
   - [Screen 15: Courtship Concluded & Exit Debrief Lock](#screen-15-courtship-concluded--exit-debrief-lock)
5. [Part IV: Main Application Tabs & Core Matchmaking (`(app)/(tabs)`)](#part-iv-main-application-tabs--core-matchmaking-apptabs)
   - [Screen 16: Geolocation-Weighted Candidate Discovery Feed](#screen-16-geolocation-weighted-candidate-discovery-feed)
   - [Screen 17: Dedicated Candidate Profile & Video Streaming Workspace](#screen-17-dedicated-candidate-profile--video-streaming-workspace)
   - [Screen 18: Match Request Management Hub (3-Slot Active Cap)](#screen-18-match-request-management-hub-3-slot-active-cap)
   - [Screen 19: Conversation Channels Inbox](#screen-19-conversation-channels-inbox)
   - [Screen 20: In-App Interactive Chat Workspace (Private & Monitored)](#screen-20-in-app-interactive-chat-workspace-private--monitored)
   - [Screen 21: Dynamic Date Calendar & Itinerary Hub](#screen-21-dynamic-date-calendar--itinerary-hub)
   - [Screen 22: Date Meetup Proposal Modal](#screen-22-date-meetup-proposal-modal)
   - [Screen 23: Dater Profile & Spiritual Credentials](#screen-23-dater-profile--spiritual-credentials)
   - [Screen 24: Kingdom Premium Subscription Modal (Paystack Checkout)](#screen-24-kingdom-premium-subscription-modal-paystack-checkout)
   - [Screen 25: App Entrypoint & Session Router](#screen-25-app-entrypoint--session-router)
   - [Screen 26: Public Discovery Explorer](#screen-26-public-discovery-explorer)
6. [Cross-Platform Web Admin Integration Summary](#6-cross-platform-web-admin-integration-summary)

---

## 1. Mobile Navigation Architecture & Lifecycle Router

The mobile application utilizes **Expo Router** with strict lifecycle guards that dynamically route the user based on authentication token validity and `UserVettingStatus`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MOBILE ROUTER DISPATCHER                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼ Unauthenticated                                 ▼ Authenticated
  ┌─────────────────┐                           ┌────────────────────────┐
  │   (auth) Group  │                           │ Evaluate VettingStatus │
  │ • lead-register │                           └───────────┬────────────┘
  │ • login         │                                       │
  │ • verify-email  │         ┌──────────────┬──────────────┼──────────────┬──────────────┐
  │ • forgot-pwd    │         ▼              ▼              ▼              ▼              ▼
  └─────────────────┘       DRAFT     PENDING_VETTING    REJECTED     HARD_BLOCKED DEBRIEF_REQUIRED
                              │              │              │              │              │
                              ▼              ▼              ▼              ▼              ▼
                        (onboarding)    (vetting)      (vetting)      (vetting)      (vetting)
                         Location        pending        rejected       blocked        debrief
                         Church
                         Career
                         Preferences
                         Socials
                         MediaUpload
                         Review
                              │
                              ▼ (100% Completed & Approved: VETTED_ACTIVE)
                        ┌────────────────────────────────────────────────────────┐
                        │                   (app) Main Tabs                      │
                        │ • discovery: Candidate Feed                            │
                        │ • requests: 3-Slot Sent/Received Gate                  │
                        │ • messages: Private Couple & 3-Way Monitored Chats     │
                        │ • calendar: Date Meetup Itineraries & Safety Checks    │
                        │ • profile: Account Dossier & Kingdom Premium Upgrade   │
                        └────────────────────────────────────────────────────────┘
```

---

## Part I: Authentication & Lead Acquisition (`(auth)`)

### Screen 1: Step-1 Low-Friction Lead Registration
- **Route Path**: `/(auth)/lead-register`
- **Implementation File**: `mobile/src/app/(auth)/lead-register.tsx`
- **Access Level**: Public / Unauthenticated
- **Use Case & User Value**:
  Low-friction entry gate. Solves user acquisition drop-off by capturing essential identity metadata (Name, Email, Phone, Gender, Password) in under 60 seconds before committing to the full Christian profiling questionnaire.
- **Functional & Safeguarding Requirements**:
  - Validates full name, email format, minimum 6-character phone number, and password match.
  - Strict binary gender selection (`Male` | `Female`) for opposite-gender Christian matchmaking.
  - Automatically provisions an unverified `Account` and sends an email verification token.
  - One-click Google/Apple OAuth buttons.
- **Supporting Backend Endpoints**:
  1. `POST /api/auth/lead-register`
     - **Auth**: None (Public)
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
     - **Response Envelope (201 Created)**:
       ```json
       {
         "success": true,
         "message": "Lead registration successful. Verification token generated.",
         "data": {
           "accountId": "uuid",
           "email": "chinedu.eze@example.com"
         }
       }
       ```
  2. `POST /api/auth/social-login` (`{ "provider": "GOOGLE" | "APPLE", "token": "..." }`)

---

### Screen 2: Credentials & Social Login
- **Route Path**: `/(auth)/login`
- **Implementation File**: `mobile/src/app/(auth)/login.tsx`
- **Access Level**: Public / Unauthenticated
- **Use Case & User Value**:
  Secure credential verification for returning candidates. Grants instant access to active chats, pending courtship requests, and verified match feeds.
- **Functional & Safeguarding Requirements**:
  - Email and password validation.
  - Role guard: Mobile application strictly authenticates accounts with `role: "User"`.
  - Secure storage: Stores JWT token in device keychain (`SecureStore`).
  - Directs candidates immediately to their corresponding lifecycle state (`onboarding`, `vetting`, or `app`).
- **Supporting Backend Endpoints**:
  1. `POST /api/auth/login`
     - **Auth**: None
     - **Request Body**: `{ "email": "candidate@example.com", "password": "Password123!" }`
     - **Response Envelope (200 OK)**:
       ```json
       {
         "success": true,
         "data": {
           "token": "eyJhbGciOi...",
           "user": {
             "id": "uuid",
             "email": "candidate@example.com",
             "role": "User",
             "status": "active",
             "vettingStatus": "VETTED_ACTIVE"
           }
         }
       }
       ```

---

### Screen 3: Email Verification & OTP Validation
- **Route Path**: `/(auth)/verify-email`
- **Implementation File**: `mobile/src/app/(auth)/verify-email.tsx`
- **Access Level**: Public / Authenticated Token Required
- **Use Case & User Value**:
  Authenticates email ownership to prevent spam, duplicate dater registrations, and impersonation.
- **Functional & Safeguarding Requirements**:
  - Accepts token link or numeric OTP code.
  - Resend cooldown timer (60s countdown) to prevent email rate-limit exhaustion.
- **Supporting Backend Endpoints**:
  1. `GET /api/auth/verify-email/:token`
  2. `POST /api/auth/request-verification` (`{ "email": "candidate@example.com" }`)

---

### Screen 4: Password Recovery Request
- **Route Path**: `/(auth)/forgot-password`
- **Implementation File**: `mobile/src/app/(auth)/forgot-password.tsx`
- **Access Level**: Public / Unauthenticated
- **Use Case & User Value**:
  Self-service password recovery for locked out daters without exposing account existence to third parties.
- **Supporting Backend Endpoints**:
  1. `POST /api/auth/forgot-password` (`{ "email": "candidate@example.com" }`)

---

## Part II: Progressive Onboarding & 100% Completion Gate (`(onboarding)`)

### Screen 5: Geographic Footprint & Residential Address
- **Route Path**: `/(onboarding)/location-profile`
- **Implementation File**: `mobile/src/app/(onboarding)/location-profile.tsx`
- **Access Level**: Authenticated `User` (`onboardingStep: 1`)
- **Use Case & User Value**:
  Captures geographic roots (State, LGA of origin) and current residential footprint (City, State, formatted address). Enables the geolocation algorithm to recommend nearby Christian singles.
- **Functional & Safeguarding Requirements**:
  - Google Places API autocomplete for verified coordinates (`residenceLatitude`, `residenceLongitude`, `residencePlaceId`).
  - Strict confidentiality: Exact street address is stored confidentially and hidden from other daters and parish general views.
- **Supporting Backend Endpoints**:
  1. `PUT /api/users/:userId`
     - **Auth**: Bearer JWT (`User`)
     - **Request Body**:
       ```json
       {
         "originCountry": "Nigeria",
         "originState": "Delta",
         "originLga": "Warri South",
         "residenceCountry": "Nigeria",
         "residenceState": "Lagos",
         "residenceCity": "Lekki",
         "residenceAddress": "Admiralty Way, Lekki Phase 1",
         "residenceLatitude": 6.4474,
         "residenceLongitude": 3.4842,
         "residencePlaceId": "ChIJ...",
         "residenceFormattedAddress": "Lekki Phase 1, Lagos, Nigeria"
       }
       ```

---

### Screen 6: Church Selection & Denomination Affiliation
- **Route Path**: `/(onboarding)/church-selection`
- **Implementation File**: `mobile/src/app/(onboarding)/church-selection.tsx`
- **Access Level**: Authenticated `User` (`onboardingStep: 2`)
- **Use Case & User Value**:
  Links the candidate to their local faith community. Assigns the member to their local parish counselors for vetting and ongoing courtship pastoral guidance.
- **Functional & Safeguarding Requirements**:
  - Dynamic searchable dropdown of registered churches (`GET /api/churches/public`).
  - Supports both `PARENT_BRANCH` (allows entering specific province or parish name, e.g. "RCCG City of David") and `INDIVIDUAL_PARISH`.
  - Re-assigns candidate's spiritual oversight to the chosen church's counselor pool.
- **Supporting Backend Endpoints**:
  1. `GET /api/churches/public`
  2. `PUT /api/users/:userId` (`{ "churchId": "uuid", "branchName": "City of David" }`)

---

### Screen 7: Career, Education & Financial Bracket (Safeguarded)
- **Route Path**: `/(onboarding)/career-financial`
- **Implementation File**: `mobile/src/app/(onboarding)/career-financial.tsx`
- **Access Level**: Authenticated `User` (`onboardingStep: 3`)
- **Use Case & User Value**:
  Verifies occupational stability and intentional life maturity. Allows candidates to share career ambition while keeping sensitive earnings confidential.
- **Functional & Safeguarding Requirements**:
  - Captures `occupation`, education level, and `salaryRange` (`RANGE_0_100K`, `RANGE_100K_500K`, `RANGE_500K_1M`, `RANGE_1M_PLUS`).
  - **Administrative Privacy Firewall**: Explicit in-app disclosure notifying the candidate that their financial bracket is encrypted and solely reviewed confidentially by their pastoral counselor.
- **Supporting Backend Endpoints**:
  1. `PUT /api/users/:userId` (`{ "occupation": "Senior Accountant", "salaryRange": "RANGE_500K_1M" }`)

---

### Screen 8: Partner Preferences & Lifestyle Values
- **Route Path**: `/(onboarding)/preferences`
- **Implementation File**: `mobile/src/app/(onboarding)/preferences.tsx`
- **Access Level**: Authenticated `User` (`onboardingStep: 4`)
- **Use Case & User Value**:
  Specifies courtship boundaries: partner age range, denomination boundary (`my_church`, `my_church_plus`, `other_churches`), and Christian lifestyle interests.
- **Supporting Backend Endpoints**:
  1. `PUT /api/users/:userId`
     - **Request Body**:
       ```json
       {
         "matchPreference": "my_church_plus",
         "interests": ["Worship Ministry", "Bible Study", "Fitness", "Entrepreneurship"]
       }
       ```

---

### Screen 9: Social Identity Verification (2-of-3 Rule)
- **Route Path**: `/(onboarding)/social-identity`
- **Implementation File**: `mobile/src/app/(onboarding)/social-identity.tsx`
- **Access Level**: Authenticated `User` (`onboardingStep: 5`)
- **Use Case & User Value**:
  Anti-catfishing & identity authenticity verification. Verifies the candidate's real-world digital footprint.
- **Functional & Safeguarding Requirements**:
  - Mandatory **2-of-3 verified social media links** (LinkedIn, Instagram, Facebook).
  - Validation: rejects duplicate URLs and blank handles.
- **Supporting Backend Endpoints**:
  1. `GET /api/users/:userId/socials`
  2. `POST /api/users/:userId/socials` (`{ "platform": "LinkedIn", "handleOrUrl": "https://linkedin.com/in/chinedu-eze" }`)
  3. `DELETE /api/users/:userId/socials/:socialId`

---

### Screen 10: Mandatory Media Upload (3 Photos + Video Intro)
- **Route Path**: `/(onboarding)/media-upload`
- **Implementation File**: `mobile/src/app/(onboarding)/media-upload.tsx`
- **Access Level**: Authenticated `User` (`onboardingStep: 6`)
- **Use Case & User Value**:
  Establishes true visual identity, facial liveness, and voice presence. Replaces misleading heavily filtered profile pictures with authentic verification media.
- **Functional & Safeguarding Requirements**:
  - **Exactly 3 Photos**: Strict upload order 1 (headshot portrait), 2 (full body), 3 (lifestyle/hobby). Modesty guidelines enforced.
  - **Video Introduction**: Short liveness video recording (<60 seconds, max 50MB) introducing themselves and their Christian testimony.
  - Multi-part form-data streaming directly to Cloudinary via backend proxy.
- **Supporting Backend Endpoints**:
  1. `POST /api/users/:userId/photos` (Form-Data: `image`, `order: 1 | 2 | 3`)
  2. `PUT /api/users/:userId` (`{ "videoIntroUrl": "https://res.cloudinary.com/.../intro.mp4", "videoDurationSeconds": 48 }`)

---

### Screen 11: 10-Point Completion Review & Pastoral Submission
- **Route Path**: `/(onboarding)/completion-review`
- **Implementation File**: `mobile/src/app/(onboarding)/completion-review.tsx`
- **Access Level**: Authenticated `User` (`onboardingStep: 7`)
- **Use Case & User Value**:
  Pre-flight verification dashboard. Confirms all 10 mandatory vetting weights are met before locking the profile and transmitting it to the parish counselor queue.
- **Functional & Safeguarding Requirements**:
  - Visual 100% completion checklist: Basic Info, Location, Church Branch, Salary Range, 2-of-3 Socials, 3 Photos, Video Intro.
  - Submission Trigger: Transitions `vettingStatus` from `DRAFT` to `PENDING_VETTING`.
  - Redirects immediately to Screen 12 (`/(vetting)/pending`).
- **Supporting Backend Endpoints**:
  1. `GET /api/users/:userId` (inspects `profileCompletionPercentage` and `missingFields`)
  2. `PUT /api/users/:userId` (`{ "vettingStatus": "PENDING_VETTING" }`)

---

## Part III: Pastoral Vetting & Safeguarding Gates (`(vetting)`)

### Screen 12: Pastoral Review Pending Holding Screen
- **Route Path**: `/(vetting)/pending`
- **Implementation File**: `mobile/src/app/(vetting)/pending.tsx`
- **Access Level**: Authenticated `User` (`vettingStatus: "PENDING_VETTING"`)
- **Use Case & User Value**:
  Reassuring holding state. Informs the candidate that their submission is currently under review by pastoral counselors at their home church, establishing trust and setting expectations for response timelines.
- **Functional & Safeguarding Requirements**:
  - Displays assigned church parish, submitted timestamp, and counselor verification stages.
  - Discovery feed is locked; match requests cannot be sent or received.
  - "Check Status" button polls `GET /api/auth/me` to detect counselor approval in real-time.
- **Supporting Backend Endpoints**:
  1. `GET /api/auth/me`

---

### Screen 13: Pastoral Adjustment Feedback & Correction Screen
- **Route Path**: `/(vetting)/rejected`
- **Implementation File**: `mobile/src/app/(vetting)/rejected.tsx`
- **Access Level**: Authenticated `User` (`vettingStatus: "REJECTED"`)
- **Use Case & User Value**:
  Constructive correction workspace. Rather than an abrupt rejection, the candidate receives specific pastoral guidance from their counselor (e.g., "Please re-record your video with clear lighting", "Update your church branch").
- **Functional & Safeguarding Requirements**:
  - Displays the counselor's exact feedback note.
  - "Edit Profile" deep-link returns the candidate to the relevant onboarding step.
  - "Resubmit for Vetting" re-queues the candidate into `PENDING_VETTING`.
- **Supporting Backend Endpoints**:
  1. `GET /api/users/:userId` (retrieves `verificationNotes`)
  2. `PUT /api/users/:userId` (`{ "vettingStatus": "PENDING_VETTING" }`)

---

### Screen 14: Disqualification & Formal Appeal Workspace
- **Route Path**: `/(vetting)/blocked`
- **Implementation File**: `mobile/src/app/(vetting)/blocked.tsx`
- **Access Level**: Authenticated `User` (`vettingStatus: "HARD_BLOCKED"`)
- **Use Case & User Value**:
  Safeguarding dispute resolution gateway. When an account is permanently disqualified by a local counselor, this screen prevents rogue counselor abuse by giving the candidate an impartial appeal desk to SuperAdmin.
- **Functional & Safeguarding Requirements**:
  - Displays the disqualification notification.
  - Formal Appeal form: Candidates enter an explanatory statement (`appealReason`).
  - Submits appeal directly to the SuperAdmin queue (`Screen 9` on Web).
- **Supporting Backend Endpoints**:
  1. `POST /api/vetting/appeal`
     - **Auth**: Bearer JWT (`User`)
     - **Request Body**: `{ "appealReason": "I submitted government-issued ID verifying my legal name." }`
     - **Response Envelope (201 Created)**:
       ```json
       {
         "success": true,
         "message": "Appeal submitted successfully. SuperAdmin review is pending.",
         "data": { "appealId": "uuid", "status": "PENDING" }
       }
       ```

---

### Screen 15: Courtship Concluded & Exit Debrief Lock
- **Route Path**: `/(vetting)/debrief`
- **Implementation File**: `mobile/src/app/(vetting)/debrief.tsx`
- **Access Level**: Authenticated `User` (`vettingStatus: "DEBRIEF_REQUIRED"`)
- **Use Case & User Value**:
  Pastoral care buffer after an ended courtship. Protects candidates from emotional rebound dating by locking discovery until a pastoral exit interview is completed with their counselor.
- **Functional & Safeguarding Requirements**:
  - Explains the debrief policy with biblical encouragement.
  - Displays assigned counselor contact details to schedule the debrief session.
  - Discovery is automatically unlocked once the counselor logs a readiness score on Web (`Screen 21`).
- **Supporting Backend Endpoints**:
  1. `GET /api/auth/me`

---

## Part IV: Main Application Tabs & Core Matchmaking (`(app)/(tabs)`)

### Screen 16: Geolocation-Weighted Candidate Discovery Feed
- **Route Path**: `/(app)/(tabs)/discovery`
- **Implementation File**: `mobile/src/app/(app)/(tabs)/discovery.tsx`
- **Access Level**: Authenticated `User` (`vettingStatus: "VETTED_ACTIVE"`)
- **Use Case & User Value**:
  Primary matchmaking engine. Presents intentional Christian singles who are identity-verified, active in faith, and geographically compatible.
- **Functional & Safeguarding Requirements**:
  - Strict filters: Opposite gender only; verified active members (`VETTED_ACTIVE`).
  - Proximity weighting using Haversine formula based on candidate coordinates.
  - Displays photo carousel (3 photos), verified church badge, age, occupation, and distance.
  - "Send Match Request" action with real-time 3-slot capacity counter.
- **Supporting Backend Endpoints**:
  1. `GET /api/discovery/feed?page=1&limit=10`
     - **Auth**: Bearer JWT (`User`)
     - **Response Envelope (200 OK)**:
       ```json
       {
         "success": true,
         "data": {
           "candidates": [
             {
               "userId": "uuid",
               "firstName": "Sarah",
               "age": 27,
               "occupation": "Pediatric Nurse",
               "residenceCity": "Lekki",
               "distanceKm": 4.2,
               "church": { "officialName": "Elevation Church" },
               "photos": [
                 { "order": 1, "url": "https://..." },
                 { "order": 2, "url": "https://..." },
                 { "order": 3, "url": "https://..." }
               ]
             }
           ],
           "meta": { "totalCandidates": 48 }
         }
       }
       ```

---

### Screen 17: Dedicated Candidate Profile & Video Streaming Workspace
- **Route Path**: `/(app)/candidate/[userId]`
- **Implementation File**: `mobile/src/app/(app)/candidate/[userId].tsx`
- **Access Level**: Authenticated `User` (`VETTED_ACTIVE`)
- **Use Case & User Value**:
  Deep compatibility inspection before committing a match request slot. Candidates watch the video introduction to evaluate spiritual maturity and personality.
- **Functional & Safeguarding Requirements**:
  - Full-screen high-res photo gallery with pinch-to-zoom.
  - Native video intro player with audio/play controls.
  - Background cards: Church branch, faith testimony, career, interests tags.
  - Bottom action bar: "Send Match Request (1 of 3 Slots)" or "Request Pending" badge.
- **Supporting Backend Endpoints**:
  1. `GET /api/users/:userId`
  2. `POST /api/requests/send` (`{ "receiverUserId": "uuid" }`)

---

### Screen 18: Match Request Management Hub (3-Slot Active Cap)
- **Route Path**: `/(app)/(tabs)/requests`
- **Implementation File**: `mobile/src/app/(app)/(tabs)/requests.tsx`
- **Access Level**: Authenticated `User` (`VETTED_ACTIVE`)
- **Use Case & User Value**:
  Enforces intentional Christian dating by capping suitors to a maximum of 3 concurrent active requests. Prevents superficial mass swiping and promotes thoughtful consideration.
- **Functional & Safeguarding Requirements**:
  - **Slots Gauge**: Visual indicator showing `Used: X / 3` and `Remaining: Y / 3`.
  - **Sent Requests Tab**: Pending requests sent to other candidates with cancel action.
  - **Received Requests Tab**: Suitors who sent requests, with "Accept" and "Decline" actions.
  - **First-Come Acceptance Rule**: When a user clicks "Accept", all other pending requests involving either party are automatically `SUPERSEDED`, and chat channels are initialized.
  - **Blind Rejection**: Declining a request notifies the sender generically without awkward confrontation, immediately returning their request slot.
- **Supporting Backend Endpoints**:
  1. `GET /api/requests/sent` (returns `slotsUsed`, `slotsRemaining`, and active requests)
  2. `GET /api/requests/received`
  3. `POST /api/requests/:requestId/accept`
     - **Response Envelope (200 OK)**:
       ```json
       {
         "success": true,
         "message": "Match request accepted. Private and counselor channels initialized.",
         "data": {
           "matchId": "uuid",
           "coupleConversationId": "uuid",
           "counselorConversationId": "uuid"
         }
       }
       ```
  4. `POST /api/requests/:requestId/decline`
  5. `POST /api/requests/:requestId/cancel`

---

### Screen 19: Conversation Channels Inbox
- **Route Path**: `/(app)/(tabs)/messages`
- **Implementation File**: `mobile/src/app/(app)/(tabs)/messages.tsx`
- **Access Level**: Authenticated `User` with active matches
- **Use Case & User Value**:
  Central messaging hub organizing candidate communication across both private 1:1 couple conversations and 3-way monitored pastoral guidance channels.
- **Functional & Safeguarding Requirements**:
  - Filterable by channel type: Direct Couple (`COUPLE_PRIVATE`) vs Counselor Oversight (`COUNSELOR_GROUP`).
  - Unread message counters, timestamps, partner avatar, and snippet previews.
  - Courtship status badge (`IN_CONVERSATION`, `COURTSHIP`).
- **Supporting Backend Endpoints**:
  1. `GET /api/communications/conversations`
     - **Auth**: Bearer JWT (`User`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": [
           {
             "id": "uuid",
             "type": "COUPLE_PRIVATE",
             "matchId": "uuid",
             "otherParticipant": { "name": "Sarah O.", "avatar": "https://..." },
             "lastMessage": { "content": "Looking forward to Sunday!", "createdAt": "..." },
             "unreadCount": 0
           }
         ]
       }
       ```

---

### Screen 20: In-App Interactive Chat Workspace (Private & Monitored)
- **Route Path**: `/(app)/chat/[conversationId]`
- **Implementation File**: `mobile/src/app/(app)/chat/[conversationId].tsx`
- **Access Level**: Authenticated Match Participant
- **Use Case & User Value**:
  Real-time communication workspace. Candidates get to know each other through text, Scripture sharing, and image exchange, supported by moral accountability.
- **Functional & Safeguarding Requirements**:
  - In `COUNSELOR_GROUP` channels: Pastoral counselor is visibly present with a golden cross badge and actively monitors conversation decorum.
  - Date meetup alerts: Proposed meetups appear as structured cards within the chat thread with action buttons to view or confirm.
  - Message bubble styling: Differentiates self, partner, and counselor messages.
- **Supporting Backend Endpoints**:
  1. `GET /api/communications/conversations/:conversationId/messages?page=1&limit=50`
  2. `POST /api/communications/conversations/:conversationId/messages`
     - **Request Body**: `{ "content": "Would you like to meet after service for lunch?", "mediaUrl": null }`

---

### Screen 21: Dynamic Date Calendar & Itinerary Hub
- **Route Path**: `/(app)/(tabs)/calendar`
- **Implementation File**: `mobile/src/app/(app)/(tabs)/calendar.tsx`
- **Access Level**: Authenticated `User`
- **Use Case & User Value**:
  Physical relationship coordination calendar. Tracks confirmed dates, scheduled video calls, and counselor check-ins in one unified agenda.
- **Functional & Safeguarding Requirements**:
  - Chronological agenda of upcoming dates (`PROPOSED`, `CONFIRMED`, `COMPLETED`).
  - Pastoral Safety Status: Indicates whether the meeting location has been reviewed and cleared by the counselor.
  - "Plan a Date" trigger opening Screen 22.
- **Supporting Backend Endpoints**:
  1. `GET /api/communications/matches/:matchId/events`
  2. `PATCH /api/communications/events/:eventId/respond` (`{ "status": "CONFIRMED" | "CANCELLED" }`)

---

### Screen 22: Date Meetup Proposal Modal
- **Route Path**: `/(app)/modal/event-scheduler`
- **Implementation File**: `mobile/src/app/(app)/modal/event-scheduler.tsx`
- **Access Level**: Authenticated Match Participant
- **Use Case & User Value**:
  Safeguarded date planning. Encourages healthy, intentional, public-space physical meetups (or virtual calls) while alerting counselors for safety oversight.
- **Functional & Safeguarding Requirements**:
  - Form inputs: Title, Date (dynamically defaults to tomorrow's date), Start/End Time, Public Location / Meeting Link, Description.
  - Public Safety Guard: Tooltip reminding candidates to choose public venues (coffee shops, church campus, restaurants) for initial dates.
  - Submitting generates a `CalendarEvent` in `PROPOSED` status, alerts the partner, and notifies the counselor on Web (`Screen 19`).
- **Supporting Backend Endpoints**:
  1. `POST /api/communications/matches/:matchId/events`
     - **Request Body**:
       ```json
       {
         "title": "Coffee Check-in & Faith Discussion",
         "description": "Meeting at Cafe Neo, Victoria Island after Sunday second service.",
         "startTime": "2026-10-04T13:30:00Z",
         "endTime": "2026-10-04T15:00:00Z"
       }
       ```

---

### Screen 23: Dater Profile & Spiritual Credentials
- **Route Path**: `/(app)/(tabs)/profile`
- **Implementation File**: `mobile/src/app/(app)/(tabs)/profile.tsx`
- **Access Level**: Authenticated `User`
- **Use Case & User Value**:
  Personal account settings and dossier management. Candidates monitor their verification badge, home church affiliation, assigned pastoral counselor, and active subscription status.
- **Functional & Safeguarding Requirements**:
  - Displays verified badges: Church Member, Video Verified, Socials Linked.
  - Avatar & Photo Gallery: Gracefully resolves candidate profile picture via `profilePictureUrl || photos[0].photoUrl || photos[0].url`.
  - Assigned Counselor Card: Displays their counselor's name and bio.
  - Action button: "Upgrade to Kingdom Premium" opening Screen 24.
  - Logout and security settings.
- **Supporting Backend Endpoints**:
  1. `GET /api/auth/me`
  2. `GET /api/users/:userId`
  3. `GET /api/subscriptions/status`

---

### Screen 24: Kingdom Premium Subscription Modal (Paystack Checkout)
- **Route Path**: `/(app)/modal/subscription-tier`
- **Implementation File**: `mobile/src/app/(app)/modal/subscription-tier.tsx`
- **Access Level**: Authenticated `User`
- **Use Case & User Value**:
  Monetization and feature upgrade portal. Candidates unlock premium matchmaking features: priority discovery placement, cross-denomination matching, and direct counselor consultation.
- **Functional & Safeguarding Requirements**:
  - Plan comparison matrix: Free Trial vs Standard (₦5,000/mo) vs Kingdom Premium (₦12,000/mo or ₦120,000/yr).
  - Billing interval toggle: Monthly vs Yearly (2 months free discount).
  - Native Paystack payment gateway initialization and callback verification.
- **Supporting Backend Endpoints**:
  1. `GET /api/subscriptions/status`
  2. `POST /api/subscriptions/subscribe`
     - **Request Body**: `{ "interval": "MONTHLY" | "YEARLY" }`
     - **Response Envelope (200 OK)**:
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
  3. `POST /api/subscriptions/cancel`

---

### Screen 25: App Entrypoint & Session Router
- **Route Path**: `/`
- **Implementation File**: `mobile/src/app/index.tsx`
- **Access Level**: Public / Dynamic Guard
- **Use Case & User Value**:
  Instantaneous app launch dispatcher. Inspects the user's stored auth token and `vettingStatus`, seamlessly forwarding them into their exact lifecycle screen without flashing blank states.
- **Supporting Backend Endpoints**:
  1. `GET /api/auth/me`

---

### Screen 26: Public Discovery Explorer
- **Route Path**: `/explore`
- **Implementation File**: `mobile/src/app/explore.tsx`
- **Access Level**: Public / Promotional
- **Use Case & User Value**:
  Pre-registration visual showcase highlighting the high integrity and faith caliber of the Lifeline community to motivate unauthenticated visitors to register.

---

## 6. Cross-Platform Web Admin Integration Summary

| Mobile Screen / Action | Corresponding Web Screen & Actor | Backend Data Contract Shared |
|---|---|---|
| Candidate completes 100% profile & submits for review | **Screen 16: Vetting Queue** (`Counselor`) | `PUT /api/users/:userId` updates `vettingStatus: PENDING_VETTING` $\rightarrow$ appears in counselor queue. |
| Counselor approves candidate on Web | **Screen 12 $\rightarrow$ Screen 16: Discovery Feed** (`User`) | `POST /api/vetting/users/:id/review` sets `VETTED_ACTIVE` $\rightarrow$ unfreezes mobile discovery feed. |
| Counselor rejects candidate with feedback | **Screen 13: Pastoral Adjustment Feedback** (`User`) | `verificationNotes` displayed in mobile banner with resubmission trigger. |
| Counselor hard-blocks fraudulent candidate | **Screen 14: Appeal Workspace** (`User`) $\rightarrow$ **Screen 9/10: Appeals** (`SuperAdmin`)| `POST /api/vetting/appeal` routes mobile petition to SuperAdmin review desk. |
| Couple accepts match and opens monitored chat | **Screen 18/19: Monitored Chats Hub** (`Counselor`) | Initialized `COUNSELOR_GROUP` channel appears in counselor's `/church/chats`. |
| Candidate proposes public coffee date | **Screen 19: Date Safety Alert** (`Counselor`) | `CalendarEvent` in `PROPOSED` status triggers pastoral review in counselor chat view. |
| Courtship ends | **Screen 15: Debrief Lock** (`User`) $\rightarrow$ **Screen 20/21: Exit Debrief** (`Counselor`) | Status `DEBRIEF_REQUIRED` locks mobile app until counselor submits exit interview on Web. |

---

*Document committed to repository as `guides/mobile_screens_and_endpoints.md`.*
