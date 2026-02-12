// services/church.service.ts
// Church resource management

import { StatusType } from "@prisma/client";
import { prisma } from "../config/db";

interface CreateChurchData {
  officialName: string;
  aka?: string;
  email: string;
  phone: string;
  state: string;
  lga?: string;
  city?: string;
  address?: string;
  createdBy: string; // SuperAdmin ID
}

/**
 * Create a new church
 */
export const createChurch = async (data: CreateChurchData) => {
  // Check if church email exists
  const existingChurch = await prisma.church.findUnique({
    where: { email: data.email },
  });

  if (existingChurch) {
    throw new Error("Church with this email already exists");
  }

  // Create church
  const church = await prisma.church.create({
    data: {
      officialName: data.officialName,
      aka: data.aka,
      email: data.email,
      phone: data.phone,
      state: data.state,
      lga: data.lga,
      city: data.city,
      address: data.address,
      status: "pending", // Pending until admin is assigned
      createdBy: data.createdBy,
    },
  });

  return church;
};

/**
 * Get all churches
 */
export const getChurches = async (filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where = filters?.status ? { status: filters.status as StatusType } : {};

  const [churches, total] = await Promise.all([
    prisma.church.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        churchAdmins: {
          include: {
            account: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
          },
        },
        counselors: {
          select: {
            id: true,
            account: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
    }),
    prisma.church.count({ where }),
  ]);

  return {
    churches,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single church by ID
 */
export const getChurchById = async (churchId: string) => {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    include: {
      churchAdmins: {
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
      },
      counselors: {
        include: {
          account: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!church) {
    throw new Error("Church not found");
  }

  return church;
};

/**
 * Get all members of a church
 */
export const getChurchMembers = async (
  requesterId: string,
  options?: {
    churchId?: string,
    verificationStatus?: string;
    page?: number;
    limit?: number;
  },
) => {
  // Get admin
  const { churchId, verificationStatus, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const requester = await prisma.account.findUnique({
    where: { id: requesterId },
    include: { churchAdmin: true, superAdmin: true },
  });

  if (!requester) throw new Error("Requester not found");

  // Determine which churchId to use
  let targetChurchId: string;
  if (requester.churchAdmin) {
    targetChurchId = requester.churchAdmin.churchId;
    if (churchId && churchId !== targetChurchId) {
      throw new Error("Church admin can only view their own church members");
    }
  } else if (requester.superAdmin) {
    if (!churchId) throw new Error("SuperAdmin must provide churchId");
    targetChurchId = churchId;
  } else {
    throw new Error("Unauthorized role for viewing members");
  }

  const where: any = { churchId: options.churchId };
  if (options?.verificationStatus) {
    where.verificationStatus = options.verificationStatus;
  }

  const [members, total] = await Promise.all([
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
            status: true,
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
    }),
    prisma.user.count({ where }),
  ]);

  return {
    members: members.map((m) => ({
      id: m.id,
      firstName: m.account.firstName,
      lastName: m.account.lastName,
      email: m.account.email,
      phone: m.account.phone,
      verificationStatus: m.verificationStatus,
      verificationNotes: m.verificationNotes,
      verifiedAt: m.verifiedAt,
      assignedCounselor: m.assignedCounselor
        ? {
            id: m.assignedCounselor.id,
            name: `${m.assignedCounselor.account.firstName} ${m.assignedCounselor.account.lastName}`,
          }
        : null,
      accountStatus: m.account.status,
      joinedAt: m.account.createdAt,
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
 * Update church details
 */
export const updateChurch = async (
  churchId: string,
  data: Partial<CreateChurchData>,
) => {
  const church = await prisma.church.update({
    where: { id: churchId },
    data: {
      officialName: data.officialName,
      aka: data.aka,
      phone: data.phone,
      state: data.state,
      lga: data.lga,
      city: data.city,
      address: data.address,
    },
  });

  return church;
};

export const updateChurchStatus = async (
  churchId: string,
  status: string,
) => {
  const church = await prisma.church.update({
    where: { id: churchId },
    data: {
      status: status as StatusType,
    },
  });

  return church;
};

/**
 * Activate church (when first admin is assigned)
 */
export const activateChurch = async (churchId: string) => {
  const church = await prisma.church.update({
    where: { id: churchId },
    data: { status: "active" },
  });

  return church;
};
