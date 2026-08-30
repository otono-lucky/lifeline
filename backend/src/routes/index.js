"use strict";
// routes/index.ts
// Main router - combines all resource routes
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authRoutes_1 = require("./authRoutes");
var churchRoutes_1 = require("./churchRoutes");
var churchAdminRoutes_1 = require("./churchAdminRoutes");
var counsellorRoutes_1 = require("./counsellorRoutes");
var userRoutes_1 = require("./userRoutes");
var adminRoutes_1 = require("./adminRoutes");
var matchingRoutes_1 = require("./matchingRoutes");
var discoveryRoutes_1 = require("./discoveryRoutes");
var requestRoutes_1 = require("./requestRoutes");
var vettingRoutes_1 = require("./vettingRoutes");
var communicationRoutes_1 = require("./communicationRoutes");
var subscriptionRoutes_1 = require("./subscriptionRoutes");
var router = express_1.default.Router();
// Mount resource routers
router.use("/auth", authRoutes_1.default);
router.use("/churches", churchRoutes_1.default);
router.use("/church-admin", churchAdminRoutes_1.default);
router.use("/counselor", counsellorRoutes_1.default);
router.use("/users", userRoutes_1.default);
router.use("/admin", adminRoutes_1.default);
router.use("/matches", matchingRoutes_1.default);
router.use("/discovery", discoveryRoutes_1.default);
router.use("/requests", requestRoutes_1.default);
router.use("/vetting", vettingRoutes_1.default);
router.use("/communications", communicationRoutes_1.default);
router.use("/subscriptions", subscriptionRoutes_1.default);
exports.default = router;
