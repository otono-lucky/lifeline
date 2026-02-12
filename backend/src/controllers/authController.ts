// controllers/auth.controller.ts
// Complete authentication endpoints

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { generateToken } from "../utils/tokenManager";
import {
  requestEmailVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
} from "../services/authService";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { comparePassword, hashPassword } from "../utils/passwordHasher";

/**
 * @desc    Register new user (existing - update to send verification email)
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req: Request, res: Response) => {
  console.log("[POST /api/auth/signup] Starting - Email:", req.body?.email);
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      originCountry,
      originState,
      originLga,
      residenceCountry,
      residenceState,
      residenceCity,
      residenceAddress,
      occupation,
      interests,
      church,
      matchPreference,
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.account.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("[POST /api/auth/signup] Failed: User already exists");
      return res.status(400).json(errorResponse("User already exists"));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create account + user profile
    const newAccount = await prisma.account.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: "User",
        isEmailVerified: false, // Start unverified

        user: {
          create: {
            gender,
            originCountry,
            originState,
            originLga,
            residenceCountry,
            residenceState,
            residenceCity,
            residenceAddress,
            occupation,
            interests,
            church,
            matchPreference,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
        isEmailVerified: true,
      },
    });

    // Send verification email
    await requestEmailVerification(newAccount.id);

    // Generate token (user can login but features limited until verified)
    const token = generateToken(newAccount);
    console.log("[POST /api/auth/signup] Success - User:", newAccount.id);

    res.status(201).json(
      successResponse(
        "User registered successfully. Please check your email to verify your account.",
        {
          token,
          user: newAccount,
        },
      ),
    );
  } catch (error: any) {
    console.error("[POST /api/auth/signup] Failed:", error.message);
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

    // Find account
    const userAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (!userAccount) {
      console.error(
        "[POST /api/auth/login] Failed: Invalid credentials - account not found",
      );
      return res.status(400).json(errorResponse("Invalid credentials"));
    }

    // Check password
    const isMatch = await comparePassword(password, userAccount.password);
    if (!isMatch) {
      console.error(
        "[POST /api/auth/login] Failed: Invalid credentials - password mismatch",
      );
      return res.status(400).json(errorResponse("Invalid credentials"));
    }

    // Check if account is suspended
    if (userAccount.status === "suspended") {
      console.error("[POST /api/auth/login] Failed: Account suspended");
      return res
        .status(403)
        .json(
          errorResponse(
            "Your account has been suspended. Please contact support.",
          ),
        );
    }

    // Check email verification (only for regular users)
    if (userAccount.role === "User" && !userAccount.isEmailVerified) {
      console.error("[POST /api/auth/login] Failed: Email not verified");
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

    // Generate token
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
      .json(errorResponse(error.message || "Server error during login"));
  }
};

/**
 * @desc    Request email verification
 * @route   POST /api/auth/request-verification
 * @access  Public
 */
export const requestVerification = async (req: Request, res: Response) => {
  console.log(
    "[POST /api/auth/request-verification] Starting - Email:",
    req.body?.email,
  );
  try {
    const { email } = req.body;

    if (!email) {
      console.error(
        "[POST /api/auth/forgot-password] Failed: Email is required",
      );
      console.error(
        "[POST /api/auth/request-verification] Failed: Email is required",
      );
      return res.status(400).json(errorResponse("Email is required"));
    }

    await resendVerificationEmail(email);

    res.json(
      successResponse(
        "Verification email sent. Please check your inbox.",
        null,
      ),
    );
  } catch (error: any) {
    console.error(
      "[POST /api/auth/request-verification] Failed:",
      error.message,
    );
    res
      .status(500)
      .json(
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
  console.log("[GET /api/auth/verify-email/:token] Starting");
  try {
    const token = String(req.params.token);

    const result = await verifyEmail(token);
    console.log("[GET /api/auth/verify-email/:token] Success");

    res.json(successResponse(result.message, { account: result.account }));
  } catch (error: any) {
    console.error("[GET /api/auth/verify-email/:token] Failed:", error.message);
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
  console.log(
    "[POST /api/auth/forgot-password] Starting - Email:",
    req.body?.email,
  );
  try {
    const { email } = req.body;

    if (!email) {
      console.error(
        "[POST /api/auth/forgot-password] Failed: Email is required",
      );
      return res.status(400).json(errorResponse("Email is required"));
    }

    const result = await requestPasswordReset(email);
    console.log("[POST /api/auth/forgot-password] Success");

    res.json(successResponse(result.message, null));
  } catch (error: any) {
    console.error("[POST /api/auth/forgot-password] Failed:", error.message);
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
  console.log("[POST /api/auth/reset-password] Starting");
  try {
    const { token, password, confirmPassword } = req.body;

    // Validation
    if (!token || !password || !confirmPassword) {
      console.error(
        "[POST /api/auth/reset-password] Failed: Missing required fields",
      );
      return res
        .status(400)
        .json(
          errorResponse("Token, password, and confirmPassword are required"),
        );
    }

    if (password !== confirmPassword) {
      console.error(
        "[POST /api/auth/reset-password] Failed: Passwords do not match",
      );
      return res.status(400).json(errorResponse("Passwords do not match"));
    }

    if (password.length < 6) {
      console.error(
        "[POST /api/auth/reset-password] Failed: Password too short",
      );
      return res
        .status(400)
        .json(errorResponse("Password must be at least 6 characters long"));
    }

    const result = await resetPassword(token, password);
    console.log("[POST /api/auth/reset-password] Success");

    res.json(successResponse(result.message, null));
  } catch (error: any) {
    console.error("[POST /api/auth/reset-password] Failed:", error.message);
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
  console.log("[GET /api/auth/me] Starting - Account:", req.account?.id);
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
      },
    });

    if (!account) {
      console.error("[GET /api/auth/me] Failed: Account not found");
      return res.status(404).json(errorResponse("Account not found"));
    }
    console.log("[GET /api/auth/me] Success");

    res.json(successResponse("User fetched successfully", { user: account }));
  } catch (error: any) {
    console.error("[GET /api/auth/me] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching user"));
  }
};
