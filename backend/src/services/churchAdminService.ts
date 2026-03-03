// services/churchAdminService.ts
// ChurchAdmin business logic

import { prisma } from "../config/db";

/**
 * Get church admin dashboard data
 */
export const getChurchAdminDashboard = async (
  requesterAccountId: string,
  requestedChurchAdminAccountId?: string,
) => {
  const scope = await resolveChurchAdminScope(
    requesterAccountId,
    requestedChurchAdminAccountId,
  );

  const churchAdmin = await prisma.churchAdmin.findUnique({
    where: { accountId: scope.accountId },
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
    (m) => m.verificationStatus === "verified",
  ).length;
  const pendingVerification = churchAdmin.church.members.filter(
    (m) => m.verificationStatus === "pending",
  ).length;
  const inProgressVerification = churchAdmin.church.members.filter(
    (m) => m.verificationStatus === "in_progress",
  ).length;
  const totalCounselors = churchAdmin.church.counselors.length;

  // Get recent members (last 5)
  const recentMembers = await prisma.user.findMany({
    where: { churchId: churchAdmin.churchId },
    take: 5,
    orderBy: { account: { createdAt: "desc" } },
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
      accountId: m.accountId,
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
  userAccountId: string,
  counselorAccountId: string,
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
  const userByAccount = await prisma.user.findUnique({
    where: { accountId: userAccountId },
    select: { id: true, accountId: true, churchId: true },
  });
  const user = userByAccount;

  if (!user) {
    throw new Error("User not found");
  }

  if (user.churchId !== churchAdmin.churchId) {
    throw new Error("User does not belong to your church");
  }

  // Verify counselor belongs to this church
  const counselorByAccount = await prisma.counselor.findUnique({
    where: { accountId: counselorAccountId },
    select: { id: true, accountId: true, churchId: true },
  });
  const counselor = counselorByAccount;

  if (!counselor) {
    throw new Error("Counselor not found");
  }

  if (counselor.churchId !== churchAdmin.churchId) {
    throw new Error("Counselor does not belong to your church");
  }

  // Assign user to counselor
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      assignedCounselorId: counselor.id,
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
    userAccountId: updatedUser.accountId,
    userName: `${updatedUser.account.firstName} ${updatedUser.account.lastName}`,
    counselorAccountId: counselor.accountId,
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

  const [rows, total] = await Promise.all([
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
    churchAdmins: rows.map((r) => ({
      accountId: r.account.id,
      firstName: r.account.firstName,
      lastName: r.account.lastName,
      email: r.account.email,
      phone: r.account.phone,
      accountStatus: r.account.status,
      createdAt: r.account.createdAt,
      church: r.church,
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
 * Get single church admin by ID
 */
export const getChurchAdminById = async (churchAdminAccountId: string) => {
  const churchAdmin =
    (await prisma.churchAdmin.findUnique({
      where: { accountId: churchAdminAccountId },
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
    }))

  if (!churchAdmin) {
    throw new Error("Church admin not found");
  }

  return {
    accountId: churchAdmin.account.id,
    firstName: churchAdmin.account.firstName,
    lastName: churchAdmin.account.lastName,
    email: churchAdmin.account.email,
    phone: churchAdmin.account.phone,
    accountStatus: churchAdmin.account.status,
    createdAt: churchAdmin.account.createdAt,
    church: churchAdmin.church,
  };
};

export const resolveChurchAdminScope = async (
  requesterAccountId: string,
  requestedChurchAdminAccountId?: string,
) => {
  const requester = await prisma.account.findUnique({
    where: { id: requesterAccountId },
    include: {
      superAdmin: true,
      churchAdmin: true,
    },
  });

  if (!requester) {
    throw new Error("Requester not found");
  }

  // Super admin → can view any church admin
  if (requester.superAdmin) {
    if (!requestedChurchAdminAccountId) {
      throw new Error("Super admin must provide church admin accountId");
    }

    const target = await prisma.churchAdmin.findUnique({
      where: { accountId: requestedChurchAdminAccountId },
      select: { id: true, accountId: true, churchId: true },
    });

    if (!target) {
      throw new Error("Church admin not found");
    }

    return target;
  }

  // Church admin → can only view themselves
  if (requester.churchAdmin) {
    if (
      requestedChurchAdminAccountId &&
      requestedChurchAdminAccountId !== requesterAccountId
    ) {
      throw new Error("Church admin can only view their own dashboard");
    }

    return {
      id: requester.churchAdmin.id,
      accountId: requesterAccountId,
      churchId: requester.churchAdmin.churchId,
    };
  }

  throw new Error("Unauthorized role");
};
