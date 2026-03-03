import apiClient from "../apiClient";

export const counselorService = {
  // Get counselor dashboard
  getDashboard: async (accountId = null) => {
    const endpoint = accountId
      ? `/counselor/${accountId}/dashboard`
      : "/counselor/dashboard";
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Get assigned users
  getAssignedUsers: async (params = {}, accountId = null) => {
    const endpoint = accountId
      ? `/counselor/${accountId}/assigned-users`
      : "/counselor/assigned-users";
    const response = await apiClient.get(endpoint, {
      params,
    });
    return response.data;
  },

  // Verify/reject user
  verifyUser: async (userAccountId, status, notes = "") => {
    const response = await apiClient.post(
      `/counselor/verify-user/${userAccountId}`,
      {
        status,
        notes,
      },
    );
    return response.data;
  },

  // Get profile by account ID
  getProfile: async (accountId) => {
    const response = await apiClient.get(`/counselor/${accountId}`);
    return response.data;
  },

  // Update profile by account ID
  updateProfile: async (accountId, data) => {
    const response = await apiClient.put(`/counselor/${accountId}`, data);
    return response.data;
  },
};
