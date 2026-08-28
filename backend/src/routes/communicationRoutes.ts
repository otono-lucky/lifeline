import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  getConversations,
  getMessages,
  postMessage,
  proposeEvent,
  respondEvent,
} from "../controllers/communicationController";

const router = express.Router();

router.use(authMiddleware);

router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", postMessage);

// Dynamic Calendar
router.post("/matches/:matchId/events", proposeEvent);
router.patch("/events/:eventId/respond", respondEvent);

export default router;
