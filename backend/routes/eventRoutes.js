import express from "express";
import {
  getDailyQuiz,
  submitDailyQuiz,
  getUserDailyQuizProgress,
} from "../controllers/quizController.js";

const router = express.Router();

router.get("/daily-quiz", getDailyQuiz);
router.post("/daily-quiz/submit", submitDailyQuiz);
router.get("/daily-quiz/userprogress", getUserDailyQuizProgress);

export default router;
