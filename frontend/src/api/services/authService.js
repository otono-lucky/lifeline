import apiClient from "../apiClient";

export const authService = {
  // Signup
  signup: async (data) => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token) => {
    const response = await apiClient.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Request email verification (resend)
  requestVerification: async (email) => {
    const response = await apiClient.post("/auth/request-verification", {
      email,
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Verify reset password token before showing reset form
  verifyResetToken: async (token) => {
    const response = await apiClient.get(`/auth/reset-password/${token}`);
    return response.data;
  },

  // Reset password
  // Backend expects: { token, password, confirmPassword }
  resetPassword: async (token, password, confirmPassword) => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,        // must match backend ResetPasswordSchema field name
      confirmPassword,
    });
    return response.data;
  },
};
