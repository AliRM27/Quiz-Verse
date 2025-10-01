import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  updateProgress,
} from "../controllers/profileController.js";
import { checkActiveSession } from "../middleware/isActive.js";

const router = express.Router();

router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.patch("/updateProgress", checkActiveSession, updateProgress);
router.delete("/", checkActiveSession, deleteProfile);

export default router;
