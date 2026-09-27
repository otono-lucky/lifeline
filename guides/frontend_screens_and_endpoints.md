# Lifeline Platform — Frontend Screens, Usecases & Supporting Endpoints Directory

> **Architectural Boundary Notice**:
> Under the Lifeline platform architecture, the **Web Frontend (`frontend/`) is strictly an administrative portal** dedicated to platform governance (`SuperAdmin`), institutional parish leadership (`ChurchAdmin`), and spiritual counseling / safeguarding operations (`Counselor`). 
> **Regular Daters (`User`) operate exclusively on the Mobile App (`mobile/` - React Native / Expo)** for candidate discovery, match requests, private chats, date coordination, and profile onboarding.

---

## Table of Contents
1. [Architectural Overview & RBAC Hierarchy](#1-architectural-overview--rbac-hierarchy)
2. [Part I: SuperAdmin Governance Portal (`/admin/*`)](#part-i-superadmin-governance-portal-admin)
   - [Screen 1: Platform Overview Dashboard](#screen-1-platform-overview-dashboard)
   - [Screen 2: Church Registry Directory](#screen-2-church-registry-directory)
   - [Screen 3: Create Church Workflow](#screen-3-create-church-workflow)
   - [Screen 4: Dedicated Church Detail & Governance Page](#screen-4-dedicated-church-detail--governance-page)
   - [Screen 5: Church Administrators Directory](#screen-5-church-administrators-directory)
   - [Screen 6: Create 1:1 ChurchAdmin Workflow](#screen-6-create-11-churchadmin-workflow)
   - [Screen 7: Counselors Directory](#screen-7-counselors-directory)
   - [Screen 8: Platform Users & Discovery Audit](#screen-8-platform-users--discovery-audit)
   - [Screen 9: Appeals Adjudication Queue](#screen-9-appeals-adjudication-queue)
   - [Screen 10: Dedicated Appeal Adjudication Workspace](#screen-10-dedicated-appeal-adjudication-workspace)
   - [Screen 11: Subscription & Revenue Analytics Dashboard](#screen-11-subscription--revenue-analytics-dashboard)
   - [Screen 12: Global Matchmaking & Compatibility Audit](#screen-12-global-matchmaking--compatibility-audit)
3. [Part II: Church & Pastoral Operations Portal (`/church/*`)](#part-ii-church--pastoral-operations-portal-church)
   - [Screen 13: Parish Operational Overview](#screen-13-parish-operational-overview)
   - [Screen 14: Parish Member Directory](#screen-14-parish-member-directory)
   - [Screen 15: Member Profile Detail Page with Safeguarding Firewall](#screen-15-member-profile-detail-page-with-safeguarding-firewall)
   - [Screen 16: Vetting Evaluation Queue](#screen-16-vetting-evaluation-queue)
   - [Screen 17: Dedicated 2-Column Vetting Adjudication Workspace](#screen-17-dedicated-2-column-vetting-adjudication-workspace)
   - [Screen 18: Monitored Courtship Chats Hub](#screen-18-monitored-courtship-chats-hub)
   - [Screen 19: 3-Way Monitored Group Chat Workspace](#screen-19-3-way-monitored-group-chat-workspace)
   - [Screen 20: Relationship Exit Debriefs Queue](#screen-20-relationship-exit-debriefs-queue)
   - [Screen 21: Exit Debrief Adjudication Workspace](#screen-21-exit-debrief-adjudication-workspace)
   - [Screen 22: Parish Counselor Staff Roster](#screen-22-parish-counselor-staff-roster)
   - [Screen 23: Create Counselor Account Workflow](#screen-23-create-counselor-account-workflow)
   - [Screen 24: Parish Profile & Ecclesiastical Leadership Settings](#screen-24-parish-profile--ecclesiastical-leadership-settings)
   - [Screen 25: Parish Active Matchmaking Monitor](#screen-25-parish-active-matchmaking-monitor)
4. [Part III: Authentication & Administrative System Screens](#part-iii-authentication--administrative-system-screens)
   - [Screen 26: Login Page](#screen-26-login-page)
   - [Screen 27: Password Recovery & Reset Workflows](#screen-27-password-recovery--reset-workflows)
   - [Screen 28: Email Verification Workflows](#screen-28-email-verification-workflows)
   - [Screen 29: Web Subscription Architecture Informational Notice](#screen-29-web-subscription-architecture-informational-notice)
5. [Part IV: Cross-Platform Mobile Application Reference (Daters / End Users)](#part-iv-cross-platform-mobile-application-reference-daters--end-users)

---

## 1. Architectural Overview & RBAC Hierarchy

The Lifeline platform strictly enforces a **4-tier Role-Based Access Control (RBAC)** architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LIFELINE ECOSYSTEM                              │
├───────────────────────────────────────────┬────────────────────────────┤
│           WEB FRONTEND (PORTALS)          │    MOBILE APP (DATERS)     │
│   Strict Administrative & Pastoral Ops    │ React Native / Expo Native │
├───────────────────────────────────────────┼────────────────────────────┤
│ 1. SuperAdmin: Global platform governance │ 4. User: End-user daters   │
│ 2. ChurchAdmin: 1:1 Parish leader & triage│    • 100% profile setup    │
│ 3. Counselor: Spiritual mentor & vetting  │    • Discovery feed        │
│                                           │    • Match requests (cap 3)│
│                                           │    • Private/monitored chat│
│                                           │    • Subscriptions (Paystack)
└───────────────────────────────────────────┴────────────────────────────┘
```

- **Institutional Leadership Designation**: Faith traditions vary in terminology (*Senior Pastor*, *Reverend Father*, *Imam*, *Resident Minister*, *General Overseer*). The system models the parish head strictly as **`ChurchAdmin`** (1:1 with Church), utilizing a customizable `title` attribute for ecclesiastical designation rather than hardcoding a rigid denominational role enum.
- **Privacy Safeguarding Firewall**: `ChurchAdmin` views are administratively firewalled from seeing sensitive candidate dating criteria, salary brackets, and external match partners in general congregational views. Privileged access to spiritual dossiers is restricted to assigned `Counselor`s and `SuperAdmin`.

---

## Part I: SuperAdmin Governance Portal (`/admin/*`)

### Screen 1: Platform Overview Dashboard
- **Route Path**: `/admin` (or `/admin/overview`)
- **Component**: `frontend/src/pages/SuperAdminDashboard.jsx` (within `AdminLayout.jsx`)
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**: 
  Provides the platform owner with an executive cockpit displaying cross-network health, growth KPIs, active churches, user acquisition velocity, match progression, and recent platform events. Enables immediate situational awareness without digging through raw tables.
- **Functional Requirements**:
  - High-level metric summary cards (Total Churches, Active Churches, Total Registered Daters, Vetted Active Daters, Active Couples, Pending Appeals).
  - Snapshot listings for recently registered churches and newly onboarded users.
  - Deep-links to full directories for rapid drill-down.
- **Supporting Endpoints**:
  1. `GET /api/admin/dashboard`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "overview": {
             "totalChurches": 24,
             "activeChurches": 21,
             "totalUsers": 1420,
             "vettedUsers": 980,
             "activeMatches": 86,
             "pendingAppeals": 4
           }
         }
       }
       ```
  2. `GET /api/churches?limit=5`
  3. `GET /api/users?limit=5`

---

### Screen 2: Church Registry Directory
- **Route Path**: `/admin/churches`
- **Component**: `frontend/src/pages/SuperAdminDashboard.jsx` (Tab: `churches`)
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Central institutional directory enabling SuperAdmin to audit, filter, search, and manage all registered churches and multi-parish networks. Enables verification of branch onboarding, denomination models, and parish operational states.
- **Functional Requirements**:
  - Filterable by `modelType` (`PARENT_BRANCH` vs `INDIVIDUAL_PARISH`) and status (`active`, `suspended`, `pending`).
  - Search query by church name or alias.
  - Deep-linked church names directing to `/admin/churches/:id`.
  - Action buttons to activate, suspend, or create new churches.
- **Supporting Endpoints**:
  1. `GET /api/churches?page=1&limit=20&status=active`
     - **Auth**: Bearer JWT (`SuperAdmin`, `ChurchAdmin`, `Counselor`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "churches": [
             {
               "id": "uuid",
               "officialName": "Redeemed Christian Church of God",
               "aka": "RCCG",
               "churchModel": "PARENT_BRANCH",
               "email": "hq@rccg.org",
               "phone": "+2348012345678",
               "state": "Lagos",
               "status": "active",
               "churchAdmin": { "id": "uuid", "title": "General Overseer", "account": { "firstName": "Enoch", "lastName": "Adeboye" } },
               "_count": { "counselors": 12, "members": 340 }
             }
           ]
         },
         "pagination": { "total": 24, "page": 1, "limit": 20, "totalPages": 2 }
       }
       ```
  2. `PATCH /api/churches/:id/status`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Body**: `{ "status": "active" | "suspended" }`

---

### Screen 3: Create Church Workflow
- **Route Path**: `/admin/churches` (Modal trigger: "Create Church")
- **Component**: `frontend/src/pages/SuperAdminDashboard.jsx`
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Enables SuperAdmin to formally establish a new religious institution on the platform, establishing its denomination model, geographical jurisdiction, and ecclesiastical leadership contact points.
- **Functional Requirements**:
  - Captures `officialName`, `aka` (optional acronym/alias), `country` (default: "Nigeria"), `state`, `city`, and physical `address`.
  - Captures `modelType`: `PARENT_BRANCH` (multi-parish network, e.g. RCCG) vs `INDIVIDUAL_PARISH` (autonomous congregation).
  - Captures spiritual leadership contact details (`pastorName`, `pastorEmail`, `pastorPhone`).
  - Validation: rejects duplicate church email.
- **Supporting Endpoints**:
  1. `POST /api/churches`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Request Body**:
       ```json
       {
         "officialName": "The Elevation Church",
         "aka": "TEC",
         "country": "Nigeria",
         "state": "Lagos",
         "city": "Lekki",
         "address": "Pistis Annex, 1 Elevation Way",
         "modelType": "PARENT_BRANCH",
         "email": "info@elevationng.org",
         "phone": "+2348000000000",
         "pastorName": "Pastor Godman Akinlabi",
         "pastorEmail": "leadpastor@elevationng.org",
         "pastorPhone": "+2348011112222"
       }
       ```
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "message": "Church created successfully",
         "data": { "church": { "id": "uuid", "officialName": "The Elevation Church", "status": "pending" } }
       }
       ```

---

### Screen 4: Dedicated Church Detail & Governance Page
- **Route Path**: `/admin/churches/:id`
- **Component**: `frontend/src/pages/ChurchDetailPage.jsx`
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Full-page 360-degree governance dossier for a specific church. SuperAdmin evaluates parish health, inspects the 1:1 assigned `ChurchAdmin`, reviews staff counselors, monitors registered congregants, and updates official institutional details.
- **Functional Requirements**:
  - Executive KPI Cards: Total Members, Active Counselors, Onboarding Model, Governance Status.
  - Dedicated Pastoral Leadership & 1:1 ChurchAdmin Card: Displays leader contact and assigned administrator profile with custom title badge.
  - Counselors Roster Table: Active counselors with assigned caseload counts.
  - Parish Members Table: Listing of congregants with vetting badges and direct links to user dossiers.
  - "Edit Profile" modal: Updates parish contact and leadership data via `PUT /api/churches/:id`.
  - Status toggle: Suspend/Activate church.
- **Supporting Endpoints**:
  1. `GET /api/churches/:id`
     - **Auth**: Bearer JWT (`SuperAdmin`, `ChurchAdmin`, `Counselor`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "church": {
             "id": "uuid",
             "officialName": "House on the Rock",
             "aka": "HOTR",
             "churchModel": "PARENT_BRANCH",
             "email": "hq@houseontherock.org.ng",
             "phone": "+2348022223333",
             "state": "Lagos",
             "pastorName": "Paul Adefarasin",
             "pastorEmail": "pastor@houseontherock.org.ng",
             "churchAdmin": {
               "id": "uuid",
               "title": "Resident Pastor",
               "account": { "id": "uuid", "firstName": "Gbenga", "lastName": "Ogunleye", "email": "admin@hotr.org.ng" }
             },
             "counselors": [...],
             "members": [...]
           }
         }
       }
       ```
  2. `PUT /api/churches/:id`
     - **Auth**: Bearer JWT (`SuperAdmin`, `ChurchAdmin`)
     - **Body**: `{ "officialName": "...", "aka": "...", "phone": "...", "address": "...", "pastorName": "..." }`
  3. `PATCH /api/churches/:id/status`

---

### Screen 5: Church Administrators Directory
- **Route Path**: `/admin/church-admins`
- **Component**: `frontend/src/pages/SuperAdminDashboard.jsx` (Tab: `admins`)
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Manages the network of institutional leaders and parish administrators. SuperAdmin audits administrative accounts, monitors verification status, and tracks parish assignments.
- **Functional Requirements**:
  - Lists all `ChurchAdmin` accounts with church assignment name, ecclesiastical title badge, account status, and contact info.
  - Deep-link to the church record.
  - Trigger for "Create Church Admin" modal.
- **Supporting Endpoints**:
  1. `GET /api/church-admin?page=1&limit=20`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "churchAdmins": [
             {
               "id": "uuid",
               "title": "Senior Pastor",
               "church": { "id": "uuid", "officialName": "Elevation Church" },
               "account": { "id": "uuid", "firstName": "John", "lastName": "Doe", "email": "pastor@elevation.org", "status": "active" }
             }
           ]
         }
       }
       ```

---

### Screen 6: Create 1:1 ChurchAdmin Workflow
- **Route Path**: `/admin/church-admins` (Modal trigger: "Create Church Admin")
- **Component**: `frontend/src/pages/SuperAdminDashboard.jsx`
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Assigns a primary institutional administrator and ecclesiastical head to an onboarded church. Establishes the authoritative 1:1 link that unlocks parish management for that church.
- **Functional Requirements**:
  - Church selector dropdown: **strictly disables churches that already have an assigned ChurchAdmin** with label `"(Admin Assigned — 1:1 Limit)"`.
  - Ecclesiastical title input: denomination-neutral (`Senior Pastor`, `Reverend Father`, `Resident Minister`, `Imam`).
  - Account credentials: First Name, Last Name, Email, Password, Phone.
  - Backend enforcement: $transaction creates `Account` with `role: "ChurchAdmin"` and `ChurchAdmin` with `churchId: @unique`.
- **Supporting Endpoints**:
  1. `POST /api/church-admin/create`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Request Body**:
       ```json
       {
         "churchId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
         "email": "pastor.david@covenant.org",
         "password": "TemporaryPassword123!",
         "firstName": "David",
         "lastName": "Oyekunle",
         "phone": "+2348033334444",
         "title": "Resident Pastor"
       }
       ```
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "message": "Church admin created successfully",
         "data": { "account": { "id": "uuid", "email": "pastor.david@covenant.org" }, "churchAdmin": { "id": "uuid", "title": "Resident Pastor" } }
       }
       ```

---

### Screen 7: Counselors Directory
- **Route Path**: `/admin/counselors`
- **Component**: `frontend/src/pages/SuperAdminDashboard.jsx` (Tab: `counselors`)
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Network-wide oversight of pastoral and operational counselors. Enables SuperAdmin to audit counselor distribution across parishes, monitor vetting caseloads, and verify qualifications.
- **Functional Requirements**:
  - Lists all counselors across all registered churches.
  - Displays assigned church, active counselee count, vetting log activity, and contact details.
- **Supporting Endpoints**:
  1. `GET /api/counselor/list-all?page=1&limit=20`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "counselors": [
             {
               "id": "uuid",
               "bio": "Certified Christian Relationship Counselor, 10 yrs exp",
               "church": { "id": "uuid", "officialName": "RCCG City of David" },
               "account": { "id": "uuid", "firstName": "Sarah", "lastName": "Adeyemi", "email": "sarah@cityofdavid.org" },
               "_count": { "assignedUsers": 18, "vettingLogs": 45 }
             }
           ]
         }
       }
       ```

---

### Screen 8: Platform Users & Discovery Audit
- **Route Path**: `/admin/users`
- **Component**: `frontend/src/pages/SuperAdminDashboard.jsx` (Tab: `users`)
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Global user management and integrity audit. SuperAdmin inspects onboarding velocity, filters daters across churches, verifies subscription tiers, and executes administrative suspensions.
- **Functional Requirements**:
  - Tabular listing of all users across churches.
  - Deep-link on names and avatars directing to `/dashboard/user/:accountId`.
  - Filters by vetting status (`DRAFT`, `PENDING_VETTING`, `VETTED_ACTIVE`, `REJECTED`, `HARD_BLOCKED`).
  - Action trigger: Activate / Suspend user account.
- **Supporting Endpoints**:
  1. `GET /api/users?page=1&limit=20&status=active`
     - **Auth**: Bearer JWT (`SuperAdmin`, `ChurchAdmin`, `Counselor`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "users": [
             {
               "accountId": "uuid",
               "firstName": "Emmanuel",
               "lastName": "Okonkwo",
               "email": "emmanuel@example.com",
               "vettingStatus": "VETTED_ACTIVE",
               "church": { "officialName": "Elevation Church" },
               "subscriptionTier": "KINGDOM_PREMIUM",
               "accountStatus": "active"
             }
           ]
         },
         "pagination": { "total": 1420, "page": 1, "limit": 20, "totalPages": 71 }
       }
       ```
  2. `PATCH /api/users/:id/status`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Body**: `{ "status": "active" | "suspended" }`

---

### Screen 9: Appeals Adjudication Queue
- **Route Path**: `/admin/appeals`
- **Component**: `frontend/src/pages/AppealsQueuePage.jsx`
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Safeguarding dispute resolution desk. When a candidate is `HARD_BLOCKED` by a local counselor, they can submit a formal appeal from mobile. SuperAdmin reviews appeals to prevent bias, rogue counselor actions, or unfair permanent exclusions.
- **Functional Requirements**:
  - Filterable tabs: `ALL`, `PENDING`, `APPROVED`, `REJECTED`.
  - Candidate identity, home church, blocking counselor, block date, and status badges.
  - Direct deep-links to full 2-column adjudication workspace `/admin/appeals/:id`.
- **Supporting Endpoints**:
  1. `GET /api/vetting/appeals?status=PENDING`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "appeals": [
             {
               "id": "uuid",
               "reason": "I believe my background check was flagged incorrectly due to a name similarity.",
               "status": "PENDING",
               "createdAt": "2026-09-20T14:30:00Z",
               "user": {
                 "id": "uuid",
                 "account": { "firstName": "David", "lastName": "Adeleke", "email": "david@example.com" },
                 "church": { "officialName": "RCCG Throne Room" }
               }
             }
           ]
         }
       }
       ```

---

### Screen 10: Dedicated Appeal Adjudication Workspace
- **Route Path**: `/admin/appeals/:id`
- **Component**: `frontend/src/pages/AppealsQueuePage.jsx`
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Full adjudication console for an individual appeal. SuperAdmin reviews the candidate's formal statement against the original counselor's blocking rationale and evidence, then renders an irrevocable decision.
- **Functional Requirements**:
  - Left Column: Candidate statement, timestamp, contact info, home parish, and original blocking rationale.
  - Right Column: Adjudication Decision Console (`APPROVE` restores candidate to `PENDING_VETTING`; `REJECT` permanently upholds hard block). Mandatory notes input.
- **Supporting Endpoints**:
  1. `GET /api/vetting/appeals/:appealId`
     - **Auth**: Bearer JWT (`SuperAdmin`)
  2. `POST /api/vetting/appeals/:appealId/review`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Request Body**:
       ```json
       {
         "decision": "APPROVE" | "REJECT",
         "notes": "Reviewed identity documentation provided. Cleared for re-evaluation by head counselor."
       }
       ```
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "message": "Appeal approved. User restored to PENDING_VETTING status."
       }
       ```

---

### Screen 11: Subscription & Revenue Analytics Dashboard
- **Route Path**: `/admin/subscriptions`
- **Component**: `frontend/src/pages/SubscriptionAnalyticsPage.jsx`
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Financial operations dashboard. SuperAdmin tracks Monthly Recurring Revenue (MRR), Annual Run Rate (ARR), tier conversions (Standard vs Kingdom Premium), churn, and live Paystack transaction logs.
- **Functional Requirements**:
  - High-level revenue metric counters (MRR, Total Revenue, Active Paid Subscribers, Conversion Rate).
  - Plan Breakdown cards with feature matrix and active count per tier.
  - Live transactions table with status badges (`SUCCESSFUL`, `PENDING`, `FAILED`), reference IDs, and customer deep-links.
- **Supporting Endpoints**:
  1. `GET /api/admin/subscriptions/analytics` (or mock fallback)
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "mrr": 4850000,
           "totalRevenue": 28400000,
           "activeSubscribers": 520,
           "churnRate": "2.4%",
           "plans": [
             { "tier": "FREE_TRIAL", "price": 0, "activeCount": 900 },
             { "tier": "STANDARD", "price": 5000, "activeCount": 380 },
             { "tier": "KINGDOM_PREMIUM", "price": 12000, "activeCount": 140 }
           ],
           "recentTransactions": [...]
         }
       }
       ```

---

### Screen 12: Global Matchmaking & Compatibility Audit
- **Route Path**: `/admin/matches`
- **Component**: `frontend/src/pages/SuperAdminDashboard.jsx` (Tab: `matches`)
- **Authorized Roles**: `SuperAdmin`
- **Use Case & User Value**:
  Global health audit of platform matchmaking. SuperAdmin monitors mutual acceptance rates, courtship progressions, and engagement across all denominations to optimize algorithm weights.
- **Functional Requirements**:
  - Listing of all system matches with status badges (`MUTUAL_ACCEPTED`, `IN_CONVERSATION`, `COURTSHIP`, `MARRIED`, `ENDED`).
  - Candidate A & Candidate B names, home churches, matching dates.
- **Supporting Endpoints**:
  1. `GET /api/admin/matches?page=1&limit=20`
     - **Auth**: Bearer JWT (`SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "matches": [
             {
               "id": "uuid",
               "status": "COURTSHIP",
               "createdAt": "2026-08-15T10:00:00Z",
               "user1": { "account": { "firstName": "David", "lastName": "O." }, "church": { "officialName": "Elevation Church" } },
               "user2": { "account": { "firstName": "Sarah", "lastName": "M." }, "church": { "officialName": "HOTR" } }
             }
           ]
         }
       }
       ```

---

## Part II: Church & Pastoral Operations Portal (`/church/*`)

### Screen 13: Parish Operational Overview
- **Route Path**: `/church` (or `/church/overview`)
- **Component**: `frontend/src/pages/ChurchPortalPage.jsx` (within `ChurchLayout.jsx`)
- **Authorized Roles**: `ChurchAdmin`, `Counselor`, `SuperAdmin`
- **Use Case & User Value**:
  Primary operational dashboard for the parish. Dynamic presentation adapts to the viewer:
  - For `ChurchAdmin`: Parish-wide growth metrics, counselor workload balancing, member triage status, and parish health.
  - For `Counselor`: Personal caseload summary, pending vetting applicants, active monitored courtship threads, and debrief alerts.
- **Functional Requirements**:
  - Role-adaptive KPI cards: Pending Vettings, Assigned Members, Active Courtships, Pending Exit Debriefs.
  - Immediate action queue highlighting candidates requiring urgent intervention.
- **Supporting Endpoints**:
  1. For `ChurchAdmin`: `GET /api/church-admin/dashboard/:id`
     - **Auth**: Bearer JWT (`ChurchAdmin`, `SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "parishStats": {
             "totalMembers": 184,
             "pendingVetting": 12,
             "activeCounselors": 4,
             "activeCourtships": 7
           }
         }
       }
       ```
  2. For `Counselor`: `GET /api/counselor/dashboard`
     - **Auth**: Bearer JWT (`Counselor`, `SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "counselorStats": {
             "assignedMembersCount": 22,
             "pendingVettingCount": 5,
             "monitoredChatsCount": 3,
             "requiredDebriefsCount": 2
           }
         }
       }
       ```

---

### Screen 14: Parish Member Directory
- **Route Path**: `/church/members`
- **Component**: `frontend/src/pages/ChurchPortalPage.jsx` (Section: `members`)
- **Authorized Roles**: `ChurchAdmin`, `Counselor`, `SuperAdmin`
- **Use Case & User Value**:
  Roster of all congregants registered under this parish. Enables triage, counselor assignment, and spiritual tracking.
- **Functional Requirements**:
  - Filterable by vetting status (`PENDING_VETTING`, `VETTED_ACTIVE`, `DEBRIEF_REQUIRED`).
  - Search by name or email.
  - Displays Assigned Counselor name or "Unassigned" indicator.
  - Deep-link to `/church/members/:id`.
  - Triage modal for `ChurchAdmin` to assign unassigned members to staff counselors.
- **Supporting Endpoints**:
  1. `GET /api/churches/:id/members?status=ALL&page=1&limit=20`
     - **Auth**: Bearer JWT (`ChurchAdmin`, `Counselor`, `SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "members": [
             {
               "id": "uuid",
               "account": { "id": "uuid", "firstName": "Chinedu", "lastName": "Eze", "email": "chinedu@example.com" },
               "vettingStatus": "PENDING_VETTING",
               "assignedCounselor": { "account": { "firstName": "Pastor", "lastName": "Tunde" } },
               "createdAt": "2026-09-12T11:00:00Z"
             }
           ]
         }
       }
       ```
  2. `POST /api/church-admin/assign-counselor`
     - **Auth**: Bearer JWT (`ChurchAdmin`)
     - **Request Body**: `{ "userId": "uuid", "counselorId": "uuid" }`

---

### Screen 15: Member Profile Detail Page with Safeguarding Firewall
- **Route Path**: `/church/members/:id`
- **Component**: `frontend/src/pages/MemberDetailPage.jsx`
- **Authorized Roles**: `ChurchAdmin`, `Counselor`, `SuperAdmin`
- **Use Case & User Value**:
  Comprehensive individual member dossier. Enforces the strict **Administrative Safeguarding Privacy Firewall**:
  - If viewed by `ChurchAdmin`: Hides personal dating preferences, financial salary brackets, street addresses, and external partner names to protect member dignity within their home parish.
  - If viewed by assigned `Counselor` or `SuperAdmin`: Unlocks full spiritual counseling dossier, candidate video intro player, photo gallery, and verification history.
- **Functional Requirements**:
  - Identity & Status Header: Avatar, full name, ecclesiastical church branch, vetting status badge.
  - Privacy Firewall Guard Banner: Transparently explains to `ChurchAdmin` why sensitive dating preferences are redacted.
  - Video Intro Player: Embedded HTML5 player with liveness verification.
  - Photo Gallery: 3-photo verification gallery with lightbox zoom.
  - Pastoral Counselor Assignment Card: Displays current counselor with 1-click reassignment trigger.
- **Supporting Endpoints**:
  1. `GET /api/users/:id`
     - **Auth**: Bearer JWT (`ChurchAdmin`, `Counselor`, `SuperAdmin`)
     - **Response Envelope (Firewalled for ChurchAdmin)**:
       ```json
       {
         "success": true,
         "data": {
           "user": {
             "id": "uuid",
             "firstName": "Grace",
             "lastName": "Oladipo",
             "gender": "Female",
             "vettingStatus": "VETTED_ACTIVE",
             "occupation": "Software Engineer",
             "church": { "officialName": "Elevation Church" },
             "assignedCounselor": { "firstName": "Sarah", "lastName": "Adeyemi" }
             // salaryRange, matchPreference, residenceAddress REDACTED
           }
         }
       }
       ```
     - **Response Envelope (Privileged for Assigned Counselor)**:
       ```json
       {
         "success": true,
         "data": {
           "user": {
             "id": "uuid",
             "salaryRange": "BRACKET_750K_1M",
             "matchPreference": { "minAge": 28, "maxAge": 35, "denomination": "ANY" },
             "residenceAddress": "Plot 12, Admiralty Way, Lekki",
             "verificationNotes": "In-person interview conducted on Zoom. Strong Christian testimony."
           }
         }
       }
       ```
  2. `POST /api/church-admin/assign-counselor`

---

### Screen 16: Vetting Evaluation Queue
- **Route Path**: `/church/vetting`
- **Component**: `frontend/src/pages/VettingQueuePage.jsx`
- **Authorized Roles**: `Counselor`, `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Operational pipeline for counselors to inspect candidates awaiting discovery indexing. Ensures that only identity-verified, spiritually committed, and safeguarding-cleared candidates enter the matchmaking pool.
- **Functional Requirements**:
  - Filterable tabs: `ALL`, `PENDING` (`PENDING_VETTING`), `DEBRIEF` (`DEBRIEF_REQUIRED`), `ACTIVE` (`VETTED_ACTIVE`), `REJECTED`.
  - Candidate profile card with completion progress, video presence badge, church parish, and wait time.
  - "Evaluate Candidate" deep-link directing to `/church/vetting/:id`.
- **Supporting Endpoints**:
  1. `GET /api/counselor/assigned-users?vettingStatus=PENDING_VETTING`
     - **Auth**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "users": [
             {
               "id": "uuid",
               "firstName": "Bukola",
               "lastName": "Balogun",
               "gender": "Female",
               "profileCompletionPercentage": 100,
               "videoIntroUrl": "https://res.cloudinary.com/.../video.mp4",
               "vettingStatus": "PENDING_VETTING",
               "createdAt": "2026-09-24T08:15:00Z"
             }
           ]
         }
       }
       ```

---

### Screen 17: Dedicated 2-Column Vetting Adjudication Workspace
- **Route Path**: `/church/vetting/:id`
- **Component**: `frontend/src/pages/VettingQueuePage.jsx`
- **Authorized Roles**: `Counselor`, `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  High-fidelity evaluation workspace replacing cramped modals. A counselor reviews all submitted evidence (photos, video intro, career, spiritual convictions, socials) and executes an adjudication decision.
- **Functional Requirements**:
  - **Left Column (Evidence Review)**:
    - 10-point Verification Checklist: Visual validation of 100% completion requirements.
    - HTML5 Video Introduction Player: Verifies candidate liveness, tone, and spoken testimony.
    - 3-Photo Lightbox Gallery: Confirms modesty, face visibility, and absence of filters.
    - Personal & Faith Dossier: Church background, spiritual testimony, occupation, education.
  - **Right Column (Pastoral Decision Console)**:
    - Decision selector: `APPROVE`, `REJECT` (requires actionable correction feedback), `DEBRIEF_RESET`, `HARD_BLOCK` (permanent ban for fraud/illicit content).
    - Pastoral Notes textarea.
    - Submit trigger.
- **Supporting Endpoints**:
  1. `GET /api/users/:id`
     - **Auth**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)
  2. `POST /api/vetting/users/:userId/review`
     - **Auth**: Bearer JWT (`Counselor`, `SuperAdmin`)
     - **Request Body**:
       ```json
       {
         "decision": "APPROVE" | "REJECT" | "HARD_BLOCK",
         "notes": "Candidate satisfies all biblical and safeguarding criteria. Video confirms genuine Christian intent.",
         "checklist": {
           "identityConfirmed": true,
           "videoIntroVerified": true,
           "churchBranchConfirmed": true,
           "pastoralTestimony": true
         }
       }
       ```
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "message": "Candidate approved and indexed into the active discovery pool.",
         "data": { "vettingStatus": "VETTED_ACTIVE" }
       }
       ```

---

### Screen 18: Monitored Courtship Chats Hub
- **Route Path**: `/church/chats`
- **Component**: `frontend/src/pages/MonitoredChatsPage.jsx`
- **Authorized Roles**: `Counselor`, `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Safeguarding communication portal. Under platform rules, matched couples communicate in a 3-way monitored channel (`COUPLE_COUNSELOR`) where the pastoral counselor provides oversight, moral accountability, and date guidance.
- **Functional Requirements**:
  - Split-pane layout: Conversation channel list on the left; active thread on the right.
  - Unread message counters and courtship stage indicators.
- **Supporting Endpoints**:
  1. `GET /api/communications/conversations`
     - **Auth**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "conversations": [
             {
               "id": "uuid",
               "channelType": "COUNSELOR_GROUP",
               "matchId": "uuid",
               "candidateA": { "name": "Daniel K.", "avatar": "url" },
               "candidateB": { "name": "Ruth O.", "avatar": "url" },
               "lastMessage": { "content": "Looking forward to our coffee check-in!", "createdAt": "..." },
               "pendingEventsCount": 1
             }
           ]
         }
       }
       ```

---

### Screen 19: 3-Way Monitored Group Chat Workspace
- **Route Path**: `/church/chats/:conversationId`
- **Component**: `frontend/src/pages/MonitoredChatsPage.jsx`
- **Authorized Roles**: `Counselor`, `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Interactive 3-way chat thread. Counselors intervene with spiritual advice, approve proposed public dates, and monitor communication decorum between courting candidates.
- **Functional Requirements**:
  - Distinct sender badges: `Candidate A`, `Candidate B`, `Pastoral Counselor`.
  - Date Meetup Proposal Banners: When candidates propose a physical meetup via mobile, an alert appears in this thread requiring the counselor to confirm physical safety.
  - Counselor message composer: Send guidance directly into the thread.
  - Action trigger: "Conclude Courtship & Mandate Debrief" (initiates graceful exit when couple parts ways).
- **Supporting Endpoints**:
  1. `GET /api/communications/conversations/:conversationId/messages`
     - **Auth**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)
  2. `POST /api/communications/conversations/:conversationId/messages`
     - **Auth**: Bearer JWT (`Counselor`)
     - **Request Body**: `{ "content": "Remember to keep your discussions centered on spiritual alignment." }`
  3. `GET /api/communications/matches/:matchId/events`
  4. `PATCH /api/communications/events/:eventId/respond`
     - **Auth**: Bearer JWT (`Counselor`)
     - **Request Body**: `{ "status": "CONFIRMED" | "CANCELLED" }`

---

### Screen 20: Relationship Exit Debriefs Queue
- **Route Path**: `/church/debriefs`
- **Component**: `frontend/src/pages/VettingQueuePage.jsx` (Default tab: `DEBRIEF`)
- **Authorized Roles**: `Counselor`, `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Pastoral care pipeline for ended relationships. When a courtship ends, both candidates are immediately locked from discovery and placed in `DEBRIEF_REQUIRED` status to prevent rebound dating, emotional distress, or unresolved disputes.
- **Functional Requirements**:
  - Lists all parish members currently in `DEBRIEF_REQUIRED` status.
  - Highlights days in debrief hold and assigned counselor.
  - Action trigger: "Conduct Exit Debrief" directing to `/church/debriefs/:id`.
- **Supporting Endpoints**:
  1. `GET /api/counselor/assigned-users?vettingStatus=DEBRIEF_REQUIRED`
     - **Auth**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)

---

### Screen 21: Exit Debrief Adjudication Workspace
- **Route Path**: `/church/debriefs/:id`
- **Component**: `frontend/src/pages/VettingQueuePage.jsx`
- **Authorized Roles**: `Counselor`, `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Post-courtship pastoral care workspace. The counselor logs reflection notes, assesses emotional closure and spiritual readiness, and resets the candidate's status to re-enter matchmaking.
- **Functional Requirements**:
  - Retrospective summary of concluded courtship.
  - Pastoral Exit Notes textarea.
  - Emotional Readiness Score selector (1 to 10 scale; scores >= 7 allow immediate re-entry).
  - Submit trigger: resets status to `VETTED_ACTIVE` and unfreezes mobile discovery.
- **Supporting Endpoints**:
  1. `POST /api/vetting/users/:userId/debrief-reset`
     - **Auth**: Bearer JWT (`Counselor`, `SuperAdmin`)
     - **Request Body**:
       ```json
       {
         "notes": "Member processed the conclusion maturely. Spiritual alignment confirmed. Ready for new discovery.",
         "readinessScore": 9
       }
       ```
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "message": "Debrief completed successfully. Member re-indexed into the discovery pool.",
         "data": { "debriefId": "uuid", "vettingStatus": "VETTED_ACTIVE" }
       }
       ```

---

### Screen 22: Parish Counselor Staff Roster
- **Route Path**: `/church/counselors`
- **Component**: `frontend/src/pages/ChurchPortalPage.jsx` (Section: `counselors`)
- **Authorized Roles**: `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Internal parish staffing management. `ChurchAdmin` provisions, monitors, and audits the counselors serving their local congregation.
- **Functional Requirements**:
  - Roster of all counselors attached to this church.
  - Caseload counters: Number of assigned daters, pending vettings, and active courtships.
  - Action trigger: "Add New Counselor" modal.
- **Supporting Endpoints**:
  1. `GET /api/churches/:id/counselors`
     - **Auth**: Bearer JWT (`ChurchAdmin`, `SuperAdmin`)
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "counselors": [
             {
               "id": "uuid",
               "bio": "Marriage ministry director",
               "account": { "firstName": "Deacon", "lastName": "Williams", "email": "williams@parish.org" },
               "_count": { "assignedUsers": 14 }
             }
           ]
         }
       }
       ```

---

### Screen 23: Create Counselor Account Workflow
- **Route Path**: `/church/counselors` (Modal trigger: "Add Counselor")
- **Component**: `frontend/src/pages/ChurchAdminDashboard.jsx`
- **Authorized Roles**: `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Enables parish leadership to onboard qualified pastoral mentors and marriage counselors to handle local congregant vetting and chat monitoring.
- **Functional Requirements**:
  - Captures First Name, Last Name, Email, Temporary Password, Phone, and Professional Bio.
  - Automatically associates counselor with the current `ChurchAdmin`'s `churchId`.
- **Supporting Endpoints**:
  1. `POST /api/counselor/create`
     - **Auth**: Bearer JWT (`ChurchAdmin`, `SuperAdmin`)
     - **Request Body**:
       ```json
       {
         "churchId": "uuid",
         "firstName": "Kehinde",
         "lastName": "Fashola",
         "email": "kehinde@parish.org",
         "password": "TemporaryPassword123!",
         "phone": "+2348055556666",
         "bio": "Licensed family counselor with 8 years pastoral ministry experience."
       }
       ```
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "message": "Counselor account created successfully",
         "data": { "account": { "id": "uuid", "email": "kehinde@parish.org" } }
       }
       ```

---

### Screen 24: Parish Profile & Ecclesiastical Leadership Settings
- **Route Path**: `/church/settings`
- **Component**: `frontend/src/pages/ParishSettingsPage.jsx`
- **Authorized Roles**: `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Institutional settings portal. `ChurchAdmin` maintains official church brand identity, physical meeting address, parish helpline/email, and designated Senior Pastor / spiritual leader oversight contacts.
- **Functional Requirements**:
  - Edit church brand: Official Name, Alias (`aka`).
  - Edit address: Physical street address, City, LGA, State.
  - Edit congregational contact: Parish public phone and email.
  - Edit spiritual leadership contacts: Senior Pastor / Head Minister name, direct email, and phone.
- **Supporting Endpoints**:
  1. `GET /api/churches/:id`
     - **Auth**: Bearer JWT (`ChurchAdmin`, `SuperAdmin`)
  2. `PUT /api/churches/:id`
     - **Auth**: Bearer JWT (`ChurchAdmin`, `SuperAdmin`)
     - **Request Body**:
       ```json
       {
         "officialName": "Redeemed Christian Church of God, City of David",
         "aka": "City of David",
         "address": "COD Road, Dedeisha, Victoria Island",
         "phone": "+2348099998888",
         "email": "contact@cityofdavidng.org",
         "pastorName": "Pastor Idowu Iluyomade",
         "pastorEmail": "pastor@cityofdavidng.org",
         "pastorPhone": "+2348011223344"
       }
       ```
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "message": "Church details updated successfully",
         "data": { "church": { "id": "uuid", "officialName": "..." } }
       }
       ```

---

### Screen 25: Parish Active Matchmaking Monitor
- **Route Path**: `/church/matches`
- **Component**: `frontend/src/pages/ChurchPortalPage.jsx` (Section: `matches`)
- **Authorized Roles**: `Counselor`, `ChurchAdmin`, `SuperAdmin`
- **Use Case & User Value**:
  Local matchmaking oversight. Counselors track the progression of couples where at least one candidate belongs to their parish, verifying healthy communication rhythms.
- **Functional Requirements**:
  - Tabular view of active parish matches with status badges.
  - Quick link to the 3-way monitored conversation thread.
- **Supporting Endpoints**:
  1. `GET /api/communications/conversations?channelType=COUNSELOR_GROUP`
     - **Auth**: Bearer JWT (`Counselor`, `ChurchAdmin`, `SuperAdmin`)

---

## Part III: Authentication & Administrative System Screens

### Screen 26: Login Page
- **Route Path**: `/login`
- **Component**: `frontend/src/pages/LoginPage.jsx`
- **Authorized Roles**: Public / Unauthenticated
- **Use Case & User Value**:
  Secure credential gateway for administrative staff (`SuperAdmin`, `ChurchAdmin`, `Counselor`).
- **Functional Requirements**:
  - Email and password inputs.
  - Role-based automatic redirect post-login (`SuperAdmin` -> `/admin`; `ChurchAdmin`/`Counselor` -> `/church`).
- **Supporting Endpoints**:
  1. `POST /api/auth/login`
     - **Request Body**: `{ "email": "admin@lifeline.org", "password": "Password123!" }`
     - **Response Envelope**:
       ```json
       {
         "success": true,
         "data": {
           "token": "jwt_token_string",
           "user": {
             "id": "uuid",
             "email": "admin@lifeline.org",
             "role": "ChurchAdmin",
             "title": "Senior Pastor",
             "churchId": "uuid"
           }
         }
       }
       ```

---

### Screen 27: Password Recovery & Reset Workflows
- **Route Paths**: `/forgot-password`, `/reset-password`, `/password-confirmed`
- **Components**: `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, `PasswordConfirmedPage.jsx`
- **Authorized Roles**: Public / Unauthenticated
- **Use Case & User Value**:
  Self-service credential recovery for platform administrators and church leaders.
- **Supporting Endpoints**:
  1. `POST /api/auth/forgot-password` (`{ "email": "..." }`)
  2. `POST /api/auth/reset-password` (`{ "token": "...", "password": "..." }`)

---

### Screen 28: Email Verification Workflows
- **Route Paths**: `/email-confirmation`, `/verify-email`
- **Components**: `EmailConfirmationPage.jsx`, `VerifyEmailPage.jsx`
- **Authorized Roles**: Public / Authenticated
- **Supporting Endpoints**:
  1. `GET /api/auth/verify-email/:token`
  2. `POST /api/auth/request-verification`

---

### Screen 29: Web Subscription Architecture Informational Notice
- **Route Path**: `/subscription`
- **Component**: `frontend/src/pages/SubscriptionPage.jsx`
- **Authorized Roles**: Public / Authenticated
- **Use Case & User Value**:
  Educational gateway informing web visitors that candidate matchmaking perks, profile discovery, and Paystack subscriptions operate exclusively within the native **Lifeline Mobile App**.
- **Functional Requirements**:
  - Displays plan comparison matrix (Free Trial vs Standard vs Kingdom Premium).
  - Prominent architectural banner directing daters to download the iOS/Android apps.
- **Supporting Endpoints**:
  1. `GET /api/auth/me`

---

## Part IV: Cross-Platform Mobile Application Reference (Daters / End Users)

For cross-platform engineering alignment, the table below documents the corresponding mobile screens in `mobile/` and their supporting backend endpoints:

| Mobile Screen | Implementation File | Primary User Value / Functional Requirement | Supporting Backend Endpoints |
|---|---|---|---|
| **Lead Registration** | `mobile/src/app/(auth)/sign-up.tsx` | Step 1 friction-free lead capture (stores email/phone metadata) | `POST /api/auth/lead-register` |
| **Progressive Onboarding** | `mobile/src/app/(onboarding)/*.tsx` | Multi-step 100% completion (Career, Address, Denomination, Socials, Photos, Video) | `PUT /api/users/:id`<br>`POST /api/users/:id/photos`<br>`POST /api/users/:id/socials` |
| **Candidate Discovery Feed** | `mobile/src/app/(app)/index.tsx` | Geolocation-weighted, opposite-gender, active vetted candidate feed | `GET /api/discovery/feed` |
| **Send Match Request (Cap 3)** | `mobile/src/app/(app)/candidate/[id].tsx` | Intentional dating gate: send request using 1 of 3 active concurrent slots | `POST /api/requests/send`<br>`GET /api/requests/sent` |
| **Match Acceptance & Mutual Channel**| `mobile/src/app/(app)/requests.tsx` | First-come mutual acceptance; auto-supersedes other requests & initializes chat | `POST /api/requests/:id/accept`<br>`POST /api/requests/:id/decline` |
| **Private Couple Chat** | `mobile/src/app/(app)/chat/[id].tsx` | Encrypted 1:1 chat between mutually accepted courting candidates | `GET /api/communications/conversations/:id/messages`<br>`POST /api/communications/conversations/:id/messages` |
| **Date Meetup Scheduler** | `mobile/src/app/(app)/modal/event-scheduler.tsx`| Propose public physical date; triggers counselor safety check | `POST /api/communications/matches/:id/events` |
| **Appeal Hard Block** | `mobile/src/app/(vetting)/rejected.tsx` | Submit formal appeal to SuperAdmin if disqualified by counselor | `POST /api/vetting/appeal` |
| **Mobile Subscription Checkout** | `mobile/src/app/(app)/modal/subscription-tier.tsx`| In-app upgrade via Paystack SDK (Standard vs Kingdom Premium) | `POST /api/payments/initialize`<br>`POST /api/payments/verify` |

---

*Document committed to repository as `guides/frontend_screens_and_endpoints.md`.*
