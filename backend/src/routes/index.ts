// routes/index.ts
// Main router - combines all resource routes

import express from "express";
import authRoutes from "./authRoutes";
import churchRoutes from "./churchRoutes";
import churchAdminRoutes from "./churchAdminRoutes";
import counselorRoutes from "./counsellorRoutes";
import userRoutes from "./userRoutes";
import adminRoutes from "./adminRoutes";
import matchingRoutes from "./matchingRoutes";

const router = express.Router();

// Mount resource routers
router.use("/auth", authRoutes);
router.use("/churches", churchRoutes);
router.use("/church-admin", churchAdminRoutes);
router.use("/counselor", counselorRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/matches", matchingRoutes);

export default router;
