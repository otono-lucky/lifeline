// services/counselorService.ts
// Counselor business logic

import { StatusType } from "@prisma/client";
import { prisma } from "../config/db";

/**
 * Get counselor dashboard data
 */
export const getCounselorDashboard = async (
  requesterAccountId: string,
  requestedCounsellorAccountId?: string,
) => {
  // Get counselor profile
  const counselorId = await resolveCounsellorScope(
    requesterAccountId,
    requestedCounsellorAccountId,
  );
  const counselor = await prisma.counselor.findUnique({
    where: { id: counselorId },
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
        orderBy: { account: { createdAt: "desc" } },
      },
    },
  });

  if (!counselor) {
    throw new Error("Counselor profile not found");
  }

  // Calculate stats
  const totalAssigned = counselor.assignedUsers.length;
  const pending = counselor.assignedUsers.filter(
    (u) => u.verificationStatus === "pending",
  ).length;
  const inProgress = counselor.assignedUsers.filter(
    (u) => u.verificationStatus === "in_progress",
  ).length;
  const verified = counselor.assignedUsers.filter(
    (u) => u.verificationStatus === "verified",
  ).length;
  const rejected = counselor.assignedUsers.filter(
    (u) => u.verificationStatus === "rejected",
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
      accountId: u.accountId,
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
  requestedCounsellorAccountId?: string,
  filters?: {
    verificationStatus?: string;
    page?: number;
    limit?: number;
  },
) => {
  // Get counselor
  const counselorId = await resolveCounsellorScope(
    accountId,
    requestedCounsellorAccountId,
  );
  
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { assignedCounselorId: counselorId };

  if (filters?.verificationStatus) {
    where.verificationStatus = filters.verificationStatus;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { account: { createdAt: "desc" } },
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
      accountId: u.accountId,
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
  userIdentifier: string,
  status: "verified" | "rejected",
  notes?: string,
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
  const user = await resolveUserByIdentifier(userIdentifier);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.assignedCounselorId !== counselor.id) {
    throw new Error("User is not assigned to you");
  }

  // Update user verification
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
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
    accountId: updatedUser.accountId,
    userName: `${updatedUser.account.firstName} ${updatedUser.account.lastName}`,
    email: updatedUser.account.email,
    verificationStatus: updatedUser.verificationStatus,
    verifiedAt: updatedUser.verifiedAt,
  };
};

/**
 * Get single counselor by account ID
 */
export const getCounselorById = async (counselorAccountId: string) => {
  const counselor = await prisma.counselor.findUnique({
    where: { accountId: counselorAccountId },
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

  return {
    accountId: counselor.account.id,
    firstName: counselor.account.firstName,
    lastName: counselor.account.lastName,
    email: counselor.account.email,
    phone: counselor.account.phone,
    accountStatus: counselor.account.status,
    bio: counselor.bio,
    church: counselor.church,
  };
};

/**
 * Update counselor details
 */
export const updateCounselor = async (
  counselorAccountId: string,
  data: {
    bio?: string;
  },
) => {
  const counselor = await prisma.counselor.update({
    where: { accountId: counselorAccountId },
    data: {
      bio: data.bio,
    },
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
    },
  });

  return {
    accountId: counselor.account.id,
    firstName: counselor.account.firstName,
    lastName: counselor.account.lastName,
    email: counselor.account.email,
    phone: counselor.account.phone,
    accountStatus: counselor.account.status,
    bio: counselor.bio,
  };
};

export const resolveCounsellorScope = async (
  requesterId: string,
  requestedCounsellorAccountId?: string,
): Promise<string> => {
  const requester = await prisma.account.findUnique({
    where: { id: requesterId },
    include: { counselor: true, churchAdmin: true, superAdmin: true },
  });

  if (!requester) throw new Error("Requester not found");

  // Super admin → can view any counsellor
  if (requester.superAdmin) {
    if (!requestedCounsellorAccountId) {
      throw new Error("Super admin must provide counselor accountId");
    }
    const counselor = await prisma.counselor.findUnique({
      where: { accountId: requestedCounsellorAccountId },
      select: { id: true },
    });
    if (!counselor) {
      throw new Error("Counselor not found");
    }
    return counselor.id;
  }

  // Church admin → can view counsellors in their church
  if (requester.churchAdmin) {
    if (!requestedCounsellorAccountId) {
      throw new Error("Church admin must provide counselor accountId");
    }

    const counselor = await prisma.counselor.findUnique({
      where: { accountId: requestedCounsellorAccountId },
      select: { id: true, churchId: true },
    });

    if (!counselor || counselor.churchId !== requester.churchAdmin.churchId) {
      throw new Error("Church admin can only view counselors in their church");
    }

    return counselor.id;
  }

  // Counsellor → can only view themselves
  if (requester.counselor) {
    const ownId = requester.counselor.id;

    if (requestedCounsellorAccountId) {
      const requestedCounselor = await prisma.counselor.findUnique({
        where: { accountId: requestedCounsellorAccountId },
        select: { id: true },
      });
      if (!requestedCounselor || requestedCounselor.id !== ownId) {
        throw new Error("Counselor can only view their own data");
      }
    }

    return ownId;
  }

  throw new Error("Unauthorized role");
};

const resolveUserByIdentifier = async (userIdentifier: string) => {
  const userByAccount = await prisma.user.findUnique({
    where: { accountId: userIdentifier },
    select: { id: true, accountId: true, assignedCounselorId: true },
  });

  if (!userByAccount) {
    throw new Error("User not found");
  }

  return userByAccount;
};

/**
 * Get counselors by church
 */
export const getCounselorsByChurch = async (churchId: string) => {
  const rows = await prisma.counselor.findMany({
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
      church: {
        select: {
          id: true,
          officialName: true,
          aka: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
    orderBy: { account: { createdAt: "desc" } },
  });

  return rows.map((c) => ({
    accountId: c.account.id,
    firstName: c.account.firstName,
    lastName: c.account.lastName,
    email: c.account.email,
    phone: c.account.phone,
    accountStatus: c.account.status,
    createdAt: c.account.createdAt,
    bio: c.bio,
    church: c.church,
  }));
};

export const getCounselors = async (filter: {
  status?: StatusType;
  page?: number;
  limit?: number;
}) => {
  const { status } = filter;
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 10;

  const rows = await prisma.counselor.findMany({
    where: {
      account: {
        ...(status && { status }),
      },
    },
    skip: (page - 1) * limit,
    take: limit,
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
          email: true,
          phone: true,
          status: true,
        },
      },
    },
    orderBy: { account: { createdAt: "desc" } },
  });

  return rows.map((c) => ({
    accountId: c.account.id,
    firstName: c.account.firstName,
    lastName: c.account.lastName,
    email: c.account.email,
    phone: c.account.phone,
    accountStatus: c.account.status,
    createdAt: c.account.createdAt,
    bio: c.bio,
    church: c.church,
  }));
};
