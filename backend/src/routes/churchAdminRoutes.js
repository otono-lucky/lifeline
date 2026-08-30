"use strict";
// routes/churchAdminRoutes.ts
// Church Admin routes
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var churchAdminController_1 = require("../controllers/churchAdminController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var requireRole_1 = require("../middleware/requireRole");
var validate_1 = require("../middleware/validate");
var church_schema_1 = require("../schemas/church.schema");
var router = express_1.default.Router();
router.use(authMiddleware_1.default);
// ChurchAdmin dashboard
router.get("/dashboard", (0, requireRole_1.default)(["ChurchAdmin", "SuperAdmin"]), churchAdminController_1.getDashboard);
router.get("/dashboard/:id", (0, requireRole_1.default)(["SuperAdmin"]), churchAdminController_1.getDashboard);
// Assign counselor
router.post("/assign-counselor", (0, requireRole_1.default)(["ChurchAdmin"]), (0, validate_1.validateBody)(church_schema_1.AssignCounselorSchema), churchAdminController_1.assignCounselor);
// SuperAdmin church admin management
router.post("/create", (0, requireRole_1.default)(["SuperAdmin"]), (0, validate_1.validateBody)(church_schema_1.CreateChurchAdminSchema), churchAdminController_1.createChurchAdminAccount);
router.get("/", (0, requireRole_1.default)(["SuperAdmin"]), churchAdminController_1.listChurchAdmins);
router.get("/:id", (0, requireRole_1.default)(["SuperAdmin", "ChurchAdmin"]), churchAdminController_1.getChurchAdminDetails);
router.put("/:id", (0, requireRole_1.default)(["SuperAdmin", "ChurchAdmin"]), (0, validate_1.validateBody)(church_schema_1.UpdateChurchAdminSchema), churchAdminController_1.updateChurchAdminProfile);
exports.default = router;
