import apiClient from "../apiClient";

export const churchAdminService = {
  // Get church admin dashboard
  getDashboard: async () => {
    const response = await apiClient.get("/church-admin/dashboard");
    return response.data;
  },

  // Get church members
  getMembers: async (params = {}) => {
    const response = await apiClient.get("/church-admin/me/members", {
      params,
    });
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

  // Get counselor by ID
  getCounselor: async (id) => {
    const response = await apiClient.get(`/counselor/${id}`);
    return response.data;
  },

  // Update counselor
  updateCounselor: async (id, data) => {
    const response = await apiClient.put(`/counselor/${id}`, data);
    return response.data;
  },

  // Update counselor status
  updateCounselorStatus: async (id, status) => {
    const response = await apiClient.patch(`/counselor/${id}/status`, {
      status,
    });
    return response.data;
  },
};
