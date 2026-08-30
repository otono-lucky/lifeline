"use strict";
// routes/subscriptionRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var subscriptionController_1 = require("../controllers/subscriptionController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var validate_1 = require("../middleware/validate");
var subscription_schema_1 = require("../schemas/subscription.schema");
var router = express_1.default.Router();
router.use(authMiddleware_1.default);
router.get("/status", subscriptionController_1.getSubscriptionStatus);
router.post("/subscribe", (0, validate_1.validateBody)(subscription_schema_1.SubscribePlanSchema), subscriptionController_1.subscribe);
router.post("/cancel", subscriptionController_1.cancelSubscription);
exports.default = router;
