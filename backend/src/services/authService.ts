// services/authService.ts
// Authentication & Lead Retention Service

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/db";
import { sendEmail, sendTestEmail } from "../services/emailService";
import env from "../config/env";
import { Account, GenderType, MatchPreferenceType } from "@prisma/client";

/**
 * Step 1 Lead Capture (Strategic Onboarding & Lead Retention Framework)
 */
export const registerLead = async (input: {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password?: string;
  authProvider?: string;
  authProviderId?: string;
  gender?: string;
}) => {
  const existing = await prisma.account.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (existing) {
    throw new Error("An account with this email already exists");
  }

  let hashedPassword: string | null = null;
  if (input.password) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(input.password, salt);
  }

  const account = await prisma.account.create({
    data: {
      email: input.email.toLowerCase().trim(),
      phone: input.phone || null,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      password: hashedPassword,
      authProvider: input.authProvider || "local",
      authProviderId: input.authProviderId || null,
      role: "User",
      isEmailVerified: input.authProvider ? true : false,
      status: "pending",
      user: {
        create: {
          gender: (input.gender as GenderType) || "Male",
          onboardingStep: 1,
          profileCompletionPercentage: 10,
          vettingStatus: "DRAFT",
          isDiscoveryIndexed: false,
        },
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  return account;
};

/**
 * Social Auth One-Click Integration (Google, Apple, etc.)
 */
export const handleSocialAuth = async (input: {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
}) => {
  let account = await prisma.account.findUnique({
    where: { email: input.email.toLowerCase().trim() },
    include: { user: true },
  });

  if (!account) {
    // Auto-create lead account
    account = await prisma.account.create({
      data: {
        email: input.email.toLowerCase().trim(),
        firstName: input.firstName,
        lastName: input.lastName,
        authProvider: input.provider,
        authProviderId: input.providerId,
        role: "User",
        isEmailVerified: true,
        status: "active",
        user: {
          create: {
            gender: (input.gender as GenderType) || "Male",
            onboardingStep: 1,
            profileCompletionPercentage: 15,
            vettingStatus: "DRAFT",
            isDiscoveryIndexed: false,
          },
        },
      },
      include: { user: true },
    });
  } else if (!account.authProviderId) {
    // Link social provider to existing account
    account = await prisma.account.update({
      where: { id: account.id },
      data: {
        authProvider: input.provider,
        authProviderId: input.providerId,
        isEmailVerified: true,
      },
      include: { user: true },
    });
  }

  return account;
};

export const createUserAccountWithVerification = async (input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hashedPassword: string;
  gender: string;
  dateOfBirth?: string;
  originCountry: string;
  originState: string;
  originLga: string;
  residenceCountry: string;
  residenceState: string;
  residenceCity: string;
  residenceAddress: string;
  occupation: string;
  interests: string[];
  churchId: string;
  matchPreference: string;
  branchName?: string;
  whatsappNumber?: string;
}) => {
  const startedAt = Date.now();
  console.log("[authService] Creating account");

  const newAccount = await prisma.account.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase().trim(),
      phone: input.phone,
      password: input.hashedPassword,
      role: "User",
      isEmailVerified: false,
      user: {
        create: {
          gender: input.gender as GenderType,
          dateOfBirth: input.dateOfBirth
            ? new Date(input.dateOfBirth)
            : undefined,
          originCountry: input.originCountry,
          originState: input.originState,
          originLga: input.originLga,
          residenceCountry: input.residenceCountry,
          residenceState: input.residenceState,
          residenceCity: input.residenceCity,
          residenceAddress: input.residenceAddress,
          occupation: input.occupation,
          interests: input.interests,
          churchId: input.churchId,
          branchName: input.branchName,
          whatsappNumber: input.whatsappNumber || input.phone,
          matchPreference: input.matchPreference as MatchPreferenceType,
          vettingStatus: "DRAFT",
          profileCompletionPercentage: 50,
        },
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      role: true,
      isEmailVerified: true,
      status: true,
      createdAt: true,
    },
  });
  console.log(
    `[authService] Account created in ${Date.now() - startedAt}ms`,
  );

  let emailSent = true;
  let emailPreview: { html: string; verificationUrl: string } | null = null;
  let emailErrorMessage: string | null = null;
  const emailStart = Date.now();
  console.log("[authService] Sending verification email");

  try {
    const emailResult = await requestEmailVerification(newAccount);
    emailPreview = emailResult?.emailPreview || null;
    console.log(
      `[authService] Verification email sent in ${Date.now() - emailStart}ms`,
    );
  } catch (error: any) {
    emailSent = false;
    emailErrorMessage = error?.message || String(error);
    console.error(
      `[authService] Verification email failed after ${Date.now() - emailStart}ms:`,
      emailErrorMessage,
    );
  }

  return {
    account: newAccount,
    emailSent,
    emailPreview,
    emailErrorMessage,
  };
};

