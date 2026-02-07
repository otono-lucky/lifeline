// services/dashboard.service.ts
// SuperAdmin dashboard aggregated stats

import { prisma } from "../config/db";

/**
 * Get SuperAdmin dashboard statistics
 */
export const getSuperAdminDashboard = async () => {
  // Run all queries in parallel for performance
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

    // Recent activity
    prisma.church.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        officialName: true,
        aka: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.user.findMany({
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
    },
    recentActivity: {
      churches: recentChurches,
      users: recentUsers,
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

  const [newChurches, newUsers, newCounselors] = await Promise.all([
    prisma.church.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.user.count({
      where: { account: {createdAt: { gte: startDate }} },
    }),
    prisma.counselor.count({
      where: { account: {createdAt: { gte: startDate }} },
    }),
  ]);

  return {
    period,
    startDate,
    endDate: now,
    newChurches,
    newUsers,
    newCounselors,
  };
};