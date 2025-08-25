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
router.get("/:id", getQuizById);
router.get("/unlocked/:userId", getUnlockedQuizzes);

export default router;
