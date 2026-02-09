# MVP Implementation Summary - Ready to Build Frontend

## ✅ What We Built

### **1. Schema Changes**

- **Account**: Core auth entity; 1:1 with exactly one role profile (`SuperAdmin`, `ChurchAdmin`, `Counselor`, or `User`). 
- **SuperAdmin**: Role profile tied to `Account`; creates many `Church` records.
- **ChurchAdmin**: Role profile tied to `Account`; belongs to one `Church`.
- **Counselor**: Role profile tied to `Account`; belongs to one `Church`; has many assigned `User` records.
- **User**: Role profile tied to `Account`; optionally belongs to a `Church`; optionally assigned to one `Counselor` for verification.
- **Church**: Organization entity; created by a `SuperAdmin`; has many `ChurchAdmin`, `Counselor`, and `User` members.
---

### **2. Response Formats**

**All endpoints use a unified response format:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 },
  "errors": null
}
```

**Examples below show the exact shapes returned per endpoint.**

---

### **3. Complete Endpoint List**

#### **SuperAdmin (Platform Management)**

```
POST /api/churches                     - Create church
GET  /api/churches                     - List all churches
GET  /api/churches/:id                 - Get church details
PUT  /api/churches/:id                 - Update church
GET /api/churches/:id/members          - Get church members
POST /api/church-admin/create          - Create church admin
GET  /api/church-admin                 - List all church admins (with filters)
GET  /api/church-admin/:id             - Get church admin details
GET  /api/users                        - List all users (with filters)
GET  /api/users/:id                    - Get user details
PUT  /api/users/:id                    - Update user
PATCH /api/users/:id/verification      - Verify/unverify user
PATCH /api/users/:id/status            - Suspend/activate user
GET /api/admin/dashboard                     - Platform stats
GET /api/admin/stats?period=week   - Time-based stats
```

#### **ChurchAdmin (Church Management)**

```
GET  /api/church-admin/dashboard       - Church stats & recent members
GET  /api/church-admin/me/members      - List church members
POST /api/church-admin/assign-counselor - Assign user to counselor
POST /api/counselor/create             - Create counselor
GET  /api/counselor/list               - List church's counselors
GET  /api/counselor/:id                - Get counselor details
PUT  /api/counselor/:id                - Update counselor
PATCH /api/counselor/:id/status        - Suspend/activate counselor
```

#### **Counselor (User Verification)**

```
GET  /api/counselor/dashboard          - Counselor stats & assigned users
GET  /api/counselor/assigned-users     - List users assigned to them
POST /api/counselor/verify-user/:userId - Verify/reject user
GET  /api/counselor/:id                - Get own profile
PUT  /api/counselor/:id                - Update own profile
```

#### **Authentication**

```
POST /api/auth/signup                  - User registration
POST /api/auth/login                   - Login (all roles)
POST /api/auth/forgot-password         - Request password reset
POST /api/auth/reset-password          - Reset password
GET  /api/auth/verify-email/:token     - Verify email
POST /api/auth/request-verification    - Resend verification
GET  /api/auth/me                      - Get current user
```

---

## Request Payloads

**Notes:**
- `?` means optional
- Query parameters are shown under the endpoint when applicable
- verification status are "verified", "pending", "rejected", "in_progress"

### **Authentication**

**POST /api/auth/signup**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string?",
  "password": "string",
  "gender": "Male|Female",
  "originCountry": "string?",
  "originState": "string?",
  "originLga": "string?",
  "residenceCountry": "string?",
  "residenceState": "string?",
  "residenceCity": "string?",
  "residenceAddress": "string?",
  "occupation": "string?",
  "interests": "json?",
  "church": "uuid?",
  "matchPreference": "my_church|my_church_plus|other_churches?"
}
```

**POST /api/auth/login**
```json
{ "email": "string", "password": "string" }
```

**POST /api/auth/request-verification**
```json
{ "email": "string" }
```

**POST /api/auth/forgot-password**
```json
{ "email": "string" }
```

**POST /api/auth/reset-password**
```json
{ "token": "string", "password": "string", "confirmPassword": "string" }
```

**GET /api/auth/verify-email/:token**
No request payload

**GET /api/auth/me**
No request payload

### **SuperAdmin (Churches & Users)**

