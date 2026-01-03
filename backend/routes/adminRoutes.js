import express from "express";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import {
  getAllUsers,
  toPromoteUserToAdmin,
} from "../controllers/adminController.js";
import {
  getDailyQuizzes,
  getDailyQuizById,
  createDailyQuiz,
  updateDailyQuiz,
  deleteDailyQuiz,
  getWeeklyEvents,
  getWeeklyEventById,
  createWeeklyEvent,
  updateWeeklyEvent,
  deleteWeeklyEvent,
} from "../controllers/adminEventsController.js";

const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.json({ message: "Admin Dashboard" });
});

// User Management
router.get("/users", getAllUsers);
router.post("/users/promote", toPromoteUserToAdmin);

// Standard Quiz Management
router.post("/quizzes/create", createQuiz);
router.put("/quizzes/update/:id", updateQuiz);
router.delete("/quizzes/delete/:id", deleteQuiz);

// Daily Quiz Management
router.get("/daily-quizzes", getDailyQuizzes);
router.get("/daily-quizzes/:id", getDailyQuizById);
router.post("/daily-quizzes", createDailyQuiz);
router.put("/daily-quizzes/:id", updateDailyQuiz);
router.delete("/daily-quizzes/:id", deleteDailyQuiz);

// Weekly Event Management
router.get("/weekly-events", getWeeklyEvents);
router.get("/weekly-events/:id", getWeeklyEventById);
router.post("/weekly-events", createWeeklyEvent);
router.put("/weekly-events/:id", updateWeeklyEvent);
router.delete("/weekly-events/:id", deleteWeeklyEvent);

export default router;
