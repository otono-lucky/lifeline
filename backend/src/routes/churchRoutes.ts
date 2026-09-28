// routes/church.routes.ts
// Church resource routes

import express from "express";
import * as ChurchController from "../controllers/churchController";
import authMiddleware from "../middleware/authMiddleware";
import { requireSuperAdmin, requireAnyAdmin } from "../middleware/requireRole";
import { uploadSingle } from "../middleware/uploadMiddleware";
import { validateBody } from "../middleware/validate";
import { CreateChurchSchema, UpdateChurchSchema } from "../schemas/church.schema";

const router = express.Router();

// Create church
router.post("/", authMiddleware, requireSuperAdmin, validateBody(CreateChurchSchema), ChurchController.create);

// List churches
// Public list for signup and unauthenticated clients
router.get("/public", ChurchController.publicList);

router.get("/", authMiddleware, requireSuperAdmin, ChurchController.list);

// Get single church
router.get("/:id", authMiddleware, requireAnyAdmin, ChurchController.getOne);

// Update church details
router.put("/:id", authMiddleware, requireAnyAdmin, validateBody(UpdateChurchSchema), ChurchController.update);

// Upload church logo
router.post("/:id/logo", authMiddleware, requireAnyAdmin, uploadSingle, ChurchController.uploadLogo);

router.patch(
  "/:id/status",
  authMiddleware,
  requireSuperAdmin,
  ChurchController.updateStatus,
);
router.get(
  "/:id/members",
  authMiddleware,
  requireAnyAdmin,
  ChurchController.getMembers,
);

export default router;
