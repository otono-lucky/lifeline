// routes/churchAdminRoutes.ts
// ChurchAdmin routes

import express from "express";
import { getDashboard, getStats } from "../controllers/adminController";
import authMiddleware from "../middleware/authMiddleware";
import { requireSuperAdmin } from "../middleware/requireRole";

const router = express.Router();

// Dashboard
router.get("/dashboard", authMiddleware, requireSuperAdmin, getDashboard);

// Members
router.get("/stats", authMiddleware, requireSuperAdmin, getStats);

export default router;
