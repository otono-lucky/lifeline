"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authMiddleware_1 = require("../middleware/authMiddleware");
var requireRole_1 = require("../middleware/requireRole");
var requireProfileComplete_1 = require("../middleware/requireProfileComplete");
var validate_1 = require("../middleware/validate");
var match_schema_1 = require("../schemas/match.schema");
var MatchingController = require("../controllers/matchingController");
var router = express_1.default.Router();
// All matching routes require auth
router.use(authMiddleware_1.default);
// User-facing: get own active match (gate enforced)
router.get("/active", requireProfileComplete_1.requireProfileComplete, MatchingController.getActive);
// User-facing: match history (gate enforced)
router.get("/history", requireProfileComplete_1.requireProfileComplete, MatchingController.getHistory);
// User-facing: end active relationship
router.post("/:matchId/end", requireProfileComplete_1.requireProfileComplete, (0, validate_1.validateBody)(match_schema_1.EndRelationshipMatchSchema), MatchingController.endMatch);
// User-facing: view match details
router.get("/:matchId", requireProfileComplete_1.requireProfileComplete, MatchingController.getMatchDetails);
// User-facing: view a participant's profile within a match
router.get("/:matchId/profile/:accountId", requireProfileComplete_1.requireProfileComplete, MatchingController.getMatchProfile);
// Public profile view (within an existing match, elevated roles bypass gate)
router.get("/public-profile/:accountId", MatchingController.getPublicProfile);
// Elevated roles: view any user's active match
router.get("/active/:accountId", (0, requireRole_1.requireRole)(["Counselor", "ChurchAdmin", "SuperAdmin"]), MatchingController.getActiveForAccount);
// Elevated roles: view any user's match history
router.get("/history/:accountId", (0, requireRole_1.requireRole)(["Counselor", "ChurchAdmin", "SuperAdmin"]), MatchingController.getHistoryForAccount);
// Admin/Counselor: list all matches
router.get("/", (0, requireRole_1.requireRole)(["Counselor", "ChurchAdmin", "SuperAdmin"]), MatchingController.listAll);
exports.default = router;
