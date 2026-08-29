import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { requireRole } from "../middleware/requireRole";
import { requireProfileComplete } from "../middleware/requireProfileComplete";
import * as MatchingController from "../controllers/matchingController";

const router = express.Router();

// All matching routes require auth
router.use(authMiddleware);

// User-facing: get own active match (gate enforced)
router.get("/active", requireProfileComplete, MatchingController.getActive);

// User-facing: match history (gate enforced)
router.get("/history", requireProfileComplete, MatchingController.getHistory);

// User-facing: end active relationship
router.post("/:matchId/end", requireProfileComplete, MatchingController.endMatch);

// User-facing: view match details
router.get("/:matchId", requireProfileComplete, MatchingController.getMatchDetails);

// User-facing: view a participant's profile within a match
router.get(
  "/:matchId/profile/:accountId",
  requireProfileComplete,
  MatchingController.getMatchProfile,
);

// Public profile view (within an existing match, elevated roles bypass gate)
router.get(
  "/public-profile/:accountId",
  MatchingController.getPublicProfile,
);

// Elevated roles: view any user's active match
router.get(
  "/active/:accountId",
  requireRole(["Counselor", "ChurchAdmin", "SuperAdmin"]),
  MatchingController.getActiveForAccount,
);

// Elevated roles: view any user's match history
router.get(
  "/history/:accountId",
  requireRole(["Counselor", "ChurchAdmin", "SuperAdmin"]),
  MatchingController.getHistoryForAccount,
);

// Admin/Counselor: list all matches
router.get(
  "/",
  requireRole(["Counselor", "ChurchAdmin", "SuperAdmin"]),
  MatchingController.listAll,
);

export default router;

