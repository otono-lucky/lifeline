// routes/index.ts
// Main router - combines all resource routes

import express from "express";
import churchRoutes from "./churchRoutes";
import accountRoutes from "./accountRoutes";
import counselorRoutes from "./counsellorRoutes";
import userRoutes from "./userRoutes";
import dashboardRoutes from "./adminRoutes";

const router = express.Router();

// Mount resource routers
router.use("/churches", churchRoutes);
router.use("/accounts", accountRoutes);
router.use("/counselors", counselorRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;