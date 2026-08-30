"use strict";
// routes/authRoutes.ts
// Authentication routes
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authController_1 = require("../controllers/authController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var validate_1 = require("../middleware/validate");
var auth_schema_1 = require("../schemas/auth.schema");
var router = express_1.default.Router();
// Strategic Onboarding & Lead Recovery
router.post("/lead-register", (0, validate_1.validateBody)(auth_schema_1.LeadRegisterSchema), authController_1.leadRegister);
router.post("/social-login", (0, validate_1.validateBody)(auth_schema_1.SocialLoginSchema), authController_1.socialLogin);
// Core Auth
router.post("/signup", (0, validate_1.validateBody)(auth_schema_1.SignupSchema), authController_1.signup);
router.post("/login", (0, validate_1.validateBody)(auth_schema_1.LoginSchema), authController_1.login);
router.get("/verify-email/:token", authController_1.verifyEmailToken);
router.post("/request-verification", (0, validate_1.validateBody)(auth_schema_1.RequestVerificationSchema), authController_1.requestVerification);
router.post("/forgot-password", (0, validate_1.validateBody)(auth_schema_1.ForgotPasswordSchema), authController_1.forgotPassword);
router.post("/reset-password", (0, validate_1.validateBody)(auth_schema_1.ResetPasswordSchema), authController_1.resetPasswordWithToken);
// Protected routes
router.get("/me", authMiddleware_1.default, authController_1.getCurrentUser);
exports.default = router;
