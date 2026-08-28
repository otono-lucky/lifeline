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

const router = express.Router();

router.use(authMiddleware);

// SuperAdmin & ChurchAdmin & Counselor list users
router.get("/", requireRole(["SuperAdmin", "ChurchAdmin", "Counselor"]), list);

// User Profile
router.get("/:id", getOne);
router.put("/:id", update);
router.post("/:id/photos", uploadSingle, uploadPhoto);
router.patch("/:id/status", requireRole(["SuperAdmin"]), updateStatus);

// Social handles (LinkedIn, Instagram, Facebook)
router.get("/:id/socials", listSocials);
router.post("/:id/socials", addSocial);
router.delete("/:id/socials/:socialId", removeSocial);

export default router;
