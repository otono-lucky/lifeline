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
import { successResponse, errorResponse } from "../utils/responseHandler";

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  SuperAdmin, Counselor (for verification purposes)
 */
export const list = async (req: Request, res: Response) => {
  console.log("[GET /api/users] Starting - Role:", req.account?.role);
  try {
    const { isVerified, subscriptionTier, page, limit } = req.query;

    const result = await getUsers({
      isVerified:
        isVerified === "true"
          ? true
          : isVerified === "false"
            ? false
            : undefined,
      subscriptionTier: subscriptionTier as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    console.log("[GET /api/users] Success - Count:", result.users.length);

    res.json(
      successResponse(
        "Users fetched successfully",
        { users: result.users },
        result.pagination,
      ),
    );
  } catch (error: any) {
    console.error("[GET /api/users] Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching users"));
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  SuperAdmin, Counselor, User (own profile)
 */
export const getOne = async (req: Request, res: Response) => {
  console.log("[GET /api/users/:id] Starting request - UserId:", req.params);
  try {
    const id = String(req.params);

    // If regular user, they can only view their own profile
    if (req.account.role === "User") {
      const userProfile = await prisma.user.findUnique({
        where: { accountId: req.account.id },
      });

      if (!userProfile || userProfile.id !== id) {
        return res
          .status(403)
          .json(errorResponse("You can only view your own profile"));
      }
    }

    const user = await getUserById(id);

    const responseData = successResponse("User fetched successfully", { user });
    console.log("[GET /api/users/:id] ✓ Success - UserId:", user.id);
    res.json(responseData);
  } catch (error: any) {
    console.error("[GET /api/users/:id] ✗ Failed:", error.message);

    if (error.message === "User not found") {
      console.error("[GET /api/users/:id] Failed: User not found");
      return res.status(404).json(errorResponse(error.message));
    }

    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching user"));
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  User (own profile), SuperAdmin
 */
export const update = async (req: Request, res: Response) => {
  console.log("[PUT /api/users/:id] Starting - UserId:", req.params);
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
      church: churchId,
      matchPreference,
    } = req.body;

    // If regular user, they can only update their own profile
    if (req.account.role === "User") {
      const userProfile = await prisma.user.findUnique({
        where: { accountId: req.account.id },
      });

      if (!userProfile || userProfile.id !== id) {
        return res
          .status(403)
          .json(errorResponse("You can only update your own profile"));
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
      churchId,
      matchPreference,
    });
    console.log("[PUT /api/users/:id] Success - UserId:", user.id);

    res.json(successResponse("User profile updated successfully", { user }));
  } catch (error: any) {
    console.error("[PATCH /api/users/:id/status] ✗ Failed:", error.message);
    res
      .status(500)
      .json(errorResponse(error.message || "Server error updating user"));
  }
};

/**
 * @desc    Update user verification status
 * @route   PATCH /api/users/:id/verification
 * @access  Counselor, SuperAdmin
 */
export const updateVerification = async (req: Request, res: Response) => {
  console.log(
    "[UserController] updateVerification - UserId:",
    req.params,
    "Status:",
    req.body?.isVerified,
  );
  try {
    const id = String(req.params);
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res
        .status(400)
        .json(errorResponse("isVerified must be a boolean"));
    }

    const user = await updateUserVerification(id, isVerified);
    console.log(
      "[PATCH /api/users/:id/verification] Success - UserId:",
      user.id,
    );
    res.json(
      successResponse(
        `User ${isVerified ? "verified" : "unverified"} successfully`,
        { user },
      ),
    );
  } catch (error: any) {
    console.error(
      "[PATCH /api/users/:id/verification] ✗ Failed:",
      error.message,
    );
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error updating verification"),
      );
  }
};

/**
 * @desc    Suspend/activate user account
 * @route   PATCH /api/users/:id/status
 * @access  SuperAdmin
 */
export const updateStatus = async (req: Request, res: Response) => {
  console.log(
    "[UserController] updateStatus - UserId:",
    req.params?.id,
    "Status:",
    req.body?.status,
  );
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res
        .status(400)
        .json(errorResponse("Invalid status. Must be: active or suspended"));
    }

    // Get user to find their accountId
    const user = await prisma.user.findUnique({
      where: { id },
      select: { accountId: true },
    });

    if (!user) {
      console.error("[PATCH /api/users/:id/status] Failed: User not found");
      return res.status(404).json(errorResponse("User not found"));
    }

    // Update account status
    const account = await updateAccountStatus(user.accountId, status);
    console.log(
      "[PATCH /api/users/:id/status] Success - UserId:",
      id,
      "Status:",
      status,
    );
    res.json(
      successResponse(
        `User ${status === "active" ? "activated" : "suspended"} successfully`,
        { status: account.status },
      ),
    );
  } catch (error: any) {
    console.error("[PATCH /api/users/:id/status] Failed:", error.message);
    res
      .status(500)
      .json(
        errorResponse(error.message || "Server error updating user status"),
      );
  }
};
