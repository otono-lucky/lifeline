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

  getSocialMedia: async (accountId) => {
    const response = await apiClient.get(`/users/${accountId}/socials`);
    return response.data;
  },

  createSocialMedia: async (accountId, payload) => {
    const response = await apiClient.post(`/users/${accountId}/socials`, payload);
    return response.data;
  },

  deleteSocialMedia: async (accountId, socialId) => {
    const response = await apiClient.delete(
      `/users/${accountId}/socials/${socialId}`,
    );
    return response.data;
  },

  uploadProfileImage: async (accountId, file, order = 1) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("order", String(order));

    const response = await apiClient.post(
      `/users/${accountId}/photos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};
