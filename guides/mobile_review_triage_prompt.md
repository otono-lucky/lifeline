# Mobile Implementation — Review & Triage Prompt

You have full access to this repository, including the mobile app codebase and the backend. Your task is to audit the current mobile implementation against `/guides/mobile_architecture.md`, produce a written triage report, then **fix everything you find** — including architecture-level conflicts, not just implementation details. Unlike the original build instructions, you have full authority here to correct deviations directly rather than flag them back to me.

## Process (in order)

1. **Read** `/guides/mobile_architecture.md` in full.
2. **Cross-reference against the real backend code** (routes, controllers, Prisma schema) for anything the mobile app calls — backend code is ground truth for exact endpoint paths, request/response shapes, and enum values, even where the architecture doc's assumptions might be stale.
3. **Audit systematically**, section by section (checklist below), comparing what the doc specifies against what's actually implemented.
4. **Produce a written triage report first**, before making any changes (format below).
5. **Then fix everything** flagged as a deviation or gap — including architectural items (e.g., missing navigation guard logic, wrong state machine handling, incorrect role assumptions) — not just cosmetic/naming issues.
6. **One exception to full autonomy:** if fixing something would require inventing a business rule that isn't specified anywhere in the architecture doc, the System Architecture Document, or what's actually implemented in the backend, stop and ask rather than guessing. This applies to genuinely undefined product behavior only — not to bugs, missing error handling, or straightforward conformance fixes.
7. **After fixes are complete**, produce a second summary: what changed, file by file, so it's reviewable as a diff-level list, not just prose.

## Audit Checklist

Go through each of these against the architecture doc's corresponding section:

- **Tech stack conformance** — NativeWind + React Native Reusables in use for styling/components (not ad-hoc StyleSheet sprawl or a different library that crept in); TanStack Query used for all server state (not raw `fetch`/`useEffect` data-fetching); Zustand for auth/session state; React Hook Form + Zod on every form; `expo-secure-store` for tokens (never AsyncStorage for auth data)
- **Project structure** — folder/route layout matches the documented structure closely enough to navigate predictably; route groups exist for auth / onboarding / gate / app zones
- **Navigation guards** — the four gated zones are enforced correctly against `UserProfile.status` and `isProfileComplete`, re-derived on focus (not just at login), with no way to navigate around a gate
- **API integration layer** — response envelope (`{success, message, data, errors}`) is unwrapped in one central place, not handled ad hoc per screen; auth interceptor attaches the JWT on every request; 401 handling clears session correctly
- **Screen-to-endpoint mapping** — every screen calls the endpoint(s) specified in the doc's mapping table, and those endpoints actually exist and match in the real backend (check both directions: doc says X, does mobile call X, does backend implement X)
- **Real-time** — socket connection is scoped to the `(app)` zone only, authenticated with the JWT, subscriptions are cleaned up on unmount, relevant React Query caches are invalidated on incoming events
- **Media handling** — exactly-3-photos enforced client-side, video capped at 60s with visible timer, multipart upload implemented correctly, upload progress shown
- **Error/loading/empty states** — every data-driven screen has all three states distinctly, not just a loading spinner or silent failure
- **Slot-limit / blind-rejection UX** — send-request UI reflects remaining slots and disables at 0; rejected requests never surface recipient identity to the requester
- **Environment config** — `EXPO_PUBLIC_*` variables used correctly, no hardcoded API URLs
- **Expo Go compliance** — nothing implemented so far requires a dev client (confirm this is still true)

## Triage Report Format

Produce this as a table before making changes:

| Area | Doc Says | Found in Code | Status | Severity |
|---|---|---|---|---|
| e.g. Navigation guard — gate zone | Re-derive status on every focus | Only checked at login | Deviation | High |
| e.g. Discovery feed pagination | (unspecified in doc) | Offset-based, works with backend | Conforms | — |

**Status values:** `Conforms` / `Deviation` / `Missing` / `Needs Product Decision` (reserve this last one only for the exception in step 6).

**Severity values:** `Critical` (breaks a core flow or violates the state machine/role model), `Moderate` (functional gap, e.g. missing empty state), `Minor` (naming/style inconsistency with no functional impact).

## Final Deliverables

1. The triage report (table above)
2. A file-by-file changelog of what was fixed
3. A short list of anything left under `Needs Product Decision`, with the specific question that needs answering
