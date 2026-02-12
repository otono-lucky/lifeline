// routes/counselorRoutes.ts
// Counselor routes

import express from "express";
import {
  getDashboard,
  getMyAssignedUsers,
  verifyUserStatus,
  createCounselorAccount,
  list,
  getOne,
  update,
  updateStatus,
  getAllCounselors,
} from "../controllers/counsellorController";
import authMiddleware from "../middleware/authMiddleware";
import {
  requireCounselor,
  requireAnyAdmin,
  requireSuperAdmin,
} from "../middleware/requireRole";

const router = express.Router();

// Counselor dashboard
router.get("/dashboard", authMiddleware, requireCounselor, getDashboard);

// Get assigned users
router.get(
  "/assigned-users",
  authMiddleware,
  requireCounselor,
  getMyAssignedUsers
);

// Verify user
router.post(
  "/verify-user/:userId",
  authMiddleware,
  requireCounselor,
  verifyUserStatus
);

// Create counselor (Admins)
router.post("/create", authMiddleware, requireAnyAdmin, createCounselorAccount);

// List counselors (Admins)
router.get("/list-all", authMiddleware, requireSuperAdmin, getAllCounselors);
router.get("/list", authMiddleware, requireAnyAdmin, list);

// Get single counselor (Admins)
router.get("/:id", authMiddleware, requireAnyAdmin, getOne);

// Update counselor (Admins)
router.put("/:id", authMiddleware, requireAnyAdmin, update);

// Update status (Admins)
router.patch("/:id/status", authMiddleware, requireAnyAdmin, updateStatus);

export default router;