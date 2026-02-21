// services/auth.service.ts
// Authentication service

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/db";
import { sendEmail } from "../services/emailService";
import env from "../config/env";
import { Account } from "@prisma/client";

/**
 * Request email verification
 * Generates token and sends verification email
 */
export const requestEmailVerification = async (
  partialAccount: Partial<Account>,
) => {
  if (!partialAccount.id || !partialAccount.email) {
    throw new Error("Account ID or Email not found");
  }

  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours

  // Update account with token
  const account = await prisma.account.update({
    where: { id: partialAccount.id },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: expiry,
      emailVerificationLastSentAt: new Date(),
    },
  });

  // Send verification email
  const verificationUrl = `${env.clientUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: account.email,
    subject: "Verify Your Email - Faith Dating Platform",
    html: `
      <h2>Welcome ${account.firstName}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
  });

  return { message: "Verification email sent" };
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const account = await prisma.account.findUnique({
    where: { emailVerificationToken: hashedToken },
  });

  if (!account) {
    throw new Error("Invalid verification token");
  }

  if (!account.emailVerificationToken || !account.emailVerificationExpiry) {
    throw new Error("Invalid or missing verification token");
  }

  if (new Date() > account.emailVerificationExpiry) {
    throw new Error("Verification token has expired");
  }

  // Mark email as verified
  await prisma.account.update({
    where: { id: account.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
      emailVerificationLastSentAt: null,
    },
  });

  return {
    message: "Email verified successfully",
    account: {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
    },
  };
};

/**
 * Request password reset
 * Generates token and sends reset email
 */
export const requestPasswordReset = async (email: string) => {
  const account = await prisma.account.findUnique({
    where: { email },
  });

  if (!account) {
    // Don't reveal if email exists or not (security)
    return {
      message: "If an account exists, a password reset link has been sent",
    };
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes

  // Update account with token
  await prisma.account.update({
    where: { id: account.id },
    data: {
      passwordResetToken: token,
      passwordResetExpiry: expiry,
    },
  });

  // Send reset email
  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: account.email,
    subject: "Reset Your Password - Faith Dating Platform",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${account.firstName},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });

  return {
    message: "If an account exists, a password reset link has been sent",
  };
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  const account = await prisma.account.findUnique({
    where: { passwordResetToken: token },
  });

  if (!account) {
    throw new Error("Invalid reset token");
  }

  // Check if token expired
  if (account.passwordResetExpiry && new Date() > account.passwordResetExpiry) {
    throw new Error("Reset token has expired");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password and clear reset token
  await prisma.account.update({
    where: { id: account.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });

  return {
    message: "Password reset successfully",
  };
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email: string) => {
  const account = await prisma.account.findUnique({
    where: { email },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  if (account.isEmailVerified) {
    throw new Error("Email already verified");
  }

  const now = new Date();

  // Cooldown: 2 minutes
  if (account.emailVerificationLastSentAt) {
    const diffMs =
      now.getTime() - account.emailVerificationLastSentAt.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes < 2) {
      throw new Error(
        "Please wait before requesting another verification email.",
      );
    }
  }

  // Reuse the requestEmailVerification function
  return await requestEmailVerification(account);
};
