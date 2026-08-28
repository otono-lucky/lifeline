// services/accountService.ts
// Account resource management (creation, auth, etc.)

import { prisma } from "../config/db";
import { activateChurch } from "./churchService";
import { hashPassword } from "../utils/passwordHasher";

interface CreateAccountData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "SuperAdmin" | "ChurchAdmin" | "Counselor" | "User";
}

interface CreateChurchAdminData extends CreateAccountData {
  role: "ChurchAdmin";
  churchId: string;
  title?: string; // Optional: Pastor, Reverend, Priest, Bishop, Elder
}

interface CreateCounselorData extends CreateAccountData {
  role: "Counselor";
  churchId: string;
  bio?: string;
  yearsExperience?: number;
}

/**
 * Create a new account (generic - works for any role)
 */
export const createAccount = async (data: CreateAccountData) => {
  const existingAccount = await prisma.account.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (existingAccount) {
    throw new Error("Account with this email already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const account = await prisma.account.create({
    data: {
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone,
      role: data.role,
      status: "active",
      isEmailVerified: data.role === "User" ? false : true,
    },
  });

  return account;
};

/**
 * Create ChurchAdmin account + profile (1:1 with Church)
 */
export const createChurchAdmin = async (data: CreateChurchAdminData) => {
  const church = await prisma.church.findUnique({
    where: { id: data.churchId },
    include: { churchAdmin: true },
  });

  if (!church) {
    throw new Error("Church not found");
  }

  if (church.churchAdmin) {
    throw new Error(
      "This church already has an assigned Church Admin. Exactly 1 Church Admin per church is allowed (1:1 relationship).",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const account = await createAccount(data);

    const churchAdmin = await tx.churchAdmin.create({
      data: {
        accountId: account.id,
        churchId: data.churchId,
        title: data.title || null,
      },
    });

    return { account, churchAdmin };
  });

  if (church.status === "pending") {
    await activateChurch(data.churchId);
  }

  return result;
};

/**
 * Create Counselor account + profile
 */
export const createCounselor = async (data: CreateCounselorData) => {
  const church = await prisma.church.findUnique({
    where: { id: data.churchId },
  });

  if (!church) {
    throw new Error("Church not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const account = await createAccount(data);

    const counselor = await tx.counselor.create({
      data: {
        accountId: account.id,
        churchId: data.churchId,
        bio: data.bio,
      },
    });

    return { account, counselor };
  });

  return result;
};

/**
 * Update account status
 */
export const updateAccountStatus = async (
  accountId: string,
  status: "pending" | "active" | "suspended" | "deleted",
) => {
  const account = await prisma.account.update({
    where: { id: accountId },
    data: { status },
  });

  return account;
};

/**
 * Change password
 */
export const changePassword = async (
  accountId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account || !account.password) {
    throw new Error("Account not found or password not set");
  }

  const bcrypt = await import("bcryptjs");
  const isMatch = await bcrypt.compare(currentPassword, account.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.account.update({
    where: { id: accountId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};
