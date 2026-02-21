import apiClient from "../apiClient";

export const churchService = {
  // Create church
  createChurch: async (data) => {
    const response = await apiClient.post("/churches", data);
    return response.data;
  },

  // Get all churches
  getChurches: async (params = {}) => {
    const response = await apiClient.get("/churches", { params });
    return response.data;
  },

  // Public: Get active churches with minimal fields (no auth required)
  getPublicChurches: async (params = {}) => {
    const response = await apiClient.get("/churches/public", { params });
    return response.data;
  },

  // Get church by ID
  getChurch: async (id) => {
    const response = await apiClient.get(`/churches/${id}`);
    return response.data;
  },

  // Update church
  updateChurch: async (id, data) => {
    const response = await apiClient.put(`/churches/${id}`, data);
    return response.data;
  },

  // Activate church
  activateChurch: async (id, data) => {
    const response = await apiClient.patch(`/churches/${id}/status`, data);
    return response.data;
  },

  // Get church members
  getChurchMembers: async (id, params = {}) => {
    const response = await apiClient.get(`/churches/${id}/members`, { params });
    return response.data;
  },
};
