# Mobile Implementation — Review & Triage Prompt

**This is a two-agent process:** one agent (auditor) produces the triage report; a **different** agent (fixer) applies the fixes. This is intentional — it gives you an independent second opinion instead of one model rationalizing its own audit while fixing it. Use **Part 1** with whichever model audits, and **Part 2** with whichever model fixes.

**Run this after the backend triage/fix pass is complete and committed.** The backend may have changed exact endpoint paths, response shapes, or enum casing during its own fix phase — this audit must check against the **current, real backend**, not assume the mobile architecture doc's original assumptions still hold.

---

## PART 1 — Audit (Auditor Agent)

You have full access to this repository, including the mobile app and the (now-updated) backend. Your task is to audit the current mobile implementation against `/guides/mobile_architecture.md` and produce a written triage report. **Do not make any code changes in this part** — your only output is the report.

### Process

1. **Read `/guides/mobile_architecture.md`** in full.
2. **Cross-reference against the real, current backend code** (routes, controllers, Prisma schema) for anything the mobile app calls — backend code is ground truth, and it may have changed since the mobile doc was written.
3. **Audit systematically**, section by section (checklist below).
4. **Produce the triage report** (format below). For every row, cite the specific file/line supporting the finding — the fixer agent will re-verify against this.
5. Do not fix anything. Stop after the report.

### Audit Checklist

**Tech stack correctness (not just "is it present" — is it used correctly and consistently):**
- NativeWind used for all styling — flag any screen falling back to ad-hoc `StyleSheet` objects or inline styles that bypass the shared theme
- React Native Reusables components used for shared primitives (Button, Input, Dialog, Card, etc.) — flag any screen that hand-rolled a one-off version of something that should be a shared component
- **TanStack Query used for all server state** — flag any screen using raw `fetch`/`axios` + `useEffect`/`useState` instead of a query/mutation hook
- Zustand used only for genuinely global/client state (auth/session, onboarding-in-progress data) — flag any server data incorrectly duplicated into Zustand instead of the query cache
- React Hook Form + Zod present on every form screen, with validation schemas matching the backend's actual field requirements (not looser or stricter)
- Single configured axios instance with the auth interceptor and envelope-unwrapping in one place — flag any screen making a raw axios call outside this instance
- `expo-secure-store` used for tokens — flag any use of plain AsyncStorage for auth data
- Media libraries (`expo-image-picker`, `expo-camera`, `expo-av`) used as specified, not a different/ad-hoc library that crept in

**Design & theme conformance (new emphasis — check this thoroughly, it wasn't verified in the original build pass):**
- A NativeWind theme config (`tailwind.config.js` or equivalent) exists and reflects a deliberate palette/typography/spacing scale — not just default Tailwind values left untouched
- That theme is actually consistent with the visual language the build agent was supposed to derive from the web app design reference (colors, typography scale, spacing rhythm, button/card style) — spot-check a sample of screens against the reference
- Components are themed centrally, not overridden per-screen with one-off colors/spacing that drift from the shared theme
- Visual consistency across screens — no screen that looks like it belongs to a different app (inconsistent spacing, button styles, type scale)
- If dark mode or any theming variant was in scope, confirm it's applied consistently, not implemented on some screens and forgotten on others

**Navigation & state machine:**
- The four gated zones (auth / onboarding / gate / app) are enforced correctly against the backend's **actual current** `ProfileStatus` values and field names (re-verify these haven't shifted since the backend fix pass)
- Gate status is re-derived on every focus of the root layout, not just at login
- No way to navigate around a gate via back-button or deep link

**API integration:**
- Response envelope unwrapped centrally, not handled ad hoc per screen
- Every screen calls the endpoint(s) the doc specifies, and those endpoints actually exist in the current backend with matching request/response shapes
- 401 handling clears session correctly

**Real-time:**
- Socket connection scoped to the authenticated `(app)` zone only, authenticated with the JWT
- Subscriptions cleaned up on unmount
- Relevant query caches invalidated on incoming events (match_formed, request_received, etc.)

**Media handling:**
- Exactly-3-photos enforced client-side before allowing continue
- Video capped at 60s with a visible timer that auto-stops recording
- Multipart upload implemented correctly with upload progress shown

**States & UX correctness:**
- Every data-driven screen has distinct loading / error / empty / populated states
- Slot-limit UI reflects remaining slots and disables at 0
- Rejected requests never surface recipient identity to the requester (blind rejection preserved end-to-end, not just on the backend)

**Environment & platform:**
- `EXPO_PUBLIC_*` variables used correctly, no hardcoded API URLs anywhere
- Nothing implemented so far actually requires a dev client (confirm Expo Go compatibility still holds)

### Triage Report Format

| Area | Doc/Reference Says | Found in Code | Status | Severity | Reference |
|---|---|---|---|---|---|
| e.g. Theme config | Should reflect web app palette | Default Tailwind colors, unmodified | Deviation | Moderate | `tailwind.config.js` |
| e.g. Discovery feed data | TanStack Query | `useEffect` + raw fetch | Deviation | Critical | `app/(app)/(tabs)/discover/index.tsx:L12` |
| e.g. Gate zone re-check | On every focus | Only checked at login | Deviation | Critical | `app/(gate)/_layout.tsx:L8` |

**Status values:** `Conforms` / `Deviation` / `Missing` / `Needs Product Decision`.
**Severity values:** `Critical` (breaks a core flow, violates the state machine, or wrong integration pattern), `Moderate` (functional or design gap, e.g. inconsistent theming, missing empty state), `Minor` (style/naming inconsistency, no functional impact).

**Auditor's final output is the report only** — hand this to the fixer agent along with `/guides/mobile_architecture.md` and the design reference (live URL/screenshots).

---

## PART 2 — Fix (Fixer Agent)

You've been handed a triage report (Part 1's output). **Treat it as claims to verify, not ground truth.**

### Phase A — Independent Re-Verification

For **every row**:
1. Open the cited file/reference and confirm the "Found in Code" description is accurate right now.
2. Re-check the relevant part of `/guides/mobile_architecture.md` (and the design reference, for theme-related rows) yourself.
3. Mark each row **Confirmed** or **Disputed**, with reasoning.

Produce the verification log before touching any code.

### Phase B — Apply Fixes

For every **Confirmed** row, fix it — including architectural items (navigation guard logic, integration pattern violations like raw fetch instead of React Query) and design/theme items (centralize the theme, fix drifted styling), not just naming issues.

**Two exceptions — stop and ask instead of fixing silently:**
- **Undefined business or design rules:** if a fix requires inventing behavior or a visual decision (e.g., a specific color/spacing value) not specified anywhere in the architecture doc, the design reference, or prior decisions, pause and ask.
- **Breaking changes to an already-working flow:** if fixing something (e.g., swapping a data-fetching pattern) risks breaking a screen that currently works end-to-end against the backend, describe the change and its risk before applying it, rather than assuming it's safe.

### Final Deliverables

1. The verification log (Phase A) — confirmed vs. disputed findings, with reasoning
2. File-by-file changelog of fixes applied, separated into: functional/integration fixes, and design/theme fixes
3. A short list of anything left under `Needs Product Decision`, with the specific question that needs answering