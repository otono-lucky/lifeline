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
import discoveryRoutes from "./discoveryRoutes";
import requestRoutes from "./requestRoutes";
import vettingRoutes from "./vettingRoutes";
import communicationRoutes from "./communicationRoutes";
import subscriptionRoutes from "./subscriptionRoutes";

const router = express.Router();

// Mount resource routers
router.use("/auth", authRoutes);
router.use("/churches", churchRoutes);
router.use("/church-admin", churchAdminRoutes);
router.use("/counselor", counselorRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/matches", matchingRoutes);
router.use("/discovery", discoveryRoutes);
router.use("/requests", requestRoutes);
router.use("/vetting", vettingRoutes);
router.use("/communications", communicationRoutes);
router.use("/subscriptions", subscriptionRoutes);

export default router;
