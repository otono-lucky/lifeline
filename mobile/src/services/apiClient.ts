// services/apiClient.ts
// Axios API Client with secure token injection, centralized error handling & 401 interception

import axios, { AxiosResponse } from "axios";
import storage from "./storage";
import { ApiResponse } from "../types";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://sincere-reasonably-mouse.ngrok-free.app/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("[apiClient] Failed to retrieve secure token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor for standardized response handling & 401 token clearing
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("[apiClient] Unauthorized 401 - clearing local token");
      await storage.removeToken();
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network request failed. Please check your connection.";
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
