import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { requireRole } from "../middleware/requireRole";
import * as MatchingController from "../controllers/matchingController";

const router = express.Router();

router.get("/active", authMiddleware, MatchingController.getActive);
router.get(
  "/active/:accountId",
  authMiddleware,
  requireRole(["Counselor", "ChurchAdmin", "SuperAdmin"]),
  MatchingController.getActiveForAccount,
);
router.get("/history", authMiddleware, MatchingController.getHistory);
router.get(
  "/history/:accountId",
  authMiddleware,
  requireRole(["Counselor", "ChurchAdmin", "SuperAdmin"]),
  MatchingController.getHistoryForAccount,
);
router.post("/:matchId/decision", authMiddleware, MatchingController.decide);
router.get(
  "/:matchId/profile/:accountId",
  authMiddleware,
  MatchingController.getMatchProfile,
);
router.get(
  "/public-profile/:accountId",
  authMiddleware,
  MatchingController.getPublicProfile,
);
router.get("/:matchId", authMiddleware, MatchingController.getMatchDetails);

router.post(
  "/",
  authMiddleware,
  requireRole(["Counselor", "ChurchAdmin", "SuperAdmin"]),
  MatchingController.create,
);
router.get(
  "/",
  authMiddleware,
  requireRole(["Counselor", "ChurchAdmin", "SuperAdmin"]),
  MatchingController.listAll,
);

export default router;
