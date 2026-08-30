"use strict";
// routes/church.routes.ts
// Church resource routes
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var ChurchController = require("../controllers/churchController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var requireRole_1 = require("../middleware/requireRole");
var validate_1 = require("../middleware/validate");
var church_schema_1 = require("../schemas/church.schema");
var router = express_1.default.Router();
// Create church
router.post("/", authMiddleware_1.default, requireRole_1.requireSuperAdmin, (0, validate_1.validateBody)(church_schema_1.CreateChurchSchema), ChurchController.create);
// List churches
// Public list for signup and unauthenticated clients
router.get("/public", ChurchController.publicList);
router.get("/", authMiddleware_1.default, requireRole_1.requireSuperAdmin, ChurchController.list);
// Get single church
router.get("/:id", authMiddleware_1.default, requireRole_1.requireAnyAdmin, ChurchController.getOne);
// Update church
router.put("/:id", authMiddleware_1.default, requireRole_1.requireSuperAdmin, (0, validate_1.validateBody)(church_schema_1.UpdateChurchSchema), ChurchController.update);
router.patch("/:id/status", authMiddleware_1.default, requireRole_1.requireSuperAdmin, ChurchController.updateStatus);
router.get("/:id/members", authMiddleware_1.default, requireRole_1.requireAnyAdmin, ChurchController.getMembers);
exports.default = router;