**POST /api/churches**
```json
{
  "officialName": "string",
  "aka": "string?",
  "email": "string",
  "phone": "string",
  "state": "string",
  "lga": "string?",
  "city": "string?",
  "address": "string?"
}
```

**PUT /api/churches/:id**
```json
{
  "officialName": "string?",
  "aka": "string?",
  "phone": "string?",
  "state": "string?",
  "lga": "string?",
  "city": "string?",
  "address": "string?"
}
```

**GET /api/churches**
Query params: `status?`, `page?`, `limit?`

**GET /api/churches/:id/members**
Query params: `verificationStatus?`, `page?`, `limit?`

**POST /api/church-admin/create**
```json
{
  "churchId": "uuid",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string?"
}
```

**GET /api/church-admin**
Query params: `status?`, `churchId?`, `page?`, `limit?`

**GET /api/church-admin/:id**
No request payload

**GET /api/users**
Query params: `isVerified?`, `subscriptionTier?`, `page?`, `limit?`

**GET /api/users/:id**
No request payload

**PUT /api/users/:id**
```json
{
  "originCountry": "string?",
  "originState": "string?",
  "originLga": "string?",
  "residenceCountry": "string?",
  "residenceState": "string?",
  "residenceCity": "string?",
  "residenceAddress": "string?",
  "occupation": "string?",
  "interests": "json?",
  "church": "uuid?",
  "matchPreference": "my_church|my_church_plus|other_churches?"
}
```

**PATCH /api/users/:id/verification**
```json
{ "isVerified": true }
```

**PATCH /api/users/:id/status**
```json
{ "status": "active|suspended" }
```

**GET /api/admin/dashboard**
No request payload

**GET /api/admin/stats**
Query params: `period?` (`day|week|month`)

### **ChurchAdmin (Church Management)**

**GET /api/church-admin/dashboard**
No request payload

**GET /api/church-admin/me/members**
Query params: `verificationStatus?`, `page?`, `limit?`

**POST /api/church-admin/assign-counselor**
```json
{ "userId": "uuid", "counselorId": "uuid" }
```

**POST /api/counselor/create**
```json
{
  "churchId": "uuid",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string?",
  "bio": "string?",
  "yearsExperience": 5
}
```

**PUT /api/counselor/:id**
```json
{ "bio": "string?", "yearsExperience": 5 }
```

**GET /api/counselor/list**
Query params: `churchId?` (required when SuperAdmin)

**GET /api/counselor/:id**
No request payload

**PATCH /api/counselor/:id/status**
```json
{ "status": "active|suspended" }
```

### **Counselor (User Verification)**

**GET /api/counselor/dashboard**
No request payload

**GET /api/counselor/assigned-users**
Query params: `verificationStatus?`, `page?`, `limit?`

**POST /api/counselor/verify-user/:userId**
```json
{ "status": "verified|rejected", "notes": "string?" }
```

---

## Response Shapes (Success)

### **Authentication**

**POST /api/auth/signup**

```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "token": "jwt",
    "user": {
      "id": "uuid",
      "email": "user@email.com",
      "firstName": "John",
      "role": "User",
      "isEmailVerified": false
    }
  }
}
```

**POST /api/auth/login**

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "token": "jwt",
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@email.com",
      "role": "User",
      "isEmailVerified": true
    }
  }
}
```

**POST /api/auth/request-verification**

```json
{
  "success": true,
  "message": "Verification email sent. Please check your inbox.",
  "data": null
}
```

**GET /api/auth/verify-email/:token**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "account": {
      "id": "uuid",
      "email": "user@email.com",
      "firstName": "John"
    }
  }
}
```

**POST /api/auth/forgot-password**

```json
{
  "success": true,
  "message": "If an account exists, a password reset link has been sent",
  "data": null
}
```

**POST /api/auth/reset-password**

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

