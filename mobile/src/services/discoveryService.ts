// services/discoveryService.ts
// Matchmaking discovery candidate feed

import apiClient from "./apiClient";
import { ApiResponse, CandidateProfile } from "../types";

export const discoveryService = {
  getFeed: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get<
      ApiResponse<{
        candidates: CandidateProfile[];
        meta: { totalCandidates: number; userChurch: string; denominationScope: string };
      }>
    >("/discovery/feed", { params });
    return response.data;
  },

  getCandidateDetails: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<{ candidate: CandidateProfile }>>(
      `/users/${userId}`,
    );
    return response.data;
  },
};

export default discoveryService;
