# Mobile App — Requirements & Architecture Document
## React Native (Expo Go) — User-Facing Dating App

**Scope:** This covers the mobile app only — the `USER` role experience. Admin, ChurchAdmin, and Counselor remain web-only (see System Architecture Document, §11). This document assumes the backend described there already exists or is being built in parallel, and defines exactly how the mobile app must be structured to integrate with it.

---

## 1. Objectives

1. Build a production-quality React Native app on Expo Go that implements the full USER-facing flow: lead-capture signup → progressive profile enrichment → vetting gate → discovery → match requests → matching → chat/calendar → subscription.
2. Integrate cleanly with the backend's response envelope (`{ success, message, data, errors }`) and JWT auth.
3. Structure the app so screens, navigation, and data-fetching are decoupled enough that backend contract changes (which will happen) don't require rewrites.

---

## 2. Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Runtime | Expo (managed workflow, Expo Go compatible) | No custom native modules required for MVP scope — see §12 for the one area to watch |
| Language | TypeScript | Type safety against backend contracts |
| Navigation | Expo Router (file-based) | Matches gated/flow-heavy navigation (onboarding → gate → app) naturally via layout guards |
| Styling | **NativeWind** (Tailwind for React Native) | Pure Babel/PostCSS transform, no native code — fully Expo Go-compatible. Matches Tailwind conventions already in use on the admin web app |
| Component primitives | **React Native Reusables** (shadcn/ui pattern for React Native, built on NativeWind) | Accessible, unstyled-but-themeable primitives (Button, Input, Dialog, etc.) you own the code for — avoids hand-building every `components/ui/` primitive from scratch while keeping the same shadcn mental model used elsewhere |
| Server state / data fetching | **TanStack Query (React Query)** | Handles caching, refetching, loading/error states for every backend call — this is the backbone of backend integration, not optional |
| Client/global state | Zustand | Auth/session, current onboarding step, ephemeral UI state |
| Forms | React Hook Form + Zod | Per-step onboarding validation, matches backend field names 1:1 |
| HTTP client | `axios` with a single configured instance | Interceptors for auth header + envelope unwrapping in one place |
| Real-time | `socket.io-client` (assuming backend uses Socket.IO per architecture doc §14) | Chat + live notification delivery |
| Media | `expo-image-picker` (photos), `expo-camera` + `expo-av` (video recording/playback) | Native Expo SDK modules — Expo Go compatible |
| Maps/address | `expo-location` + a Places Autocomplete component hitting the backend's proxy endpoint (do not call Google Maps directly from the client — proxy through backend to protect API key) | |
| Push notifications | `expo-notifications` | **Caveat:** remote push on Android in recent Expo SDKs requires a development build, not plain Expo Go — flagged in §12 |
| Storage | `expo-secure-store` for JWT/refresh token; AsyncStorage for non-sensitive cache | Never store tokens in plain AsyncStorage |
| Env config | `expo-constants` + `.env` via `react-native-dotenv` or EAS environment variables | Per-environment API base URLs |

---

## 3. Project Structure

```
app/                          # Expo Router routes
  (auth)/
    welcome.tsx
    signup.tsx
    login.tsx
    forgot-password.tsx
    reset-password.tsx
    verify-email.tsx
    _layout.tsx                # redirects to (onboarding) or (app) if already authed
  (onboarding)/
    hub.tsx
    basic-info.tsx
    church.tsx
    address.tsx
    phones.tsx
    social-handles.tsx
    income.tsx
    photos.tsx
    intro-video.tsx
    preferences.tsx
    review.tsx
    _layout.tsx                # guards: redirect to (gate) once submitted
  (gate)/
    locked.tsx
    pending-vetting.tsx
    denied.tsx
    hard-blocked.tsx
    appeal.tsx
    _layout.tsx                # guards: redirect to (app) once vetted_active
  (app)/
    (tabs)/
      discover/
        index.tsx
        [userId].tsx
      requests/
        sent.tsx
        received.tsx
      matches/
        index.tsx
        [matchId]/
          chat.tsx
          group-chat.tsx
          calendar.tsx
      profile/
        index.tsx
        edit.tsx
      _layout.tsx               # tab bar
    subscription/
      plans.tsx
      checkout.tsx
      manage.tsx
      billing-history.tsx
    settings/
      notifications.tsx
      privacy-info.tsx
      account.tsx
  _layout.tsx                   # root: auth state check, splash

api/
  client.ts                     # axios instance + interceptors
  envelope.ts                   # ApiResponse<T> type + unwrap helper
  auth.ts
  profile.ts
  vetting.ts
  discovery.ts
  matchRequests.ts
  matches.ts
  chat.ts
  subscriptions.ts

hooks/                          # React Query hooks, one file per resource
  useAuth.ts
  useProfile.ts
  useVettingStatus.ts
  useDiscoveryFeed.ts
  useMatchRequests.ts
  useMatches.ts
  useChat.ts
  useSubscription.ts

store/
  authStore.ts                  # Zustand: token, current account, role guard
  onboardingStore.ts             # Zustand: in-progress step data before each PUT commits

components/
  ui/                           # Button, Input, Card, Badge, ProgressBar, Modal, SlotCounter
  onboarding/                   # OnboardingStepShell, ProgressHeader
  discovery/                    # ProfileCard, FilterSheet
  chat/                         # MessageBubble, ChatInput, CalendarEventCard

types/
  api.ts                        # mirrors backend Prisma enums/models exactly
```

