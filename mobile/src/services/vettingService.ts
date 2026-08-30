// services/vettingService.ts
// Counselor vetting, appeals, and post-match debrief reset

import apiClient from "./apiClient";
import { ApiResponse } from "../types";

export const vettingService = {
  // User appeal against hard-block
  submitAppeal: async (appealReason: string) => {
    const response = await apiClient.post<
      ApiResponse<{
        appealId: string;
        status: string;
      }>
    >("/vetting/appeal", { appealReason });
    return response.data;
  },
};

export default vettingService;
