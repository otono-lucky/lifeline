import React, { useState, useEffect, useCallback } from "react";
import { authService } from "../api/services";
import { queryClient } from "../api/queryClient";
import { queryKeys } from "../api/queryKeys";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await queryClient.fetchQuery({
            queryKey: queryKeys.auth.me(),
            queryFn: authService.getMe,
            staleTime: 1000 * 60 * 2,
          });
          if (response.success && response.data.user) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem("token");
            setUser(null);
            queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
          }
        } catch {
          localStorage.removeItem("token");
          setUser(null);
          queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        queryClient.setQueryData(queryKeys.auth.me(), {
          success: true,
          data: { user: response.data.user },
        });
        return response.data;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    }
  }, []);

  const signup = useCallback(async (data) => {
    setError(null);
    try {
      const response = await authService.signup(data);
      if (response.success) {
        // localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        queryClient.setQueryData(queryKeys.auth.me(), {
          success: true,
          data: { user: response.data.user },
        });
        return response.data;
      } else {
        throw new Error(response.message || "Signup failed");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
    queryClient.clear();
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
