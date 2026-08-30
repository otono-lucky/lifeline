"use strict";
// routes/userRoutes.ts
// User routes
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var userController_1 = require("../controllers/userController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var requireRole_1 = require("../middleware/requireRole");
var uploadMiddleware_1 = require("../middleware/uploadMiddleware");
var validate_1 = require("../middleware/validate");
var user_schema_1 = require("../schemas/user.schema");
var router = express_1.default.Router();
router.use(authMiddleware_1.default);
// SuperAdmin & ChurchAdmin & Counselor list users
router.get("/", (0, requireRole_1.default)(["SuperAdmin", "ChurchAdmin", "Counselor"]), userController_1.list);
// User Profile
router.get("/:id", userController_1.getOne);
router.put("/:id", (0, validate_1.validateBody)(user_schema_1.UpdateUserProfileSchema), userController_1.update);
router.post("/:id/photos", uploadMiddleware_1.uploadSingle, userController_1.uploadPhoto);
router.patch("/:id/status", (0, requireRole_1.default)(["SuperAdmin"]), (0, validate_1.validateBody)(user_schema_1.UpdateAccountStatusSchema), userController_1.updateStatus);
// Social handles (LinkedIn, Instagram, Facebook)
router.get("/:id/socials", userController_1.listSocials);
router.post("/:id/socials", (0, validate_1.validateBody)(user_schema_1.AddSocialMediaHandleSchema), userController_1.addSocial);
router.delete("/:id/socials/:socialId", userController_1.removeSocial);
exports.default = router;
