import apiClient from "../apiClient";

export const adminService = {
  // Get admin dashboard
  getDashboard: async () => {
    const response = await apiClient.get("/admin/dashboard");
    return response.data;
  },

  // Get admin stats
  getStats: async (period = "week") => {
    const response = await apiClient.get("/admin/stats", {
      params: { period },
    });
    return response.data;
  },

  // Get all users
  getUsers: async (params = {}) => {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (accountId) => {
    const response = await apiClient.get(`/users/${accountId}`);
    return response.data;
  },

  // Update user
  updateUser: async (accountId, data) => {
    const response = await apiClient.put(`/users/${accountId}`, data);
    return response.data;
  },

  // Verify/unverify user
  verifyUser: async (accountId, isVerified) => {
    const response = await apiClient.patch(`/users/${accountId}/verification`, {
      isVerified,
    });
    return response.data;
  },

  // Suspend/activate user
  updateUserStatus: async (accountId, status) => {
    const response = await apiClient.patch(`/users/${accountId}/status`, {
      status,
    });
    return response.data;
  },

  // Create church admin
  createChurchAdmin: async (data) => {
    const response = await apiClient.post("/church-admin/create", data);
    return response.data;
  },

  // Get all church admins
  getChurchAdmins: async (params = {}) => {
    const response = await apiClient.get("/church-admin", { params });
    return response.data;
  },

  // Get church admin by account ID
  getChurchAdmin: async (accountId) => {
    const response = await apiClient.get(`/church-admin/${accountId}`);
    return response.data;
  },

  // Get counselor by account ID
  getCounsellor: async (accountId) => {
    const response = await apiClient.get(`/counselor/${accountId}`);
    return response.data;
  },
  // Get all church admins
  getCounsellors: async (params = {}) => {
    const response = await apiClient.get("/counselor/list-all", { params });
    return response.data;
  },
};
