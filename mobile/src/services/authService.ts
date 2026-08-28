// services/authService.ts
// Authentication & Registration API calls

import apiClient from "./apiClient";
import { ApiResponse, UserProfile } from "../types";

export interface LeadRegisterPayload {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SocialAuthPayload {
  email: string;
  authProvider: "GOOGLE" | "APPLE";
  authProviderId: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
}

export const authService = {
  // Step-1 Lead Registration
  registerLead: async (payload: LeadRegisterPayload) => {
    const response = await apiClient.post<
      ApiResponse<{ account: { id: string; email: string }; user: UserProfile; token: string }>
    >("/auth/lead-register", payload);
    return response.data;
  },

  // Social Auth
  socialLogin: async (payload: SocialAuthPayload) => {
    const response = await apiClient.post<
      ApiResponse<{ account: { id: string; email: string }; user: UserProfile; token: string }>
    >("/auth/social-login", payload);
    return response.data;
  },

  // Credentials Login
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<
      ApiResponse<{ account: { id: string; email: string; role: string }; user?: UserProfile; token: string }>
    >("/auth/login", payload);
    return response.data;
  },

  // Get Current User Profile
  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<{ user: UserProfile }>>("/auth/me");
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return response.data;
  },

  // Request Email Verification Resend
  resendVerification: async (email: string) => {
    const response = await apiClient.post<ApiResponse<null>>("/auth/request-verification", { email });
    return response.data;
  },
};

export default authService;
