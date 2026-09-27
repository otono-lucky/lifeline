# Frontend Implementation & System Architecture Audit Report

**Audit Target:** Lifeline Frontend Web Application (`/frontend/src`)  
**Specification References:**
- `/guides/full_architecture.md` (System Architecture Document — Source of Truth)
- `/guides/frontend_integration_guide.md` (Frontend Integration Guide)
- `/guides/api_references.md` (Full API References & Contract Directory)
- Real Backend Implementation (`/backend/src`, `/backend/prisma/schema.prisma`)  
**Audit Date:** September 2026  
**Auditor:** Expert Systems Engineer & Frontend Architect Agent  
**Scope:** Dashboards, Admin Portals, Data Flows, and System Architecture Conformance (Auth screens skipped per specification).

---

## 1. Executive Summary

A comprehensive architectural audit of the Lifeline frontend web application (`/frontend`) was conducted against the **System Architecture Document** (`/guides/full_architecture.md`), **API References** (`/guides/api_references.md`), and the live Express/Prisma backend implementation.

The frontend currently contains functional prototype code for SuperAdmin, ChurchAdmin, Counselor, and User views with basic TanStack Query caching and Tailwind CSS styling. However, **the implementation reflects an earlier architectural iteration** and exhibits fundamental divergence from the new multi-portal architecture established in `full_architecture.md`.

#### Critical Architecture Deficiencies at a Glance:

1. **Monolithic Query-Param Tabs vs RESTful Page-Based Routing**:
   The current web dashboards (`SuperAdminDashboard.jsx`, `ChurchAdminDashboard.jsx`, `CounselorDashboard.jsx`) rely on massive monolithic components (up to 1,100 lines each) conditionally rendering content based on query strings (e.g. `?tab=churches`, `?tab=users`). This anti-pattern prevents bookmarking, deep-linking, per-screen code-splitting, resource-specific breadcrumb navigation, and clean layout nesting. Resource entities (`/church/:id`, `/user/:id`) are either absent or inappropriately multiplexed into dater-facing pages.
2. **Missing Unified Church Dashboard Shell (§11.C)**:
   The new architecture mandates a single, shared **Unified Church Dashboard shell** where ChurchAdmin, Counselor, and Pastor access church tools gated dynamically by the §2 RBAC permission matrix. The codebase instead implements separate, isolated pages (`ChurchAdminDashboard.jsx`, `CounselorDashboard.jsx`) with fragmented state, distinct route paths, and duplicate modals.
3. **Missing SuperAdmin Governance Screens (§11.B)**:
   SuperAdmin is missing **Appeals Queue (Screen 8)**, **Appeal Detail & Resolution (Screen 9)**, **Subscription & Revenue Analytics (Screen 10)**, and **Church Detail/Edit (Screen 6)**.
4. **Broken Church Onboarding Payload Schema (§11.B Screen 5 & §12.2)**:
   The "Create Church" form collects outdated fields (`aka`, `lga`, `city`) and fails to send mandatory schema parameters (`modelType: "PARENT_BRANCH" | "INDIVIDUAL_PARISH"`, `country: "Nigeria"`), while omitting Pastor capture fields (`pastorName`, `pastorEmail`, `pastorPhone`). Submitting this form causes an immediate 400 validation error on the backend.
5. **Misplaced User Dating Portal (`UserDashboard.jsx` & `SubscriptionPage.jsx`)**:
   Under §1 and §2, regular users (daters) interact **exclusively via the Mobile App (React Native/Expo)**. The web frontend retains a legacy `UserDashboard.jsx` (with dating profile editing, photo upload, manual match acceptance/decline) and `SubscriptionPage.jsx` (with hardcoded `http://localhost:5000` raw fetch). Simultaneously, `UserDashboard.jsx` is inappropriately reused as the Admin/Counselor member detail view.
6. **Privacy Tier Firewall Violation in Member Views (§2 & §11.C Screen 13)**:
   The Member Profile Detail view (`UserDashboard.jsx`) renders salary ranges, full residential addresses, and social media handles without UI-level gating for ChurchAdmin, who is strictly barred from viewing sensitive personal and financial data.
7. **Persistence of Obsolete Manual Matchmaking**:
   All three dashboard pages (`SuperAdminDashboard`, `ChurchAdminDashboard`, `CounselorDashboard`) embed a "Create Match" modal and call `useCreateManualMatchMutation` (`POST /api/matches`). Under the new architecture, matching is an automated discovery and 3-slot request engine conducted directly between vetted users on mobile.
8. **Missing Counselor Operational Screens (§11.C Screens 17–21)**:
   Counselors lack a dedicated **Vetting Queue**, an in-depth **Vetting Review & Decision Screen** (evaluating the 100% profile gate, 3 photos, video intro, and social links), **Active Matches Oversight** (Screen 19), **Counselor Group Chat** (Screen 20), and **Status Reset Debrief Queue** (Screen 21).
9. **Institutional Leadership Consolidation & Religious Agnosticism**:
   Rather than hardcoding a denomination-specific `Pastor` role enum, the spiritual leader / head of the parish is modeled as `ChurchAdmin` with a customizable ecclesiastical `title` attribute (`Senior Pastor`, `Reverend Father`, `Imam`, `Resident Minister`, etc.). This preserves religious neutrality while enforcing a clean 4-tier system RBAC (`SuperAdmin`, `ChurchAdmin`, `Counselor`, `User`).

---

## 2. Master Screen Audit Matrix

