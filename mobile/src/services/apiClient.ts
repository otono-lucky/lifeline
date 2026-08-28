// services/apiClient.ts
// Axios API Client with async storage token injection

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiResponse } from "../types";

// Note: Set this to your machine's LAN IP or Cloudflare tunnel when testing on physical device/emulator
// e.g. "http://10.0.2.2:5000/api" for Android emulator, "http://localhost:5000/api" for iOS
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

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
      const token = await AsyncStorage.getItem("lifeline_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("[apiClient] Failed to retrieve token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor for standardized response extraction & 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("[apiClient] Unauthorized 401 - clearing local token");
      await AsyncStorage.removeItem("lifeline_token");
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network request failed. Please check your connection.";
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
