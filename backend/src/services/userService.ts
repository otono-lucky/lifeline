// services/userService.ts
// User business logic & privacy filtering

import { MatchPreferenceType, SalaryRange, UserVettingStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { calculateAge } from "../utils/ageUtils";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import {
  MIN_SOCIAL_HANDLES_REQUIRED,
  REQUIRED_PHOTOS_COUNT,
  SOCIAL_PLATFORM_OPTIONS,
} from "../constants";

export { SOCIAL_PLATFORM_OPTIONS };

/**
 * Get all users with role-aware privacy serialization
 */
export const getUsers = async (
  requesterRole: string,
  requesterAccountId: string,
  filters?: {
    churchId?: string;
    isVerified?: boolean;
    vettingStatus?: UserVettingStatus;
    subscriptionTier?: string;
    page?: number;
    limit?: number;
  },
) => {
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

  if (filters?.vettingStatus) {
    where.vettingStatus = filters.vettingStatus;
  }

  if (filters?.subscriptionTier) {
    where.subscriptionTier = filters.subscriptionTier;
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { account: { createdAt: "desc" } },
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
        photos: {
          orderBy: { order: "asc" },
          select: { url: true, order: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: rows.map((u) => {
      // Privacy firewall for Church Admin: mask sensitive financial & location data
      const isPrivileged = requesterRole === "SuperAdmin";
      return {
        accountId: u.account.id,
        firstName: u.account.firstName,
        lastName: u.account.lastName,
        email: u.account.email,
        phone: u.account.phone,
        accountStatus: u.account.status,
        createdAt: u.account.createdAt,
        vettingStatus: u.vettingStatus,
        profileCompletionPercentage: u.profileCompletionPercentage,
        isVerified: u.isVerified,
        gender: u.gender,
        age: calculateAge(u.dateOfBirth),
        profilePictureUrl: u.profilePictureUrl || u.photos[0]?.url || null,
        photos: u.photos.map((p) => p.url),
        church: u.church,
        branchName: u.branchName,
        assignedCounselor: u.assignedCounselor
          ? {
              accountId: u.assignedCounselor.account.id,
              firstName: u.assignedCounselor.account.firstName,
              lastName: u.assignedCounselor.account.lastName,
            }
          : null,
        // Privacy firewall
        salaryRange: isPrivileged ? u.salaryRange : undefined,
        residenceAddress: isPrivileged ? u.residenceAddress : undefined,
      };
    }),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single user by account ID with privacy firewall
 */
export const getUserById = async (
  targetAccountId: string,
  requesterAccountId: string,
  requesterRole: string,
) => {
  const row = await prisma.user.findUnique({
    where: { accountId: targetAccountId },
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
          accountId: true,
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
      photos: {
        orderBy: { order: "asc" },
        select: { id: true, url: true, order: true },
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

  const isSelf = targetAccountId === requesterAccountId;
  const isSuperAdmin = requesterRole === "SuperAdmin";
  const isAssignedCounselor =
    requesterRole === "Counselor" &&
    row.assignedCounselor?.accountId === requesterAccountId;

  const completion = calculateProfileCompletion({
    ...row,
    photos: row.photos,
    socialMediaHandles: row.socialMediaHandles,
  });

  // Base profile
  const result: any = {
    accountId: row.account.id,
    userId: row.id,
    firstName: row.account.firstName,
    lastName: row.account.lastName,
    email: isSelf || isSuperAdmin || isAssignedCounselor ? row.account.email : undefined,
    phone: isSelf || isSuperAdmin || isAssignedCounselor ? row.account.phone : undefined,
    whatsappNumber: isSelf || isSuperAdmin || isAssignedCounselor ? row.whatsappNumber : undefined,
    accountStatus: row.account.status,
    createdAt: row.account.createdAt,
    isVerified: row.isVerified,
    isEmailVerified: row.account.isEmailVerified,
    vettingStatus: row.vettingStatus,
    profileCompletionPercentage: completion.percentage,
    missingFields: isSelf ? completion.missingFields : undefined,
    verifiedAt: row.verifiedAt,
    dateOfBirth: row.dateOfBirth,
    age: calculateAge(row.dateOfBirth),
    gender: row.gender,
    subscriptionTier: row.subscriptionTier,
    subscriptionStatus: row.subscriptionStatus,
    originCountry: row.originCountry,
    originState: row.originState,
    originLga: row.originLga,
    residenceCountry: row.residenceCountry,
    residenceState: row.residenceState,
    residenceCity: row.residenceCity,
    occupation: row.occupation,
    interests: row.interests,
    matchPreference: isSelf || isSuperAdmin || isAssignedCounselor ? row.matchPreference : undefined,
    profilePictureUrl: row.profilePictureUrl || row.photos[0]?.url || null,
    photos: row.photos,
    videoIntroUrl: row.videoIntroUrl,
    church: row.church,
    branchName: row.branchName,
    socialMediaHandles: isSelf || isSuperAdmin || isAssignedCounselor ? row.socialMediaHandles : undefined,
    assignedCounselor: row.assignedCounselor
      ? {
          accountId: row.assignedCounselor.account.id,
          firstName: row.assignedCounselor.account.firstName,
          lastName: row.assignedCounselor.account.lastName,
        }
      : null,
  };

  // Financial & Exact Address Privacy Firewall (ONLY Self, SuperAdmin, Assigned Counselor)
  if (isSelf || isSuperAdmin || isAssignedCounselor) {
    result.salaryRange = row.salaryRange;
    result.residenceAddress = row.residenceAddress;
    result.residenceFormattedAddress = row.residenceFormattedAddress;
    result.verificationNotes = row.verificationNotes;
  }

  return result;
};

/**
 * Update user profile with full field support & completion recalculation
 */
export const updateUser = async (
  userIdOrAccountId: string,
  data: {
    originCountry?: string;
    originState?: string;
    originLga?: string;
    residenceCountry?: string;
    residenceState?: string;
    residenceCity?: string;
    residenceAddress?: string;
    residenceLatitude?: number;
    residenceLongitude?: number;
    residencePlaceId?: string;
    residenceFormattedAddress?: string;
    occupation?: string;
    salaryRange?: SalaryRange;
    interests?: any;
    churchId?: string;
    branchName?: string;
    whatsappNumber?: string;
    matchPreference?: MatchPreferenceType;
    dateOfBirth?: Date | string;
    videoIntroUrl?: string;
    videoDurationSeconds?: number;
  },
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ id: userIdOrAccountId }, { accountId: userIdOrAccountId }],
    },
    include: {
      photos: true,
      socialMediaHandles: true,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const cleanedData: any = {};
  if (data.originCountry !== undefined) cleanedData.originCountry = data.originCountry?.trim();
  if (data.originState !== undefined) cleanedData.originState = data.originState?.trim();
  if (data.originLga !== undefined) cleanedData.originLga = data.originLga?.trim();
  if (data.residenceCountry !== undefined) cleanedData.residenceCountry = data.residenceCountry?.trim();
  if (data.residenceState !== undefined) cleanedData.residenceState = data.residenceState?.trim();
  if (data.residenceCity !== undefined) cleanedData.residenceCity = data.residenceCity?.trim();
  if (data.residenceAddress !== undefined) cleanedData.residenceAddress = data.residenceAddress?.trim();
  if (data.residenceLatitude !== undefined) cleanedData.residenceLatitude = data.residenceLatitude;
  if (data.residenceLongitude !== undefined) cleanedData.residenceLongitude = data.residenceLongitude;
  if (data.residencePlaceId !== undefined) cleanedData.residencePlaceId = data.residencePlaceId;
  if (data.residenceFormattedAddress !== undefined) cleanedData.residenceFormattedAddress = data.residenceFormattedAddress;
  if (data.occupation !== undefined) cleanedData.occupation = data.occupation?.trim();
  if (data.salaryRange !== undefined) cleanedData.salaryRange = data.salaryRange;
  if (data.churchId !== undefined) cleanedData.churchId = data.churchId;
  if (data.branchName !== undefined) cleanedData.branchName = data.branchName?.trim();
  if (data.whatsappNumber !== undefined) cleanedData.whatsappNumber = data.whatsappNumber?.trim();
  if (data.matchPreference !== undefined) cleanedData.matchPreference = data.matchPreference;
  if (data.videoIntroUrl !== undefined) cleanedData.videoIntroUrl = data.videoIntroUrl?.trim();
  if (data.videoDurationSeconds !== undefined) cleanedData.videoDurationSeconds = data.videoDurationSeconds;
  if (data.interests !== undefined) cleanedData.interests = data.interests;
  if (data.dateOfBirth !== undefined) {
    cleanedData.dateOfBirth =
      typeof data.dateOfBirth === "string" ? new Date(data.dateOfBirth) : data.dateOfBirth;
  }

  // Recalculate profile completion
  const mergedForCalculation = {
    ...existingUser,
    ...cleanedData,
    photos: existingUser.photos,
    socialMediaHandles: existingUser.socialMediaHandles,
  };

  const completion = calculateProfileCompletion(mergedForCalculation);
  cleanedData.profileCompletionPercentage = completion.percentage;

  // If hits 100% and currently DRAFT or REJECTED, promote to PENDING_VETTING
  if (
    completion.isComplete &&
    (existingUser.vettingStatus === "DRAFT" || existingUser.vettingStatus === "REJECTED")
  ) {
    cleanedData.vettingStatus = "PENDING_VETTING";

    // Auto-assign counselor if not assigned
    if (!existingUser.assignedCounselorId && cleanedData.churchId) {
      const counselor = await prisma.counselor.findFirst({
        where: { churchId: cleanedData.churchId },
      });
      if (counselor) {
        cleanedData.assignedCounselorId = counselor.id;
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: cleanedData,
    include: {
      photos: { orderBy: { order: "asc" } },
      socialMediaHandles: true,
      church: true,
    },
  });

  return {
    ...updatedUser,
    completionPercentage: completion.percentage,
    isComplete: completion.isComplete,
    missingFields: completion.missingFields,
  };
};

/**
 * Manage User Photos (Exactly 3 photos required: orders 1, 2, 3)
 */
export const saveUserPhoto = async (
  accountId: string,
  photoUrl: string,
  order: number,
  publicId?: string,
) => {
  if (order < 1 || order > REQUIRED_PHOTOS_COUNT) {
    throw new Error(`Photo order must be between 1 and ${REQUIRED_PHOTOS_COUNT}`);
  }

  const user = await prisma.user.findUnique({
    where: { accountId },
    include: { photos: true, socialMediaHandles: true },
  });

  if (!user) throw new Error("User not found");

  const savedPhoto = await prisma.userPhoto.upsert({
    where: {
      userId_order: {
        userId: user.id,
        order,
      },
    },
    update: {
      url: photoUrl,
      publicId: publicId || null,
    },
    create: {
      userId: user.id,
      url: photoUrl,
      order,
      publicId: publicId || null,
    },
  });

  // If order 1, also update primary profilePictureUrl
  if (order === 1) {
    await prisma.user.update({
      where: { id: user.id },
      data: { profilePictureUrl: photoUrl },
    });
  }

  // Refresh profile completion
  const allPhotos = await prisma.userPhoto.findMany({
    where: { userId: user.id },
  });

  const completion = calculateProfileCompletion({
    ...user,
    photos: allPhotos,
    socialMediaHandles: user.socialMediaHandles,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      profileCompletionPercentage: completion.percentage,
      ...(completion.isComplete &&
      (user.vettingStatus === "DRAFT" || user.vettingStatus === "REJECTED")
        ? { vettingStatus: "PENDING_VETTING" }
        : {}),
    },
  });

  return savedPhoto;
};

export const listUserSocialMedia = async (accountId: string) => {
  const user = await prisma.user.findUnique({
    where: { accountId },
    include: {
      socialMediaHandles: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) throw new Error("User not found");
  return user.socialMediaHandles;
};

export const createUserSocialMedia = async (
  accountId: string,
  payload: { platform: string; handleOrUrl: string },
) => {
  const user = await prisma.user.findUnique({
    where: { accountId },
    include: { photos: true, socialMediaHandles: true },
  });

  if (!user) throw new Error("User not found");

  if (!SOCIAL_PLATFORM_OPTIONS.includes(payload.platform as any)) {
    throw new Error(
      `Invalid platform. Allowed values: ${SOCIAL_PLATFORM_OPTIONS.join(", ")}`,
    );
  }

  // Check if platform already added
  const alreadyHasPlatform = user.socialMediaHandles.some(
    (s) => s.platform.toLowerCase() === payload.platform.toLowerCase(),
  );
  if (alreadyHasPlatform) {
    throw new Error(`You have already added a ${payload.platform} handle`);
  }

  const created = await prisma.userSocialMedia.create({
    data: {
      userId: user.id,
      platform: payload.platform,
      handleOrUrl: payload.handleOrUrl,
    },
  });

  const allSocials = [...user.socialMediaHandles, created];
  const completion = calculateProfileCompletion({
    ...user,
    photos: user.photos,
    socialMediaHandles: allSocials,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      profileCompletionPercentage: completion.percentage,
      ...(completion.isComplete &&
      (user.vettingStatus === "DRAFT" || user.vettingStatus === "REJECTED")
        ? { vettingStatus: "PENDING_VETTING" }
        : {}),
    },
  });

  return created;
};

export const deleteUserSocialMedia = async (
  accountId: string,
  socialId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { accountId },
    include: { photos: true, socialMediaHandles: true },
  });

  if (!user) throw new Error("User not found");

  const social = user.socialMediaHandles.find((s) => s.id === socialId);
  if (!social) {
    throw new Error("Social media handle not found");
  }

  await prisma.userSocialMedia.delete({
    where: { id: socialId },
  });

  const remainingSocials = user.socialMediaHandles.filter((s) => s.id !== socialId);
  const completion = calculateProfileCompletion({
    ...user,
    photos: user.photos,
    socialMediaHandles: remainingSocials,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      profileCompletionPercentage: completion.percentage,
    },
  });
};
