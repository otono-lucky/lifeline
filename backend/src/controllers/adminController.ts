// controllers/dashboard.controller.ts
// SuperAdmin dashboard endpoints

import { Request, Response } from "express";
import {
  getSuperAdminDashboard,
  getPlatformStats,
} from "../services/adminService";
import { successResponse, errorResponse } from "../utils/responseHandler";

/**
 * @desc    Get SuperAdmin dashboard
 * @route   GET /api/admin/dashboard
 * @access  SuperAdmin
 */
export const getDashboard = async (req: Request, res: Response) => {
  console.log(
    "[GET /api/admin/dashboard] Starting - SuperAdmin:",
    req.account?.id,
  );
  try {
    const dashboard = await getSuperAdminDashboard();
    console.log("[GET /api/admin/dashboard] Success");
    res.json(successResponse("Dashboard data fetched successfully", dashboard));
  } catch (error: any) {
    console.error("[GET /api/admin/dashboard] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching dashboard"));
  }
};

/**
 * @desc    Get platform statistics
 * @route   GET /api/admin/stats
 * @access  SuperAdmin
 */
export const getStats = async (req: Request, res: Response) => {
  console.log("[GET /api/admin/stats] Starting - Period:", req.query.period);
  try {
    const { period } = req.query;

    const validPeriods = ["day", "week", "month"];
    const selectedPeriod = validPeriods.includes(period as string)
      ? (period as "day" | "week" | "month")
      : "week";

    const stats = await getPlatformStats(selectedPeriod);
    console.log("[GET /api/admin/stats] Success");
    res.json(
      successResponse("Platform statistics fetched successfully", stats),
    );
  } catch (error: any) {
    console.error("[GET /api/admin/stats] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching statistics"));
  }
};
