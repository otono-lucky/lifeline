// routes/counselor.routes.ts
// Counselor resource routes

import express from "express";
import * as CounselorController from "../controllers/counsellorController";
import authMiddleware from "../middleware/authMiddleware";
import { requireAnyAdmin } from "../middleware/requireRole";

const router = express.Router();

// List counselors
router.get("/", authMiddleware, requireAnyAdmin, CounselorController.list);

// Get single counselor
router.get("/:id", authMiddleware, requireAnyAdmin, CounselorController.getOne);

// Update counselor
router.put("/:id", authMiddleware, requireAnyAdmin, CounselorController.update);

// Update counselor status
router.patch(
  "/:id/status",
  authMiddleware,
  requireAnyAdmin,
  CounselorController.updateStatus
);

export default router;