// store/authStore.ts
// Zustand Store for Global Authentication & Session State

import { create } from "zustand";
import storage from "../services/storage";
import apiClient from "../services/apiClient";
import { UserProfile, UserVettingStatus } from "../types";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  vettingStatus: UserVettingStatus;

  // Actions
  initialize: () => Promise<void>;
  login: (token: string, userData?: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateLocalUser: (updater: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isProfileComplete: false,
  vettingStatus: "DRAFT",

  initialize: async () => {
    try {
      const storedToken = await storage.getToken();
      if (!storedToken) {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      set({ token: storedToken, isAuthenticated: true });

      try {
        const response = await apiClient.get<{ success: boolean; data: { user: UserProfile } }>("/auth/me");
        if (response.data.success && response.data.data?.user) {
          const user = response.data.data.user;
          const isComplete =
            user.profileCompletionPercentage === 100 ||
            user.vettingStatus !== "DRAFT";

          set({
            user,
            isProfileComplete: isComplete,
            vettingStatus: user.vettingStatus || "DRAFT",
          });
        }
      } catch (err) {
        console.warn("[authStore] Could not fetch profile with stored token:", err);
      }
    } catch (e) {
      console.error("[authStore] Initialization error:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (newToken: string, userData?: Partial<UserProfile>) => {
    await storage.setToken(newToken);
    set({
      token: newToken,
      isAuthenticated: true,
      isLoading: true,
    });

    try {
      const response = await apiClient.get<{ success: boolean; data: { user: UserProfile } }>("/auth/me");
      if (response.data.success && response.data.data?.user) {
        const fullUser = response.data.data.user;
        const isComplete =
          fullUser.profileCompletionPercentage === 100 ||
          fullUser.vettingStatus !== "DRAFT";

        set({
          user: fullUser,
          isProfileComplete: isComplete,
          vettingStatus: fullUser.vettingStatus || "DRAFT",
          isLoading: false,
        });
        return;
      }
    } catch (err) {
      console.warn("[authStore] Failed to fetch /auth/me after login:", err);
    }

    if (userData) {
      const isComplete =
        userData.profileCompletionPercentage === 100 ||
        (userData.vettingStatus && userData.vettingStatus !== "DRAFT");
      set({
        user: userData as UserProfile,
        isProfileComplete: Boolean(isComplete),
        vettingStatus: userData.vettingStatus || "DRAFT",
      });
    }
    set({ isLoading: false });
  },

  logout: async () => {
    await storage.removeToken();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isProfileComplete: false,
      vettingStatus: "DRAFT",
      isLoading: false,
    });
  },

  refreshUser: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { user: UserProfile } }>("/auth/me");
      if (response.data.success && response.data.data?.user) {
        const user = response.data.data.user;
        const isComplete =
          user.profileCompletionPercentage === 100 ||
          user.vettingStatus !== "DRAFT";

        set({
          user,
          isProfileComplete: isComplete,
          vettingStatus: user.vettingStatus || "DRAFT",
        });
      }
    } catch (error) {
      console.warn("[authStore] Failed to refresh user profile:", error);
    }
  },

  updateLocalUser: (updater: Partial<UserProfile>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const merged = { ...currentUser, ...updater };
    const isComplete =
      merged.profileCompletionPercentage === 100 ||
      (merged.vettingStatus && merged.vettingStatus !== "DRAFT");

    set({
      user: merged,
      isProfileComplete: isComplete,
      vettingStatus: merged.vettingStatus || "DRAFT",
    });
  },
}));

export default useAuthStore;
