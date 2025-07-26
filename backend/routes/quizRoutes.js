import express from "express";
import {
  getAllQuizzes,
  getQuizById,
  getUnlockedQuizzes,
} from "../controllers/quizController.js";

const router = express.Router();

router.get("/", getAllQuizzes);
router.get("/:id", getQuizById);
router.get("/unlocked/:userId", getUnlockedQuizzes);

export default router;
