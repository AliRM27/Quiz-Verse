import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  updateProgress,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.patch("/updateProgress", updateProgress);
router.delete("/", deleteProfile);

export default router;
