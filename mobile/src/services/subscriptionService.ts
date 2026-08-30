// services/subscriptionService.ts
// Periodic subscription plan management

import apiClient from "./apiClient";
import { ApiResponse, SubscriptionPlanInterval } from "../types";

export const subscriptionService = {
  getStatus: async () => {
    const response = await apiClient.get<
      ApiResponse<{
        subscription: {
          id: string;
          subscriptionTier: string;
          subscriptionInterval?: SubscriptionPlanInterval;
          subscriptionStatus: string;
          subscriptionExpiresAt?: string;
        };
      }>
    >("/subscriptions/status");
    return response.data;
  },

  subscribe: async (interval: SubscriptionPlanInterval) => {
    const response = await apiClient.post<
      ApiResponse<{
        subscription: {
          id: string;
          subscriptionTier: string;
          subscriptionInterval: SubscriptionPlanInterval;
          subscriptionStatus: string;
          subscriptionExpiresAt: string;
        };
      }>
    >("/subscriptions/subscribe", { interval });
    return response.data;
  },

  cancel: async () => {
    const response = await apiClient.post<
      ApiResponse<{
        subscription: {
          id: string;
          subscriptionStatus: string;
          subscriptionExpiresAt?: string;
        };
      }>
    >("/subscriptions/cancel");
    return response.data;
  },
};

export default subscriptionService;
