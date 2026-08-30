"use strict";
// routes/counselorRoutes.ts
// Counselor routes
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var counsellorController_1 = require("../controllers/counsellorController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var requireRole_1 = require("../middleware/requireRole");
var validate_1 = require("../middleware/validate");
var counselor_schema_1 = require("../schemas/counselor.schema");
var router = express_1.default.Router();
var requireCounselorOrHigher = (0, requireRole_1.requireRole)([
    "Counselor",
    "ChurchAdmin",
    "SuperAdmin",
]);
// Counselor dashboard
router.get("/dashboard", authMiddleware_1.default, requireCounselorOrHigher, counsellorController_1.getDashboard);
router.get("/:id/dashboard", authMiddleware_1.default, requireCounselorOrHigher, counsellorController_1.getDashboard);
// Get assigned users
router.get("/assigned-users", authMiddleware_1.default, requireCounselorOrHigher, counsellorController_1.getMyAssignedUsers);
router.get("/:id/assigned-users", authMiddleware_1.default, requireCounselorOrHigher, counsellorController_1.getMyAssignedUsers);
// Create counselor (Admins)
router.post("/create", authMiddleware_1.default, requireRole_1.requireAnyAdmin, (0, validate_1.validateBody)(counselor_schema_1.CreateCounselorSchema), counsellorController_1.createCounselorAccount);
// List counselors (Admins)
router.get("/list-all", authMiddleware_1.default, requireRole_1.requireSuperAdmin, counsellorController_1.getAllCounselors);
router.get("/list", authMiddleware_1.default, requireRole_1.requireAnyAdmin, counsellorController_1.list);
// Get single counselor (Admins)
router.get("/:id", authMiddleware_1.default, requireCounselorOrHigher, counsellorController_1.getOne);
// Update counselor (Admins)
router.put("/:id", authMiddleware_1.default, requireCounselorOrHigher, (0, validate_1.validateBody)(counselor_schema_1.UpdateCounselorSchema), counsellorController_1.update);
// Update status (Admins)
router.patch("/:id/status", authMiddleware_1.default, requireRole_1.requireAnyAdmin, (0, validate_1.validateBody)(counselor_schema_1.UpdateCounselorStatusSchema), counsellorController_1.updateStatus);
exports.default = router;