---

## 4. Navigation & Routing Guards

The app has **four gated zones**, matching the backend's `ProfileStatus` state machine (§6 of the architecture doc). Navigation must enforce these server-side states client-side too — a user should never be able to navigate around a gate by pressing back or deep-linking.

| Zone | Layout Guard Condition | Redirect Target |
|---|---|---|
| `(auth)` | `!isAuthenticated` | — |
| `(onboarding)` | `isAuthenticated && !profile.isProfileComplete` | `(gate)` once submitted, `(auth)` if token invalid |
| `(gate)` | `isAuthenticated && profile.isProfileComplete && profile.status !== 'vetted_active'` | Route to the sub-screen matching `profile.status` exactly (`pending_vetting`/`denied`/`hard_blocked`) |
| `(app)` | `isAuthenticated && profile.status === 'vetted_active'` | `(gate)` if status regresses (e.g., after a match ends and reset is pending, per §8) |

**Implementation note:** fetch `/profile/me` (or `/auth/me` + `/profile/me`) once at root layout mount via React Query, and re-derive the gate on every focus of the root layout — not just at login — because status can change server-side while the app is backgrounded (a counselor could verify them while they're not using the app).

---

## 5. API Integration Layer

### 5.1 Response Envelope Handling

Every backend response is `{ success, message, data, errors }`. Centralize unwrapping so screens never touch the envelope directly:

```typescript
// api/envelope.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: Record<string, string> | { code: string } | null;
}

export class ApiError extends Error {
  constructor(message: string, public errors?: any) {
    super(message);
  }
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(response.message, response.errors);
  }
  return response.data as T;
}
```

### 5.2 Axios Client with Auth Interceptor

```typescript
// api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // token invalid/expired — clear session, route handled by authStore subscriber
      await SecureStore.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  }
);
```

### 5.3 React Query as the Integration Backbone

Every backend call is a `useQuery`/`useMutation` hook, never a bare `fetch` inside a component. This is the single most important architectural decision for "integrating successfully" — it standardizes loading/error/retry/cache behavior across ~40 screens instead of reinventing it per screen.

```typescript
// hooks/useProfile.ts
export function useProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => unwrap(await apiClient.get('/profile/me').then(r => r.data)),
  });
}

export function useUpdateChurchStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { churchId: string; branchName?: string }) =>
      unwrap(apiClient.put('/profile/church', body).then(r => r.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', 'me'] }),
  });
}
```

Every mutation that changes gate-relevant state (`profile.status`, `isProfileComplete`) must invalidate the `['profile', 'me']` query so the navigation guard in §4 reacts immediately.

---

## 6. Authentication & Session Management

| Concern | Implementation |
|---|---|
| Token storage | `expo-secure-store`, never plain AsyncStorage |
| Session bootstrap | On app launch, read token from SecureStore → if present, call `/auth/me` → populate `authStore` → route per §4; if absent or 401, route to `(auth)` |
| Social auth | Use `expo-auth-session` for the OAuth flow, exchange the resulting provider token via `POST /auth/social` — backend issues the platform JWT, not the provider token, for all subsequent calls |
| Logout | Clear SecureStore token, clear React Query cache entirely (`queryClient.clear()`), reset Zustand store |
| Token refresh | If the backend issues refresh tokens (confirm with backend team — not yet specified in the architecture doc), implement silent refresh in the axios response interceptor; if not, a long-lived single JWT with re-login on expiry is acceptable for MVP |

**Flag for backend team:** the architecture doc's auth section doesn't currently specify a refresh-token endpoint. Confirm before mobile build whether JWT expiry triggers forced re-login or silent refresh — this changes the interceptor design in §5.2.

---

## 7. Screen-to-Endpoint Mapping

This is the core integration contract. Every screen below must call exactly these endpoints — no screen should call an endpoint not listed in the System Architecture Document §12.

### Auth
| Screen | Endpoint(s) |
|---|---|
| Social Auth Signup | `POST /auth/social` |
| Minimal Signup | `POST /auth/signup` |
| Login | `POST /auth/login` |
| Forgot Password | `POST /auth/forgot-password` |
| Reset Password | `POST /auth/reset-password` |
| Email Verification Prompt | `POST /auth/request-verification`, `GET /auth/verify-email/:token` (deep link) |

### Onboarding
| Screen | Endpoint(s) |
|---|---|
| Onboarding Hub | `GET /profile/me` (drives progress %, resume point) |
| Basic Info | `PUT /profile/basic-info` |
| Church Selection (ParentBranch) | `GET /churches/parent-orgs`, `PUT /profile/church` |
| Church Selection (Independent) | `GET /churches/search?q=`, `PUT /profile/church` |
| Address + Map | `PUT /profile/address` (lat/lng from device geocode or backend Places proxy) |
| Phone Numbers | `PUT /profile/phones` |
| Social Handles | `PUT /profile/social-handles` (client validates 2-of-3 before submit; backend re-validates) |
| Income Range | `PUT /profile/income` |
| Photo Upload | `POST /profile/photos` (multipart, 3x) |
| Intro Video | `POST /profile/intro-video` (multipart) |
| Match Preferences | `PUT /profile/match-preferences` |
| Review & Submit | `POST /profile/submit` |

### Gate Screens
| Screen | Endpoint(s) |
|---|---|
| Locked / Pending / Denied / Hard-Blocked | `GET /profile/me` (status drives which is shown — one hook, four possible renders) |
| Appeal Submission | `POST /appeals` |
| Appeal Status | `GET /appeals` (filtered client-side to own appeal, or a dedicated `GET /appeals/me` if backend adds one — flag as a gap, see §13) |

### Discovery & Requests
| Screen | Endpoint(s) |
|---|---|
| Discovery Feed | `GET /discovery/feed` |
| Profile Detail | `GET /discovery/:userId` |
| Send Request | `POST /match-requests` |
| Sent Requests | `GET /match-requests/sent` |
| Received Requests | `GET /match-requests/received` |
| Accept/Reject | `POST /match-requests/:id/accept`, `POST /match-requests/:id/reject` |

### Match & Communication
| Screen | Endpoint(s) |
|---|---|
| Match Celebration | Triggered by accept-mutation success payload, no separate fetch |
| Private/Group Chat | `GET /chats/:matchId`, `GET /chats/channel/:channelId/messages`, `POST /chats/channel/:channelId/messages` + WebSocket subscription for live messages |
| Propose/Confirm Meeting | `POST /chats/channel/:channelId/events`, `POST /events/:id/confirm`, `POST /events/:id/cancel` |
| Mark Match Ended | `POST /matches/:id/end` |
| Status Reset Request | `POST /matches/:id/reset-request` |

### Subscription
| Screen | Endpoint(s) |
|---|---|
| Plans | `GET /subscriptions/plans` |
| Checkout | `POST /subscriptions/checkout` |
| Manage | `GET /subscriptions/me`, `POST /subscriptions/cancel` |
| Billing History | `GET /subscriptions/billing-history` |

---

## 8. Real-Time Communication

- Establish one Socket.IO connection at app root (only inside `(app)` zone — no reason to connect during onboarding/gate).
- Auth the socket connection with the same JWT (`socket.io-client` `auth` option), backend validates on connect.
- Subscribe to per-user notification channel (server-side room keyed by `accountId`) for all §9-matrix events (`match_formed`, `request_received`, etc.) — these should invalidate the relevant React Query cache keys on receipt (e.g., a `match_formed` event invalidates `['matches']` and `['matchRequests', 'sent']`).
- Subscribe to chat channel rooms only while that specific chat screen is mounted; unsubscribe on unmount to avoid leaking listeners.

---

## 9. Media Handling Details

| Requirement | Implementation |
|---|---|
| Exactly 3 photos | `expo-image-picker`, client enforces count before enabling "Continue"; backend also validates on `/profile/submit` — never trust client validation alone |
| Intro video < 1 min | `expo-camera` recording with a hard 60s timer that auto-stops recording; show remaining time in UI |
| Upload | Both endpoints are `multipart/form-data` — use `FormData` with the file `uri`, `type`, `name` from the Expo asset object |
| Upload progress | Use axios `onUploadProgress` to show a progress bar, especially for video (larger payload) |
| Compression | Compress video before upload (`expo-video-thumbnails` for preview + a compression step if file size is large) to avoid slow uploads on typical Nigerian mobile data speeds — this matters for real-world usability, not just nicety |

---

## 10. Error, Loading & Empty States — Required on Every Data Screen

Non-negotiable per-screen states (React Query gives you the first three for free if you check `isLoading`/`isError`/`data`):

1. **Loading** — skeleton or spinner, never a blank screen
2. **Error** — human-readable message from `ApiError.message` (which is the backend's `message` field — do not show raw error objects), with a retry action
3. **Empty** — e.g., "No matches yet", "No requests received" — distinct from error
4. **Success/populated** — the normal case

Special case: **slot-limit and blind-rejection UX** (§13 of architecture doc) — the "Send Request" button must reflect `slotsRemaining` from the last known state, and disable with a clear message at 0, not just fail silently on submit.

---

## 11. Environment Configuration

```
EXPO_PUBLIC_API_URL=https://api-staging.yourapp.com
EXPO_PUBLIC_SOCKET_URL=https://api-staging.yourapp.com
```

- Use `EXPO_PUBLIC_*` prefix (Expo's built-in env var exposure mechanism) rather than a custom babel plugin, to keep this Expo Go-compatible without extra config.
- Maintain at least `development`, `staging`, `production` variable sets; switch via EAS build profiles when you eventually move past Expo Go for release builds.

---

## 12. Expo Go Constraints — Read Before Building

**What Expo Go is:** a generic, pre-built sandbox app Expo ships, containing a fixed set of native modules bundled in ahead of time. **What a Dev Client is:** your own custom build of that same shell app (via EAS Build) containing exactly the native modules/config your project needs — installed on-device like a normal app, developed against with the same `npx expo start` workflow. Moving from Expo Go to a Dev Client later is a **tooling change, not an architecture change** — no code restructuring or ejecting to bare workflow required, since this whole document stays in Expo's managed workflow throughout.

**Current scope (confirmed):** verification is human counselor review of the recorded intro video (§9) — no automated on-device liveness detection. This means the *entire* MVP scope in this document is Expo Go-compatible with no exceptions.

**One thing to plan for, not block on:** remote push notifications on Android require a Dev Client, not plain Expo Go, in recent Expo SDKs. This only matters when push notification work actually begins (§15, step 8) — everything up to and including chat, matches, and subscriptions can be built and tested entirely on Expo Go. When push work starts, the migration is: `npx expo install expo-dev-client` → `eas build --profile development --platform android` (and/or `ios`) → install that build on test devices instead of Expo Go. Budget for developer account setup (Apple/Google) at that point if not already done — that's the actual lead time, not the technical migration itself.

**If on-device liveness is added later:** that would require a native SDK and would be the one case genuinely requiring a Dev Client earlier than push notifications. Flag this explicitly to backend/product before it's scoped in, so mobile can plan the Dev Client transition ahead of that work rather than discovering it mid-sprint.

---

## 13. Gaps to Resolve With Backend Before/During Build

- No `GET /appeals/me` (user-scoped) endpoint currently listed — only `GET /appeals` (SuperAdmin queue). Mobile needs a way to check own appeal status.
- No refresh-token endpoint specified — confirm token expiry/refresh strategy (§6).
- No explicit endpoint for "which chat channel type am I looking at" beyond `GET /chats/:matchId` returning both IDs — confirm the shape returns enough to distinguish private vs. group chat participant lists client-side (needed to render "Counselor" badges in group chat correctly).
- Confirm whether `/discovery/feed` paginates via cursor or offset — affects the React Query `useInfiniteQuery` implementation.

---

## 14. Non-Functional Requirements

| Concern | Requirement |
|---|---|
| Performance | Discovery feed and chat message lists must use `FlashList` (Shopify) rather than `FlatList` for large-list performance |
| Accessibility | All interactive elements have accessible labels; forms show inline validation errors, not just toast/alert |
| Localization | Not required for MVP but avoid hardcoding user-facing strings inline — centralize in a strings file for future i18n |
| Crash reporting | Sentry (Expo-compatible SDK) from day one, not added later |
| Analytics | Basic funnel tracking (signup → each onboarding step → submit → vetted) is high-value for this specific product given the "Lead Recovery" strategy in the source PRD — instrument early |

---

## 15. Build Sequencing (Mobile-Specific)

1. Project scaffold + navigation shell (all route groups, empty screens, guards wired to mock auth state) — validate structure before any real API calls
2. API client + envelope handling + React Query setup, wired to a running backend (staging), starting with Auth
3. Onboarding flow end-to-end against real endpoints
4. Gate screens + vetting status polling/realtime
5. Discovery + match requests
6. Matches + chat (REST first, then layer in Socket.IO)
7. Subscription/payment
8. Push notifications (requires dev client per §12)
9. Polish: error states, empty states, loading skeletons, analytics instrumentation