// controllers/auth.controller.ts
// Complete authentication & lead retention endpoints

import { Request, Response } from "express";
import { prisma } from "../config/db";
import { generateToken } from "../utils/tokenManager";
import {
  createUserAccountWithVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  registerLead,
  handleSocialAuth,
} from "../services/authService";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { comparePassword, hashPassword } from "../utils/passwordHasher";

/**
 * @desc    Step-1 Lead Registration (Strategic Onboarding & Lead Recovery)
 * @route   POST /api/auth/lead-register
 * @access  Public
 */
export const leadRegister = async (req: Request, res: Response) => {
  try {
    const { email, phone, firstName, lastName, password, authProvider, authProviderId, gender } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json(errorResponse("Email, firstName, and lastName are required"));
    }

    const account = await registerLead({
      email,
      phone,
      firstName,
      lastName,
      password,
      authProvider,
      authProviderId,
      gender,
    });

    const token = generateToken({
      id: account.id,
      email: account.email,
      role: account.role,
      firstName: account.firstName,
    });

    return res.status(201).json(
      successResponse("Lead registered successfully. Initializing onboarding sequence.", {
        token,
        account,
      }),
    );
  } catch (error: any) {
    return res.status(400).json(errorResponse(error.message || "Failed to register lead"));
  }
};

/**
 * @desc    One-Click Social Login / Register (Google, Apple, etc.)
 * @route   POST /api/auth/social-login
 * @access  Public
 */