/**
 * Request email verification
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
  const verificationUrl = `${env.clientUrl}/email-confirmation?token=${token}`;
  const emailHtml = `
      <h2>Welcome ${account.firstName}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `;

  const shouldUseTestEmail = env.mailtrap.useSandbox || env.exposeEmailHtml;
  let emailMessage: string | null = null;

  if (shouldUseTestEmail) {
    emailMessage = await sendTestEmail({
      to: account.email,
      subject: "Verify Your Email - Lifeline Dating Platform",
      html: emailHtml,
    });
  } else {
    await sendEmail({
      to: account.email,
      subject: "Verify Your Email - Lifeline Dating Platform",
      html: emailHtml,
    });
  }

  const shouldReturnPreview = shouldUseTestEmail;

  return {
    message: "Verification email sent",
    verificationUrl,
    emailPreview: shouldReturnPreview
      ? {
          html: emailMessage || emailHtml,
          verificationUrl,
        }
      : null,
  };
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
      status: "active",
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
 */
export const requestPasswordReset = async (email: string) => {
  const account = await prisma.account.findUnique({
    where: { email },
  });

  if (!account) {
    return {
      message: "If an account exists, a password reset link has been sent",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes

  await prisma.account.update({
    where: { id: account.id },
    data: {
      passwordResetToken: token,
      passwordResetExpiry: expiry,
    },
  });

  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
  const emailHtml = `
      <h2>Password Reset Request</h2>
      <p>Hi ${account.firstName},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

  const shouldUseTestEmail = env.mailtrap.useSandbox || env.exposeEmailHtml;
  let emailMessage: string | null = null;

  if (shouldUseTestEmail) {
    emailMessage = await sendTestEmail({
      to: account.email,
      subject: "Reset Your Password - Faith Dating Platform",
      html: emailHtml,
    });
  } else {
    await sendEmail({
      to: account.email,
      subject: "Reset Your Password - Faith Dating Platform",
      html: emailHtml,
    });
  }

  const shouldReturnPreview = shouldUseTestEmail;

  return {
    message: "If an account exists, a password reset link has been sent",
    emailPreview: shouldReturnPreview
      ? {
          html: emailMessage || emailHtml,
          resetUrl,
        }
      : null,
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

  if (account.passwordResetExpiry && new Date() > account.passwordResetExpiry) {
    throw new Error("Reset token has expired");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

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
  const cooldownMs = 2 * 60 * 1000;

  if (account.emailVerificationLastSentAt) {
    const diffMs =
      now.getTime() - account.emailVerificationLastSentAt.getTime();

    if (diffMs < cooldownMs) {
      const remainingMs = cooldownMs - diffMs;
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const human = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      const error: any = new Error(
        `Please wait ${human} before requesting another verification email.`,
      );
      error.retryAfterSeconds = remainingSeconds;
      throw error;
    }
  }

  return await requestEmailVerification(account);
};
