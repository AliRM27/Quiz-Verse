import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  updateProgress,
  getUserProgressData,
  getUserHistory,
  getUserProgressDetail,
  rewardShare,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", getProfile);
router.get("/me/progress", getUserProgressData);
router.get("/me/history", getUserHistory);
router.get("/me/progress/:quizId", getUserProgressDetail);
router.patch("/me", updateProfile);
router.post("/reward-share", rewardShare);
router.patch("/updateProgress", updateProgress);
router.delete("/", deleteProfile);

export default router;