**GET /api/auth/me**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@email.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "string|null",
      "role": "User|Counselor|ChurchAdmin|SuperAdmin",
      "isEmailVerified": true,
      "status": "active|suspended|pending",
      "createdAt": "2026-02-09T10:00:00.000Z"
    }
  }
}
```

### **SuperAdmin (Churches & Users)**

**POST /api/churches**

```json
{
  "success": true,
  "message": "Church created successfully",
  "data": {
    "church": {
      "id": "uuid",
      "officialName": "First Baptist Church",
      "aka": "FBC",
      "email": "church@email.com",
      "phone": "string",
      "state": "string",
      "lga": "string|null",
      "city": "string|null",
      "address": "string|null",
      "status": "pending|active|suspended",
      "createdBy": "uuid",
      "createdAt": "2026-02-09T10:00:00.000Z",
      "updatedAt": "2026-02-09T10:00:00.000Z"
    }
  }
}
```

**GET /api/churches**

```json
{
  "success": true,
  "message": "Churches fetched successfully",
  "data": {
    "churches": [
      {
        "id": "uuid",
        "officialName": "First Baptist Church",
        "aka": "FBC",
        "email": "church@email.com",
        "phone": "string",
        "state": "string",
        "lga": "string|null",
        "city": "string|null",
        "address": "string|null",
        "status": "pending|active|suspended",
        "createdBy": "uuid",
        "createdAt": "2026-02-09T10:00:00.000Z",
        "updatedAt": "2026-02-09T10:00:00.000Z",
        "churchAdmins": [
          {
            "id": "uuid",
            "accountId": "uuid",
            "churchId": "uuid",
            "account": {
              "id": "uuid",
              "firstName": "John",
              "lastName": "Doe",
              "email": "admin@email.com",
              "status": "active|suspended|pending"
            }
          }
        ],
        "counselors": [
          {
            "id": "uuid",
            "account": {
              "firstName": "Mary",
              "lastName": "Smith",
              "email": "counselor@email.com",
              "status": "active|suspended|pending"
            }
          }
        ]
      }
    ]
  },
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

**GET /api/churches/:id**

```json
{
  "success": true,
  "message": "Church fetched successfully",
  "data": {
    "church": {
      "id": "uuid",
      "officialName": "First Baptist Church",
      "aka": "FBC",
      "email": "church@email.com",
      "phone": "string",
      "state": "string",
      "lga": "string|null",
      "city": "string|null",
      "address": "string|null",
      "status": "pending|active|suspended",
      "createdBy": "uuid",
      "createdAt": "2026-02-09T10:00:00.000Z",
      "updatedAt": "2026-02-09T10:00:00.000Z",
      "churchAdmins": [
        {
          "id": "uuid",
          "accountId": "uuid",
          "churchId": "uuid",
          "account": {
            "id": "uuid",
            "firstName": "John",
            "lastName": "Doe",
            "email": "admin@email.com",
            "phone": "string|null",
            "status": "active|suspended|pending",
            "createdAt": "2026-02-09T10:00:00.000Z"
          }
        }
      ],
      "counselors": [
        {
          "id": "uuid",
          "account": {
            "id": "uuid",
            "firstName": "Mary",
            "lastName": "Smith",
            "email": "counselor@email.com",
            "status": "active|suspended|pending"
          }
        }
      ]
    }
  }
}
```

**PUT /api/churches/:id**

```json
{
  "success": true,
  "message": "Church updated successfully",
  "data": {
    "church": {
      "id": "uuid",
      "officialName": "First Baptist Church",
      "aka": "FBC",
      "email": "church@email.com",
      "phone": "string",
      "state": "string",
      "lga": "string|null",
      "city": "string|null",
      "address": "string|null",
      "status": "pending|active|suspended",
      "createdBy": "uuid",
      "createdAt": "2026-02-09T10:00:00.000Z",
      "updatedAt": "2026-02-09T10:00:00.000Z"
    }
  }
}
```

**POST /api/church-admin/create**

```json
{
  "success": true,
  "message": "Church admin account created successfully",
  "data": {
    "account": {
      "id": "uuid",
      "email": "admin@email.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ChurchAdmin"
    },
    "churchAdmin": {
      "id": "uuid",
      "accountId": "uuid",
      "churchId": "uuid"
    },
    "token": "jwt"
  }
}
```

**GET /api/users**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "accountId": "uuid",
        "gender": "Male|Female",
        "originCountry": "string|null",
        "originState": "string|null",
        "originLga": "string|null",
        "residenceCountry": "string|null",
        "residenceState": "string|null",
        "residenceCity": "string|null",
        "residenceAddress": "string|null",
        "occupation": "string|null",
        "interests": "json|null",
        "matchPreference": "my_church|my_church_plus|other_churches|null",
        "subscriptionTier": "free|premium",
        "subscriptionStatus": "active|expired|canceled",
        "subscriptionExpiresAt": "2026-02-09T10:00:00.000Z|null",
        "isVerified": false,
        "verificationStatus": "pending|in_progress|verified|rejected",
        "verificationNotes": "string|null",
        "verifiedAt": "2026-02-09T10:00:00.000Z|null",
        "assignedCounselorId": "uuid|null",
        "churchId": "uuid|null",
        "account": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "user@email.com",
          "phone": "string|null",
          "status": "active|suspended|pending",
          "createdAt": "2026-02-09T10:00:00.000Z"
        },
        "church": {
          "id": "uuid",
          "officialName": "First Baptist Church",
          "aka": "FBC"
        },
        "assignedCounselor": {
          "id": "uuid",
          "account": {
            "firstName": "Mary",
            "lastName": "Smith"
          }
        }
      }
    ]
  },
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

