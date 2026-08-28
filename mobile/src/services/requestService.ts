// services/requestService.ts
// 3-Slot Request management, blind rejection, and first-come acceptance

import apiClient from "./apiClient";
import { ApiResponse, MatchRequest } from "../types";

export const requestService = {
  // Send match request (3-slot cap enforced on backend)
  sendRequest: async (receiverUserId: string) => {
    const response = await apiClient.post<
      ApiResponse<{
        requestId: string;
        status: string;
        slotsUsed: number;
        slotsRemaining: number;
        createdAt: string;
      }>
    >("/requests/send", { receiverUserId });
    return response.data;
  },

  // Get sent requests with active slot counter
  getSentRequests: async () => {
    const response = await apiClient.get<
      ApiResponse<{
        requests: MatchRequest[];
        slotsUsed: number;
        slotsRemaining: number;
      }>
    >("/requests/sent");
    return response.data;
  },

  // Get received requests
  getReceivedRequests: async () => {
    const response = await apiClient.get<
      ApiResponse<{
        requests: MatchRequest[];
        totalReceived: number;
      }>
    >("/requests/received");
    return response.data;
  },

  // First-Come Acceptance (auto-supersedes other requests & provisions channels)
  acceptRequest: async (requestId: string) => {
    const response = await apiClient.post<
      ApiResponse<{
        matchId: string;
        coupleConversationId: string;
        counselorConversationId: string;
      }>
    >(`/requests/${requestId}/accept`);
    return response.data;
  },

  // Blind Rejection (sender notified generically of 1 slot reclamation)
  declineRequest: async (requestId: string) => {
    const response = await apiClient.post<ApiResponse<null>>(
      `/requests/${requestId}/decline`,
    );
    return response.data;
  },

  // Cancel sent request to reclaim slot
  cancelRequest: async (requestId: string) => {
    const response = await apiClient.post<ApiResponse<null>>(
      `/requests/${requestId}/cancel`,
    );
    return response.data;
  },
};

export default requestService;
