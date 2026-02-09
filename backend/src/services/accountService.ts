// services/account.service.ts
// Account resource management (creation, auth, etc.)

import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { activateChurch } from "./churchService";

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
  // Check if email exists
  const existingAccount = await prisma.account.findUnique({
    where: { email: data.email },
  });

  if (existingAccount) {
    throw new Error("Account with this email already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  // Create account
  const account = await prisma.account.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      status: "active",
    },
  });

  return account;
};

/**
 * Create ChurchAdmin account + profile
 */
export const createChurchAdmin = async (data: CreateChurchAdminData) => {
  // Verify church exists
  const church = await prisma.church.findUnique({
    where: { id: data.churchId },
  });

  if (!church) {
    throw new Error("Church not found");
  }

  // Check if church already has an admin
  const existingAdminCount = await prisma.churchAdmin.count({
    where: { churchId: data.churchId },
  });

  if (existingAdminCount >= 3) {
    throw new Error(
      "Church already has a maximum of 3 admin allowed for each church",
    );
  }

  // Create account + church admin profile in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create account
    const account = await createAccount(data);

    // Create church admin profile
    const churchAdmin = await tx.churchAdmin.create({
      data: {
        accountId: account.id,
        churchId: data.churchId,
      },
    });

    return { account, churchAdmin };
  });

  // Activate church
  if (existingAdminCount === 0) {
    await activateChurch(data.churchId);
  }

  return result;
};

/**
 * Create Counselor account + profile
 */
export const createCounselor = async (data: CreateCounselorData) => {
  // Verify church exists
  const church = await prisma.church.findUnique({
    where: { id: data.churchId },
  });

  if (!church) {
    throw new Error("Church not found");
  }

  // Create account + counselor profile in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create account
    const account = await createAccount(data);

    // Create counselor profile (no status field - uses account.status)
    const counselor = await tx.counselor.create({
      data: {
        accountId: account.id,
        churchId: data.churchId,
        bio: data.bio,
        yearsExperience: data.yearsExperience,
      },
    });

    return { account, counselor };
  });

  return result;
};

/**
 * Get account by email
 */
export const getAccountByEmail = async (email: string) => {
  const account = await prisma.account.findUnique({
    where: { email },
    include: {
      superAdmin: true,
      churchAdmin: {
        include: { church: true },
      },
      counselor: {
        include: { church: true },
      },
      user: true,
    },
  });

  return account;
};

/**
 * Update account status (for suspending/activating any role)
 */
export const updateAccountStatus = async (
  accountId: string,
  status: "active" | "suspended",
) => {
  const account = await prisma.account.update({
    where: { id: accountId },
    data: { status },
  });

  return account;
};
