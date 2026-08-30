// routes/subscriptionRoutes.ts

import express from "express";
import {
  cancelSubscription,
  getSubscriptionStatus,
  subscribe,
} from "../controllers/subscriptionController";
import authMiddleware from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import { SubscribePlanSchema } from "../schemas/subscription.schema";

const router = express.Router();

router.use(authMiddleware);

router.get("/status", getSubscriptionStatus);
router.post("/subscribe", validateBody(SubscribePlanSchema), subscribe);
router.post("/cancel", cancelSubscription);

export default router;