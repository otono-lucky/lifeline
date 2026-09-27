# Mobile App — Requirements & Architecture Document
## React Native (Expo) — User-Facing Dating App

**Scope:** This document specifies the mobile client architecture — exclusively dedicated to the **`USER`** role experience (regular daters). Administrative governance, church management, and spiritual counseling operations (`SuperAdmin`, `ChurchAdmin`, and `Counselor`) remain web-only (see System Architecture Document, §11, and `frontend_screens_and_endpoints.md`). This document is fully synchronized with the live `mobile/` codebase, Express backend routes, and Prisma schema.

---

## 1. Objectives

1. Deliver a production-grade React Native app on Expo that implements the complete dater lifecycle: lead-capture signup → progressive profile enrichment (100% completion) → pastoral vetting gate → geo-weighted discovery → 3-slot match requests → first-come acceptance → in-app couple & monitored chat / calendar → subscription management.
2. Integrate seamlessly with the backend's standardized JSON envelope (`{ success, message, data, pagination, errors }`), JWT authentication, and the 4-tier RBAC system.
3. Enforce client-side navigation guards strictly aligned with the backend's `UserVettingStatus` state machine (`DRAFT`, `PENDING_VETTING`, `VETTED_ACTIVE`, `REJECTED`, `HARD_BLOCKED`, `DEBRIEF_REQUIRED`).

---

## 2. Tech Stack

| Concern | Choice | Implementation Details |
|---|---|---|
| **Runtime & Framework** | React Native 0.86, Expo ~57 (Managed Workflow) | Expo Go compatible for development; production deployable via EAS Build. |
| **Language** | TypeScript 6.0 | Strict type safety against backend Prisma models, enums, and API responses. |
| **Navigation & Routing** | **Expo Router** (~57.0) | File-based routing with layout guards dividing the app into `(auth)`, `(onboarding)`, `(vetting)`, and `(app)`. |
| **Styling** | **NativeWind v4** (Tailwind CSS for React Native) | Zero-runtime CSS-in-JS transform; identical Tailwind design language across web and mobile. |
| **Server State & Caching** | **TanStack Query v5** (`@tanstack/react-query`) | Handles queries, optimistic updates, cache invalidation, and polling (e.g. 3s message polling). |
| **Client / Session State** | **Zustand v5** | Global session, auth tokens, cached user profile, and vetting status via `authStore.ts`. |
| **Form Handling** | **React Hook Form v7** + **Zod** | Form controllers, schema validation, and field-level error messages matching backend schemas 1:1. |
| **HTTP Client** | **Axios** with centralized `apiClient.ts` | Request interceptor for Bearer token injection; response interceptor for 401 token eviction. |
| **Media Capture & Upload** | `expo-image-picker`, `expo-camera` | 3 modest verification photos (order 1–3) and <60s video intro uploaded via multi-part form data to Cloudinary. |
| **Secure Storage** | `expo-secure-store` | Hardware-backed encrypted keychain storage for auth tokens (`authToken`). |
| **Location & Places** | `expo-location` + Google Places API | Geolocation capture for Haversine proximity calculations; exact street address confidentially firewalled. |
| **Icons & Primitives** | `lucide-react-native` + Custom UI Library | Consistent component library in `components/ui/` (Button, Input, Card, Badge, SlotCounter, Avatar). |

---

## 3. Project Structure

The mobile codebase lives in `mobile/src/` with a modular Expo Router hierarchy:

