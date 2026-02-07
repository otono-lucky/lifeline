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

/**
 * @desc    Register new user (existing - update to send verification email)
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req: Request, res: Response) => {
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
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      token,
      user: newAccount,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find account
    const userAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (!userAccount) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, userAccount.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is suspended
    if (userAccount.status === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // Check email verification (only for regular users)
    if (userAccount.role === "User" && !userAccount.isEmailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
        email: userAccount.email,
      });
    }

    // Generate token
    const token = generateToken({
      id: userAccount.id,
      email: userAccount.email,
      role: userAccount.role,
      firstName: userAccount.firstName,
    });

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: userAccount.id,
        firstName: userAccount.firstName,
        lastName: userAccount.lastName,
        email: userAccount.email,
        role: userAccount.role,
        isEmailVerified: userAccount.isEmailVerified,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
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
      return res.status(400).json({ message: "Email is required" });
    }

    await resendVerificationEmail(email);

    res.json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error: any) {
    console.error("Request verification error:", error);
    res.status(500).json({
      message: error.message || "Server error sending verification email",
    });
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

    res.json(result);
  } catch (error: any) {
    console.error("Verify email error:", error);
    res.status(400).json({
      message: error.message || "Server error verifying email",
    });
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
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await requestPasswordReset(email);

    res.json(result);
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error processing password reset request",
    });
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

    // Validation
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Token, password, and confirmPassword are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const result = await resetPassword(token, password);

    res.json(result);
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(400).json({
      message: error.message || "Server error resetting password",
    });
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
      },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ user: account });
  } catch (error: any) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
};