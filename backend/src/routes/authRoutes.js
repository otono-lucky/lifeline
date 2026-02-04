import express from "express";
import * as authController from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.put("/subscription", protect, authController.updateSubscription);

export default router;
