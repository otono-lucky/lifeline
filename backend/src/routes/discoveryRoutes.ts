import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { requireProfileComplete } from "../middleware/requireProfileComplete";
import { validateQuery } from "../middleware/validate";
import { DiscoveryQuerySchema } from "../schemas/discovery.schema";
import { getFeed } from "../controllers/discoveryController";

const router = express.Router();

// Protected with Auth, 100% Profile Update Gate, and Query validation
router.get("/feed", authMiddleware, requireProfileComplete, validateQuery(DiscoveryQuerySchema), getFeed);

export default router;