```
mobile/src/
├── app/                              # Expo Router Routes & Layouts
│   ├── _layout.tsx                   # Root Provider Shell (QueryClient, AuthProvider, Slot)
│   ├── index.tsx                     # Master Session Dispatcher & Lifecycle Router
│   ├── explore.tsx                   # Public Promotional Discovery Showcase
│   │
│   ├── (auth)/                       # Unauthenticated Gateway
│   │   ├── _layout.tsx               # Auth Stack Layout
│   │   ├── lead-register.tsx         # Step-1 Low-Friction Lead Registration
│   │   ├── login.tsx                 # Credentials & OAuth Login
│   │   ├── verify-email.tsx          # Email OTP / Token Verification
│   │   └── forgot-password.tsx       # Password Recovery Request
│   │
│   ├── (onboarding)/                 # 100% Profile Completion Gate
│   │   ├── _layout.tsx               # Sequential Stepper Layout
│   │   ├── location-profile.tsx      # Origin & Residential Coordinates (Google Places)
│   │   ├── church-selection.tsx      # Church & Branch Selection (Parent-Branch vs Parish)
│   │   ├── career-financial.tsx      # Occupation, Education & Confidential Salary Bracket
│   │   ├── preferences.tsx           # Courtship Boundaries & Christian Lifestyle Interests
│   │   ├── social-identity.tsx       # 2-of-3 Verified Social Links (LinkedIn, IG, FB)
│   │   ├── media-upload.tsx          # Exactly 3 Photos (Order 1-3) & <60s Video Intro
│   │   └── completion-review.tsx     # 10-Point Checklist Audit & Pastoral Submission
│   │
│   ├── (vetting)/                    # Pastoral Review & Safeguarding Holding States
│   │   ├── _layout.tsx               # Vetting Screen Stack
│   │   ├── pending.tsx               # "Under Pastoral Review" Holding Screen
│   │   ├── rejected.tsx              # "Adjustments Requested" Pastoral Feedback Workspace
│   │   ├── blocked.tsx               # "Account Restricted" & Formal SuperAdmin Appeal Desk
│   │   └── debrief.tsx               # "Courtship Concluded" Exit Debrief Hold
│   │
│   └── (app)/                        # Authenticated Vetted Application
│       ├── _layout.tsx               # App Root & Modal Presentation Shell
│       ├── (tabs)/                   # Bottom Tab Navigator
│       │   ├── _layout.tsx           # Tab Bar Configuration & Icon Badges
│       │   ├── discovery.tsx         # Geolocation-Weighted Candidate Discovery Feed
│       │   ├── requests.tsx          # 3-Slot Match Request Management (Sent & Received)
│       │   ├── messages.tsx          # Conversation Channels Inbox (Private & Monitored)
│       │   ├── calendar.tsx          # Dynamic Date Scheduler & Meetup Itineraries
│       │   └── profile.tsx           # Member Profile, Verified Badges & Settings
│       │
│       ├── candidate/[userId].tsx    # Full Candidate Profile & Video Streaming Dossier
│       ├── chat/[conversationId].tsx # Interactive Chat (Private Couple & 3-Way Monitored)
│       └── modal/
│           ├── event-scheduler.tsx   # Public Venue Date Proposal Modal
│           └── subscription-tier.tsx # Kingdom Premium Paystack Checkout Modal
│
├── components/                       # Reusable Presentation Components
│   ├── layout/                       # ScreenWrapper, AuthLayout
│   └── ui/                           # Avatar, Badge, Button, Card, Input, ProgressBar, SlotCounter
│
├── context/                          # Context Adapters (AuthContext.tsx)
├── hooks/                            # Custom React Query & Profile Hooks (useUserProfile.ts)
├── services/                         # REST API Client & Service Abstractions
│   ├── apiClient.ts                  # Axios Instance, Interceptors & Environment Fallbacks
│   ├── authService.ts                # Auth & Token Operations
│   ├── userService.ts                # Profile, Photos, Socials & Public Churches
│   ├── discoveryService.ts           # Discovery Feed & Candidate Dossiers
│   ├── requestService.ts             # 3-Slot Requests, First-Come Accept, Blind Decline
│   ├── communicationService.ts       # Conversations, Real-time Messages & Calendar Events
│   ├── vettingService.ts             # Candidate Appeals Submission
│   ├── subscriptionService.ts        # Paystack Subscriptions & Status
│   ├── locationService.ts           # Geolocation & Reverse Geocoding
│   └── storage.ts                    # Expo SecureStore Token Persistence
│
├── store/                            # Global State Management (authStore.ts)
└── types/                            # Shared TypeScript Definitions (index.ts)
```

---

## 4. Navigation & Routing Guards

