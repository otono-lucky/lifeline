// services/counselorService.ts
// Counselor business logic

import { prisma } from "../config/db";

/**
 * Get counselor dashboard data
 */
export const getCounselorDashboard = async (accountId: string) => {
  // Get counselor profile
  const counselor = await prisma.counselor.findUnique({
    where: { accountId },
    include: {
      assignedUsers: {
        include: {
          account: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: { account: {createdAt: "desc"} },
      },
    },
  });

  if (!counselor) {
    throw new Error("Counselor profile not found");
  }

  // Calculate stats
  const totalAssigned = counselor.assignedUsers.length;
  const pending = counselor.assignedUsers.filter(
    (u) => u.verificationStatus === "pending"
  ).length;
  const inProgress = counselor.assignedUsers.filter(
    (u) => u.verificationStatus === "in_progress"
  ).length;
  const verified = counselor.assignedUsers.filter(
    (u) => u.verificationStatus === "verified"
  ).length;
  const rejected = counselor.assignedUsers.filter(
    (u) => u.verificationStatus === "rejected"
  ).length;

  return {
    stats: {
      totalAssigned,
      pending,
      inProgress,
      verified,
      rejected,
    },
    assignedUsers: counselor.assignedUsers.map((u) => ({
      id: u.id,
      firstName: u.account.firstName,
      lastName: u.account.lastName,
      email: u.account.email,
      verificationStatus: u.verificationStatus,
      verificationNotes: u.verificationNotes,
      verifiedAt: u.verifiedAt,
      assignedAt: u.account.createdAt,
    })),
  };
};

/**
 * Get assigned users with filters
 */
export const getAssignedUsers = async (
  accountId: string,
  filters?: {
    verificationStatus?: string;
    page?: number;
    limit?: number;
  }
) => {
  // Get counselor
  const counselor = await prisma.counselor.findUnique({
    where: { accountId },
    select: { id: true },
  });

  if (!counselor) {
    throw new Error("Counselor profile not found");
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { assignedCounselorId: counselor.id };

  if (filters?.verificationStatus) {
    where.verificationStatus = filters.verificationStatus;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { account: {createdAt: "desc" }},
      include: {
        account: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      firstName: u.account.firstName,
      lastName: u.account.lastName,
      email: u.account.email,
      phone: u.account.phone,
      gender: u.gender,
      verificationStatus: u.verificationStatus,
      verificationNotes: u.verificationNotes,
      verifiedAt: u.verifiedAt,
      occupation: u.occupation,
      residenceState: u.residenceState,
      residenceCity: u.residenceCity,
      assignedAt: u.account.createdAt,
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
 * Verify or reject user
 */
export const verifyUser = async (
  counselorAccountId: string,
  userId: string,
  status: "verified" | "rejected",
  notes?: string
) => {
  // Get counselor
  const counselor = await prisma.counselor.findUnique({
    where: { accountId: counselorAccountId },
    select: { id: true },
  });

  if (!counselor) {
    throw new Error("Counselor profile not found");
  }

  // Verify user is assigned to this counselor
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { assignedCounselorId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.assignedCounselorId !== counselor.id) {
    throw new Error("User is not assigned to you");
  }

  // Update user verification
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: status,
      verificationNotes: notes,
      verifiedAt: status === "verified" ? new Date() : null,
      isVerified: status === "verified", // Update old field too
    },
    include: {
      account: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return {
    userId: updatedUser.id,
    userName: `${updatedUser.account.firstName} ${updatedUser.account.lastName}`,
    email: updatedUser.account.email,
    verificationStatus: updatedUser.verificationStatus,
    verifiedAt: updatedUser.verifiedAt,
  };
};

/**
 * Get counselors by church
 */
export const getCounselorsByChurch = async (churchId: string) => {
  const counselors = await prisma.counselor.findMany({
    where: { churchId },
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
    orderBy: { account: {createdAt: "desc"} },
  });

  return counselors;
};

/**
 * Get single counselor by ID
 */
export const getCounselorById = async (counselorId: string) => {
  const counselor = await prisma.counselor.findUnique({
    where: { id: counselorId },
    include: {
      account: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
      church: {
        select: {
          id: true,
          officialName: true,
          aka: true,
        },
      },
    },
  });

  if (!counselor) {
    throw new Error("Counselor not found");
  }

  return counselor;
};

/**
 * Update counselor details
 */
export const updateCounselor = async (
  counselorId: string,
  data: {
    bio?: string;
    yearsExperience?: number;
  }
) => {
  const counselor = await prisma.counselor.update({
    where: { id: counselorId },
    data: {
      bio: data.bio,
      yearsExperience: data.yearsExperience,
    },
  });

  return counselor;
};