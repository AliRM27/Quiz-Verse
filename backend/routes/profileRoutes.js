import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  updateProgress,
  getUserProgressData,
  getUserHistory,
  getUserProgressDetail,
} from "../controllers/profileController.js";
import { checkActiveSession } from "../middleware/isActive.js";

const router = express.Router();

router.get("/me", getProfile);
router.get("/me/progress", getUserProgressData);
router.get("/me/history", getUserHistory);
router.get("/me/progress/:quizId", getUserProgressDetail);
router.patch("/me", updateProfile);
router.patch("/updateProgress", checkActiveSession, updateProgress);
router.delete("/", checkActiveSession, deleteProfile);

export default router;