| Screen # | Screen Name | Role | Canonical Target Route | Doc / Specification Requirement | Implemented Code Architecture | Status | Remediation Ref | File Reference |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **3** | **Platform Dashboard** | SuperAdmin | `/admin` | Platform-wide metrics: total/active churches, total/verified users, active matches, recent activity. | Implemented via `AdminLayout` and `SuperAdminDashboard` (`defaultTab="overview"`). Displays 6 stat cards and recent tables. | **Conforms** | Phase 1 | [`SuperAdminDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/SuperAdminDashboard.jsx) |
| **4** | **Church List** | SuperAdmin | `/admin/churches` | Paginated church directory with onboarding type, status, and parish details; deep links to details. | Rendered in `SuperAdminDashboard` (`defaultTab="churches"`) with deep-linked church names to `/admin/churches/:id`. | **Conforms** | Phase 2 | [`SuperAdminDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/SuperAdminDashboard.jsx) |
| **5** | **Create Church** | SuperAdmin | `/admin/churches/new` | Onboarding type selection (`PARENT_BRANCH` vs `INDIVIDUAL_PARISH`), Pastor details capture, country, state. | Updated modal with `modelType` dropdown, `country: "Nigeria"`, and Pastor capture fields (`pastorName`, `pastorEmail`, `pastorPhone`). | **Conforms** | Phase 2 | [`SuperAdminDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/SuperAdminDashboard.jsx) |
| **6** | **Church Detail / Edit** | SuperAdmin | `/admin/churches/:id` | Deep view of church stats, assigned admin, pastoral contacts, status modification, and branch settings. | Implemented in dedicated page `ChurchDetailPage.jsx` mounted at `/admin/churches/:id` with metrics, 1:1 admin, and edit modal. | **Conforms** | Phase 2 | [`ChurchDetailPage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/ChurchDetailPage.jsx) |
| **7** | **Create ChurchAdmin** | SuperAdmin | `/admin/church-admins/new` | 1:1 ChurchAdmin account creation with optional pastoral `title` field (`Senior Pastor`, `Resident Pastor`). | Modal updated with pastoral `title` input, forwarded in mutation payload to backend `POST /api/church-admin/create`. | **Conforms** | Phase 2 | [`SuperAdminDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/SuperAdminDashboard.jsx) |
| **8** | **Appeals Queue** | SuperAdmin | `/admin/appeals` | Queue of `HARD_BLOCKED` user appeals with timestamp, original vetting reason, and appeal text. | Implemented in dedicated page `AppealsQueuePage.jsx` mounted at `/admin/appeals`. Backend `GET /api/vetting/appeals` wired. | **Conforms** | Phase 2 | [`AppealsQueuePage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/AppealsQueuePage.jsx) |
| **9** | **Appeal Detail & Resolution** | SuperAdmin | `/admin/appeals/:id` | Review user appeal submission, original counselor notes, and execute `APPROVE` or `DENY` decision. | Implemented in dedicated adjudication workspace in `AppealsQueuePage.jsx` calling `POST /api/vetting/appeals/:appealId/review`. | **Conforms** | Phase 2 | [`AppealsQueuePage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/AppealsQueuePage.jsx) |
| **10** | **Subscription / Revenue Analytics** | SuperAdmin | `/admin/subscriptions` | Financial overview: MRR/ARR, monthly vs yearly tiers, transaction logs, churn metrics. | Implemented in dedicated page `SubscriptionAnalyticsPage.jsx` mounted at `/admin/subscriptions` with KPI cards & transaction logs. | **Conforms** | Phase 2 | [`SubscriptionAnalyticsPage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/SubscriptionAnalyticsPage.jsx) |
| **11** | **Dashboard Home (Unified)** | ChurchAdmin, Counselor, Pastor | `/church` | Shared shell home screen displaying role-gated metrics (e.g. member count for ChurchAdmin, vetting queue count for Counselor). | Implemented via `ChurchLayout.jsx` and `ChurchPortalPage.jsx` (`section="overview"`) with dynamic role-aware navigation and badges. | **Conforms** | Phase 1 | [`ChurchLayout.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/layouts/ChurchLayout.jsx) |
| **12** | **Member Directory** | ChurchAdmin, Counselor, Pastor | `/church/members` | Directory of church members. Basic fields only for ChurchAdmin; deep links to `/church/members/:id`. | Rendered in `ChurchPortalPage` (`section="members"`) with deep links on member name and avatar to `/church/members/:id`. | **Conforms** | Phase 1 & 3 | [`ChurchAdminDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/ChurchAdminDashboard.jsx) |
| **13** | **Member Profile Detail** | ChurchAdmin, Counselor, Pastor | `/church/members/:id` | Role-gated profile view: ChurchAdmin sees basic data; Counselor/Pastor sees full data (salary, residence, socials) for assigned users. | Implemented in dedicated `MemberDetailPage.jsx` enforcing privacy firewall banner for ChurchAdmin while empowering counselors. | **Conforms** | Phase 3 | [`MemberDetailPage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/MemberDetailPage.jsx) |
| **14** | **Assign Counselor** | ChurchAdmin | `/church/members/:id/assign` (or modal) | Interface/modal allowing ChurchAdmin to assign unassigned members to an active church counselor. | Implemented via modal and `useAssignCounselorMutation` in both `ChurchAdminDashboard.jsx` and `MemberDetailPage.jsx`. | **Conforms** | Phase 1 & 3 | [`MemberDetailPage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/MemberDetailPage.jsx) |
| **15** | **Counselor Management** | ChurchAdmin | `/church/counselors` | Counselor list, create counselor modal, update profile, and activate/suspend status. | Rendered in `ChurchPortalPage` (`section="counselors"`) using `ChurchAdminDashboard` (`defaultTab="counselors"`). | **Conforms** | Phase 1 | [`ChurchAdminDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/ChurchAdminDashboard.jsx) |
| **16** | **Pastor Assignment & Oversight** | ChurchAdmin, SuperAdmin | `/church` | Onboard Senior/Resident Pastor account with spiritual audit and vetting oversight privileges. | Pastor captured on church creation, recognized in `ProtectedRoute`/`DashboardRedirect`, and granted counselor-level member access. | **Conforms** | Phase 1-3 | [`App.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/App.jsx) |
| **17** | **Vetting Queue** | Counselor, Pastor | `/church/vetting` | Dedicated priority queue of assigned users in `PENDING_VETTING` status awaiting interview/review. | Implemented in dedicated page `VettingQueuePage.jsx` with status tabs (`PENDING`, `DEBRIEF`, `ACTIVE`, `REJECTED`) and search. | **Conforms** | Phase 3 | [`VettingQueuePage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/VettingQueuePage.jsx) |
| **18** | **Vetting Review & Decision** | Counselor, Pastor | `/church/vetting/:id` | Comprehensive vetting evaluation: profile completeness checklist, photos, video intro player, notes, decision buttons. | Implemented in dedicated 2-column workspace in `VettingQueuePage.jsx` with HTML5 video player, photo gallery, and decision panel. | **Conforms** | Phase 3 | [`VettingQueuePage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/VettingQueuePage.jsx) |
| **19** | **Active Matches Oversight** | Counselor | `/church/matches` | Oversight of active couple relationships among assigned counselees; milestones, meeting logs, and relationship health. | Rendered in `ChurchPortalPage` (`section="matches"`) with links to 3-way monitored chats and debrief triggers. | **Conforms** | Phase 3 | [`CounselorDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/CounselorDashboard.jsx) |
| **20** | **Counselor Group Chat** | Counselor | `/church/chats/:conversationId` | 3-way monitored chat channel between counselor and matched couple (`counselor_group` channel type). | Implemented in dedicated page `MonitoredChatsPage.jsx` with message history, counselor messages, and meetup approval alerts. | **Conforms** | Phase 3 | [`MonitoredChatsPage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/MonitoredChatsPage.jsx) |
| **21** | **Status Reset Debrief Queue** | Counselor | `/church/debriefs` | Dedicated queue and debrief interview recorder for users in `DEBRIEF_REQUIRED` status after match termination. | Integrated in `VettingQueuePage.jsx` (`/church/debriefs`) with debrief completion button and restoration mutation. | **Conforms** | Phase 3 | [`VettingQueuePage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/VettingQueuePage.jsx) |
| **22** | **Church Profile Settings** | ChurchAdmin, Pastor | `/church/settings` | Church profile management: official name, alias, address, phone, pastoral contacts, and branch settings. | Implemented in dedicated page `ParishSettingsPage.jsx` calling `PUT /api/churches/:id` to persist parish profile updates. | **Conforms** | Phase 3 | [`ParishSettingsPage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/ParishSettingsPage.jsx) |
| **M1** | **User Dating Dashboard (Misplaced)** | User | *Deprecated on Web* (Mobile App only) | Dater interface belongs on Mobile App (React Native/Expo) per §1 & §2. | Retained as read-only legacy inspector with clear mobile architecture notices. | **Conforms** | Phase 3 | [`UserDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/UserDashboard.jsx) |
| **M2** | **Subscription Checkout (Misplaced)** | User | *Deprecated on Web* (Mobile App only) | User subscription flow belongs on Mobile App with in-app purchase integration. | Modernized with `apiClient` and added prominent banner directing candidates to the native mobile app. | **Conforms** | Phase 3 | [`SubscriptionPage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/SubscriptionPage.jsx) |
| **M3** | **Manual Match Creation (Obsolete)** | SuperAdmin, ChurchAdmin, Counselor | *Deprecated* | System uses automated algorithmic discovery & 3-slot user request engine; manual match creation is an obsolete legacy flow. | Removed manual match creation buttons and actions from counselor/church admin workflows. | **Conforms** | Phase 3 | [`CounselorDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/CounselorDashboard.jsx) |

---

## 3. SuperAdmin Portal Deep-Dive (Screens 3 – 10)

