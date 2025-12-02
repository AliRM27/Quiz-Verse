import express from "express";
import { getDailyQuiz } from "../controllers/quizController.js";

const router = express.Router();

router.get("/daily-quiz", getDailyQuiz);

export default router;
