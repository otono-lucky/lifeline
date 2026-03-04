import apiClient from "../apiClient";

export const userService = {
  // Get user profile (own)
  getProfile: async (accountId) => {
    const response = await apiClient.get(`/users/${accountId}`);
    return response.data;
  },

  // Get user by account ID (if allowed)
  getUser: async (accountId) => {
    const response = await apiClient.get(`/users/${accountId}`);
    return response.data;
  },

  // Update user by account ID
  updateUser: async (accountId, data) => {
    const response = await apiClient.put(`/users/${accountId}`, data);
    return response.data;
  },
};