**GET /api/users/:id**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "id": "uuid",
      "accountId": "uuid",
      "gender": "Male|Female",
      "originCountry": "string|null",
      "originState": "string|null",
      "originLga": "string|null",
      "residenceCountry": "string|null",
      "residenceState": "string|null",
      "residenceCity": "string|null",
      "residenceAddress": "string|null",
      "occupation": "string|null",
      "interests": "json|null",
      "matchPreference": "my_church|my_church_plus|other_churches|null",
      "subscriptionTier": "free|premium",
      "subscriptionStatus": "active|expired|canceled",
      "subscriptionExpiresAt": "2026-02-09T10:00:00.000Z|null",
      "isVerified": false,
      "verificationStatus": "pending|in_progress|verified|rejected",
      "verificationNotes": "string|null",
      "verifiedAt": "2026-02-09T10:00:00.000Z|null",
      "assignedCounselorId": "uuid|null",
      "churchId": "uuid|null",
      "account": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@email.com",
        "phone": "string|null",
        "status": "active|suspended|pending",
        "createdAt": "2026-02-09T10:00:00.000Z"
      },
      "church": {
        "id": "uuid",
        "officialName": "First Baptist Church",
        "aka": "FBC"
      },
      "assignedCounselor": {
        "id": "uuid",
        "account": {
          "firstName": "Mary",
          "lastName": "Smith",
          "email": "counselor@email.com"
        }
      }
    }
  }
}
```

**PUT /api/users/:id**

```json
{
  "message": "User profile updated successfully",
  "user": {
    "id": "uuid",
    "accountId": "uuid",
    "gender": "Male|Female",
    "originCountry": "string|null",
    "originState": "string|null",
    "originLga": "string|null",
    "residenceCountry": "string|null",
    "residenceState": "string|null",
    "residenceCity": "string|null",
    "residenceAddress": "string|null",
    "occupation": "string|null",
    "interests": "json|null",
    "matchPreference": "my_church|my_church_plus|other_churches|null",
    "subscriptionTier": "free|premium",
    "subscriptionStatus": "active|expired|canceled",
    "subscriptionExpiresAt": "2026-02-09T10:00:00.000Z|null",
    "isVerified": false,
    "verificationStatus": "pending|in_progress|verified|rejected",
    "verificationNotes": "string|null",
    "verifiedAt": "2026-02-09T10:00:00.000Z|null",
    "assignedCounselorId": "uuid|null",
    "churchId": "uuid|null"
  }
}
```

**PATCH /api/users/:id/verification**

```json
{
  "success": true,
  "message": "User verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "accountId": "uuid",
      "gender": "Male|Female",
      "originCountry": "string|null",
      "originState": "string|null",
      "originLga": "string|null",
      "residenceCountry": "string|null",
      "residenceState": "string|null",
      "residenceCity": "string|null",
      "residenceAddress": "string|null",
      "occupation": "string|null",
      "interests": "json|null",
      "matchPreference": "my_church|my_church_plus|other_churches|null",
      "subscriptionTier": "free|premium",
      "subscriptionStatus": "active|expired|canceled",
      "subscriptionExpiresAt": "2026-02-09T10:00:00.000Z|null",
      "isVerified": true,
      "verificationStatus": "verified",
      "verificationNotes": "string|null",
      "verifiedAt": "2026-02-09T10:00:00.000Z",
      "assignedCounselorId": "uuid|null",
      "churchId": "uuid|null"
    }
  }
}
```

**PATCH /api/users/:id/status**

```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": { "status": "active|suspended" }
}
```

### **ChurchAdmin (Unified Response Format)**

**GET /api/church-admin**

```json
{
  "success": true,
  "message": "Church admins fetched successfully",
  "data": {
    "churchAdmins": [
      {
        "id": "uuid",
        "accountId": "uuid",
        "churchId": "uuid",
        "account": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "admin@email.com",
          "phone": "string|null",
          "status": "active|suspended|pending",
          "createdAt": "2026-02-09T10:00:00.000Z"
        },
        "church": {
          "id": "uuid",
          "officialName": "First Baptist Church",
          "aka": "FBC",
          "email": "church@email.com",
          "phone": "string",
          "status": "pending|active|suspended"
        }
      }
    ]
  },
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

