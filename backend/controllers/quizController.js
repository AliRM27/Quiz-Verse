import DailyQuiz from "../models/DailyQuiz.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import UserDailyQuiz from "../models/userDailyQuiz.js";
import { getTodayDateKey } from "../services/dateKey.js";

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select("-sections");
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quizzes" });
  }
};

export const getUnlockedQuizzes = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("unlockedQuizzes.quizId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.unlockedQuizzes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unlocked quizzes" });
  }
};

export const getQuizById = async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quiz" });
  }
};

export const getDailyQuiz = async (req, res) => {
  try {
    const userId = req.userId; // comes from your auth middleware
    const dateKey = getTodayDateKey();

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 1. Find today's DailyQuiz
    const dailyQuiz = await DailyQuiz.findOne({
      dateKey,
      isPublished: true,
    });

    if (!dailyQuiz) {
      return res.status(404).json({
        success: false,
        message: `No Daily Quiz defined for ${dateKey}`,
      });
    }

    // 2. Find user's progress for this daily quiz (if any)
    const userDaily = await UserDailyQuiz.findOne({
      userId: user._id,
      dailyQuizId: dailyQuiz._id,
    });

    // 3. Build "safe" questions (do NOT send correct answers/isCorrect flags)
    const safeQuestions = dailyQuiz.questions.map((q, index) => ({
      index, // client can use this to map answers back
      question: q.question, // { en, de, ru }
      type: q.type,
      range: q.range || null, // for numeric
      options: q.options.map((opt) => ({
        text: opt.text, // { en, de, ru }
        // we intentionally do NOT send isCorrect here
      })),
    }));

    // 4. Compute time until reset (optional but useful for UI)
    const now = new Date();
    const endsAt = dailyQuiz.endsAt;
    const resetsInMs = Math.max(0, endsAt - now);
    const resetsInSeconds = Math.floor(resetsInMs / 1000);

    // 5. Prepare user progress summary
    const userProgress = userDaily
      ? {
          completed: userDaily.completed,
          correctCount: userDaily.correctCount,
          totalQuestions: userDaily.totalQuestions,
          perfect: userDaily.perfect,
        }
      : null;

    // 6. Streak info (if you added these fields to User model)
    const streak = {
      current: user.dailyQuizStreak ?? 0,
      lastDateKey: user.lastDailyQuizDateKey ?? null,
      todayCompleted: userDaily?.completed ?? false,
    };

    return res.json({
      success: true,
      quiz: {
        id: dailyQuiz._id,
        dateKey: dailyQuiz.dateKey,
        title: dailyQuiz.title,
        description: dailyQuiz.description,
        startsAt: dailyQuiz.startsAt,
        endsAt: dailyQuiz.endsAt,
        resetsInSeconds,
        rewards: dailyQuiz.rewards, // { trophies, gems }
        maxAttemptsPerUser: dailyQuiz.maxAttemptsPerUser,
        questions: safeQuestions,
      },
      userProgress,
      streak,
    });
  } catch (err) {
    console.error("[getDailyQuiz] error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load Daily Quiz",
    });
  }
};

export const searchQuizzes = async (req, res) => {
  const { query } = req.query;

  let quizzes;

  try {
    if (!query) {
      quizzes = await Quiz.find().select("-sections").limit(10);
    } else {
      quizzes = await Quiz.find({
        $or: [{ title: { $regex: query, $options: "i" } }],
      })
        .select("-sections")
        .limit(20);
    }
    res.status(200).json(quizzes);
  } catch (error) {
    return res.status(500).json({ message: "Error searching quizzes" });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      logoFile,
      description,
      category,
      rewardsTotal,
      questionsTotal,
      company,
    } = req.body;

    if (!title || !logoFile || !category)
      return res.status(400).json({ error: "Missing required fields" });

    const newQuiz = new Quiz({
      title,
      logoFile,
      description,
      category,
      rewardsTotal,
      questionsTotal,
      company,
      sections: [],
    });

    await newQuiz.save();

    res
      .status(201)
      .json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    res.status(400).json({ message: "Error creating quiz", error });
  }
};

export const updateQuiz = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(updatedQuiz);
  } catch (error) {
    res.status(400).json({ message: "Error updating quiz", error });
  }
};

export const deleteQuiz = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(id);
    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting quiz", error });
  }
};
