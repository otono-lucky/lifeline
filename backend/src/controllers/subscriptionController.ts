import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import env from "../config/env";
import { successResponse, errorResponse } from "../utils/responseHandler";

// @desc    Update user subscription tier
// @route   PUT /api/auth/subscription
// @access  Private
export const updateSubscription = async (req, res) => {
  try {
    const { tier } = req.body;
    const userAccountId = req.account.id; // From authMiddleware

    if (!["free", "premium"].includes(tier)) {
      return res.status(400).json(errorResponse("Invalid subscription tier"));
    }

    const updatedUser = await prisma.user.update({
      where: { accountId: userAccountId },
      data: { subscriptionTier: tier },
      select: { id: true, subscriptionTier: true },
    });

    res.json(
      successResponse(`Subscription updated to ${tier}`, { user: updatedUser })
    );
  } catch (error) {
    console.error("Subscription update error:", error);
    res
      .status(500)
      .json(errorResponse("Server error during subscription update"));
  }
};
