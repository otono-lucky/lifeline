import apiClient from "../apiClient";

export const matchingService = {
  getActiveMatch: async () => {
    const response = await apiClient.get("/matches/active");
    return response.data;
  },

  getActiveMatchForAccount: async (accountId) => {
    const response = await apiClient.get(`/matches/active/${accountId}`);
    return response.data;
  },

  getMatchHistory: async () => {
    const response = await apiClient.get("/matches/history");
    return response.data;
  },

  getMatchHistoryForAccount: async (accountId) => {
    const response = await apiClient.get(`/matches/history/${accountId}`);
    return response.data;
  },

  decideMatch: async (matchId, payload) => {
    const response = await apiClient.post(`/matches/${matchId}/decision`, payload);
    return response.data;
  },

  getPublicProfile: async (accountId) => {
    const response = await apiClient.get(`/matches/public-profile/${accountId}`);
    return response.data;
  },

  getMatchProfile: async (matchId, accountId) => {
    const response = await apiClient.get(
      `/matches/${matchId}/profile/${accountId}`,
    );
    return response.data;
  },

  getMatchDetails: async (matchId) => {
    const response = await apiClient.get(`/matches/${matchId}`);
    return response.data;
  },

  listMatches: async (params = {}) => {
    const response = await apiClient.get("/matches", { params });
    return response.data;
  },

  createManualMatch: async (payload) => {
    const response = await apiClient.post("/matches", payload);
    return response.data;
  },

  endMatch: async (matchId, reason = "") => {
    const response = await apiClient.post(`/matches/${matchId}/end`, {
      reason: reason || undefined,
    });
    return response.data;
  },
};

