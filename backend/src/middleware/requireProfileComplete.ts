import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { calculateProfileCompletion } from "../utils/profileCompletion";

export const requireProfileComplete = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accountId = req.account?.id;
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Elevated roles bypass profile gate
    if (req.account?.role !== "User") {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { accountId },
      include: {
        photos: true,
        socialMediaHandles: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const completion = calculateProfileCompletion({
      ...user,
      socialMediaHandles: user.socialMediaHandles,
      photos: user.photos,
    });

    if (!completion.isComplete) {
      return res.status(403).json({
        success: false,
        message:
          "Profile Update Gate: Your profile must be 100% complete to access discovery and matchmaking.",
        data: {
          completionPercentage: completion.percentage,
          missingFields: completion.missingFields,
        },
      });
    }

    if (user.vettingStatus !== "VETTED_ACTIVE") {
      return res.status(403).json({
        success: false,
        message: `Account is not active in the discovery pool. Current status: ${user.vettingStatus}`,
        data: {
          vettingStatus: user.vettingStatus,
        },
      });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to check profile completion status",
    });
  }
};
