import express from "express";
import {
  getAllQuizzes,
  getQuizById,
  getUnlockedQuizzes,
  searchQuizzes,
} from "../controllers/quizController.js";

const router = express.Router();

router.get("/search", searchQuizzes);
router.get("/", getAllQuizzes);
router.get("/unlocked/:userId", getUnlockedQuizzes);
router.get("/:id", getQuizById);

export default router;
