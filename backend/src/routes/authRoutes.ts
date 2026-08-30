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
import { validateBody } from "../middleware/validate";
import {
  LeadRegisterSchema,
  SocialLoginSchema,
  SignupSchema,
  LoginSchema,
  RequestVerificationSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../schemas/auth.schema";

const router = express.Router();

// Strategic Onboarding & Lead Recovery
router.post("/lead-register", validateBody(LeadRegisterSchema), leadRegister);
router.post("/social-login", validateBody(SocialLoginSchema), socialLogin);

// Core Auth
router.post("/signup", validateBody(SignupSchema), signup);
router.post("/login", validateBody(LoginSchema), login);
router.get("/verify-email/:token", verifyEmailToken);
router.post("/request-verification", validateBody(RequestVerificationSchema), requestVerification);
router.post("/forgot-password", validateBody(ForgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateBody(ResetPasswordSchema), resetPasswordWithToken);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

export default router;