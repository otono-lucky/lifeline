// controllers/dashboard.controller.ts
// SuperAdmin dashboard endpoints

import { Request, Response } from "express";
import {
  getSuperAdminDashboard,
  getPlatformStats,
} from "../services/adminService";

/**
 * @desc    Get SuperAdmin dashboard
 * @route   GET /api/dashboard
 * @access  SuperAdmin
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await getSuperAdminDashboard();

    res.json(dashboard);
  } catch (error: any) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      message: error.message || "Server error fetching dashboard",
    });
  }
};

/**
 * @desc    Get platform statistics
 * @route   GET /api/dashboard/stats
 * @access  SuperAdmin
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const { period } = req.query;

    const validPeriods = ["day", "week", "month"];
    const selectedPeriod = validPeriods.includes(period as string)
      ? (period as "day" | "week" | "month")
      : "week";

    const stats = await getPlatformStats(selectedPeriod);

    res.json(stats);
  } catch (error: any) {
    console.error("Get platform stats error:", error);
    res.status(500).json({
      message: error.message || "Server error fetching statistics",
    });
  }
};