export const socialLogin = async (req: Request, res: Response) => {
  try {
    const { provider, providerId, email, firstName, lastName, gender } = req.body;

    if (!provider || !providerId || !email) {
      return res.status(400).json(errorResponse("Provider, providerId, and email are required"));
    }

    const account = await handleSocialAuth({
      provider,
      providerId,
      email,
      firstName: firstName || "User",
      lastName: lastName || "",
      gender,
    });

    const token = generateToken({
      id: account.id,
      email: account.email,
      role: account.role,
      firstName: account.firstName,
    });

    return res.json(
      successResponse("Social login successful", {
        token,
        user: {
          id: account.id,
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          role: account.role,
        },
      }),
    );
  } catch (error: any) {
    return res.status(400).json(errorResponse(error.message || "Social login failed"));
  }
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req: Request, res: Response) => {
  const requestId = `signup_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  const startedAt = Date.now();
  console.log(
    `[POST /api/auth/signup][${requestId}] Starting - Email:`,
    req.body?.email,
  );

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      originCountry,
      originState,
      originLga,
      residenceCountry,
      residenceState,
      residenceCity,
      residenceAddress,
      occupation,
      interests,
      churchId,
      matchPreference,
      branchName,
      whatsappNumber,
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.account.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(
        `[POST /api/auth/signup][${requestId}] Failed: User already exists`,
      );
      return res.status(400).json(errorResponse("User already exists"));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const {
      account: newAccount,
      emailSent,
      emailPreview,
      emailErrorMessage,
    } = await createUserAccountWithVerification({
      firstName,
      lastName,
      email,
      phone,
      hashedPassword,
      gender,
      dateOfBirth,
      originCountry,
      originState,
      originLga,
      residenceCountry,
      residenceState,
      residenceCity,
      residenceAddress,
      occupation,
      interests,
      churchId,
      matchPreference,
      branchName,
      whatsappNumber,
    });

    if (!emailSent) {
      console.error(
        `[POST /api/auth/signup][${requestId}] Verification email failed:`,
        emailErrorMessage || "Unknown error",
      );
    }

    console.log(
      `[POST /api/auth/signup][${requestId}] Success - User: ${newAccount.id} in ${Date.now() - startedAt}ms`,
    );

    const message = emailSent
      ? "User registered successfully. Please check your email to verify your account."
      : "User registered successfully, but we could not send a verification email. Please request verification.";

    res.status(201).json(
      successResponse(message, {
        user: newAccount,
        emailSent,
        ...(emailPreview ? { emailPreview } : {}),
      }),
    );
  } catch (error: any) {
    console.error(
      `[POST /api/auth/signup][${requestId}] Failed after ${Date.now() - startedAt}ms:`,
      error.message,
    );
    res
      .status(500)
      .json(errorResponse(error.message || "Server error during registration"));
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  console.log("[POST /api/auth/login] Starting - Email:", req.body?.email);
  try {
    const { email, password } = req.body;

    const userAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (!userAccount || !userAccount.password) {
      console.error(
        "[POST /api/auth/login] Failed: Invalid credentials",
      );
      return res.status(400).json(errorResponse("Invalid email or password"));
    }

    const isMatch = await comparePassword(password, userAccount.password);
    if (!isMatch) {
      console.error(
        "[POST /api/auth/login] Failed: Invalid credentials - password mismatch",
      );
      return res.status(400).json(errorResponse("Invalid email or password"));
    }

    if (userAccount.status === "suspended") {
      return res
        .status(403)
        .json(
          errorResponse(
            "Your account has been suspended. Please contact support.",
          ),
        );
    }

    if (userAccount.role === "User" && !userAccount.isEmailVerified) {
      return res.status(403).json(
        errorResponse(
          "Please verify your email address before logging in. Check your inbox for the verification link.",
          {
            requiresVerification: true,
            email: userAccount.email,
          },
        ),
      );
    }

    const token = generateToken({
      id: userAccount.id,
      email: userAccount.email,
      role: userAccount.role,
      firstName: userAccount.firstName,
    });
    console.log("[POST /api/auth/login] Success - User:", userAccount.id);

    res.json(
      successResponse("Logged in successfully", {
        token,
        user: {
          id: userAccount.id,
          firstName: userAccount.firstName,
          lastName: userAccount.lastName,
          email: userAccount.email,
          role: userAccount.role,
          isEmailVerified: userAccount.isEmailVerified,
        },
      }),
    );
  } catch (error: any) {
    console.error("[POST /api/auth/login] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse("Server error during login"));
  }
};

/**
 * @desc    Request email verification
 * @route   POST /api/auth/request-verification
 * @access  Public
 */
export const requestVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(errorResponse("Email is required"));
    }

    const result = await resendVerificationEmail(email);

    res.json(
      successResponse(
        result.message || "Verification email sent. Please check your inbox.",
        {
          ...(result.emailPreview ? { emailPreview: result.emailPreview } : {}),
        },
      ),
    );
  } catch (error: any) {
    if (error?.retryAfterSeconds) {
      return res.status(429).json(
        errorResponse(error.message, {
          retryAfterSeconds: error.retryAfterSeconds,
        }),
      );
    }
    res.status(500).json(
      errorResponse(
        error.message || "Server error sending verification email",
      ),
    );
  }
};

/**
 * @desc    Verify email with token
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmailToken = async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token);
    const result = await verifyEmail(token);
    res.json(successResponse(result.message, { account: result.account }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error verifying email"));
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(errorResponse("Email is required"));
    }

    const result = await requestPasswordReset(email);

    res.json(
      successResponse(result.message, {
        ...(result.emailPreview ? { emailPreview: result.emailPreview } : {}),
      }),
    );
  } catch (error: any) {
    res
      .status(500)
      .json(
        errorResponse(
          error.message || "Server error processing password reset request",
        ),
      );
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPasswordWithToken = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res
        .status(400)
        .json(
          errorResponse("Token, password, and confirmPassword are required"),
        );
    }

    if (password !== confirmPassword) {
      return res.status(400).json(errorResponse("Passwords do not match"));
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json(errorResponse("Password must be at least 6 characters long"));
    }

    const result = await resetPassword(token, password);
    res.json(successResponse(result.message, null));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error resetting password"));
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const account = await prisma.account.findUnique({
      where: { id: req.account.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        status: true,
        createdAt: true,
        churchAdmin: {
          select: {
            title: true,
            churchId: true,
          },
        },
      },
    });

    if (!account) {
      return res.status(404).json(errorResponse("Account not found"));
    }

    res.json(successResponse("User fetched successfully", { user: account }));
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching user"));
  }
};
