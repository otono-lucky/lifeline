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