**GET /api/church-admin/:id**

```json
{
  "success": true,
  "message": "Church admin fetched successfully",
  "data": {
    "churchAdmin": {
      "id": "uuid",
      "accountId": "uuid",
      "churchId": "uuid",
      "account": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "admin@email.com",
        "phone": "string|null",
        "status": "active|suspended|pending",
        "createdAt": "2026-02-09T10:00:00.000Z"
      },
      "church": {
        "id": "uuid",
        "officialName": "First Baptist Church",
        "aka": "FBC",
        "email": "church@email.com",
        "phone": "string",
        "status": "pending|active|suspended"
      }
    }
  }
}
```

**GET /api/church-admin/dashboard**

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "church": {
      "id": "uuid",
      "name": "First Baptist Church",
      "aka": "FBC",
      "email": "church@email.com",
      "phone": "string",
      "status": "pending|active|suspended"
    },
    "stats": {
      "totalMembers": 0,
      "verifiedMembers": 0,
      "pendingVerification": 0,
      "inProgressVerification": 0,
      "totalCounselors": 0
    },
    "recentMembers": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@email.com",
        "verificationStatus": "pending|in_progress|verified|rejected",
        "assignedCounselor": "Mary Smith|null",
        "joinedAt": "2026-02-09T10:00:00.000Z"
      }
    ]
  }
}
```

**GET /api/church-admin/me/members**

```json
{
  "success": true,
  "message": "Members fetched successfully",
  "data": {
    "members": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@email.com",
        "phone": "string|null",
        "verificationStatus": "pending|in_progress|verified|rejected",
        "verificationNotes": "string|null",
        "verifiedAt": "2026-02-09T10:00:00.000Z|null",
        "assignedCounselor": { "id": "uuid", "name": "Mary Smith" },
        "accountStatus": "active|suspended|pending",
        "joinedAt": "2026-02-09T10:00:00.000Z"
      }
    ]
  },
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

**POST /api/church-admin/assign-counselor**

```json
{
  "success": true,
  "message": "User assigned to counselor successfully",
  "data": {
    "userId": "uuid",
    "userName": "John Doe",
    "counselorName": "Mary Smith",
    "verificationStatus": "in_progress"
  }
}
```

### **Counselor (Unified Response Format)**

**GET /api/counselor/dashboard**

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "stats": {
      "totalAssigned": 0,
      "pending": 0,
      "inProgress": 0,
      "verified": 0,
      "rejected": 0
    },
    "assignedUsers": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@email.com",
        "verificationStatus": "pending|in_progress|verified|rejected",
        "verificationNotes": "string|null",
        "verifiedAt": "2026-02-09T10:00:00.000Z|null",
        "assignedAt": "2026-02-09T10:00:00.000Z"
      }
    ]
  }
}
```

**GET /api/counselor/assigned-users**

```json
{
  "success": true,
  "message": "Assigned users fetched successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@email.com",
        "phone": "string|null",
        "gender": "Male|Female",
        "verificationStatus": "pending|in_progress|verified|rejected",
        "verificationNotes": "string|null",
        "verifiedAt": "2026-02-09T10:00:00.000Z|null",
        "occupation": "string|null",
        "residenceState": "string|null",
        "residenceCity": "string|null",
        "assignedAt": "2026-02-09T10:00:00.000Z"
      }
    ]
  },
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

**POST /api/counselor/verify-user/:userId**

```json
{
  "success": true,
  "message": "User verified successfully",
  "data": {
    "userId": "uuid",
    "userName": "John Doe",
    "email": "user@email.com",
    "verificationStatus": "verified|rejected",
    "verifiedAt": "2026-02-09T10:00:00.000Z|null"
  }
}
```

**POST /api/counselor/create**

