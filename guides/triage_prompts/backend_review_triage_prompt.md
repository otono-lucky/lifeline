# Backend Implementation — Review & Triage Prompt

**This is a two-agent process:** one agent (auditor) produces the triage report; a **different** agent (fixer) applies the fixes. This split is intentional — it gives you an independent second opinion instead of one model rationalizing its own audit while fixing it. Use **Part 1** with whichever model is doing the audit, and **Part 2** with whichever model is doing the fixes.

This review happens **before** the mobile review, because backend drift affects every downstream consumer — get this right first.

---

## PART 1 — Audit (Auditor Agent)

You have full access to this repository. Your task is to audit the current backend implementation against the **System Architecture Document** (confirm its exact path in `/guides/` — adjust if the filename differs from what's referenced here) and produce a written triage report. **Do not make any code changes in this part** — your only output is the report.

### Process

1. **Read the System Architecture Document** in full, focusing especially on: §2 (Roles & RBAC), §3 (Data Model), §4 (Church Onboarding Logic), §6 (Vetting State Machine), §7 (Discovery & Matching Engine rules), §9 (Notification Matrix), §12–13 (API Reference & Contracts).
2. **Audit systematically**, section by section (checklist below), comparing the doc against the actual codebase — schema, services, controllers, routes, middleware.
3. **Produce the triage report** (format below). For every row, cite the specific file/line or code reference that supports your finding — the fixer agent will re-verify against this, so vague findings without a pointer to the actual code slow that down.
4. Do not fix anything. Stop after the report.

### Audit Checklist

- **Role model & schema conformance** — `Account.role` enum is exactly `SUPER_ADMIN | CHURCH_ADMIN | COUNSELOR | USER`; no leftover `Pastor` model, table, or role references anywhere in code; `ChurchAdmin.churchId` is enforced unique (one ChurchAdmin per church, at the DB constraint level, not just application logic); `ChurchAdmin` has a `title` field and **no** duplicate `role` field; all role tables (`ChurchAdmin`, `Counselor`, `User`) correctly relate to both `Account` and `Church`
- **Naming & structure conventions** — resources named as nouns (`churchController`, `counselorService`, etc.), not dot-notation (`church.controller`) or function-named modules (`dashboardController` — should be `adminController` per earlier decision); one router per resource
- **Unified response envelope** — every endpoint returns `{success, message, data, errors}` consistently; flag any endpoint still returning an ad-hoc shape
- **RBAC middleware** — role guards use current role names/casing correctly; permissions match the §2 matrix exactly (e.g., only `COUNSELOR` can action vetting decisions; only `CHURCH_ADMIN` can create counselors; `SUPER_ADMIN` retains full access)
- **Vetting state machine** — `ProfileStatus` transitions match §6 exactly (`draft → pending_vetting → vetted_active | denied | hard_blocked`, denied→resubmit→pending_vetting, hard_blocked→appeal→SuperAdmin resolution); no invalid transitions are possible via the API
- **Discovery/matching business rules** — 3-slot limit enforced **server-side** (not assumed to be client-only); blind rejection confirmed — the requester-facing serializer never includes recipient identity on a rejected request; concurrency resolution on accept is transactional (accepted request + auto `no_longer_available` on the requester's other pending requests + Match + both chat channels created atomically, not as separate uncoordinated writes)
- **Profile completion gate** — the exact required-field list from §3.4 (including exactly-3-photos and the 2-of-3 social handle rule) is what's actually enforced before `isProfileComplete` flips true — not a looser or stricter version
- **Church onboarding flow** — confirm the direct-creation flow (SuperAdmin creates Church + one ChurchAdmin; ChurchAdmin creates Counselors) is what's implemented, with no invite-link system present unless that was intentionally reintroduced since our last discussion (if it has been, note it — don't assume it's wrong, just confirm it was a deliberate choice)
- **Endpoint completeness, both directions** — every endpoint in §12 actually exists and matches its documented method/path/access role; separately, flag any implemented endpoint **not** in the doc — note whether that's useful undocumented evolution (update the doc) or actual scope creep worth questioning
- **Auth & security** — password hashing in place, JWT payload contains what's expected (`accountId`, `role`), token expiry configured, email verification and password reset flows functioning per the documented contracts
- **Privacy tier enforcement** — endpoints/serializers reachable by `CHURCH_ADMIN` never leak restricted fields (income/salary, address, full social handles) — those should only appear in `COUNSELOR`-facing responses for their assigned users, per §2's permission table
- **Notification triggers** — check whether notification records/events are actually created at each trigger point in §9's matrix; if this is intentionally deferred to a later phase rather than missing, note that distinction rather than flagging it as a bug

### Triage Report Format

| Area | Doc Says | Found in Code | Status | Severity | Reference |
|---|---|---|---|---|---|
| e.g. ChurchAdmin cardinality | Exactly one per church, DB-enforced | `churchId` not marked unique | Deviation | Critical | `prisma/schema.prisma:L42` |
| e.g. Vetting decision endpoint | Counselor-only | Also accessible to ChurchAdmin | Deviation | Critical | `routes/vetting.routes.ts:L18` |
| e.g. Notification on match_formed | Required | Not implemented | Missing | Moderate (confirm if deferred) | n/a |

**Status values:** `Conforms` / `Deviation` / `Missing` / `Needs Product Decision`.
**Severity values:** `Critical` (violates role model, state machine, or a data-integrity rule), `Moderate` (functional gap, e.g. missing notification), `Minor` (naming/style inconsistency, no functional impact).

**Auditor's final output is the report only** — hand this to the fixer agent along with the System Architecture Document.

---

## PART 2 — Fix (Fixer Agent)

You've been handed a triage report (Part 1's output) claiming to compare this backend against the System Architecture Document. **Treat the report as a set of claims to verify, not as ground truth.** The auditor may have misread code, cited a stale line reference, or misunderstood the doc. Your job has two phases:

### Phase A — Independent Re-Verification

For **every row** in the report:
1. Open the cited file/reference and confirm the "Found in Code" description is actually accurate as of right now.
2. Re-read the relevant section of the System Architecture Document yourself and confirm the "Doc Says" description is accurate — don't take the auditor's paraphrase at face value.
3. Mark each row as **Confirmed** (both sides check out, proceed to fix) or **Disputed** (something doesn't hold up — explain why, and don't fix it based on a disputed finding).

Produce a short verification log before touching any code: which rows you confirmed as-is, which you disputed and why, and any you'd reclassify (e.g., a "Deviation" that's actually a "Needs Product Decision").

### Phase B — Apply Fixes

For every **Confirmed** row, fix it — including architecture-level items (e.g., missing DB constraints, incorrect RBAC scoping, wrong state machine transitions), not just naming/style issues. You have full authority here.

**Two exceptions — stop and ask instead of fixing silently:**
- **Undefined business rules:** if a fix requires inventing behavior not specified anywhere in the System Architecture Document or prior decisions, pause and ask.
- **Destructive or breaking schema changes:** if correcting a schema deviation would require a migration that could drop columns/tables with existing data, or would break a contract another consumer (e.g. the mobile app) may already depend on, pause and describe the change before running it. Purely additive schema fixes (new optional column, new table) don't need this pause.

### Final Deliverables

1. The verification log (Phase A) — confirmed vs. disputed findings, with reasoning
2. File-by-file changelog of fixes applied, with schema/migration changes called out separately from code changes
3. A short list of anything left under `Needs Product Decision` or `Needs Migration Confirmation`, with the specific question that needs answering before proceeding
