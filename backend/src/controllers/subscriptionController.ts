import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import env from "../config/env";
import { successResponse, errorResponse } from "../utils/responseHandler";

// @desc    Update user subscription tier
// @route   PUT /api/auth/subscription
// @access  Private
export const updateSubscription = async (req, res) => {
  console.log(
    "[SubscriptionController] updateSubscription - UserId:",
    req.account?.id,
    "Tier:",
    req.body?.tier,
  );
  try {
    const { tier } = req.body;
    const userAccountId = req.account.id; // From authMiddleware

    if (!["free", "premium"].includes(tier)) {
      console.error(
        "[PUT /api/auth/subscription] Failed: Invalid subscription tier",
      );
      return res.status(400).json(errorResponse("Invalid subscription tier"));
    }

    const updatedUser = await prisma.user.update({
      where: { accountId: userAccountId },
      data: { subscriptionTier: tier },
      select: { id: true, subscriptionTier: true },
    });
    console.log(
      "[PUT /api/auth/subscription] Success - UserId:",
      updatedUser.id,
      "Tier:",
      tier,
    );
    res.json(
      successResponse(`Subscription updated to ${tier}`, { user: updatedUser }),
    );
  } catch (error) {
    console.error("[PUT /api/auth/subscription] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse("Server error during subscription update"));
  }
};
