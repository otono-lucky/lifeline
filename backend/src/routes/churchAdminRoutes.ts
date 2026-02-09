// routes/churchAdminRoutes.ts
// ChurchAdmin routes

import express from "express";
import {
  getDashboard,
  getMembers,
  assignCounselor,
  createChurchAdminAccount,
  listChurchAdmins,
  getChurchAdminDetails,
} from "../controllers/churchAdminController";
import authMiddleware from "../middleware/authMiddleware";
import {
  requireSuperAdmin,
  requireChurchAdmin,
} from "../middleware/requireRole";

const router = express.Router();

// Dashboard
router.get("/dashboard", authMiddleware, requireChurchAdmin, getDashboard);

// Members
router.get("/me/members", authMiddleware, requireChurchAdmin, getMembers);

// Assign counselor
router.post(
  "/assign-counselor",
  authMiddleware,
  requireChurchAdmin,
  assignCounselor
);
// List all church admins
router.get("/", authMiddleware, requireSuperAdmin, listChurchAdmins);

// Get single church admin
router.get("/:id", authMiddleware, requireSuperAdmin, getChurchAdminDetails);
// Create church admin (SuperAdmin only)
router.post("/create", authMiddleware, requireSuperAdmin, createChurchAdminAccount);

export default router;