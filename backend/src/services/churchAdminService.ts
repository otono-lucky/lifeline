// services/churchAdminService.ts
// ChurchAdmin business logic

import { prisma } from "../config/db";

/**
 * Get church admin dashboard data
 */
export const getChurchAdminDashboard = async (accountId: string) => {
  // Get church admin profile
  const churchAdmin = await prisma.churchAdmin.findUnique({
    where: { accountId },
    include: {
      church: {
        include: {
          members: {
            select: {
              id: true,
              verificationStatus: true,
            },
          },
          counselors: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!churchAdmin) {
    throw new Error("Church admin profile not found");
  }

  // Calculate stats
  const totalMembers = churchAdmin.church.members.length;
  const verifiedMembers = churchAdmin.church.members.filter(
    (m) => m.verificationStatus === "verified"
  ).length;
  const pendingVerification = churchAdmin.church.members.filter(
    (m) => m.verificationStatus === "pending"
  ).length;
  const inProgressVerification = churchAdmin.church.members.filter(
    (m) => m.verificationStatus === "in_progress"
  ).length;
  const totalCounselors = churchAdmin.church.counselors.length;

  // Get recent members (last 5)
  const recentMembers = await prisma.user.findMany({
    where: { churchId: churchAdmin.churchId },
    take: 5,
    orderBy: { account: {createdAt: "desc"} },
    include: {
      account: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
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
  });

  return {
    church: {
      id: churchAdmin.church.id,
      name: churchAdmin.church.officialName,
      aka: churchAdmin.church.aka,
      email: churchAdmin.church.email,
      phone: churchAdmin.church.phone,
      status: churchAdmin.church.status,
    },
    stats: {
      totalMembers,
      verifiedMembers,
      pendingVerification,
      inProgressVerification,
      totalCounselors,
    },
    recentMembers: recentMembers.map((m) => ({
      id: m.id,
      firstName: m.account.firstName,
      lastName: m.account.lastName,
      email: m.account.email,
      verificationStatus: m.verificationStatus,
      assignedCounselor: m.assignedCounselor
        ? `${m.assignedCounselor.account.firstName} ${m.assignedCounselor.account.lastName}`
        : null,
      joinedAt: m.account.createdAt,
    })),
  };
};

/**
 * Assign user to counselor
 */
export const assignUserToCounselor = async (
  churchAdminAccountId: string,
  userId: string,
  counselorId: string
) => {
  // Verify church admin
  const churchAdmin = await prisma.churchAdmin.findUnique({
    where: { accountId: churchAdminAccountId },
    select: { churchId: true },
  });

  if (!churchAdmin) {
    throw new Error("Church admin profile not found");
  }

  // Verify user belongs to this church
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { churchId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.churchId !== churchAdmin.churchId) {
    throw new Error("User does not belong to your church");
  }

  // Verify counselor belongs to this church
  const counselor = await prisma.counselor.findUnique({
    where: { id: counselorId },
    select: { churchId: true },
  });

  if (!counselor) {
    throw new Error("Counselor not found");
  }

  if (counselor.churchId !== churchAdmin.churchId) {
    throw new Error("Counselor does not belong to your church");
  }

  // Assign user to counselor
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      assignedCounselorId: counselorId,
      verificationStatus: "in_progress",
    },
    include: {
      account: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      assignedCounselor: {
        select: {
          account: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return {
    userId: updatedUser.id,
    userName: `${updatedUser.account.firstName} ${updatedUser.account.lastName}`,
    counselorName: `${updatedUser.assignedCounselor!.account.firstName} ${updatedUser.assignedCounselor!.account.lastName}`,
    verificationStatus: updatedUser.verificationStatus,
  };
};

/**
 * List church admins with filters
 */
export const getChurchAdmins = async (filters?: {
  status?: string;
  churchId?: string;
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
  if (filters?.status) {
    where.account = { status: filters.status };
  }

  const [churchAdmins, total] = await Promise.all([
    prisma.churchAdmin.findMany({
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
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    }),
    prisma.churchAdmin.count({ where }),
  ]);

  return {
    churchAdmins,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single church admin by ID
 */
export const getChurchAdminById = async (churchAdminId: string) => {
  const churchAdmin = await prisma.churchAdmin.findUnique({
    where: { id: churchAdminId },
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
  });

  if (!churchAdmin) {
    throw new Error("Church admin not found");
  }

  return churchAdmin;
};
