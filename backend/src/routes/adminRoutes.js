"use strict";
// routes/churchAdminRoutes.ts
// ChurchAdmin routes
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var adminController_1 = require("../controllers/adminController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var requireRole_1 = require("../middleware/requireRole");
var router = express_1.default.Router();
// Dashboard
router.get("/dashboard", authMiddleware_1.default, requireRole_1.requireSuperAdmin, adminController_1.getDashboard);
// Members
router.get("/stats", authMiddleware_1.default, requireRole_1.requireSuperAdmin, adminController_1.getStats);
exports.default = router;
