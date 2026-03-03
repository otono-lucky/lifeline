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
  requireRole,
} from "../middleware/requireRole";

const router = express.Router();
const requireCounselorOrHigher = requireRole([
  "Counselor",
  "ChurchAdmin",
  "SuperAdmin",
]);

// Counselor dashboard
router.get("/dashboard", authMiddleware, requireCounselorOrHigher, getDashboard);
router.get(
  "/:id/dashboard",
  authMiddleware,
  requireCounselorOrHigher,
  getDashboard,
);

// Get assigned users
router.get(
  "/assigned-users",
  authMiddleware,
  requireCounselorOrHigher,
  getMyAssignedUsers
);
router.get(
  "/:id/assigned-users",
  authMiddleware,
  requireCounselorOrHigher,
  getMyAssignedUsers,
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
router.get("/:id", authMiddleware, requireCounselorOrHigher, getOne);

// Update counselor (Admins)
router.put("/:id", authMiddleware, requireCounselorOrHigher, update);

// Update status (Admins)
router.patch("/:id/status", authMiddleware, requireAnyAdmin, updateStatus);

export default router;
