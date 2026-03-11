// services/userService.ts
// User business logic

import { MatchPreferenceType } from "@prisma/client";
import { prisma } from "../config/db";
import { findRandomCounselorId, getMatchingEligibility } from "./matchingService";

export const SOCIAL_PLATFORM_OPTIONS = [
  "Facebook",
  "Instagram",
  "X",
  "LinkedIn",
  "TikTok",
  "YouTube",
] as const;

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
      isActive: u.account.status === "active",      
      dateOfBirth: u.dateOfBirth,
      profilePictureUrl: u.profilePictureUrl,
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
          isEmailVerified: true,
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
      socialMediaHandles: {
        select: {
          id: true,
          platform: true,
          handleOrUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!row) {
    throw new Error("User not found");
  }

  const matchingEligibility = await getMatchingEligibility(accountId);

  return {
    accountId: row.account.id,
    firstName: row.account.firstName,
    lastName: row.account.lastName,
    email: row.account.email,
    phone: row.account.phone,
    accountStatus: row.account.status,
    createdAt: row.account.createdAt,
    isVerified: row.isVerified,
    isEmailVerified: row.account.isEmailVerified,
    verificationStatus: row.verificationStatus,
    verificationNotes: row.verificationNotes,
    verifiedAt: row.verifiedAt,
    dateOfBirth: row.dateOfBirth,
    gender: row.gender,
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
    profilePictureUrl: row.profilePictureUrl,
    videoIntroUrl: row.videoIntroUrl,
    socialMediaHandles: row.socialMediaHandles,
    matchingEligibility,
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
    dateOfBirth?: Date;
    videoIntroUrl?: string;
  }
) => {
  const resolvedUser = await resolveUserByIdentifier(userId);

  const user = await prisma.user.update({
    where: { id: resolvedUser.id },
    data: {
      ...data,
    },
  });

  return user;
};

/**
 * Update user profile image separately from profile data.
 */
export const updateUserProfileImage = async (
  userId: string,
  profilePictureUrl: string,
) => {
  const resolvedUser = await resolveUserByIdentifier(userId);

  const existingUser = await prisma.user.findUnique({
    where: { id: resolvedUser.id },
    select: {
      id: true,
      assignedCounselorId: true,
      churchId: true,
      profilePictureUrl: true,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const shouldAutoAssignCounselor =
    !existingUser.assignedCounselorId &&
    profilePictureUrl.trim().length > 0 &&
    profilePictureUrl !== existingUser.profilePictureUrl;

  let assignedCounselorId: string | undefined;
  if (shouldAutoAssignCounselor) {
    assignedCounselorId = await findRandomCounselorId(existingUser.churchId);
  }

  const user = await prisma.user.update({
    where: { id: resolvedUser.id },
    data: {
      profilePictureUrl,
      ...(shouldAutoAssignCounselor && assignedCounselorId
        ? { assignedCounselorId, verificationStatus: "in_progress" }
        : {}),
    },
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

export const listUserSocialMedia = async (accountId: string) => {
  const user = await prisma.user.findUnique({
    where: { accountId },
    include: {
      socialMediaHandles: {
        select: {
          id: true,
          platform: true,
          handleOrUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.socialMediaHandles;
};

export const createUserSocialMedia = async (
  accountId: string,
  payload: { platform: string; handleOrUrl: string },
) => {
  const resolvedUser = await resolveUserByIdentifier(accountId);

  if (!SOCIAL_PLATFORM_OPTIONS.includes(payload.platform as any)) {
    throw new Error(
      `Invalid platform. Allowed values: ${SOCIAL_PLATFORM_OPTIONS.join(", ")}`,
    );
  }

  const count = await prisma.userSocialMedia.count({
    where: { userId: resolvedUser.id },
  });

  if (count >= 4) {
    throw new Error("You can only add up to 4 social media handles");
  }

  const created = await prisma.userSocialMedia.create({
    data: {
      userId: resolvedUser.id,
      platform: payload.platform,
      handleOrUrl: payload.handleOrUrl,
    },
  });

  return created;
};

export const deleteUserSocialMedia = async (
  accountId: string,
  socialId: string,
) => {
  const resolvedUser = await resolveUserByIdentifier(accountId);
  const social = await prisma.userSocialMedia.findUnique({
    where: { id: socialId },
    select: { id: true, userId: true },
  });

  if (!social || social.userId !== resolvedUser.id) {
    throw new Error("Social media handle not found");
  }

  const currentCount = await prisma.userSocialMedia.count({
    where: { userId: resolvedUser.id },
  });
  if (currentCount <= 2) {
    throw new Error("At least 2 social media handles are required");
  }

  await prisma.userSocialMedia.delete({
    where: { id: socialId },
  });
};
