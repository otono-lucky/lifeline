// routes/dashboard.routes.ts
// SuperAdmin dashboard routes

import express from "express";
import * as DashboardController from "../controllers/adminController";
import authMiddleware from "../middleware/authMiddleware";
import { requireSuperAdmin } from "../middleware/requireRole";

const router = express.Router();

// Get dashboard overview
router.get("/", authMiddleware, requireSuperAdmin, DashboardController.getDashboard);

// Get platform statistics
router.get("/stats", authMiddleware, requireSuperAdmin, DashboardController.getStats);

export default router;