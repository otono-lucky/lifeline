import express from "express";
import * as subscriptionController from "../controllers/subscriptionController";
import authenticate from "../middleware/authMiddleware";


const router = express.Router();

router.put("/subscription", authenticate, subscriptionController.updateSubscription);