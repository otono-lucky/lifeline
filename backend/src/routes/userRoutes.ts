// routes/user.routes.ts
// User resource routes

import express from "express";
import * as UserController from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";
import { requireSuperAdmin } from "../middleware/requireRole";
import {
  profileImageUpload,
  handleUploadError,
} from "../middleware/uploadMiddleware";

const router = express.Router();

// List users
router.get(
  "/",
  authMiddleware,
  requireSuperAdmin, // Only SuperAdmin can list all users
  UserController.list
);

// Get single user
router.get(
  "/:id",
  authMiddleware, // User can view own profile, SuperAdmin/Counselor can view any
  UserController.getOne
);

// Update user profile
router.put(
  "/:id",
  authMiddleware, // User can update own profile, SuperAdmin can update any
  UserController.update
);

router.post(
  "/:id/profile-image",
  authMiddleware,
  profileImageUpload.single("image"),
  handleUploadError,
  UserController.uploadProfileImage,
);

// Update user verification status
router.patch(
  "/:id/verification",
  authMiddleware,
  requireSuperAdmin, // Only SuperAdmin or Counselor should verify
  UserController.updateVerification
);

// Update user account status (suspend/activate)
router.patch(
  "/:id/status",
  authMiddleware,
  requireSuperAdmin,
  UserController.updateStatus
);

router.get(
  "/:id/social-media",
  authMiddleware,
  UserController.listSocialMedia
);

router.post(
  "/:id/social-media",
  authMiddleware,
  UserController.createSocialMedia
);

router.delete(
  "/:id/social-media/:socialId",
  authMiddleware,
  UserController.removeSocialMedia
);

export default router;
