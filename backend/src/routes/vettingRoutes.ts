import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import requireRole from "../middleware/requireRole";
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
  reviewVetting,
);

// Counselor-Mediated Status Reset
router.post(
  "/users/:userId/debrief-reset",
  requireRole(["Counselor", "SuperAdmin"]),
  debriefReset,
);

// User appeal
router.post("/appeal", appealBlock);

// SuperAdmin review appeal
router.post("/appeals/:appealId/review", requireRole(["SuperAdmin"]), reviewAppeal);

export default router;
