// routes/churchAdminRoutes.ts
// Church Admin routes

import express from "express";
import {
  getDashboard,
  assignCounselor,
  createChurchAdminAccount,
  listChurchAdmins,
  getChurchAdminDetails,
  updateChurchAdminProfile,
} from "../controllers/churchAdminController";
import authMiddleware from "../middleware/authMiddleware";
import requireRole from "../middleware/requireRole";

const router = express.Router();

router.use(authMiddleware);

// ChurchAdmin dashboard
router.get(
  "/dashboard",
  requireRole(["ChurchAdmin", "SuperAdmin"]),
  getDashboard,
);
router.get(
  "/dashboard/:id",
  requireRole(["SuperAdmin"]),
  getDashboard,
);

// Assign counselor
router.post(
  "/assign-counselor",
  requireRole(["ChurchAdmin"]),
  assignCounselor,
);

// SuperAdmin church admin management
router.post(
  "/create",
  requireRole(["SuperAdmin"]),
  createChurchAdminAccount,
);
router.get(
  "/",
  requireRole(["SuperAdmin"]),
  listChurchAdmins,
);
router.get(
  "/:id",
  requireRole(["SuperAdmin", "ChurchAdmin"]),
  getChurchAdminDetails,
);
router.put(
  "/:id",
  requireRole(["SuperAdmin", "ChurchAdmin"]),
  updateChurchAdminProfile,
);

export default router;
