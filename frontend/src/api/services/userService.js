import apiClient from "../apiClient";

export const userService = {
  // Get user profile (own)
  getProfile: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await apiClient.put("/users/me", data);
    return response.data;
  },

  // Get user by ID (if allowed)
  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user by ID
  updateUser: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },
};
