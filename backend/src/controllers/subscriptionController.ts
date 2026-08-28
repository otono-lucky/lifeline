import { Request, Response } from "express";
import { prisma } from "../config/db";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { SubscriptionPlanInterval, SubscriptionTierType } from "@prisma/client";

/**
 * @desc    Get current subscription status
 * @route   GET /api/subscriptions/status
 * @access  Private
 */
export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userAccountId = req.account?.id;
    if (!userAccountId) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    const user = await prisma.user.findUnique({
      where: { accountId: userAccountId },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionInterval: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });

    if (!user) {
      return res.status(404).json(errorResponse("User profile not found"));
    }

    res.json(successResponse("Subscription status retrieved", { subscription: user }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Failed to fetch subscription"));
  }
};

/**
 * @desc    Subscribe to periodic plan (MONTHLY or YEARLY)
 * @route   POST /api/subscriptions/subscribe
 * @access  Private
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const userAccountId = req.account?.id;
    const { interval } = req.body; // "MONTHLY" | "YEARLY"

    if (!userAccountId) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    if (!interval || !["MONTHLY", "YEARLY"].includes(interval)) {
      return res.status(400).json(errorResponse("Valid interval required: 'MONTHLY' or 'YEARLY'"));
    }

    const now = new Date();
    const expiry = new Date(now);
    if (interval === "MONTHLY") {
      expiry.setDate(expiry.getDate() + 30);
    } else {
      expiry.setFullYear(expiry.getFullYear() + 1);
    }

    const updatedUser = await prisma.user.update({
      where: { accountId: userAccountId },
      data: {
        subscriptionTier: "premium",
        subscriptionInterval: interval as SubscriptionPlanInterval,
        subscriptionStatus: "active",
        subscriptionExpiresAt: expiry,
      },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionInterval: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });

    res.json(
      successResponse(`Successfully subscribed to ${interval.toLowerCase()} plan`, {
        subscription: updatedUser,
      }),
    );
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Subscription update failed"));
  }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/subscriptions/cancel
 * @access  Private
 */
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userAccountId = req.account?.id;
    if (!userAccountId) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    const updatedUser = await prisma.user.update({
      where: { accountId: userAccountId },
      data: {
        subscriptionStatus: "canceled",
      },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });

    res.json(successResponse("Subscription cancelled", { subscription: updatedUser }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Failed to cancel subscription"));
  }
};
