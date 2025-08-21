import User from "../models/User.js";
import mongoose from "mongoose";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "unlockedQuizzes.quizId completedQuizzes.quizId lastPlayed.quizId progress.quizId"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const { quizId, difficulty, updates } = req.body;

    if (!quizId || !difficulty || !updates) {
      return res
        .status(400)
        .json({ message: "quizId, difficulty and updates are required" });
    }

    const quizObjectId = new mongoose.Types.ObjectId(quizId);

    // Step 1: Ensure progress entry exists
    let user = await User.findOne({
      _id: userId,
      "progress.quizId": quizObjectId,
    });

    if (!user) {
      const newProgress = {
        quizId: quizObjectId,
        questionsCompleted: 0,
        rewardsTotal: 0,
        completed: false,
        perfected: false,
        sections: [
          { difficulty: "Easy", questions: 0, rewards: 0, answered: [] },
          { difficulty: "Medium", questions: 0, rewards: 0, answered: [] },
          { difficulty: "Hard", questions: 0, rewards: 0, answered: [] },
          { difficulty: "Extreme", questions: 0, rewards: 0, answered: [] },
        ],
      };

      await User.findByIdAndUpdate(
        userId,
        { $push: { progress: newProgress } },
        { new: true }
      );
    }

    // Step 2: Update fields for the section
    user = await User.findById(userId);
    const quizProgress = user.progress.find(
      (p) => p.quizId.toString() === quizObjectId.toString()
    );
    const section = quizProgress.sections.find(
      (s) => s.difficulty === difficulty
    );

    if (!section) return res.status(404).json({ message: "Section not found" });

    // Increment questions and rewards
    if (updates.questions !== undefined) section.questions += updates.questions;
    if (updates.rewards !== undefined) section.rewards += updates.rewards;

    // Merge new correct answers without duplicates
    if (updates.answered && Array.isArray(updates.answered)) {
      updates.answered.forEach((index) => {
        if (!section.answered.includes(index)) {
          section.answered.push(index);
        }
      });
    }

    // Update completed/perfected if provided
    if (updates.completed !== undefined)
      quizProgress.completed = updates.completed;
    if (updates.perfected !== undefined)
      quizProgress.perfected = updates.perfected;

    // Step 3: Recalculate totals
    quizProgress.questionsCompleted = quizProgress.sections.reduce(
      (sum, s) => sum + (s.questions || 0),
      0
    );
    quizProgress.rewardsTotal = quizProgress.sections.reduce(
      (sum, s) => sum + (s.rewards || 0),
      0
    );

    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
