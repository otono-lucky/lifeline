import apiClient from "../apiClient";

export const churchAdminService = {
  // Get church admin dashboard
  getDashboard: async (accountId = null) => {
    const endpoint = accountId
      ? `/church-admin/${accountId}/dashboard`
      : "/church-admin/dashboard";
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Assign user to counselor
  assignCounselor: async (userId, counselorId) => {
    const response = await apiClient.post("/church-admin/assign-counselor", {
      userId,
      counselorId,
    });
    return response.data;
  },

  // Create counselor
  createCounselor: async (data) => {
    const response = await apiClient.post("/counselor/create", data);
    return response.data;
  },

  // Get counselors list
  getCounselors: async (params = {}) => {
    const response = await apiClient.get("/counselor/list", { params });
    return response.data;
  },

  // Get counselor by account ID
  getCounselor: async (accountId) => {
    const response = await apiClient.get(`/counselor/${accountId}`);
    return response.data;
  },

  // Update counselor
  updateCounselor: async (accountId, data) => {
    const response = await apiClient.put(`/counselor/${accountId}`, data);
    return response.data;
  },

  // Update counselor status
  updateCounselorStatus: async (accountId, status) => {
    const response = await apiClient.patch(`/counselor/${accountId}/status`, {
      status,
    });
    return response.data;
  },
};