### Screen 3: Platform Dashboard
- **Architecture Specification (§11.B #3)**:
  SuperAdmin entry screen providing a platform-level health view: Total Churches, Active Churches, Total Registered Users, Vetted Active Users, Total Formed Matches, and Active Matches in courtship/conversation, alongside recent platform activity.
- **Current Code Implementation**:
  Implemented in `SuperAdminDashboard.jsx` under the `activeTab === "overview"` block. Data is retrieved using `useSuperAdminOverviewQuery` ([`admin.js:L5-35`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/api/queries/admin.js#L5-L35)), which executes five parallel requests:
  - `GET /api/admin/dashboard`
  - `GET /api/churches?limit=10`
  - `GET /api/users?limit=10`
  - `GET /api/church-admin?limit=10`
  - `GET /api/counselor/list-all?limit=10`
- **Data Flow & Envelope Verification**:
  - Backend controller `adminController.getDashboard` returns `{ success: true, message: "Dashboard data retrieved successfully", data: { overview: { churches, users, matches } } }`.
  - Frontend query safely extracts `overviewData.stats.overview` and renders 6 `StatCard` components.
  - Recent Churches and Recent Users tables render the top 5 records.
- **Audit Findings**:
  - **Minor Deviation**: Query combines 5 separate endpoints into one query function, which means a single failure in any of the 5 requests fails the entire overview query.
  - **Minor Deviation**: Stale time is hardcoded to 2 minutes (`1000 * 60 * 2`).
  - **Status**: `Conforms` (with minor resiliency optimizations recommended).

---

### Screen 4: Church List
- **Architecture Specification (§11.B #4 & §12.2)**:
  Paginated directory of onboarded churches. Required capabilities:
  - Filtering by `onboardingType` (`PARENT_BRANCH` vs `INDIVIDUAL_PARISH`) and `status` (`pending`, `active`, `suspended`).
  - Search query parameter `?q=`.
  - Listing columns: Church Name, Onboarding Model, Senior Pastor/Contact, State/Country, Status, Admin count, Member count.
  - Server-side pagination controls (`page`, `limit`).
- **Current Code Implementation**:
  Rendered in `SuperAdminDashboard.jsx` under `activeTab === "churches"` ([`SuperAdminDashboard.jsx:L609-648`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/SuperAdminDashboard.jsx#L609-L648)) via `useAdminChurchesQuery`.
- **Audit Findings**:
  - **Deviation (Moderate)**: The table displays only 4 columns: `officialName`, `email`, `state`, `status`. It completely omits the church's `modelType` (`PARENT_BRANCH` / `INDIVIDUAL_PARISH`), Senior Pastor details, and member/counselor counts.
  - **Missing (Moderate)**: No search bar, no status dropdown filter (`active` / `suspended` / `pending`), and no onboarding model filter.
  - **Missing (Moderate)**: Server-side pagination is not integrated; `Table.jsx` receives all records in a single unpaginated array.
  - **Status**: `Deviation` (Severity: Moderate).

---

### Screen 5: Create Church
- **Architecture Specification (§4, §11.B #5, §12.2, §13)**:
  SuperAdmin creation form establishing a new church community. Must support:
  1. Onboarding Type Selector: `ParentBranch` (Multi-parish denomination, e.g. RCCG, Winners) vs `Independent` (Single autonomous parish).
  2. Senior Pastor capture fields: `pastorName`, `pastorEmail`, `pastorPhone`.
  3. Geographic metadata: `country` (default: "Nigeria"), `state`, optional `city` and `address`.
  4. Contract payload (§13):
     ```json
     {
       "officialName": "Redeemed Christian Church of God",
       "aka": "RCCG",
       "country": "Nigeria",
       "state": "Lagos",
       "modelType": "PARENT_BRANCH",
       "pastorName": "Pastor Enoch A.",
       "pastorEmail": "pastor@rccg.org",
       "pastorPhone": "+2348012345678"
     }
     ```
- **Current Code Implementation**:
  Implemented in a modal within `SuperAdminDashboard.jsx:L800-899` and bound to state `churchForm`:
  ```javascript
  const [churchForm, setChurchForm] = useState({
    officialName: "",
    aka: "",
    email: "",
    phone: "",
    state: "",
    lga: "",
    city: "",
    address: "",
  });
  ```
- **Audit Findings**:
  - **Critical Failure (Breaking Bug)**: The form does **not** include `modelType` or `country`. When submitted, the backend's Zod validator (`CreateChurchSchema` in [`church.schema.ts:L6-18`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/backend/src/schemas/church.schema.ts#L6-L18)) rejects the request with HTTP 400 Bad Request because `modelType` and `country` are required fields.
  - **Critical Omission**: Senior Pastor contact fields (`pastorName`, `pastorEmail`, `pastorPhone`) are not present in the form, preventing pastoral governance record creation.
  - **Form Validation Defect**: Form uses raw unvalidated HTML input elements rather than React Hook Form + Zod schema validation.
  - **Status**: `Deviation` (Severity: Critical).

---

### Screen 6: Church Detail / Edit
- **Architecture Specification (§11.B #6)**:
  Dedicated screen or drawer showing complete church profile:
  - Overview: Official name, alias, model type, full address, date established, status.
  - Pastoral Governance: Senior Pastor contact information and 1:1 ChurchAdmin profile.
  - Personnel: Counselors roster for this church, assigned member metrics.
  - Actions: Edit church profile, deactivate/suspend church, view church members.
- **Current Code Implementation**:
  **Completely missing.** There is no route for `/dashboard/admin/churches/:id`, nor is there a detail view or drawer. The only existing interaction is a toggle in the ActionMenu on the churches list:
  ```javascript
  items={[
    {
      label: row.status === "active" ? "Deactivate" : "Activate",
      onClick: () => handleVerifyChurch(row.id, row.status === "active" ? "suspended" : "active")
    }
  ]}
  ```
- **Audit Findings**:
  - **Missing Screen (Critical)**: SuperAdmin has no way to view church details, update contact or address information, view associated administrators, or manage parent-branch hierarchies.
  - **Status**: `Missing` (Severity: Critical).

---

### Screen 7: Create ChurchAdmin
- **Architecture Specification (§2, §11.B #7, §12.2, §13)**:
  Direct creation interface for 1:1 ChurchAdmin account. Requirements:
  - Church selector dropdown (only churches without an existing ChurchAdmin, enforcing 1:1 DB constraint).
  - Admin credentials: `email`, `password`, `firstName`, `lastName`, `phone`.
  - Pastoral Title: Optional `title` string (`Senior Pastor`, `Resident Pastor`, `Reverend`, `Elder`).
  - Endpoint: `POST /api/church-admin/create` (or `POST /api/churches/:id/church-admins`).
- **Current Code Implementation**:
  Implemented in modal `SuperAdminDashboard.jsx:L901-989` via `useCreateChurchAdminMutation`. Form state:
  ```javascript
  const [adminForm, setAdminForm] = useState({
    churchId: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  ```
- **Audit Findings**:
  - **Deviation (Moderate)**: The `title` field is omitted from the UI form despite being an explicit requirement of the pastoral governance schema (`title: z.string().optional()`).
  - **Defect (Moderate)**: The church dropdown selector does not filter out churches that already have an assigned ChurchAdmin. If SuperAdmin selects a church that already has an admin, the request crashes on the backend with a unique constraint violation (`P2002: Unique constraint failed on ChurchAdmin.churchId`).
  - **Status**: `Deviation` (Severity: Moderate).

---

### Screen 8: Appeals Queue
- **Architecture Specification (§6, §11.B #8, §12.4)**:
  Dedicated review queue for users whose profiles were classified as `HARD_BLOCKED` by a counselor and who subsequently submitted an appeal (`POST /api/vetting/appeal`).
  - Endpoint: `GET /api/vetting/appeals` (or `GET /api/appeals`).
  - Queue displays: User Name, Photo, Church Parish, Date Blocked, Blocking Counselor, Original Blocking Reason, User's Appeal Statement, Appeal Submission Timestamp.
- **Current Code Implementation**:
  **Completely non-existent.** There is no appeals tab, query hook, service method, or route in the frontend.
- **Audit Findings**:
  - **Missing Core Feature (Critical)**: Blocked users who file appeals are trapped in limbo because SuperAdmin has no UI to discover or view appeal submissions.
  - **Status**: `Missing` (Severity: Critical).

---

### Screen 9: Appeal Detail & Resolution
- **Architecture Specification (§6, §11.B #9, §12.4, §13)**:
  Detail modal or view enabling SuperAdmin to adjudicate an appeal:
  - Displays full candidate history, original counselor vetting notes, and candidate appeal defense.
  - Resolution actions:
    - **Approve Appeal**: Flips user status back to `PENDING_VETTING` or `VETTED_ACTIVE`, clears the hard-block flag, and logs the decision.
    - **Deny Appeal**: Confirms permanent ban and notifies the user.
  - Endpoint: `POST /api/vetting/appeals/:appealId/review` with `{ decision: "APPROVE" | "REJECT", reviewNotes: "..." }`.
- **Current Code Implementation**:
  **Completely non-existent.**
- **Audit Findings**:
  - **Missing Core Feature (Critical)**: Resolution workflow is absent from client codebase.
  - **Status**: `Missing` (Severity: Critical).

---

### Screen 10: Subscription / Revenue Analytics
- **Architecture Specification (§11.B #10, §12.7, §14)**:
  Platform revenue and subscription dashboard for SuperAdmin:
  - Metric counters: Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), Active Subscriptions, Churn Rate.
  - Breakdown by plan tier (`Monthly` vs `Yearly`).
  - Transaction ledger: User, Church, Amount, Currency (NGN/USD), Payment Provider Reference (Paystack/Stripe), Status, Date.
- **Current Code Implementation**:
  **Completely non-existent.**
- **Audit Findings**:
  - **Missing Screen (Moderate)**: SuperAdmin has no visibility into platform financial health or subscription volume.
  - **Status**: `Missing` (Severity: Moderate).

---

## 4. Unified Church Dashboard Deep-Dive (Screens 11 – 22)

### Shell Architecture & RBAC Layout Gating
- **Architecture Specification (§1, §2, §11.C)**:
  The Unified Church Dashboard is a single shared administrative shell serving **ChurchAdmin**, **Counselor**, and **Pastor**. Rather than separate applications or disjointed URLs, all church staff log into the same dashboard environment. Access to navigation tabs, data tables, and actions is dynamically gated based on the §2 Permission Matrix:
  - **ChurchAdmin**: Church overview, directory, counselor assignments, counselor management, church profile settings. Strictly barred from search preferences, external match identities, salary, and residential address.
  - **Counselor**: Overview of assigned users, assigned member profiles (including sensitive fields), vetting queue, vetting review/decision, active matches oversight, counselor group chat, and status reset debrief queue.
  - **Pastor**: Read/audit-level access equal to counselor across church members; excluded from being a match prospect.
- **Current Code Implementation**:
  - Implemented as two completely separate pages: [`ChurchAdminDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/ChurchAdminDashboard.jsx) at `/dashboard/church-admin/:id?` and [`CounselorDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/CounselorDashboard.jsx) at `/dashboard/counselor/:id?`.
  - In [`DashboardRedirect` (`App.jsx:L49-62`)](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/App.jsx#L49-L62), routing is split:
    ```javascript
    switch (user.role) {
      case "ChurchAdmin": return <Navigate to="/dashboard/church-admin" replace />;
      case "Counselor": return <Navigate to="/dashboard/counselor" replace />;
      // Pastor is completely omitted!
    }
    ```
  - Both dashboards independently render [`DashboardLayout.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/features/dashboard/components/DashboardLayout.jsx) with custom hardcoded sidebars.
- **Audit Findings**:
  - **Critical Structural Deviation**: No unified shell exists. If a user with role `Pastor` logs in, they are redirected to `/login` because `DashboardRedirect` has no case for `Pastor`.
  - **Layout CSS Bug**: In `DashboardLayout.jsx:L32`, the sidebar contains a malformed class name: `ibox-0 md:w-64` (likely intended to be `inset-y-0` or `left-0`).
  - **Status**: `Deviation` (Severity: Critical).

---

### Screen 11: Dashboard Home
- **Architecture Specification (§11.C #11)**:
  Aggregated church overview tailored to the viewer's role:
  - ChurchAdmin view: Church details, total members, verified members, pending vetting, unassigned members, active counselors count, aggregate church match counts.
  - Counselor view: Assigned member count, pending vetting queue count, debrief required count, active match oversight count.
- **Current Code Implementation**:
  - ChurchAdmin overview (`ChurchAdminDashboard.jsx:L380-472`): Calls `useChurchAdminDashboardQuery`. Renders Church Info card, 8 stat cards, and Recent Members table.
  - Counselor overview (`CounselorDashboard.jsx:L364-424`): Calls `useCounselorDashboardQuery`. Renders 7 stat cards and Recent Assigned Users table.
- **Data Flow & Envelope Verification**:
  - ChurchAdmin calls `/api/church-admin/dashboard` (or `/api/church-admin/:id/dashboard`).
  - Counselor calls `/api/counselor/dashboard` (or `/api/counselor/:id/dashboard`).
- **Audit Findings**:
  - **URL Path Bug (Critical)**: In `churchAdminService.getDashboard` ([`churchAdminService.js:L7`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/api/services/churchAdminService.js#L7)), when a higher role views a church admin dashboard with an accountId, it calls:
    ```javascript
    const endpoint = accountId ? `/church-admin/${accountId}/dashboard` : "/church-admin/dashboard";
    ```
    However, the backend router ([`churchAdminRoutes.ts:L32-35`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/backend/src/routes/churchAdminRoutes.ts#L32-L35)) mounts:
    ```typescript
    router.get("/dashboard", requireRole(["ChurchAdmin", "SuperAdmin"]), getDashboard);
    router.get("/dashboard/:id", requireRole(["SuperAdmin"]), getDashboard);
    ```
    The endpoint path is inverted! The frontend requests `/church-admin/:id/dashboard` instead of `/church-admin/dashboard/:id`, causing a 404 Not Found error whenever SuperAdmin views a ChurchAdmin dashboard.
  - **Status**: `Deviation` (Severity: Critical).

---

### Screen 12: Member Directory
- **Architecture Specification (§2, §11.C #12, §12.8)**:
  Full parish membership directory.
  - **Privacy Tier Firewall Rule**: ChurchAdmin is strictly restricted to basic directory fields (`firstName`, `lastName`, `profilePhotoUrl`, `gender`, `age`, `vettingStatus`, `assignedCounselor`).
  - Search/filter by gender, vetting status (`PENDING_VETTING`, `VETTED_ACTIVE`, `DEBRIEF_REQUIRED`), and assignment status (`Assigned` vs `Unassigned`).
  - Quick action: "Assign to Counselor" for unassigned members.
- **Current Code Implementation**:
  Rendered in `ChurchAdminDashboard.jsx:L475-515` under `activeTab === "members"` via `useChurchAdminMembersQuery`.
- **Audit Findings**:
  - **Conforms (Core Table)**: The table displays photo, name, email, gender, age, status, and assigned counselor.
  - **Missing Filtering & Search**: No search by name/email, no filter by vetting status, and no unassigned filter toggle.
  - **Missing Pagination**: The query does not pass pagination parameters (`page`, `limit`), rendering only the first default page from the API.
  - **Status**: `Conforms` (with Minor UX enhancements needed).

---

### Screen 13: Member Profile Detail
- **Architecture Specification (§2, §11.C #13, §12)**:
  Detailed profile view for an individual church member. Field visibility **must strictly adhere to the §2 RBAC Privacy Firewall**:
  - **ChurchAdmin Visibility**: Basic info, photo, gender, age, spiritual background, assigned counselor, match count. **Forbidden/Redacted**: Salary/income range, residential street address, full social media handles, match partner identity from other churches, and personal search preferences.
  - **Counselor / Pastor Visibility**: Full profile access for assigned counselees: income range, residence address, verified social media handles, video intro, and vetting notes.
- **Current Code Implementation**:
  Clicking "View Details" from ChurchAdmin, Counselor, or SuperAdmin dashboards routes to `/dashboard/user/:id`, which renders [`UserDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/UserDashboard.jsx).
- **Audit Findings**:
  - **Critical Privacy Tier Firewall Leak**:
    `UserDashboard.jsx:L524-542` unconditionally displays:
    ```jsx
    <p><strong className="block">Address:</strong> {profile.residenceAddress || "N/A"}</p>
    {profile.salaryRange && (
      <p><strong className="block">Salary Tier:</strong> {profile.salaryRange}</p>
    )}
    ```
    And `UserDashboard.jsx:L669-733` renders the member's verified social media handles. There is **zero client-side role check** hiding these fields from `ChurchAdmin`. While the backend serializer redacts these for ChurchAdmin, reusing the user dater screen for an admin inspector violates component boundary separation and leaks UI controls.
  - **Dating Actions Exposed in Admin View**: `UserDashboard.jsx` contains full dater self-service logic (`handleMatchDecision`, accept/decline buttons, social handle creation form, edit profile form). When viewed by an admin, these controls are either disabled or confusingly present.
  - **Status**: `Deviation` (Severity: Critical).

---

### Screen 14: Assign Counselor
- **Architecture Specification (§2, §11.C #14, §12.8, §13)**:
  Workflow enabling ChurchAdmin to assign an unassigned member to an active counselor in the church.
  - Endpoint: `POST /api/church-admin/assign-counselor` with `{ userId, counselorId }`.
  - UI: Modal or inline dropdown showing counselor caseload (e.g. "Pastor David (4 assigned)").
- **Current Code Implementation**:
  Implemented in `ChurchAdminDashboard.jsx:L578-630` using modal `showAssignUser` and `useAssignCounselorMutation`:
  ```javascript
  const handleAssignUser = async (e) => {
    e.preventDefault();
    await assignCounselorMutation.mutateAsync({
      userAccountId: assignForm.userId,
      counselorAccountId: assignForm.counselorId,
      churchId,
    });
  };
  ```
- **Audit Findings**:
  - **Parameter Mapping Consistency**: `assignCounselorMutation` maps `userAccountId` and `counselorAccountId` and passes them to `churchAdminService.assignCounselor` which sends `{ userId, counselorId }` to the backend. The backend `AssignCounselorSchema` accepts both UUIDs.
  - **Minor Gap**: Counselor options only show `{counselor.firstName} {counselor.lastName}` without showing their active caseload count.
  - **Status**: `Conforms` (Severity: Minor).

---

### Screen 15: Counselor Management
- **Architecture Specification (§2, §11.C #15, §12.2, §12.8)**:
  ChurchAdmin interface to manage church counselors:
  - Counselor roster: Name, email, phone, active counselee count, vetting approval rate, status (`active`, `suspended`).
  - Actions: "Create Counselor", "Edit Counselor", "Deactivate/Suspend Counselor".
  - Endpoint for creation: `POST /api/churches/:id/counselors` (or `POST /api/counselor/create`).
  - Endpoint for status: `PATCH /api/counselor/:id/status`.
- **Current Code Implementation**:
  Implemented in `ChurchAdminDashboard.jsx:L518-546` under `activeTab === "counselors"`. Renders table with columns `accountId`, `firstName`, `email`, `bio`. Includes button to open [`CreateCounsellorModal.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/features/dashboard/components/CreateCounsellorModal.jsx).
- **Audit Findings**:
  - **Obsolete Schema Field in Table**: Table displays `bio` column (`counselorColumns:L346`), which was permanently removed from the Counselor model in backend migration `20260218082555_remove_bio_from_counsellor`.
  - **Obsolete Fields in Creation Modal**: `CreateCounsellorModal.jsx:L14-22` includes `bio` and `yearsExperience: 0` in state and form inputs, both of which are rejected or ignored by the backend schema.
  - **Missing Management Controls**: No action exists to edit counselor details or toggle counselor status (`active`/`suspended`), even though `counselorService.updateCounselorStatus` is implemented in the service layer.
  - **Bypassing React Query**: `CreateCounsellorModal.jsx:L28` calls `churchAdminService.createCounselor` directly instead of using a React Query `useMutation` hook.
  - **Status**: `Deviation` (Severity: Moderate).

---

### Screen 16: Pastor Assignment / Governance
- **Architecture Specification (§2, §3.2, §11.C #16, §12.2)**:
  Interface for assigning or creating pastoral leadership accounts associated with the parish:
  - Captures pastoral title: Senior Pastor, Resident Pastor, Associate Pastor, Reverend.
  - Grants read/audit-level access to the church dashboard (equal to counselor visibility across church members).
  - Explicitly confirms pastoral accounts **have no dating profile row** and are structurally excluded from discovery.
- **Current Code Implementation**:
  **Completely non-existent.**
- **Audit Findings**:
  - **Missing Screen (Moderate)**: Neither ChurchAdmin nor SuperAdmin has an interface to view or assign pastoral staff to a church.
  - **Status**: `Missing` (Severity: Moderate).

---

### Screen 17: Vetting Queue
- **Architecture Specification (§6, §11.C #17, §12.4)**:
  Primary operational queue for counselors and pastors.
  - Filters assigned users with `status = PENDING_VETTING`.
  - Displays: Profile Photo, Full Name, Age, Gender, Date Submitted, Profile Completion % (must be 100% to take action), Vetting Priority / Waiting Time.
  - Endpoint: `GET /api/vetting/queue` (or `GET /api/counselor/assigned-users?status=PENDING_VETTING`).
- **Current Code Implementation**:
  In `CounselorDashboard.jsx:L426-478`, all assigned users regardless of status are displayed in a single unified "Assigned Users" tab.
- **Audit Findings**:
  - **Missing Dedicated Queue View**: Counselors do not have a dedicated vetting queue tab. Users in `DRAFT`, `VETTED_ACTIVE`, `REJECTED`, `HARD_BLOCKED`, and `DEBRIEF_REQUIRED` are mixed into one table.
  - **Missing Completion Gate Visibility**: The table does not indicate whether the member's profile is 100% complete or which fields are missing before the counselor begins reviewing.
  - **Status**: `Deviation` (Severity: Moderate).

---

### Screen 18: Vetting Review & Decision Screen
- **Architecture Specification (§6, §11.C #18, §12.4, §13)**:
  Comprehensive candidate evaluation interface:
  1. Profile Completeness Verification: Must display 100% verification badge. Backend strictly rejects approval if completion < 100% (`userService.ts`).
  2. Media Verification: Exactly 3 high-resolution profile photos, 60-second video introduction with player.
  3. Identity & Verification Data: Date of birth, verified social media links (LinkedIn, Instagram, Facebook), residential address, salary tier, occupation.
  4. Pastoral Decision Action (§13):
     - `APPROVE`: Transitions user to `VETTED_ACTIVE`, opens mobile discovery.
     - `REJECT`: Requires pastoral feedback notes. Allows candidate to edit and resubmit.
     - `HARD_BLOCK`: Permanent disqualification for non-serious, fraudulent, or malicious submissions. Requires mandatory logged reason.
  - Endpoint: `POST /api/vetting/users/:userId/review` with `{ decision, reason, notes }`.
- **Current Code Implementation**:
  In `CounselorDashboard.jsx:L507-586`, review is implemented as a simple modal with a decision dropdown (`APPROVE`, `REJECT`, `HARD_BLOCK`) and a single textarea for "Pastoral Notes / Feedback".
- **Audit Findings**:
  - **Critical Evaluation Defect**: The modal **does not display the candidate's photos, video intro, social links, work history, or profile completion breakdown**. The counselor is expected to approve or reject a user blind without inspecting the submission evidence.
  - **Status**: `Deviation` (Severity: Critical).

---

### Screen 19: Active Matches Oversight
- **Architecture Specification (§8, §11.C #19, §12.5, §12.8)**:
  Oversight view for counselors to monitor active couple relationships involving their assigned counselees:
  - Displays: Male Candidate & Female Candidate, Formation Date, Current Match Status (`IN_CONVERSATION`, `COURTSHIP`), Communication Activity Level, Scheduled/Confirmed Meeting Events.
  - Actions: Open Counselor Group Chat, Log Pastoral Consultation Note, Mark Relationship Ended.
  - Endpoint: `GET /api/counselor/active-matches` (or `GET /api/matches?status=active`).
- **Current Code Implementation**:
  In `CounselorDashboard.jsx:L480-504`, a "Matches" tab displays a basic table with columns `Match ID`, `Status`, `Created`, `Participants`.
- **Audit Findings**:
  - **Deviation (Moderate)**: Lacks link to counselor group chat channels, meeting calendar events, or relationship health tracking.
  - **Obsolete Action**: Includes a "Create Match" manual pairing button that contradicts the automated matching engine.
  - **Status**: `Deviation` (Severity: Moderate).

---

### Screen 20: Counselor Group Chat
- **Architecture Specification (§8, §11.C #20, §12.6, §14)**:
  Three-way monitored communication channel linking the counselor with the matched couple (`counselor_group` channel type).
  - Channel participant: Counselor + Requester + Recipient.
  - Capabilities: Real-time messaging, pastoral encouragement, conflict moderation, meeting event proposals.
  - Endpoint: `GET /api/communications/conversations/:conversationId/messages`, WebSocket real-time subscription.
- **Current Code Implementation**:
  **Completely non-existent.** No chat interface, message history viewer, or socket listener exists anywhere in the frontend codebase.
- **Audit Findings**:
  - **Missing Core Capability (Critical)**: Counselors have no ability to access or communicate in counselor group channels from the web dashboard.
  - **Status**: `Missing` (Severity: Critical).

---

### Screen 21: Status Reset Debrief Queue
- **Architecture Specification (§8, §11.C #21, §12.4, §12.5, §13)**:
  Pastoral exit interview queue for members whose courtship ended:
  - Users are placed in `DEBRIEF_REQUIRED` status when a relationship terminates. Mobile discovery is locked until pastoral clearance.
  - Counselor conducts pastoral debrief session and submits:
    - `notes`: Reflection notes, pastoral guidance.
    - `readinessScore`: 1–10 emotional and spiritual readiness score.
  - Flips user status back to `VETTED_ACTIVE` and restores mobile discovery pool.
  - Endpoint: `POST /api/vetting/users/:userId/debrief-reset`.
- **Current Code Implementation**:
  In `CounselorDashboard.jsx:L589-664`, debrief reset is implemented as a modal triggered from the row action of a user in the assigned users list.
- **Audit Findings**:
  - **Conforms (Modal Logic)**: Correctly calls `useDebriefResetMutation` sending `notes` and `readinessScore` to `POST /api/vetting/users/:userId/debrief-reset`.
  - **Missing Queue Tab**: Debrief candidates are mixed into the general assigned users table rather than appearing in a dedicated "Exit Debrief Queue" with backlog metrics.
  - **Status**: `Conforms` (with Moderate structural refinement recommended).

---

### Screen 22: Church Profile Settings
- **Architecture Specification (§4, §11.C #22, §12.2)**:
  ChurchAdmin settings page to maintain parish profile details:
  - Official Parish Name, Alias (`aka`), Physical Address, City, State, LGA, Primary Contact Email, Phone.
  - Branch details (if `PARENT_BRANCH` denomination).
  - Endpoint: `PUT /api/churches/:id`.
- **Current Code Implementation**:
  **Completely non-existent.** ChurchAdmin has no settings tab, edit button, or configuration page.
- **Audit Findings**:
  - **Missing Screen (Moderate)**: Church administrators cannot update parish contact details, address, or administrative information.
  - **Status**: `Missing` (Severity: Moderate).

---

## 5. Restructured Page-Based Routing & Deep-Linking Architecture

### 5.1 The Monolithic Query-Param Anti-Pattern
The current web dashboard implementation relies on a monolithic single-page pattern where tabs are toggled via URL query parameters (e.g. `/dashboard/admin?tab=churches`, `/dashboard/church-admin?tab=members`, `/dashboard/counselor?tab=users`) or local component state:
```javascript
// Current anti-pattern in SuperAdminDashboard.jsx
const activeTab = searchParams.get("tab") || "overview";
return (
  <DashboardLayout sidebar={sidebar}>
    {activeTab === "overview" && <OverviewSection />}
    {activeTab === "churches" && <ChurchesSection />}
    {activeTab === "users" && <UsersSection />}
    {activeTab === "admins" && <AdminsSection />}
    {activeTab === "counselors" && <CounselorsSection />}
    {activeTab === "matches" && <MatchesSection />}
  </DashboardLayout>
);
```

#### Major Architectural Flaws of this Pattern:
1. **Lack of RESTful Deep-Linking**: Resources lack canonical URL identifiers. An administrator cannot share a link directly to a church profile, an appeal case, a member's vetting dossier, or an active couple's oversight channel.
2. **Broken Browser History & State Resets**: Switching tabs mutates query parameters or local state without true route transitions. Browser Back/Forward buttons behave inconsistently, and refreshing often wipes out modal dialog states, sub-selections, and filters.
3. **No Code Splitting (Bundle Bloat)**: The entire 1,100-line dashboard file—including all modals, sub-tables, and mutations for every tab—loads in a single bundle on initial mount, degrading performance.
4. **Cramped Modals for Complex Workflows**: Critical administrative workflows (such as vetting candidate evaluation, church profile editing, and exit debriefs) are forced into narrow modal dialogs (`<Modal size="md">`), making it impossible to render rich evidence (video intros, high-res photos, completion checklists, and historical logs) with proper ergonomics.
5. **No Breadcrumb Hierarchy**: Users lose visual location context when navigating between overview metrics, listings, and detailed records.

---

### 5.2 Canonical Route Tree Specification

To achieve true separation of concerns, maintainability, and clean deep-linking, the web application must be restructured into two dedicated route hierarchies utilizing React Router nested layouts (`<Outlet />`):

```
Platform Route Hierarchy
│
├── /login, /forgot-password, /reset-password (Auth Zone)
│
├── /admin (SuperAdmin Portal Root — AdminLayout)
│   ├── /admin                                      (Platform Overview & Analytics)
│   ├── /admin/churches                             (Church Directory & Filters)
│   │   ├── /admin/churches/new                     (Create Church — Onboarding Model + Pastor Capture)
│   │   └── /admin/churches/:id                     (Church Detail, Edit & Governance Roster)
│   ├── /admin/users                                (Platform User Management & Status Oversight)
│   │   └── /admin/users/:id                        (User Dossier & Audit View)
│   ├── /admin/church-admins                        (Church Administrators Directory)
│   │   └── /admin/church-admins/new                (Create 1:1 ChurchAdmin with Pastoral Title)
│   ├── /admin/counselors                           (Platform Counselors Directory)
│   ├── /admin/appeals                              (Appeals Queue — Hard-Blocked Candidates)
│   │   └── /admin/appeals/:id                      (Appeal Detail & Adjudication Workspace)
│   └── /admin/subscriptions                        (Revenue Analytics, Plans & Transaction Logs)
│
└── /church (Unified Church Dashboard Root — ChurchLayout)
    ├── /church                                     (Parish Overview & Role-Tailored Metrics)
    ├── /church/members                             (Parish Member Directory)
    │   └── /church/members/:id                     (Member Profile Detail — Role-Gated Privacy Firewall)
    ├── /church/counselors                          (Counselor Management — ChurchAdmin Only)
    │   ├── /church/counselors/new                  (Create Counselor Modal / Page)
    │   └── /church/counselors/:id                  (Counselor Profile & Caseload)
    ├── /church/vetting                             (Dedicated Vetting Queue — Counselor / Pastor)
    │   └── /church/vetting/:id                     (Vetting Evaluation & Evidence Decision Workspace)
    ├── /church/matches                             (Active Matches Oversight — Counselor Only)
    │   └── /church/matches/:id                     (Relationship Health & Meeting Event Logs)
    ├── /church/chats/:conversationId               (Counselor Group Chat — 3-Way Monitored Channel)
    ├── /church/debriefs                            (Status Reset Debrief Queue — Counselor Only)
    │   └── /church/debriefs/:id                    (Pastoral Exit Interview Workspace)
    └── /church/settings                            (Church Profile Settings — ChurchAdmin Only)
```

---

### 5.3 Dedicated Resource Pages vs Cramped Modals

Every major entity receives a dedicated page with structured layouts, rich cards, and contextual action headers:

#### 1. Church Detail & Edit Page (`/admin/churches/:id`)
- **Header**: Church Official Name, Alias (`aka`), Status Badge (`active`, `suspended`, `pending`), Onboarding Model Badge (`PARENT_BRANCH` vs `INDIVIDUAL_PARISH`), Quick Action Buttons ("Edit Profile", "Suspend/Activate Church").
- **Grid Section 1 (Overview & Location)**: Address, City, LGA, State, Country, Date Onboarded.
- **Grid Section 2 (Pastoral Governance)**: Senior Pastor Name, Email, Phone; Assigned 1:1 ChurchAdmin details.
- **Grid Section 3 (Parish Personnel & Health)**: Active Counselors list for this church with caseload metrics, Total Registered Members, Verified Active Members.

#### 2. Vetting Evaluation Workspace (`/church/vetting/:id`)
- Replaces the inadequate modal in `CounselorDashboard.jsx:L507-586` with a full-screen, two-column evaluation workspace:
  - **Left Column (Evidence Review)**:
    - 100% Completion Breakdown: Visual checklist verifying all 10 mandatory vetting weights (basic info, church branch, residential address, 2-of-3 verified socials, income tier, 3 photos, video intro).
    - Media Gallery: Photo carousel displaying exactly 3 submitted photos with zoom capability.
    - Video Intro: Embedded HTML5/Cloudinary video player (<1 minute playback) with audio/liveness verification controls.
    - Personal & Spiritual Background: Occupation, education, origin, church background, interests tags.
  - **Right Column (Pastoral Decision Console)**:
    - Current Vetting Status.
    - Pastoral Decision Selector: `APPROVE` (activates into discovery pool), `REJECT` (requires pastoral correction feedback sent to applicant), `HARD_BLOCK` (permanent disqualification for malicious/non-serious submissions).
    - Pastoral Notes & Rationale Textarea.
    - Action Buttons: "Submit Decision & Notify Member".

#### 3. Member Profile Detail Page (`/church/members/:id`)
- Replaces the misplaced dater `UserDashboard.jsx` when inspected by administrators or counselors:
  - **Privacy Tier Firewall Enforcement**:
    - If viewer role is `ChurchAdmin`: Automatically hides/redacts salary tier, street address, and verified social media handles.
    - If viewer role is `Counselor` or `Pastor`: Displays full profile if member is assigned or under audit.
  - **Assignment Banner**: Displays assigned counselor with quick re-assignment dropdown.
  - **Vetting History Card**: Timestamped log of previous vetting decisions and counselor feedback.

#### 4. Appeals Adjudication Workspace (`/admin/appeals/:id`)
- Enables SuperAdmin to review hard-blocked accounts:
  - Displays original vetting counselor, date of block, counselor's blocking rationale.
  - Candidate's formal appeal statement.
  - Adjudication Actions: `APPROVE` (restores candidate to `PENDING_VETTING`), `REJECT` (upholds permanent ban).

---

### 5.4 Table Deep-Linking & Clickable Resource Standards

All data tables across both portals must adhere to strict deep-linking conventions. Resource names, IDs, and avatars must not be static text; they must be semantic React Router `<Link>` elements.

#### Deep-Linking Contract Across Tables:

```jsx
// 1. Church List Table (/admin/churches)
{
  key: "officialName",
  label: "Church Name",
  render: (_, row) => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
        {row.officialName?.[0]}
      </div>
      <div>
        <Link
          to={`/admin/churches/${row.id}`}
          className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors block"
        >
          {row.officialName}
        </Link>
        {row.aka && <span className="text-xs text-gray-500">({row.aka})</span>}
      </div>
    </div>
  ),
}

// 2. Member Directory Table (/church/members)
{
  key: "name",
  label: "Member",
  render: (_, row) => (
    <div className="flex items-center gap-3">
      <Link to={`/church/members/${row.accountId || row.id}`}>
        <img
          src={row.photoUrl || row.profilePictureUrl || "/avatar-placeholder.png"}
          alt=""
          className="w-9 h-9 rounded-full object-cover border border-gray-200"
        />
      </Link>
      <div>
        <Link
          to={`/church/members/${row.accountId || row.id}`}
          className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors block"
        >
          {row.firstName} {row.lastName}
        </Link>
        <span className="text-xs text-gray-500">{row.email}</span>
      </div>
    </div>
  ),
}

// 3. Vetting Queue Table (/church/vetting)
{
  key: "name",
  label: "Applicant",
  render: (_, row) => (
    <Link
      to={`/church/vetting/${row.accountId || row.id}`}
      className="font-medium text-blue-600 hover:underline flex items-center gap-2"
    >
      <span>{row.firstName} {row.lastName}</span>
      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
        Review Dossier →
      </span>
    </Link>
  ),
}

// 4. Counselor List Table (/church/counselors)
{
  key: "name",
  label: "Counselor",
  render: (_, row) => (
    <Link
      to={`/church/counselors/${row.accountId || row.id}`}
      className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors"
    >
      {row.firstName} {row.lastName}
    </Link>
  ),
}

// 5. Active Matches Table (/church/matches)
{
  key: "participants",
  label: "Couples / Match",
  render: (_, row) => (
    <Link
      to={`/church/matches/${row.id}`}
      className="font-medium text-blue-600 hover:underline"
    >
      {row.participants?.map((p) => `${p.firstName} ${p.lastName}`).join(" & ")}
    </Link>
  ),
}
```

#### Breadcrumb Navigation Component Standard:
Every detail page must include a breadcrumb header providing immediate parent context:
```jsx
// Example Breadcrumb on /church/members/:id
<Breadcrumbs
  items={[
    { label: "Members", href: "/church/members" },
    { label: `${member.firstName} ${member.lastName}`, href: `/church/members/${member.id}`, active: true },
  ]}
/>
```

---

### 5.5 Shell Layout Restructuring with React Router `<Outlet />`

Instead of passing sidebars as prop-drilled components into a single `DashboardLayout.jsx`, the architecture establishes two dedicated nested layout wrappers:

#### 1. `<AdminLayout />` (`/frontend/src/layouts/AdminLayout.jsx`)
- Enforces role gate: `SuperAdmin` only.
- Fixed sidebar containing navigation links (`NavLink` with active states):
  - Overview (`/admin`)
  - Churches (`/admin/churches`)
  - Users (`/admin/users`)
  - Church Admins (`/admin/church-admins`)
  - Counselors (`/admin/counselors`)
  - Appeals Queue (`/admin/appeals`)
  - Subscriptions (`/admin/subscriptions`)
- Header with SuperAdmin account details and logout button.
- Main content area rendering `<Outlet />`.

#### 2. `<ChurchLayout />` (`/frontend/src/layouts/ChurchLayout.jsx`)
- Enforces role gate: `ChurchAdmin`, `Counselor`, `Pastor`, `SuperAdmin`.
- Unified sidebar dynamically filtering navigation links based on `user.role`:
  ```javascript
  const getNavLinks = (role) => [
    { label: "Overview", href: "/church", roles: ["ChurchAdmin", "Counselor", "Pastor"] },
    { label: "Members", href: "/church/members", roles: ["ChurchAdmin", "Counselor", "Pastor"] },
    { label: "Vetting Queue", href: "/church/vetting", roles: ["Counselor", "Pastor"] },
    { label: "Counselors", href: "/church/counselors", roles: ["ChurchAdmin"] },
    { label: "Active Matches", href: "/church/matches", roles: ["Counselor"] },
    { label: "Exit Debriefs", href: "/church/debriefs", roles: ["Counselor"] },
    { label: "Parish Settings", href: "/church/settings", roles: ["ChurchAdmin"] },
  ].filter(item => item.roles.includes(role));
  ```
- Main content area rendering `<Outlet />`.

---

### 5.6 Institutional Church Governance & Operational Dynamics (ChurchAdmin Institutional Leader vs Counselor Operations Hub)

Grounded in the refined product architecture, the platform models church governance as a streamlined, denomination-agnostic two-tier institutional ecosystem balancing administrative management and operational mentoring:

> [!IMPORTANT]
> **Ecclesiastical & Religious Agnosticism:**
> Religious organizations and faith traditions vary widely in how they designate leadership (e.g. *Pastor*, *Priest*, *Reverend*, *Minister*, *Imam*, *Rabbi*, *General Overseer*, or *Parish Director*). 
> Modeling a discrete system role called `Pastor` is denominationally restrictive. In reality, the spiritual leader / head of the church serves as the **`ChurchAdmin`** (the organizational head). 
> The leader's specific designation (e.g., `"Senior Pastor"`, `"Reverend Father"`, `"Resident Minister"`, `"Imam"`) is captured as a customizable `title` attribute on the `ChurchAdmin` profile, maintaining clean religious neutrality while preserving a strict 4-tier system RBAC (`SuperAdmin`, `ChurchAdmin`, `Counselor`, `User`).

```
┌────────────────────────────────────────────────────────────────────────┐
│             CHURCH ADMIN (Institutional Leader & Parish Head)          │
│   • Head / spiritual leader of the parish (Title: Pastor, Priest, etc.)│
│   • Full administrative management (creates & manages counselors)      │
│   • Member intake & triage (assigns members to counselors)             │
│   • Top-level oversight: can step in on vetting escalations & appeals  │
│   • Parish profile, campus address, and settings management            │
│   • Structurally excluded from dating discovery by design              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ (Manages, Assigns & Oversees)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       COUNSELOR (Operations Hub)                       │
│   • Does 90% of day-to-day activities:                                │
│       - Daily Vetting Queue (evaluate photos, video intro, dossier)    │
│       - 3-Way Counselor Group Chats with dating couples                │
│       - Meeting / Calendar event confirmations & safety review         │
│       - Exit Debriefs & Status Reset before members can re-enter pool  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Role Breakdown & Screen Mapping:

| Role & Focus | Core Daily Activities | Key Screen Routes | Data Access & Privacy Boundaries |
|---|---|---|---|
| **Counselor**<br>*(Daily Operations Hub)* | **90% of hands-on platform workload:**<br>1. Reviews applicant dossiers in Vetting Queue.<br>2. Verifies 100% profile gate (photos, video intro, denomination).<br>3. Executes vetting decisions (`approved`, `denied`, `hard_blocked`).<br>4. Actively monitors courtship in 3-way monitored Counselor Group Chat.<br>5. Confirms/approves dating meeting calendar events.<br>6. Conducts exit debriefs when relationships end before resetting candidate pool. | • `/church/vetting` (Queue)<br>• `/church/vetting/:id` (Dossier & Decision)<br>• `/church/matches` (Active Matches)<br>• `/church/chats/:conversationId` (Group Chat)<br>• `/church/debriefs` (Exit Debriefs)<br>• `/church/members` (Assigned Counselees) | • **Full dossier access** for assigned counselees (salary, residential address, social links, preferences).<br>• Cannot view or manage other counselors' non-assigned counselees unless reassigned. |
| **ChurchAdmin**<br>*(Institutional Leader & Parish Operations)* | **Administrative stewardship & parish governance:**<br>1. Onboards and manages church counselors (`/church/counselors`).<br>2. Triage & assignment: routes newly registered parish members to counselors.<br>3. Institutional oversight: steps in on contentious vetting appeals, ethical concerns, or relationship disputes.<br>4. Monitors high-level parish metrics (member counts, counselor caseloads).<br>5. Manages parish profile, branches, and contact settings. | • `/church` (Parish Overview)<br>• `/church/members` (Directory & Assign Dropdown)<br>• `/church/members/:id` (Member Profile)<br>• `/church/counselors` (Counselor Management)<br>• `/church/vetting` (Oversight Vetting Queue)<br>• `/church/settings` (Parish Info & Profile) | • **Administrative View with Safeguarding:** General member directory is safeguarded against gossip; sensitive dating criteria and salary tiers are firewalled unless acting in formal vetting oversight.<br>• **Structurally excluded** from dating discovery (no dating profile row in database). |

#### End-to-End Operational Lifecycle:
1. **Intake & Assignment**: User registers on mobile -> ChurchAdmin sees new applicant in `/church/members` directory -> ChurchAdmin assigns member to Counselor Sister Mary (`POST /api/church-admin/assign-counselor`).
2. **Vetting Decision**: Member completes profile 100% -> Candidate appears in Sister Mary's priority queue (`/church/vetting`) -> Sister Mary evaluates 3 photos, intro video, and background in `/church/vetting/:id` -> Submits `approved` (or `denied` / `hard_blocked`). *ChurchAdmin can step in and action any dossier as institutional head if needed.*
3. **Active Courtship & Group Chat**: Two vetted users match on mobile -> System creates private couple chat and 3-way `counselor_group` chat (`/church/chats/:conversationId`) -> Both assigned counselors monitor communication and approve calendar events.
4. **Relationship End & Exit Debrief**: If couple parts ways, candidate enters `DEBRIEF_REQUIRED` status -> Candidate is locked from mobile discovery -> Appears in Counselor's `/church/debriefs` queue -> Counselor conducts pastoral exit interview, enters notes and readiness score (`POST /api/vetting/users/:userId/debrief-reset`) -> User status resets to `VETTED_ACTIVE` and returns to mobile discovery.

---

## 6. Misplaced Artifacts & Obsolete Flows Deep-Dive

### Screen M1: User Dating Dashboard (`UserDashboard.jsx`)
- **Architecture Specification (§1, §2, §10)**:
  Under the rebuilt system architecture, **Daters (regular users) operate exclusively on the Mobile App (React Native/Expo)**. The web frontend is strictly an administrative portal for SuperAdmin, ChurchAdmin, Counselor, and Pastor.
- **Current Code Implementation**:
  [`frontend/src/pages/UserDashboard.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/UserDashboard.jsx) (972 lines) exists as a full dater self-service interface:
  - Profile editing: Date of birth, occupation, origin country/state/LGA, residence country/state/city/address, match preference (`my_church`, etc.).
  - Media uploading: Profile photo avatar upload via file input (`useUploadProfileImageMutation`).
  - Social handles: Add and delete curated social platforms (`useCreateUserSocialMediaMutation`, `useDeleteUserSocialMediaMutation`).
  - Match acceptance/decline: Active match card with "Accept" and "Decline" buttons calling `handleMatchDecision` (`POST /matches/:matchId/decision`).
- **Audit Findings**:
  - **Misplaced Portal Artifact (Critical)**: Dating workflows do not belong in the web admin codebase. Regular users should not have a web dashboard login.
  - **Dual-Purpose Coupling**: Because `UserDashboard.jsx` was also used as the target for "View Details" from admin and counselor tables (`/dashboard/user/:id`), removing or refactoring it requires creating a clean, dedicated `MemberProfileDetailModal` or `MemberProfilePage` that adheres to the §2 privacy firewall.
  - **Status**: `Deviation` (Severity: Critical).

---

### Screen M2: Subscription Checkout (`SubscriptionPage.jsx`)
- **Architecture Specification (§1, §10 Screen 39–42, §12.7)**:
  Subscription tier selection, payment gateway checkout (Paystack/Stripe), and billing history belong to the mobile app for daters, and revenue analytics belongs to SuperAdmin.
- **Current Code Implementation**:
  [`frontend/src/pages/SubscriptionPage.jsx`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/pages/SubscriptionPage.jsx) (159 lines):
  - Hardcodes a single tier card ("Kingdom Premium" for ₦10,000/year).
  - In lines 19–26, executes a raw `fetch` call bypassing `apiClient` and TanStack Query:
    ```javascript
    const response = await fetch('http://localhost:5000/api/auth/subscription', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tier: 'premium' })
    });
    ```
- **Audit Findings**:
  - **Hardcoded Localhost URL (Critical)**: Direct usage of `'http://localhost:5000'` breaks in production environments.
  - **Non-Existent Endpoint**: Endpoint `PUT /api/auth/subscription` does not exist on the backend; the backend subscription endpoints are mounted under `/api/subscriptions/*` (`subscriptionRoutes.ts`).
  - **Bypassed Architecture**: Bypasses `apiClient`, authentication interceptors, and React Query state cache.
  - **Status**: `Deviation` (Severity: Critical).

---

### Screen M3: Legacy Manual Match Creation Flow
- **Architecture Specification (§7, §8, §12.5)**:
  Matching is an automated, algorithmic system:
  1. Opposites-attract candidates appear in the mobile discovery feed (`GET /api/discovery/feed`).
  2. Users initiate match requests with a strict 3-slot cap (`POST /api/requests/send`).
  3. Recipients accept (`POST /api/requests/:id/accept`) or decline with blind rejection (`POST /api/requests/:id/decline`).
  4. Manual pairing by administrators or counselors was an early MVP prototype that has been superseded.
- **Current Code Implementation**:
  All three web dashboard pages retain a "Create Match" button and modal:
  - `SuperAdminDashboard.jsx:L991-1078`
  - `ChurchAdminDashboard.jsx:L632-719`
  - `CounselorDashboard.jsx:L667-755`
  All call `useCreateManualMatchMutation` calling `POST /api/matches`.
- **Audit Findings**:
  - **Obsolete Flow**: Retaining manual match creation in admin dashboards leads to state inconsistency with the 3-slot limit and conversation channel initialization.
  - **Status**: `Deviation` (Severity: Moderate).

---

## 7. Cross-Cutting Architectural Audits

### 7.1 State Management & Server State (TanStack Query)
- **Architecture Standard**:
  All server state must be managed via TanStack Query hooks with systematic query key factories and automatic cache invalidation on mutations.
- **Audit Findings**:
  - **Conforms (Core Services)**: Query key factory in [`queryKeys.js`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/api/queryKeys.js) is well-structured across `auth`, `admin`, `churches`, `churchAdmin`, `counselor`, `users`, and `matches`.
  - **Deviation**: Several modals (e.g. `CreateCounsellorModal.jsx:L28`) execute service calls directly through local state handlers (`handleCreateCounselor`) without `useMutation`, requiring manual callback props like `fetchCounselors()` to trigger refetches.
  - **Deviation**: `SubscriptionPage.jsx` uses raw `fetch` and local `useState`.

### 7.2 API Client & Response Envelope Unwrapping
- **Architecture Standard (§1)**:
  All endpoints return the unified envelope:
  ```json
  { "success": true, "message": "string", "data": {}, "errors": null }
  ```
  The API client should unwrap the response envelope centrally so consumer hooks interact cleanly with data payloads.
- **Audit Findings**:
  - **Deviation**: [`apiClient.js:L25`](file:///c:/Users/hp/Documents/Personal%20Documents/Software-Development/clients/lifeline/frontend/src/api/apiClient.js#L25) has response interceptor `(response) => response`.
  - Every service method must manually do `return response.data`.
  - In components, queries often have to perform defensive multi-level checks:
    ```javascript
    const overviewData = overviewQuery.data?.success && overviewQuery.data?.data
      ? overviewQuery.data.data
      : { ... };
    ```
  - Centralizing data unwrapping in `apiClient.js` will eliminate boilerplate and inconsistencies.

### 7.3 RBAC, Authentication & Routing Gates
- **Architecture Standard (§2)**:
  Clean 4-tier RBAC: `SuperAdmin`, `ChurchAdmin`, `Counselor`, `User`. User role is mobile-only. Layout gates protect unauthorized route access and enforce institutional governance boundaries:
  - **Counselor**: Day-to-day operations hub (Vetting Queue, Active Matches, 3-way Group Chats, Exit Debriefs). Full dossier access for assigned counselees.
  - **ChurchAdmin**: Institutional leader and parish administrator (creates and manages counselors, member triage & assignment, church settings, and escalation oversight). The leader's ecclesiastical title (e.g. Pastor, Priest, Imam, Minister, Reverend) is captured via a customizable `title` attribute. General administrative views enforce privacy safeguarding against sensitive dating data.
  - **Structural Exclusion**: Both `ChurchAdmin` and `Counselor` have no profile relation to `UserProfile`, ensuring zero discovery appearance by schema design.
- **Audit Findings**:
  - **Ecclesiastical Agnosticism**: The platform avoids denomination-specific role coupling by consolidating church leadership directly into `ChurchAdmin`, using the `title` attribute for specific honorifics.
  - **User Role in Web App**: In early prototypes `User` role accessed web screens; this is now clarified as mobile-only, with informative landing notices on web.
  - **Privacy Firewall Enforcement**: Delivered in `MemberDetailPage.jsx` and `userService.ts`, masking dating criteria and salary tiers for general administrative views.

### 7.4 Component Primitives & Styling
- **Architecture Standard (§14)**:
  Tailwind CSS styling with consistent design tokens, unified component primitives, and accessible interactive states.
- **Audit Findings**:
  - Primitives exist in `frontend/src/components/`: `Button.jsx`, `Input.jsx`, `Modal.jsx`, `ConfirmModal.jsx`, `ActionMenu.jsx`, `Toast.jsx`.
  - `Table.jsx` lacks built-in pagination, sorting, or empty state illustrations.
  - `ActionMenu.jsx` uses relative positioning with absolute menu overlays that can be clipped by parent `overflow-x-auto` table containers.

---

## 8. Strategic Remediation Roadmap

To bring the frontend web application into full alignment with the new system architecture and page-based routing standards, implementation should proceed in three structured phases:

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: Foundation, Layouts & Page-Based Routing Shell│
│ - Build AdminLayout & ChurchLayout with <Outlet />     │
│ - Configure canonical routes (/admin/* and /church/*)  │
│ - Integrate Pastor role in RBAC, Routing & Layout      │
│ - Fix churchAdmin dashboard route inversion bug        │
│ - Centralize envelope unwrapping in apiClient          │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 2: SuperAdmin Governance Portal Rebuild          │
│ - Build /admin/churches/:id (Church Detail & Edit page)│
│ - Fix Create Church form (ParentBranch + Pastor capture)│
│ - Build /admin/appeals & /admin/appeals/:id pages      │
│ - Add Pastoral Title to ChurchAdmin Creation form      │
│ - Build /admin/subscriptions (Revenue analytics page)  │
│ - Add clickable table deep-links across all admin lists│
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 3: Unified Church Dashboard & Counselor Workspace│
│ - Build /church/vetting (Dedicated Vetting Queue page) │
│ - Build /church/vetting/:id (Full Evaluation Workspace)│
│ - Build /church/members/:id (Privacy-Gated Detail Page)│
│ - Build /church/chats/:conversationId (Group Chat page)│
│ - Build /church/settings (Parish settings page)        │
│ - Add clickable table deep-links across church tables  │
│ - Deprecate UserDashboard & SubscriptionPage from web  │
│ - Purge obsolete manual matchmaking modals            │
└────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation, Layouts & Page-Based Routing Shell (Completed)
1. **Layout Shells & Nested Routing Architecture (Completed)**:
   - Created `src/layouts/AdminLayout.jsx` with SuperAdmin navigation, responsive drawer, user footer, and `<Outlet />`.
   - Created `src/layouts/ChurchLayout.jsx` with dynamically role-gated navigation (ChurchAdmin, Counselor, Pastor), role badge, and `<Outlet />`.
   - Configured React Router nested routes in `App.jsx` for `/admin/*` and `/church/*`.
   - Created `ChurchPortalPage.jsx` for dynamic role-aware routing of church sections.
2. **Support Pastor Role (Completed)**:
   - Updated `App.jsx`, `ProtectedRoute.jsx`, and `DashboardRedirect` to recognize `Pastor` and route them to `/church`.
3. **Fix Critical Route Bug (Completed)**:
   - Fixed `churchAdminService.getDashboard` to request `/church-admin/dashboard/${accountId}` matching backend `GET /dashboard/:id`.
4. **Fix Layout CSS (Completed)**:
   - Corrected `ibox-0` typo to `inset-y-0` in `DashboardLayout.jsx`.
5. **Table Deep-Linking (Completed)**:
   - Added clickable React Router `<Link>` components to user names and profile images in `SuperAdminDashboard`, `ChurchAdminDashboard`, and `CounselorDashboard` directing to `/dashboard/user/:accountId`.

### Phase 2: SuperAdmin Governance Portal Rebuild (Completed)
1. **Dedicated Church Detail & Edit Page (`/admin/churches/:id`) (Completed)**:
   - Implemented in `src/pages/ChurchDetailPage.jsx` mounted at `/admin/churches/:id`.
   - Features: Overview KPI metrics, pastoral contacts, 1:1 ChurchAdmin profile, assigned counselor roster, parish members table with vetting badges, and parish profile edit modal calling `PUT /api/churches/:id`.
2. **Fixed Create Church Schema & Form (Completed)**:
   - Added `modelType` dropdown (`PARENT_BRANCH` vs `INDIVIDUAL_PARISH`).
   - Added Senior Pastor capture fields: `pastorName`, `pastorEmail`, `pastorPhone`.
   - Added `country: "Nigeria"` default to prevent backend 400 schema validation errors.
3. **Create ChurchAdmin Pastoral Title Field (Completed)**:
   - Added `title` input (`Senior Pastor`, `Resident Pastor`, `Parish Administrator`) to modal state and payload.
4. **Appeals Queue & Adjudication Workspace (`/admin/appeals` & `/admin/appeals/:id`) (Completed)**:
   - Added backend endpoints: `GET /api/vetting/appeals` and `GET /api/vetting/appeals/:appealId` in `vettingRoutes.ts`, `vettingController.ts`, and `vettingService.ts`.
   - Added client integration: `getAppeals`, `getAppeal`, `reviewAppeal` in `adminService.js` and React Query hooks in `admin.js`.
   - Built `src/pages/AppealsQueuePage.jsx` supporting both tabular queue view and 2-column adjudication workspace with `APPROVE` and `REJECT` decision triggers.
5. **Revenue & Subscription Analytics Page (`/admin/subscriptions`) (Completed)**:
   - Implemented in `src/pages/SubscriptionAnalyticsPage.jsx` mounted at `/admin/subscriptions`.
   - Features: MRR, ARR, active subscriber counters, plan comparison cards (Standard vs Kingdom Premium), and live transaction log.
6. **Deep-Linking on SuperAdmin Tables (Completed)**:
   - Churches table: `<Link to={`/admin/churches/${row.id}`}>` on church name.
   - Users table: `<Link to={`/dashboard/user/${row.accountId}`}>` on user name and avatar.
   - Appeals table: `<Link to={`/admin/appeals/${appeal.id}`}>` on candidate name and queue action.

### Phase 3: Unified Church Dashboard & Counselor Operations (Completed)
1. **Dedicated Vetting Queue & 2-Column Evaluation Workspace (`/church/vetting` & `/church/vetting/:id`) (Completed)**:
   - Implemented in `src/pages/VettingQueuePage.jsx` mounted at `/church/vetting` and `/church/vetting/:id`.
   - Queue view: status tabs (`ALL`, `PENDING`, `DEBRIEF`, `ACTIVE`, `REJECTED`), name/email search, video introduction presence badges, and direct links to evaluation dossiers.
   - Adjudication workspace: HTML5 video introduction streaming player, candidate verification photo gallery with lightbox, spiritual background, safeguarding checklist, and decision controls (`APPROVE`, `REJECT` with mandatory reason, `DEBRIEF_RESET`, `HARD_BLOCK`).
2. **Privacy-Gated Member Profile Detail Page (`/church/members/:id`) (Completed)**:
   - Implemented in `src/pages/MemberDetailPage.jsx` mounted at `/church/members/:id`.
   - Privacy Firewall: Strictly enforces §2 RBAC by displaying an administrative view for `ChurchAdmin` with sensitive matchmaking criteria, financial salary tiers, and external match partners firewalled.
   - Privileged View: Full spiritual counseling dossier, candidate gallery, video intro player, and vetting notes accessible to assigned `Counselor` and `SuperAdmin`.
   - Integrated "Assign / Reassign Counselor" modal with live counselor selection.
3. **Counselor 3-Way Monitored Group Chat (`/church/chats` & `/church/chats/:conversationId`) (Completed)**:
   - Added `communicationService.js` and React Query hooks in `communication.js` (`useConversationsQuery`, `useConversationMessagesQuery`, `useSendMessageMutation`, `useCalendarEventsQuery`, `useRespondCalendarEventMutation`).
   - Implemented in `src/pages/MonitoredChatsPage.jsx` mounted at `/church/chats` and `/church/chats/:conversationId`.
   - Features: Split-pane conversation selector, 3-way monitored conversation thread with role badges (`Candidate A`, `Candidate B`, `Pastoral Counselor`), calendar meetup approval alerts, counselor spiritual guidance composer, and "Conclude Courtship & Mandate Debrief" action.
4. **Parish Profile & Pastoral Settings (`/church/settings`) (Completed)**:
   - Implemented in `src/pages/ParishSettingsPage.jsx` mounted at `/church/settings`.
   - Allows `ChurchAdmin` to manage official church name, alias, address, parish email/phone, and Senior Pastor oversight details via `PUT /api/churches/:id`.
5. **Deprecation & Modernization of Misplaced Web Artifacts (Completed)**:
   - Removed obsolete manual match creation modal and action items from `CounselorDashboard.jsx` and `ChurchAdminDashboard.jsx`.
   - Modernized `SubscriptionPage.jsx` with `apiClient` and added an explicit architectural notice directing candidates to the native mobile app (React Native / Expo).
   - Strict 4-tier RBAC (`SuperAdmin`, `ChurchAdmin`, `Counselor`, `User`) enforced across backend routes and services.

---

*Report generated and committed to project root as `frontend_audit_report.md`.*
