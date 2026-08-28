// context/AuthContext.tsx
// Core Authentication & Lifecycle State Manager

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../services/apiClient";
import { UserProfile, UserVettingStatus } from "../types";

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { user: UserProfile } }>("/auth/me");
      if (response.data.success && response.data.data?.user) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.warn("[AuthContext] Failed to fetch current user profile:", error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("lifeline_token");
        if (storedToken) {
          setToken(storedToken);
          const response = await apiClient.get<{ success: boolean; data: { user: UserProfile } }>("/auth/me");
          if (response.data.success && response.data.data?.user) {
            setUser(response.data.data.user);
          }
        }
      } catch (error) {
        console.warn("[AuthContext] Init error:", error);
        await AsyncStorage.removeItem("lifeline_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string, userData?: any) => {
    await AsyncStorage.setItem("lifeline_token", newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
    } else {
      await refreshUser();
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("lifeline_token");
    setToken(null);
    setUser(null);
  };

  const updateLocalUser = (updater: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updater } : null));
  };

  const isAuthenticated = Boolean(token && user);
  const isProfileComplete = (user?.profileCompletionPercentage ?? 0) >= 100;
  const vettingStatus: UserVettingStatus = user?.vettingStatus || "DRAFT";

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated,
        isProfileComplete,
        vettingStatus,
        login,
        logout,
        refreshUser,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
