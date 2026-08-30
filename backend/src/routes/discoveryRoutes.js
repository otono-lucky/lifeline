"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authMiddleware_1 = require("../middleware/authMiddleware");
var requireProfileComplete_1 = require("../middleware/requireProfileComplete");
var validate_1 = require("../middleware/validate");
var discovery_schema_1 = require("../schemas/discovery.schema");
var discoveryController_1 = require("../controllers/discoveryController");
var router = express_1.default.Router();
// Protected with Auth, 100% Profile Update Gate, and Query validation
router.get("/feed", authMiddleware_1.default, requireProfileComplete_1.requireProfileComplete, (0, validate_1.validateQuery)(discovery_schema_1.DiscoveryQuerySchema), discoveryController_1.getFeed);
exports.default = router;