```json
{
  "success": true,
  "message": "Counselor account created successfully",
  "data": {
    "account": {
      "id": "uuid",
      "email": "counselor@email.com",
      "firstName": "Mary",
      "lastName": "Smith",
      "role": "Counselor"
    },
    "counselor": {
      "id": "uuid",
      "bio": "string|null",
      "yearsExperience": 5
    },
    "token": "jwt"
  }
}
```

**GET /api/counselor/list**

```json
{
  "success": true,
  "message": "Counselors fetched successfully",
  "data": {
    "counselors": [
      {
        "id": "uuid",
        "accountId": "uuid",
        "churchId": "uuid",
        "bio": "string|null",
        "yearsExperience": 5,
        "account": {
          "id": "uuid",
          "firstName": "Mary",
          "lastName": "Smith",
          "email": "counselor@email.com",
          "phone": "string|null",
          "status": "active|suspended|pending",
          "createdAt": "2026-02-09T10:00:00.000Z"
        }
      }
    ]
  }
}
```

**GET /api/counselor/:id**

```json
{
  "success": true,
  "message": "Counselor fetched successfully",
  "data": {
    "counselor": {
      "id": "uuid",
      "accountId": "uuid",
      "churchId": "uuid",
      "bio": "string|null",
      "yearsExperience": 5,
      "account": {
        "id": "uuid",
        "firstName": "Mary",
        "lastName": "Smith",
        "email": "counselor@email.com",
        "phone": "string|null",
        "status": "active|suspended|pending"
      },
      "church": {
        "id": "uuid",
        "officialName": "First Baptist Church",
        "aka": "FBC"
      }
    }
  }
}
```

**PUT /api/counselor/:id**

```json
{
  "success": true,
  "message": "Counselor updated successfully",
  "data": {
    "counselor": {
      "id": "uuid",
      "accountId": "uuid",
      "churchId": "uuid",
      "bio": "string|null",
      "yearsExperience": 5
    }
  }
}
```

**PATCH /api/counselor/:id/status**

```json
{
  "success": true,
  "message": "Counselor suspended successfully",
  "data": { "status": "active|suspended" }
}
```

---

## 🎯 Complete User Flows

### **Flow 1: SuperAdmin Creates Church**

1. `POST /api/churches` - Create church
2. `POST /api/church-admin/create` - Create admin for church
3. Church admin receives credentials

### **Flow 2: Church Admin Onboards Counselor**

1. `POST /api/counselor/create` - Create counselor account
2. Counselor receives credentials
3. `GET /api/church-admin/dashboard` - See counselor added

### **Flow 3: User Verification Workflow**

1. User signs up: `POST /api/auth/signup`
2. Church admin sees user: `GET /api/church-admin/me/members`
3. Church admin assigns to counselor: `POST /api/church-admin/assign-counselor`
4. Counselor sees user: `GET /api/counselor/assigned-users`
5. Counselor verifies: `POST /api/counselor/verify-user/:userId`
6. User is verified and ready!

---

## 📊 Dashboard Responses

### **SuperAdmin Dashboard**

```json
{
  "overview": {
    "churches": { "total": 10, "active": 8, "pending": 2 },
    "churchAdmins": { "total": 10 },
    "counselors": { "total": 25, "active": 22 },
    "users": { "total": 150, "verified": 100, "premium": 20, "free": 130 }
  },
  "recentActivity": {
    "churches": [...],
    "users": [...]
  }
}
```

### **ChurchAdmin Dashboard**

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "church": { "id": "...", "name": "...", "email": "..." },
    "stats": {
      "totalMembers": 45,
      "verifiedMembers": 30,
      "pendingVerification": 10,
      "inProgressVerification": 5,
      "totalCounselors": 5
    },
    "recentMembers": [...]
  }
}
```

### **Counselor Dashboard**

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "stats": {
      "totalAssigned": 10,
      "pending": 2,
      "inProgress": 5,
      "verified": 3,
      "rejected": 0
    },
    "assignedUsers": [...]
  }
}
```

---

## 🔐 Authentication & Authorization

**Roles:**

- `SuperAdmin` - Full platform access
- `ChurchAdmin` - Manage their church only
- `Counselor` - Verify assigned users only
- `User` - Own profile access only

**All protected endpoints require:**

```
Headers: Authorization: Bearer {token}
```
**payload**
- id - account ID
- email - account email
- role - account role
- firstName - Optional

---
