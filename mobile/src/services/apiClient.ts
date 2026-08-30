// services/apiClient.ts
// Axios API Client with secure token injection, centralized error handling & 401 interception

import axios, { AxiosResponse } from "axios";
import { Platform } from "react-native";
import storage from "./storage";
import { ApiResponse } from "../types";

// 1. Prioritize EXPO_PUBLIC_API_URL from mobile/.env
// 2. Fallback to active ngrok URL for physical device testing, or localhost for web/emulators
const getDefaultApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fallback for physical devices connecting over internet / ngrok
  return "https://sincere-reasonably-mouse.ngrok-free.app/api";
};

export const API_BASE_URL = getDefaultApiUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
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
