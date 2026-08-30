"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authMiddleware_1 = require("../middleware/authMiddleware");
var validate_1 = require("../middleware/validate");
var communication_schema_1 = require("../schemas/communication.schema");
var communicationController_1 = require("../controllers/communicationController");
var router = express_1.default.Router();
router.use(authMiddleware_1.default);
router.get("/conversations", communicationController_1.getConversations);
router.get("/conversations/:conversationId/messages", communicationController_1.getMessages);
router.post("/conversations/:conversationId/messages", (0, validate_1.validateBody)(communication_schema_1.SendMessageSchema), communicationController_1.postMessage);
// Dynamic Calendar
router.post("/matches/:matchId/events", (0, validate_1.validateBody)(communication_schema_1.ProposeCalendarEventSchema), communicationController_1.proposeEvent);
router.patch("/events/:eventId/respond", (0, validate_1.validateBody)(communication_schema_1.RespondCalendarEventSchema), communicationController_1.respondEvent);
exports.default = router;
