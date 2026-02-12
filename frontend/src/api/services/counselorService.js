import apiClient from "../apiClient";

export const counselorService = {
  // Get counselor dashboard
  getDashboard: async () => {
    const response = await apiClient.get("/counselor/dashboard");
    return response.data;
  },

  // Get assigned users
  getAssignedUsers: async (params = {}) => {
    const response = await apiClient.get("/counselor/assigned-users", {
      params,
    });
    return response.data;
  },

  // Verify/reject user
  verifyUser: async (userId, status, notes = "") => {
    const response = await apiClient.post(`/counselor/verify-user/${userId}`, {
      status,
      notes,
    });
    return response.data;
  },

  // Get own profile
  getProfile: async (id) => {
    const response = await apiClient.get(`/counselor/${id}`);
    return response.data;
  },

  // Update own profile
  updateProfile: async (id, data) => {
    const response = await apiClient.put(`/counselor/${id}`, data);
    return response.data;
  },
};
