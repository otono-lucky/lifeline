import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { requireProfileComplete } from "../middleware/requireProfileComplete";
import { validateBody } from "../middleware/validate";
import { SendMatchRequestSchema } from "../schemas/request.schema";
import {
  accept,
  cancel,
  decline,
  getReceived,
  getSent,
  sendRequest,
} from "../controllers/requestController";

const router = express.Router();

router.use(authMiddleware);

router.post("/send", requireProfileComplete, validateBody(SendMatchRequestSchema), sendRequest);
router.get("/sent", getSent);
router.get("/received", getReceived);
router.post("/:id/accept", accept);
router.post("/:id/decline", decline);
router.post("/:id/cancel", cancel);

export default router;
