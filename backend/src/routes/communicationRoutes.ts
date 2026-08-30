import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import {
  SendMessageSchema,
  ProposeCalendarEventSchema,
  RespondCalendarEventSchema,
} from "../schemas/communication.schema";
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
router.post("/conversations/:conversationId/messages", validateBody(SendMessageSchema), postMessage);

// Dynamic Calendar
router.post("/matches/:matchId/events", validateBody(ProposeCalendarEventSchema), proposeEvent);
router.patch("/events/:eventId/respond", validateBody(RespondCalendarEventSchema), respondEvent);

export default router;
