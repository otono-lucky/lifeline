import { Request, Response } from "express";
import { getDiscoveryFeed } from "../services/discoveryService";

export const getFeed = async (req: Request, res: Response) => {
  try {
    const accountId = req.account?.id;
    if (!accountId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page, limit, maxDistanceKm, minAge, maxAge } = req.query;

    const result = await getDiscoveryFeed(accountId, {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm as string) : undefined,
      minAge: minAge ? parseInt(minAge as string, 10) : undefined,
      maxAge: maxAge ? parseInt(maxAge as string, 10) : undefined,
    });

    return res.json({
      success: true,
      message: "Discovery feed retrieved successfully",
      data: result.candidates,
      pagination: result.pagination,
      errors: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve discovery feed",
      errors: error.message,
    });
  }
};
