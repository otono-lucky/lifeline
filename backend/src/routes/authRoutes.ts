// routes/auth.routes.ts
// Complete authentication routes

import express from "express";
import {
  signup,
  login,
  requestVerification,
  verifyEmailToken,
  forgotPassword,
  resetPasswordWithToken,
  getCurrentUser,
} from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// ============= PUBLIC ROUTES =============

// Register
router.post("/signup", signup);

// Login
router.post("/login", login);

// Request email verification (resend)
router.post("/request-verification", requestVerification);

// Verify email with token
router.get("/verify-email/:token", verifyEmailToken);

// Forgot password (request reset)
router.post("/forgot-password", forgotPassword);

// Reset password with token
router.post("/reset-password", resetPasswordWithToken);

// ============= PROTECTED ROUTES =============

// Get current user
router.get("/me", authMiddleware, getCurrentUser);

export default router;