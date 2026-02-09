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

  const [users, total] = await Promise.all([
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
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single user by ID
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
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
  const user = await prisma.user.update({
    where: { id: userId },
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
  const user = await prisma.user.update({
    where: { id: userId },
    data: { 
      isVerified,
      verificationStatus: isVerified ? "verified" : "pending",
      verifiedAt: isVerified ? new Date() : null,
    },
  });

  return user;
};