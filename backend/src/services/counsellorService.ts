// services/counselor.service.ts
// Counselor resource management

import { prisma } from "../config/db";

/**
 * Get counselors for a church
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
          status: true, // Account status (active/suspended)
          createdAt: true,
        },
      },
    },
    orderBy: { account: {createdAt: "desc" }},
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