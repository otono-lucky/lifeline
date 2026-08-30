"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authMiddleware_1 = require("../middleware/authMiddleware");
var requireRole_1 = require("../middleware/requireRole");
var validate_1 = require("../middleware/validate");
var vetting_schema_1 = require("../schemas/vetting.schema");
var vettingController_1 = require("../controllers/vettingController");
var router = express_1.default.Router();
router.use(authMiddleware_1.default);
// Counselor reviews
router.post("/users/:userId/review", (0, requireRole_1.default)(["Counselor", "SuperAdmin"]), (0, validate_1.validateBody)(vetting_schema_1.VettingReviewSchema), vettingController_1.reviewVetting);
// Counselor-Mediated Status Reset
router.post("/users/:userId/debrief-reset", (0, requireRole_1.default)(["Counselor", "SuperAdmin"]), (0, validate_1.validateBody)(vetting_schema_1.DebriefResetSchema), vettingController_1.debriefReset);
// User appeal
router.post("/appeal", (0, validate_1.validateBody)(vetting_schema_1.UserAppealSchema), vettingController_1.appealBlock);
// SuperAdmin review appeal
router.post("/appeals/:appealId/review", (0, requireRole_1.default)(["SuperAdmin"]), (0, validate_1.validateBody)(vetting_schema_1.ReviewAppealSchema), vettingController_1.reviewAppeal);
exports.default = router;
