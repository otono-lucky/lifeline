import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import requireRole from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import {
  VettingReviewSchema,
  DebriefResetSchema,
  UserAppealSchema,
  ReviewAppealSchema,
} from "../schemas/vetting.schema";
import {
  appealBlock,
  debriefReset,
  reviewAppeal,
  reviewVetting,
} from "../controllers/vettingController";

const router = express.Router();

router.use(authMiddleware);

// Counselor reviews
router.post(
  "/users/:userId/review",
  requireRole(["Counselor", "SuperAdmin"]),
  validateBody(VettingReviewSchema),
  reviewVetting,
);

// Counselor-Mediated Status Reset
router.post(
  "/users/:userId/debrief-reset",
  requireRole(["Counselor", "SuperAdmin"]),
  validateBody(DebriefResetSchema),
  debriefReset,
);

// User appeal
router.post("/appeal", validateBody(UserAppealSchema), appealBlock);

// SuperAdmin review appeal
router.post("/appeals/:appealId/review", requireRole(["SuperAdmin"]), validateBody(ReviewAppealSchema), reviewAppeal);

export default router;
