// services/adminService.ts
// SuperAdmin dashboard aggregated stats

import { prisma } from "../config/db";
import { calculateAge } from "../utils/ageUtils";

/**
 * Get SuperAdmin dashboard statistics
 */
export const getSuperAdminDashboard = async () => {
  const [
    totalChurches,
    activeChurches,
    pendingChurches,
    totalChurchAdmins,
    totalCounselors,
    activeCounselors,
    totalUsers,
    verifiedUsers,
    premiumUsers,
    totalMatches,
    activeMatches,
    recentChurches,
    recentUsers,
  ] = await Promise.all([
    // Church stats
    prisma.church.count(),
    prisma.church.count({ where: { status: "active" } }),
    prisma.church.count({ where: { status: "pending" } }),

    // Admin stats
    prisma.churchAdmin.count(),

    // Counselor stats
    prisma.counselor.count(),
    prisma.account.count({
      where: { role: "Counselor", status: "active" },
    }),

    // User stats
    prisma.user.count(),
    prisma.user.count({ where: { isVerified: true } }),
    prisma.user.count({ where: { subscriptionTier: "premium" } }),

    // Match stats
    prisma.match.count(),
    prisma.match.count({
      where: {
        status: {
          in: [
            "AWAITING_DECISIONS",
            "WAITING_FOR_OTHER",
            "MUTUAL_ACCEPTED",
            "IN_CONVERSATION",
            "COURTSHIP",
          ],
        },
      },
    }),

    // Recent activity
    prisma.church.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        officialName: true,
        aka: true,
        churchModel: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.user.findMany({
      take: 5,
      orderBy: { account: { createdAt: "desc" } },
      select: {
        accountId: true,
        gender: true,
        dateOfBirth: true,
        isVerified: true,
        vettingStatus: true,
        account: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
      },
    }),
  ]);

  return {
    overview: {
      churches: {
        total: totalChurches,
        active: activeChurches,
        pending: pendingChurches,
      },
      churchAdmins: {
        total: totalChurchAdmins,
      },
      counselors: {
        total: totalCounselors,
        active: activeCounselors,
      },
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        premium: premiumUsers,
        free: totalUsers - premiumUsers,
      },
      matches: {
        total: totalMatches,
        active: activeMatches,
      },
    },
    recentActivity: {
      churches: recentChurches,
      users: recentUsers.map((user) => ({
        ...user,
        age: calculateAge(user.dateOfBirth),
      })),
    },
  };
};

/**
 * Get platform-wide statistics
 */
export const getPlatformStats = async (period?: "day" | "week" | "month") => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "day":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const [newUsers, newChurches, newMatches] = await Promise.all([
    prisma.account.count({
      where: {
        role: "User",
        createdAt: { gte: startDate },
      },
    }),
    prisma.church.count({
      where: {
        createdAt: { gte: startDate },
      },
    }),
    prisma.match.count({
      where: {
        createdAt: { gte: startDate },
      },
    }),
  ]);

  return {
    period: period || "week",
    startDate,
    endDate: now,
    stats: {
      newUsers,
      newChurches,
      newMatches,
    },
  };
};
