// routes/userRoutes.ts
// User routes

import express from "express";
import {
  list,
  getOne,
  update,
  uploadPhoto,
  updateStatus,
  listSocials,
  addSocial,
  removeSocial,
} from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";
import requireRole from "../middleware/requireRole";
import { uploadSingle } from "../middleware/uploadMiddleware";
import { validateBody } from "../middleware/validate";
import {
  UpdateUserProfileSchema,
  AddSocialMediaHandleSchema,
  UpdateAccountStatusSchema,
} from "../schemas/user.schema";

const router = express.Router();

router.use(authMiddleware);

// SuperAdmin & ChurchAdmin & Counselor list users
router.get("/", requireRole(["SuperAdmin", "ChurchAdmin", "Counselor"]), list);

// User Profile
router.get("/:id", getOne);
router.put("/:id", validateBody(UpdateUserProfileSchema), update);
router.post("/:id/photos", uploadSingle, uploadPhoto);
router.patch("/:id/status", requireRole(["SuperAdmin"]), validateBody(UpdateAccountStatusSchema), updateStatus);

// Social handles (LinkedIn, Instagram, Facebook)
router.get("/:id/socials", listSocials);
router.post("/:id/socials", validateBody(AddSocialMediaHandleSchema), addSocial);
router.delete("/:id/socials/:socialId", removeSocial);

export default router;
