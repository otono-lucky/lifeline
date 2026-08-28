import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { requireProfileComplete } from "../middleware/requireProfileComplete";
import { getFeed } from "../controllers/discoveryController";

const router = express.Router();

// Protected with Auth and 100% Profile Update Gate
router.get("/feed", authMiddleware, requireProfileComplete, getFeed);

export default router;
