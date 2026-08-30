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
import { validateBody } from "../middleware/validate";
import {
  CreateChurchAdminSchema,
  UpdateChurchAdminSchema,
  AssignCounselorSchema,
} from "../schemas/church.schema";

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
  validateBody(AssignCounselorSchema),
  assignCounselor,
);

// SuperAdmin church admin management
router.post(
  "/create",
  requireRole(["SuperAdmin"]),
  validateBody(CreateChurchAdminSchema),
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
  validateBody(UpdateChurchAdminSchema),
  updateChurchAdminProfile,
);

export default router;
