
## 🚀 Frontend Integration Guide

### **1. Setup API Client**

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: any;
}

async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });

  return response.json();
}
```

### **2. Example Usage**

```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await apiCall("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.success) {
    localStorage.setItem("token", response.data.token);
    return response.data.user;
  } else {
    throw new Error(response.message);
  }
};

// Get Dashboard
const getDashboard = async () => {
  const response = await apiCall("/api/church-admin/dashboard");

  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.message);
  }
};

// Assign Counselor
const assignCounselor = async (userId: string, counselorId: string) => {
  const response = await apiCall("/api/church-admin/assign-counselor", {
    method: "POST",
    body: JSON.stringify({ userId, counselorId }),
  });

  if (response.success) {
    alert(response.message);
    return response.data;
  } else {
    throw new Error(response.message);
  }
};
```

---

## ✅ What's Ready for Demo

1. ✅ **SuperAdmin Portal**
   - Login
   - Dashboard with stats
   - Create churches
   - Create church admins
   - View all users
   - View all churches

2. ✅ **ChurchAdmin Portal**
   - Login
   - Dashboard with church stats
   - See church members
   - Create counselors
   - Assign users to counselors
   - View counselor list

3. ✅ **Counselor Portal**
   - Login
   - Dashboard with assigned users
   - View assigned users
   - Verify/reject users with notes
   - Update own profile

4. ✅ **User Flow**
   - Sign up
   - Email verification
   - Password reset
   - Profile management

---

## 🎬 Demo Script

**"Let me show you our verification system":**

1. **SuperAdmin creates church**

   ```
   POST /api/churches
   → "First Baptist Church created"
   ```

2. **SuperAdmin creates church admin**

   ```
   POST /api/church-admin/create
   → "Pastor John can now manage the church"
   ```

3. **Church admin logs in**

   ```
   GET /api/church-admin/dashboard
   → Shows: 0 members, 0 counselors
   ```

4. **Church admin creates counselor**

   ```
   POST /api/counselor/create
   → "Sister Mary added"
   ```

5. **User signs up**

   ```
   POST /api/auth/signup
   → "John Doe registered"
   ```

6. **Church admin assigns user**

   ```
   POST /api/church-admin/assign-counselor
   → "John assigned to Sister Mary"
   ```

7. **Counselor verifies user**
   ```
   POST /api/counselor/verify-user/john-id
   → "John verified and ready!"
   ```

---

## 🔧 Next Steps

### **Immediate (This Week)**

1. Run migration
2. Build frontend login pages
3. Build admin dashboards
4. Build church admin portal
5. Build counselor portal

### **Later (Future Features)**

- Matching algorithm
- Messaging system
- Church events
- Advanced analytics
- File uploads (photos, documents)

**Everything is ready for frontend development! Start with login → dashboards → user management.**
