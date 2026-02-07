// services/user.service.ts
// User resource management

import { MatchPreferenceType } from "@prisma/client";
import { prisma } from "../config/db";

/**
 * Get all users (dating app users)
 */
export const getUsers = async (filters?: {
  isVerified?: boolean;
  subscriptionTier?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (filters?.isVerified !== undefined) {
    where.isVerified = filters.isVerified;
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
    church?: string;
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
 * Update user verification status
 */
export const updateUserVerification = async (
  userId: string,
  isVerified: boolean
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isVerified },
  });

  return user;
};