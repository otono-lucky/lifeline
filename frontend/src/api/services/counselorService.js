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

  // Review user vetting (APPROVE, REJECT, HARD_BLOCK)
  verifyUser: async (userAccountId, decision, notes = "", reason = "") => {
    // Normalize status string if caller still passes legacy "verified"/"rejected"
    let normalizedDecision = decision;
    if (decision === "verified") normalizedDecision = "APPROVE";
    if (decision === "rejected") normalizedDecision = "REJECT";

    const response = await apiClient.post(
      `/vetting/users/${userAccountId}/review`,
      {
        decision: normalizedDecision,
        notes: notes || undefined,
        reason: reason || notes || undefined,
      },
    );
    return response.data;
  },

  // Reset user after exit debrief
  resetUserAfterDebrief: async (
    userAccountId,
    { notes, readinessScore = 10, matchId } = {},
  ) => {
    const response = await apiClient.post(
      `/vetting/users/${userAccountId}/debrief-reset`,
      {
        notes,
        readinessScore,
        matchId: matchId || undefined,
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
