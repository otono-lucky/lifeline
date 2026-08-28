// routes/subscriptionRoutes.ts

import express from "express";
import {
  cancelSubscription,
  getSubscriptionStatus,
  subscribe,
} from "../controllers/subscriptionController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

router.get("/status", getSubscriptionStatus);
router.post("/subscribe", subscribe);
router.post("/cancel", cancelSubscription);

export default router;