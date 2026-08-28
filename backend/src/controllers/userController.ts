// controllers/userController.ts
// User resource endpoints

import { Request, Response } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  saveUserPhoto,
  createUserSocialMedia,
  deleteUserSocialMedia,
  listUserSocialMedia,
} from "../services/userService";
import { uploadProfileImageToCloudinary } from "../services/mediaService";
import { updateAccountStatus } from "../services/accountService";
import { successResponse, errorResponse } from "../utils/responseHandler";

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  SuperAdmin, ChurchAdmin, Counselor
 */
export const list = async (req: Request, res: Response) => {
  try {
    const { isVerified, vettingStatus, subscriptionTier, churchId, page, limit } = req.query;

    const result = await getUsers(
      req.account?.role || "User",
      req.account?.id || "",
      {
        isVerified:
          isVerified === "true"
            ? true
            : isVerified === "false"
            ? false
            : undefined,
        vettingStatus: vettingStatus as any,
        subscriptionTier: subscriptionTier as string,
        churchId: churchId as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      },
    );

    res.json(
      successResponse(
        "Users fetched successfully",
        { users: result.users },
        result.pagination,
      ),
    );
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Server error fetching users"));
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  User (own profile), SuperAdmin, Counselor, ChurchAdmin
 */
export const getOne = async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id);
    const requesterAccountId = req.account?.id || "";
    const requesterRole = req.account?.role || "User";

    const user = await getUserById(targetId, requesterAccountId, requesterRole);

    res.json(successResponse("User fetched successfully", { user }));
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse(error.message || "Server error fetching user"));
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  User (own profile), SuperAdmin
 */
export const update = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);

    if (req.account?.role === "User" && req.account?.id !== accountId) {
      return res.status(403).json(errorResponse("You can only update your own profile"));
    }

    const {
      originCountry,
      originState,
      originLga,
      residenceCountry,
      residenceState,
      residenceCity,
      residenceAddress,
      residenceLatitude,
      residenceLongitude,
      residencePlaceId,
      residenceFormattedAddress,
      occupation,
      salaryRange,
      interests,
      church: churchId,
      branchName,
      whatsappNumber,
      matchPreference,
      dateOfBirth,
      videoIntroUrl,
      videoDurationSeconds,
    } = req.body;

    const user = await updateUser(accountId, {
      originCountry,
      originState,
      originLga,
      residenceCountry,
      residenceState,
      residenceCity,
      residenceAddress,
      residenceLatitude,
      residenceLongitude,
      residencePlaceId,
      residenceFormattedAddress,
      occupation,
      salaryRange,
      interests,
      churchId,
      branchName,
      whatsappNumber,
      matchPreference,
      dateOfBirth,
      videoIntroUrl,
      videoDurationSeconds,
    });

    res.json(successResponse("User profile updated successfully", { user }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Server error updating user"));
  }
};

/**
 * @desc    Upload profile photo (order: 1, 2, or 3)
 * @route   POST /api/users/:id/photos
 * @access  User (own profile), SuperAdmin
 */
export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);
    const order = req.body.order ? parseInt(req.body.order, 10) : 1;

    if (req.account?.role === "User" && req.account?.id !== accountId) {
      return res.status(403).json(errorResponse("You can only upload photos for your own profile"));
    }

    if (!req.file) {
      return res.status(400).json(errorResponse("No image file provided"));
    }

    const uploadResult = await uploadProfileImageToCloudinary(req.file.buffer);

    const savedPhoto = await saveUserPhoto(
      accountId,
      uploadResult.secureUrl,
      order,
      uploadResult.publicId,
    );

    res.json(
      successResponse("Photo uploaded successfully", {
        photo: savedPhoto,
      }),
    );
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Server error uploading photo"));
  }
};

/**
 * @desc    Update user status (suspend/activate)
 * @route   PATCH /api/users/:id/status
 * @access  SuperAdmin
 */
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);
    const { status } = req.body;

    if (!status || !["pending", "active", "suspended", "deleted"].includes(status)) {
      return res.status(400).json(errorResponse("Invalid status value"));
    }

    const user = await updateAccountStatus(accountId, status);
    res.json(successResponse("User status updated successfully", { user }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Server error updating status"));
  }
};

/**
 * @desc    List user's social media handles
 * @route   GET /api/users/:id/socials
 */
export const listSocials = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);
    const socials = await listUserSocialMedia(accountId);
    res.json(successResponse("Social media handles fetched", { socials }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Failed to fetch socials"));
  }
};

/**
 * @desc    Add social media handle (LinkedIn, Instagram, Facebook)
 * @route   POST /api/users/:id/socials
 */
export const addSocial = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);
    const { platform, handleOrUrl } = req.body;

    if (req.account?.role === "User" && req.account?.id !== accountId) {
      return res.status(403).json(errorResponse("Unauthorized"));
    }

    if (!platform || !handleOrUrl) {
      return res.status(400).json(errorResponse("Platform and handleOrUrl are required"));
    }

    const created = await createUserSocialMedia(accountId, {
      platform,
      handleOrUrl,
    });

    res.status(201).json(successResponse("Social media handle added", { social: created }));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message || "Failed to add social handle"));
  }
};

/**
 * @desc    Delete social media handle
 * @route   DELETE /api/users/:id/socials/:socialId
 */
export const removeSocial = async (req: Request, res: Response) => {
  try {
    const accountId = String(req.params.id);
    const socialId = String(req.params.socialId);

    if (req.account?.role === "User" && req.account?.id !== accountId) {
      return res.status(403).json(errorResponse("Unauthorized"));
    }

    await deleteUserSocialMedia(accountId, socialId);
    res.json(successResponse("Social media handle removed", null));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message || "Failed to remove social handle"));
  }
};