The root dispatcher [`mobile/src/app/index.tsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/mobile/src/app/index.tsx) acts as the single source of truth for navigation state, continuously evaluating the user's authentication and `UserVettingStatus`:

| Zone | Guard Condition | Target Route | Description |
|---|---|---|---|
| **Unauthenticated** | `!isAuthenticated` | `/(auth)/lead-register` | Directs unauthenticated visitors to lead acquisition or login. |
| **Incomplete Profile** | `isAuthenticated && !isProfileComplete` | `/(onboarding)/[missing-step]` | Evaluates profile completion (0–100%) and forwards the user to their first unfulfilled step. |
| **Pending Review** | `vettingStatus === "PENDING_VETTING"` | `/(vetting)/pending` | Holding state while assigned parish counselors evaluate the submission. |
| **Adjustment Required** | `vettingStatus === "REJECTED"` | `/(vetting)/rejected` | Shows counselor feedback notes; allows candidate to edit and resubmit. |
| **Hard Blocked** | `vettingStatus === "HARD_BLOCKED"` | `/(vetting)/blocked` | Disqualification state; provides formal appeal form to SuperAdmin. |
| **Debrief Hold** | `vettingStatus === "DEBRIEF_REQUIRED"` | `/(vetting)/debrief` | Relationship concluded hold; unfreezes discovery once counselor completes exit interview. |
| **Active Discovery** | `vettingStatus === "VETTED_ACTIVE"` | `/(app)/(tabs)/discovery` | Unlocks full discovery feed, 3-slot requests, messaging, and calendar. |

---

## 5. API Integration Layer

### 5.1 Response Envelope Handling
The backend returns a standardized JSON envelope. The mobile services unwrap this envelope, returning typed data directly to React Query hooks:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  errors?: Array<{ field?: string; message: string }>;
}
```

### 5.2 Axios Client & Secure Token Injection
In [`mobile/src/services/apiClient.ts`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/mobile/src/services/apiClient.ts):
- Requests automatically retrieve the JWT from `expo-secure-store` and inject `Authorization: Bearer <token>`.
- Responses intercept `401 Unauthorized` status codes, automatically evicting invalid tokens from `SecureStore` to trigger re-authentication.
- Preserves the original `error.response` so components and queries can inspect specific backend validation error codes.

### 5.3 React Query State Synchronization
All screens utilize TanStack Query (`useQuery`, `useMutation`). Key mutations trigger targeted query cache invalidations:
- Accepting a request invalidates `["sentRequests"]` and `["receivedRequests"]`.
- Updating onboarding steps invalidates `["userProfile"]` and updates `authStore`.
- Messages query polls every 3 seconds (`refetchInterval: 3000`) for real-time chat responsiveness.

---

## 6. Authentication & Session Management

| Concern | Implementation Protocol |
|---|---|
| **Token Storage** | Hardware-backed `expo-secure-store` via `storage.getToken()` / `storage.setToken()`. |
| **Session Bootstrap** | On launch, `authStore.initialize()` reads token $\rightarrow$ calls `GET /api/auth/me` $\rightarrow$ derives `isProfileComplete` and `vettingStatus`. |
| **Role Verification** | Verifies `user.role === "User"`. Web admin roles (`SuperAdmin`, `ChurchAdmin`, `Counselor`) are prompted to access the web portal. |
| **Logout Protocol** | Evicts `authToken` from `SecureStore`, clears React Query cache, and resets `authStore` to initial states. |

---

## 7. Screen-to-Endpoint Integration Contract

Every screen in the mobile app communicates strictly with the backend endpoints specified below:

### Auth Group (`(auth)`)
| Screen | Implementation File | Backend Endpoint(s) |
|---|---|---|
| **Lead Registration** | `lead-register.tsx` | `POST /api/auth/lead-register`<br>`POST /api/auth/social-login` |
| **Credentials Login** | `login.tsx` | `POST /api/auth/login` |
| **Verify Email** | `verify-email.tsx` | `GET /api/auth/verify-email/:token`<br>`POST /api/auth/request-verification` |
| **Forgot Password** | `forgot-password.tsx` | `POST /api/auth/forgot-password` |

### Progressive Onboarding (`(onboarding)`)
| Screen | Implementation File | Backend Endpoint(s) |
|---|---|---|
| **Location & Address** | `location-profile.tsx` | `PUT /api/users/:userId` |
| **Church Selection** | `church-selection.tsx` | `GET /api/churches/public`<br>`PUT /api/users/:userId` |
| **Career & Finance** | `career-financial.tsx` | `PUT /api/users/:userId` (`salaryRange`) |
| **Match Preferences** | `preferences.tsx` | `PUT /api/users/:userId` (`matchPreference`, `interests`) |
| **Social Identity** | `social-identity.tsx` | `GET /api/users/:userId/socials`<br>`POST /api/users/:userId/socials`<br>`DELETE /api/users/:userId/socials/:id` |
| **Media Upload** | `media-upload.tsx` | `POST /api/users/:userId/photos` (order 1–3)<br>`PUT /api/users/:userId` (`videoIntroUrl`) |
| **Completion Review** | `completion-review.tsx` | `GET /api/users/:userId`<br>`PUT /api/users/:userId` (`vettingStatus: PENDING_VETTING`) |

### Pastoral Vetting Gates (`(vetting)`)
| Screen | Implementation File | Backend Endpoint(s) |
|---|---|---|
| **Pending Review** | `pending.tsx` | `GET /api/auth/me` |
| **Adjustment Feedback** | `rejected.tsx` | `GET /api/users/:userId`<br>`PUT /api/users/:userId` (`vettingStatus: PENDING_VETTING`) |
| **Restricted / Appeal** | `blocked.tsx` | `POST /api/vetting/appeal` |
| **Debrief Hold** | `debrief.tsx` | `GET /api/auth/me` |

### Main Application Tabs & Core Features (`(app)`)
| Screen | Implementation File | Backend Endpoint(s) |
|---|---|---|
| **Discovery Feed** | `(tabs)/discovery.tsx` | `GET /api/discovery/feed`<br>`GET /api/requests/sent` |
| **Candidate Dossier** | `candidate/[userId].tsx` | `GET /api/users/:userId`<br>`POST /api/requests/send` |
| **Requests Hub (3-Slot)**| `(tabs)/requests.tsx` | `GET /api/requests/sent`<br>`GET /api/requests/received`<br>`POST /api/requests/:id/accept`<br>`POST /api/requests/:id/decline`<br>`POST /api/requests/:id/cancel` |
| **Messages Inbox** | `(tabs)/messages.tsx` | `GET /api/communications/conversations` |
| **Interactive Chat** | `chat/[conversationId].tsx`| `GET /api/communications/conversations/:id/messages`<br>`POST /api/communications/conversations/:id/messages` |
| **Date Calendar** | `(tabs)/calendar.tsx` | `GET /api/communications/matches/:matchId/events`<br>`PATCH /api/communications/events/:id/respond` |
| **Date Proposal Modal** | `modal/event-scheduler.tsx`| `POST /api/communications/matches/:matchId/events` |
| **Profile & Settings** | `(tabs)/profile.tsx` | `GET /api/auth/me`<br>`GET /api/users/:userId`<br>`GET /api/subscriptions/status` |
| **Paystack Upgrade** | `modal/subscription-tier.tsx`| `GET /api/subscriptions/status`<br>`POST /api/subscriptions/subscribe`<br>`POST /api/subscriptions/cancel` |

---

## 8. Resolution of Architecture Decisions

1. **Denomination-Neutral Pastoral Leadership**:
   The mobile app references pastoral counselors descriptively without rigid denominational roles. Church selection accommodates both hierarchical parent networks (`PARENT_BRANCH` with branch name input) and independent congregations (`INDIVIDUAL_PARISH`).
2. **Administrative Privacy Firewall**:
   Candidate financial tiers (`salaryRange`), exact street addresses, and private match boundaries are firewalled from parish general views. Mobile daters are explicitly informed of this protection during onboarding.
3. **Appeals Routing**:
   Disqualified candidates submit appeals via `POST /api/vetting/appeal`, which routes directly into SuperAdmin's adjudication workspace on Web (`Screen 9/10`).
4. **Dynamic Calendar Proposal**:
   The date scheduler dynamically computes tomorrow's date (`YYYY-MM-DD`), preventing accidental scheduling in the past while maintaining public venue safety guidelines.
5. **Robust Photo URL Resolution**:
   Candidate cards and profile galleries resolve both database schema conventions (`url` and `photoUrl`), ensuring dependable media rendering across all screens.

---

*Document committed to repository as `guides/mobile_architecture.md`.*