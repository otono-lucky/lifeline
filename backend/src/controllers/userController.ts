// controllers/user.controller.ts
// User resource endpoints

import { Request, Response } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  updateUserVerification,
  updateUserProfileImage,
  createUserSocialMedia,
  deleteUserSocialMedia,
  listUserSocialMedia,
} from "../services/userService";
import { uploadProfileImageToCloudinary } from "../services/mediaService";
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
  console.log("[GET /api/users/:id] Starting request - UserId:", req.params.id);
  try {
    const accountId = String(req.params.id);

    // If regular user, they can only view their own profile
    if (req.account.role === "User" && req.account.id !== accountId) {
        return res
          .status(403)
          .json(errorResponse("You can only view your own profile"));
    }

    const user = await getUserById(accountId);

    const responseData = successResponse("User fetched successfully", { user });
    console.log(
      "[GET /api/users/:id] ✓ Success - AccountId:",
      user.accountId,
    );
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
    const accountId = String(req.params.id);
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
      dateOfBirth,
      videoIntroUrl,
    } = req.body;

    // If regular user, they can only update their own profile
    if (req.account.role === "User" && req.account.id !== accountId) {
        return res
          .status(403)
          .json(errorResponse("You can only update your own profile"));
    }

    if (typeof req.body?.profilePictureUrl === "string") {
      return res
        .status(400)
        .json(
          errorResponse(
            "Profile image updates must use /users/:id/profile-image",
          ),
        );
    }

    const user = await updateUser(accountId, {
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
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      videoIntroUrl,
    });
    console.log("[PUT /api/users/:id] Success - AccountId:", user.accountId);

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
    const accountId = String(req.params.id);
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res
        .status(400)
        .json(errorResponse("isVerified must be a boolean"));
    }

    const user = await updateUserVerification(accountId, isVerified);
    console.log(
      "[PATCH /api/users/:id/verification] Success - UserId:",
      user.accountId,
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
    const accountId = String(req.params.id);
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res
        .status(400)
        .json(errorResponse("Invalid status. Must be: active or suspended"));
    }

    // Get user by accountId
    const user = await prisma.user.findUnique({
      where: { accountId },
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
      accountId,
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

export const listSocialMedia = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);
    if (req.account.role === "User" && req.account.id !== accountId) {
      return res
        .status(403)
        .json(errorResponse("You can only view your own social handles"));
    }

    const socialMedia = await listUserSocialMedia(accountId);
    res.json(successResponse("Social media handles fetched", { socialMedia }));
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse(error.message || "Server error fetching social handles"));
  }
};

export const createSocialMedia = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);
    const { platform, handleOrUrl } = req.body;

    if (req.account.role === "User" && req.account.id !== accountId) {
      return res
        .status(403)
        .json(errorResponse("You can only update your own social handles"));
    }

    if (!platform || !handleOrUrl) {
      return res
        .status(400)
        .json(errorResponse("platform and handleOrUrl are required"));
    }

    const social = await createUserSocialMedia(accountId, { platform, handleOrUrl });
    res.status(201).json(successResponse("Social media handle added", { social }));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error creating social handle"));
  }
};

export const removeSocialMedia = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);
    const socialId = String(req.params.socialId);

    if (req.account.role === "User" && req.account.id !== accountId) {
      return res
        .status(403)
        .json(errorResponse("You can only update your own social handles"));
    }

    await deleteUserSocialMedia(accountId, socialId);
    res.json(successResponse("Social media handle removed"));
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error deleting social handle"));
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);

    if (req.account.role === "User" && req.account.id !== accountId) {
      return res
        .status(403)
        .json(errorResponse("You can only update your own profile image"));
    }

    if (!req.file?.buffer) {
      return res.status(400).json(errorResponse("No image file uploaded"));
    }

    const uploaded = await uploadProfileImageToCloudinary(req.file.buffer);
    const user = await updateUserProfileImage(accountId, uploaded.secureUrl);

    res.json(
      successResponse("Profile image uploaded successfully", {
        profilePictureUrl: uploaded.secureUrl,
        user,
      }),
    );
  } catch (error: any) {
    res
      .status(400)
      .json(errorResponse(error.message || "Server error uploading profile image"));
  }
};
