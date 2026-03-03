// services/userService.ts
// User business logic

import { MatchPreferenceType } from "@prisma/client";
import { prisma } from "../config/db";

/**
 * Get all users (with filters)
 */
export const getUsers = async (filters?: {
  churchId?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  subscriptionTier?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (filters?.churchId) {
    where.churchId = filters.churchId;
  }
  
  if (filters?.isVerified !== undefined) {
    where.isVerified = filters.isVerified;
  }
  
  if (filters?.verificationStatus) {
    where.verificationStatus = filters.verificationStatus;
  }
  
  if (filters?.subscriptionTier) {
    where.subscriptionTier = filters.subscriptionTier;
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { account: {createdAt: "desc"} },
      include: {
        account: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        church: {
          select: {
            id: true,
            officialName: true,
            aka: true,
          },
        },
        assignedCounselor: {
          select: {
            id: true,
            account: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: rows.map((u) => ({
      accountId: u.account.id,
      firstName: u.account.firstName,
      lastName: u.account.lastName,
      email: u.account.email,
      phone: u.account.phone,
      accountStatus: u.account.status,
      createdAt: u.account.createdAt,
      isVerified: u.isVerified,
      verificationStatus: u.verificationStatus,
      verificationNotes: u.verificationNotes,
      verifiedAt: u.verifiedAt,
      subscriptionTier: u.subscriptionTier,
      subscriptionStatus: u.subscriptionStatus,
      church: u.church,
      assignedCounselor: u.assignedCounselor
        ? {
            accountId: u.assignedCounselor.account.id,
            firstName: u.assignedCounselor.account.firstName,
            lastName: u.assignedCounselor.account.lastName,
          }
        : null,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single user by account ID
 */
export const getUserById = async (accountId: string) => {
  const row = await prisma.user.findUnique({
    where: { accountId },
    include: {
      account: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
        },
      },
      church: {
        select: {
          id: true,
          officialName: true,
          aka: true,
        },
      },
      assignedCounselor: {
        select: {
          id: true,
            account: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
          },
        },
      },
    },
  });

  if (!row) {
    throw new Error("User not found");
  }

  return {
    accountId: row.account.id,
    firstName: row.account.firstName,
    lastName: row.account.lastName,
    email: row.account.email,
    phone: row.account.phone,
    accountStatus: row.account.status,
    createdAt: row.account.createdAt,
    isVerified: row.isVerified,
    verificationStatus: row.verificationStatus,
    verificationNotes: row.verificationNotes,
    verifiedAt: row.verifiedAt,
    subscriptionTier: row.subscriptionTier,
    subscriptionStatus: row.subscriptionStatus,
    originCountry: row.originCountry,
    originState: row.originState,
    originLga: row.originLga,
    residenceCountry: row.residenceCountry,
    residenceState: row.residenceState,
    residenceCity: row.residenceCity,
    residenceAddress: row.residenceAddress,
    occupation: row.occupation,
    interests: row.interests,
    matchPreference: row.matchPreference,
    church: row.church,
    assignedCounselor: row.assignedCounselor
      ? {
          accountId: row.assignedCounselor.account.id,
          firstName: row.assignedCounselor.account.firstName,
          lastName: row.assignedCounselor.account.lastName,
          email: row.assignedCounselor.account.email,
        }
      : null,
  };
};

/**
 * Update user profile
 */
export const updateUser = async (
  userId: string,
  data: {
    originCountry?: string;
    originState?: string;
    originLga?: string;
    residenceCountry?: string;
    residenceState?: string;
    residenceCity?: string;
    residenceAddress?: string;
    occupation?: string;
    interests?: any;
    churchId?: string;
    matchPreference?: MatchPreferenceType;
  }
) => {
  const resolvedUser = await resolveUserByIdentifier(userId);

  const user = await prisma.user.update({
    where: { id: resolvedUser.id },
    data,
  });

  return user;
};

/**
 * Update user verification status (for counselors/admins)
 */
export const updateUserVerification = async (
  userId: string,
  isVerified: boolean
) => {
  const resolvedUser = await resolveUserByIdentifier(userId);

  const user = await prisma.user.update({
    where: { id: resolvedUser.id },
    data: { 
      isVerified,
      verificationStatus: isVerified ? "verified" : "pending",
      verifiedAt: isVerified ? new Date() : null,
    },
  });

  return user;
};

const resolveUserByIdentifier = async (identifier: string) => {
  const userByAccount = await prisma.user.findUnique({
    where: { accountId: identifier },
    select: { id: true },
  });

  if (!userByAccount) {
    throw new Error("User not found");
  }

  return userByAccount;
};
