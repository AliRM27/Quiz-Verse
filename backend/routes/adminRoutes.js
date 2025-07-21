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

const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.json({ message: "Admin Dashboard" });
});

router.get("/users", getAllUsers);
router.post("/users/promote", toPromoteUserToAdmin);
router.post("/quizzes/create", createQuiz);
router.put("/quizzes/update/:id", updateQuiz);
router.delete("quizzes/delete/:id", deleteQuiz);

export default router;
