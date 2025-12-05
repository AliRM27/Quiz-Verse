import User from "../models/User.js";
import Quiz from "../models/Quiz.js";
import mongoose from "mongoose";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select(
        "title googleId email name profileImage stars gems level role language theme activeSession lastActiveAt firstLogIn unlockedQuizzes completedQuizzes dailyQuizStreak lastDailyQuizDateKey"
      )
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = {
      ...user,
      unlockedQuizzesCount: user.unlockedQuizzes
        ? user.unlockedQuizzes.length
        : 0,
      completedQuizzesCount: user.completedQuizzes
        ? user.completedQuizzes.length
        : 0,
    };

    delete response.unlockedQuizzes;
    delete response.completedQuizzes;

    res.json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProgressData = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("progress unlockedQuizzes")
      .populate([
        {
          path: "progress.quizId",
          select: "title logoFile questionsTotal rewardsTotal company",
        },
        {
          path: "unlockedQuizzes.quizId",
          select: "title logoFile questionsTotal rewardsTotal company",
        },
      ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const summary = (user.progress || []).map((entry) => ({
      _id: entry._id,
      quizId: entry.quizId,
      questionsCompleted: entry.questionsCompleted,
      rewardsTotal: entry.rewardsTotal,
      completed: entry.completed,
      perfected: entry.perfected,
      sections: (entry.sections || []).map((section) => ({
        difficulty: section.difficulty,
        questions: section.questions,
        rewards: section.rewards,
      })),
    }));

    res.json({
      progress: summary,
      unlockedQuizzes: user.unlockedQuizzes || [],
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("lastPlayed completedQuizzes")
      .populate([
        {
          path: "lastPlayed.quizId",
          select: "title logoFile questionsTotal rewardsTotal company",
        },
        {
          path: "completedQuizzes.quizId",
          select: "title logoFile questionsTotal rewardsTotal company",
        },
      ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      lastPlayed: user.lastPlayed || [],
      completedQuizzes: user.completedQuizzes || [],
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProgressDetail = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!quizId) {
      return res.status(400).json({ message: "quizId is required" });
    }

    const user = await User.findById(req.userId)
      .select("progress")
      .select("sections");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const progressEntry = (user.progress || []).find(
      (entry) => entry.quizId._id.toString() === quizId
    );

    if (!progressEntry) {
      return res.status(404).json({ message: "Progress not found" });
    }

    res.json({ progress: progressEntry });
  } catch (error) {
    console.error("Error fetching progress detail:", error);
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

    if (!quizId) {
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
          {
            difficulty: "Easy",
            questions: 0,
            rewards: 0,
            answered: [],
            streaks: [],
            timeBonuses: [], // ✅ NEW
            timeRewards: 0,
            streaksRewards: 0,
          },
          {
            difficulty: "Medium",
            questions: 0,
            rewards: 0,
            answered: [],
            streaks: [],
            timeBonuses: [], // ✅ NEW
            timeRewards: 0,
            streaksRewards: 0,
          },
          {
            difficulty: "Hard",
            questions: 0,
            rewards: 0,
            answered: [],
            streaks: [],
            timeBonuses: [], // ✅ NEW
            timeRewards: 0,
            streaksRewards: 0,
          },
          {
            difficulty: "Extreme",
            questions: 0,
            rewards: 0,
            answered: [],
            streaks: [],
            timeBonuses: [], // ✅ NEW
            timeRewards: 0,
            streaksRewards: 0,
          },
        ],
      };

      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            progress: newProgress,
            unlockedQuizzes: { quizId: quizObjectId },
          },
        },
        { new: true }
      );
      return res.status(200).json({ message: "Progress entry ensured" });
    }

    if (!difficulty || !updates) {
      return res
        .status(400)
        .json({ message: "quizId, difficulty and updates are required" });
    }

    // Step 2: Update fields for the section
    const quiz = await Quiz.findById(quizId);
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
    if (updates.timeRewards !== undefined)
      section.timeRewards += updates.timeRewards;
    if (updates.streaksRewards !== undefined)
      section.streaksRewards += updates.streaksRewards;
    // Merge new correct answers without duplicates
    if (updates.answered && Array.isArray(updates.answered)) {
      updates.answered.forEach((index) => {
        if (!section.answered.includes(index)) {
          section.answered.push(index);
        }
      });
    }

    // Merge new streaks without duplicates
    if (updates.streaks && Array.isArray(updates.streaks)) {
      updates.streaks.forEach((streak) => {
        if (!section.streaks.includes(streak)) {
          section.streaks.push(streak);
        }
      });
    }

    if (updates.timeBonuses && Array.isArray(updates.timeBonuses)) {
      updates.timeBonuses.forEach((bonus) => {
        if (!section.timeBonuses.includes(bonus)) {
          section.timeBonuses.push(bonus);
        }
      });
    }

    // Step 3: Recalculate totals
    quizProgress.questionsCompleted = quizProgress.sections.reduce(
      (sum, s) => sum + (s.questions || 0),
      0
    );
    quizProgress.rewardsTotal = quizProgress.sections.reduce(
      (sum, s) => sum + (s.rewards || 0),
      0
    );

    if (quizProgress.questionsCompleted === quiz.questionsTotal) {
      quizProgress.completed = true;
    }
    if (
      quizProgress.rewardsTotal === quiz.rewardsTotal &&
      quizProgress.completed
    ) {
      quizProgress.perfected = true;
    }

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
