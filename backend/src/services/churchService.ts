// services/churchService.ts
// Church resource management

import { ChurchModelType, StatusType } from "@prisma/client";
import { prisma } from "../config/db";

interface CreateChurchData {
  officialName: string;
  aka?: string;
  churchModel?: ChurchModelType;
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
  const existingChurch = await prisma.church.findUnique({
    where: { email: data.email },
  });

  if (existingChurch) {
    throw new Error("Church with this email already exists");
  }

  const church = await prisma.church.create({
    data: {
      officialName: data.officialName,
      aka: data.aka,
      churchModel: data.churchModel || "INDIVIDUAL_PARISH",
      email: data.email,
      phone: data.phone,
      state: data.state,
      lga: data.lga,
      city: data.city,
      address: data.address,
      status: "pending",
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
  churchModel?: ChurchModelType;
  page?: number;
  limit?: number;
}) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters?.status) where.status = filters.status as StatusType;
  if (filters?.churchModel) where.churchModel = filters.churchModel;

  const [churches, total] = await Promise.all([
    prisma.church.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        churchAdmin: {
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
 * Get public list of active churches with minimal fields for signup
 */
export const getPublicChurches = async (options?: { limit?: number }) => {
  const limit = options?.limit || 200;

  const churches = await prisma.church.findMany({
    where: { status: "active" },
    take: limit,
    orderBy: { officialName: "asc" },
    select: {
      id: true,
      officialName: true,
      aka: true,
      churchModel: true,
      state: true,
      lga: true,
      city: true,
      address: true,
    },
  });

  return churches.map((c) => ({
    id: c.id,
    officialName: c.officialName,
    aka: c.aka,
    churchModel: c.churchModel,
    address: {
      state: c.state,
      lga: c.lga,
      city: c.city,
      address: c.address,
    },
  }));
};

/**
 * Get single church by ID
 */
export const getChurchById = async (churchId: string) => {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    include: {
      churchAdmin: {
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
 * Get all members of a church with Privacy Firewall for Church Admin
 */
export const getChurchMembers = async (
  requesterId: string,
  options?: {
    churchId?: string;
    vettingStatus?: string;
    page?: number;
    limit?: number;
  },
) => {
  const { churchId, vettingStatus, page = 1, limit = 20 } = options || {};
  const skip = (page - 1) * limit;

  const targetChurchId = await resolveChurchScope(requesterId, churchId);

  const where: any = { churchId: targetChurchId };
  if (vettingStatus) {
    where.vettingStatus = vettingStatus;
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
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        photos: {
          where: { order: 1 },
          select: { url: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    members: members.map((m) => ({
      accountId: m.accountId,
      firstName: m.account.firstName,
      lastName: m.account.lastName,
      email: m.account.email,
      phone: m.account.phone,
      gender: m.gender,
      vettingStatus: m.vettingStatus,
      isVerified: m.isVerified,
      photoUrl: m.photos[0]?.url || m.profilePictureUrl || null,
      branchName: m.branchName,
      assignedCounselor: m.assignedCounselor
        ? {
            accountId: m.assignedCounselor.account.id,
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
      churchModel: data.churchModel,
      phone: data.phone,
      state: data.state,
      lga: data.lga,
      city: data.city,
      address: data.address,
    },
  });

  return church;
};

export const updateChurchStatus = async (churchId: string, status: string) => {
  const church = await prisma.church.update({
    where: { id: churchId },
    data: {
      status: status as StatusType,
    },
  });

  return church;
};

export const activateChurch = async (churchId: string) => {
  const church = await prisma.church.update({
    where: { id: churchId },
    data: { status: "active" },
  });

  return church;
};

export const resolveChurchScope = async (
  requesterId: string,
  requestedChurchId?: string,
): Promise<string> => {
  const requester = await prisma.account.findUnique({
    where: { id: requesterId },
    include: { churchAdmin: true, superAdmin: true },
  });

  if (!requester) throw new Error("Requester not found");

  if (requester.superAdmin) {
    if (!requestedChurchId) {
      throw new Error("Super admin must provide a churchId");
    }
    return requestedChurchId;
  }

  if (requester.churchAdmin) {
    const ownChurchId = requester.churchAdmin.churchId;

    if (requestedChurchId && requestedChurchId !== ownChurchId) {
      throw new Error("Church admin can only view their own church");
    }

    return ownChurchId;
  }

  throw new Error("Unauthorized role for church-scoped data");
};
