// routes/church.routes.ts
// Church resource routes

import express from "express";
import * as ChurchController from "../controllers/churchController";
import authMiddleware from "../middleware/authMiddleware";
import { requireSuperAdmin, requireAnyAdmin } from "../middleware/requireRole";

const router = express.Router();

// Create church
router.post("/", authMiddleware, requireSuperAdmin, ChurchController.create);

// List churches
router.get("/", authMiddleware, requireSuperAdmin, ChurchController.list);

// Get single church
router.get("/:id", authMiddleware, requireAnyAdmin, ChurchController.getOne);

// Update church
router.put("/:id", authMiddleware, requireSuperAdmin, ChurchController.update);

export default router;