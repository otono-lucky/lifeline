// context/AuthContext.tsx
// Context adapter wrapping Zustand authStore for seamless compatibility

import React, { useEffect, ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { UserProfile, UserVettingStatus } from "../types";

export interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  vettingStatus: UserVettingStatus;
  login: (token: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateLocalUser: (updater: Partial<UserProfile>) => void;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
  const store = useAuthStore();
  return {
    token: store.token,
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    isProfileComplete: store.isProfileComplete,
    vettingStatus: store.vettingStatus,
    login: store.login,
    logout: store.logout,
    refreshUser: store.refreshUser,
    updateLocalUser: store.updateLocalUser,
  };
};

export default useAuth;
