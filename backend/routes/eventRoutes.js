import express from "express";
import {
  getDailyQuiz,
  submitDailyQuiz,
  getUserDailyQuizProgress,
} from "../controllers/quizController.js";
import {
  getCurrentWeeklyEvent,
  completeWeeklyEvent,
  getWeeklyNodeQuestions,
  submitWeeklyVote,
} from "../controllers/eventsController.js";

const router = express.Router();

router.get("/daily-quiz", getDailyQuiz);
router.post("/daily-quiz/submit", submitDailyQuiz);
router.get("/daily-quiz/userprogress", getUserDailyQuizProgress);
router.get("/weekly/current", getCurrentWeeklyEvent);
router.post("/weekly/node/:index/complete", completeWeeklyEvent);
router.get("/weekly/node/:index/questions", getWeeklyNodeQuestions);
router.post("/weekly/node/:index/vote", submitWeeklyVote);

export default router;
