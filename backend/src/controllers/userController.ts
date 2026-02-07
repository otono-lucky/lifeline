// controllers/user.controller.ts
// User resource endpoints

import { Request, Response } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  updateUserVerification,
} from "../services/userService";
import { updateAccountStatus } from "../services/accountService";
import { prisma } from "../config/db";

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  SuperAdmin, Counselor (for verification purposes)
 */
export const list = async (req: Request, res: Response) => {
  try {
    const { isVerified, subscriptionTier, page, limit } = req.query;

    const result = await getUsers({
      isVerified: isVerified === "true" ? true : isVerified === "false" ? false : undefined,
      subscriptionTier: subscriptionTier as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(result);
  } catch (error: any) {
    console.error("List users error:", error);
    res.status(500).json({
      message: error.message || "Server error fetching users",
    });
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  SuperAdmin, Counselor, User (own profile)
 */
export const getOne = async (req: Request, res: Response) => {
  try {
    const id = String(req.params);

    // If regular user, they can only view their own profile
    if (req.account.role === "User") {
      const userProfile = await prisma.user.findUnique({
        where: { accountId: req.account.id },
      });

      if (!userProfile || userProfile.id !== id) {
        return res.status(403).json({
          message: "You can only view your own profile",
        });
      }
    }

    const user = await getUserById(id);

    res.json({ user });
  } catch (error: any) {
    console.error("Get user error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: error.message || "Server error fetching user",
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  User (own profile), SuperAdmin
 */
export const update = async (req: Request, res: Response) => {
  try {
    const id = String(req.params);
    const {
      originCountry,
      originState,
      originLga,
      residenceCountry,
      residenceState,
      residenceCity,
      residenceAddress,
      occupation,
      interests,
      church,
      matchPreference,
    } = req.body;

    // If regular user, they can only update their own profile
    if (req.account.role === "User") {
      const userProfile = await prisma.user.findUnique({
        where: { accountId: req.account.id },
      });

      if (!userProfile || userProfile.id !== id) {
        return res.status(403).json({
          message: "You can only update your own profile",
        });
      }
    }

    const user = await updateUser(id, {
      originCountry,
      originState,
      originLga,
      residenceCountry,
      residenceState,
      residenceCity,
      residenceAddress,
      occupation,
      interests,
      church,
      matchPreference,
    });

    res.json({
      message: "User profile updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: error.message || "Server error updating user",
    });
  }
};

/**
 * @desc    Update user verification status
 * @route   PATCH /api/users/:id/verification
 * @access  Counselor, SuperAdmin
 */
export const updateVerification = async (req: Request, res: Response) => {
  try {
    const id = String(req.params);
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        message: "isVerified must be a boolean",
      });
    }

    const user = await updateUserVerification(id, isVerified);

    res.json({
      message: `User ${isVerified ? "verified" : "unverified"} successfully`,
      user,
    });
  } catch (error: any) {
    console.error("Update user verification error:", error);
    res.status(500).json({
      message: error.message || "Server error updating verification",
    });
  }
};

/**
 * @desc    Suspend/activate user account
 * @route   PATCH /api/users/:id/status
 * @access  SuperAdmin
 */
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be: active or suspended",
      });
    }

    // Get user to find their accountId
    const user = await prisma.user.findUnique({
      where: { id },
      select: { accountId: true },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update account status
    const account = await updateAccountStatus(user.accountId, status);

    res.json({
      message: `User ${status === "active" ? "activated" : "suspended"} successfully`,
      status: account.status,
    });
  } catch (error: any) {
    console.error("Update user status error:", error);
    res.status(500).json({
      message: error.message || "Server error updating user status",
    });
  }
};