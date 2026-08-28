// routes/authRoutes.ts
// Authentication routes

import express from "express";
import {
  signup,
  login,
  verifyEmailToken,
  requestVerification,
  forgotPassword,
  resetPasswordWithToken,
  getCurrentUser,
  leadRegister,
  socialLogin,
} from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Strategic Onboarding & Lead Recovery
router.post("/lead-register", leadRegister);
router.post("/social-login", socialLogin);

// Core Auth
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmailToken);
router.post("/request-verification", requestVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithToken);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

export default router;