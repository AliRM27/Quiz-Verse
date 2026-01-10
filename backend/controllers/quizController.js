import UserDailyQuiz from "../models/UserDailyQuiz.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import DailyQuiz from "../models/DailyQuiz.js";
import { getTodayDateKey, getYesterdayDateKey } from "../services/dateKey.js";

function normalizeText(str = "") {
  return String(str).trim().toLowerCase();
}

export const submitDailyQuiz = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers are required.",
      });
    }

    const dateKey = getTodayDateKey();
    const yesterdayKey = getYesterdayDateKey();

    // 1. Find today's quiz
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

    // 2. Check if user already completed today (one rewarded attempt per day)
    let userDaily = await UserDailyQuiz.findOne({
      userId: user._id,
      dailyQuizId: dailyQuiz._id,
    });

    if (userDaily?.completed) {
      return res.status(400).json({
        success: false,
        message: "Daily Quiz already completed.",
      });
    }

    const questions = dailyQuiz.questions;
    let correctCount = 0;

    // This will be sent back so you can show which ones were wrong
    const detailedResults = [];

    // 3. For each question, compare user answer with correct one
    questions.forEach((q, index) => {
      const answerPayload = answers.find((a) => a.index === index);

      // default result: unanswered/incorrect
      let isCorrect = false;
      const result = {
        index,
        type: q.type,
        isCorrect: false,
        userAnswer: null,
        correctAnswer: null,
      };

      if (!answerPayload) {
        // user skipped this question
        // still push default result
        detailedResults.push(result);
        return;
      }

      if (q.type === "Multiple Choice" || q.type === "True/False") {
        const selectedIndex = answerPayload.selectedOptionIndex;

        const correctOptionIndex = q.options.findIndex((opt) => opt.isCorrect);

        isCorrect =
          typeof selectedIndex === "number" &&
          correctOptionIndex === selectedIndex;

        result.userAnswer = {
          selectedAnswer: selectedIndex,
        };

        result.correctAnswer = {
          correctOptionIndex,
        };
      } else if (q.type === "Short Answer") {
        const userText = normalizeText(answerPayload.textAnswer);

        const correctOption = q.options.find((opt) => opt.isCorrect);
        const correctTextEn = correctOption?.text?.en || "";
        // You can adapt this to check different languages if needed
        const correctTextNormalized = normalizeText(correctTextEn);

        isCorrect = userText.length > 0 && userText === correctTextNormalized;

        result.userAnswer = {
          textAnswer: answerPayload.textAnswer || "",
        };

        result.correctAnswer = {
          correctTextEn,
        };
      } else if (q.type === "Numeric") {
        const userValue = Number(answerPayload.numericAnswer);
        const target = q.numericAnswer;
        const tolerance = q.numericTolerance ?? 0;

        if (!Number.isNaN(userValue) && typeof target === "number") {
          isCorrect = Math.abs(userValue - target) <= tolerance;
        }

        result.userAnswer = {
          numericAnswer: userValue,
        };

        result.correctAnswer = {
          numericAnswer: target,
          tolerance,
        };
      }

      if (isCorrect) {
        correctCount++;
      }

      result.isCorrect = isCorrect;
      detailedResults.push(result);
    });

    const totalQuestions = questions.length;
    const perfect = correctCount === totalQuestions;

    // 4. Create or update UserDailyQuiz
    if (!userDaily) {
      userDaily = await UserDailyQuiz.create({
        userId: user._id,
        dailyQuizId: dailyQuiz._id,
        dateKey,
        completed: true,
        correctCount,
        totalQuestions,
        perfect,
        rewardsGiven: false,
        completedAt: new Date(),
      });
    } else {
      userDaily.completed = true;
      userDaily.correctCount = correctCount;
      userDaily.totalQuestions = totalQuestions;
      userDaily.perfect = perfect;
      userDaily.completedAt = new Date();
      await userDaily.save();
    }

    // 5. Give rewards + update streak (only once)
    const { trophies: maxTrophies, gems: maxGems } = dailyQuiz.rewards;

    let trophiesToGive = 0;
    let gemsToGive = 0;

    if (totalQuestions > 0) {
      const ratio = correctCount / totalQuestions;

      trophiesToGive = Math.round(maxTrophies * ratio);
      if (ratio >= 0.6) {
        gemsToGive = 1;
      }

      if (perfect) {
        gemsToGive = maxGems; // maxGems = 2
      }
    }

    if (!userDaily.rewardsGiven) {
      user.stars = (user.stars || 0) + trophiesToGive;
      user.gems = (user.gems || 0) + gemsToGive;

      if (user.lastDailyQuizDateKey === dateKey) {
        // already counted today → do nothing
      } else if (user.lastDailyQuizDateKey === yesterdayKey) {
        user.dailyQuizStreak = (user.dailyQuizStreak || 0) + 1;
      } else {
        user.dailyQuizStreak = 1;
      }

      user.lastDailyQuizDateKey = dateKey;
      userDaily.rewardsGiven = true;
      userDaily.totalRewards = trophiesToGive;

      await Promise.all([user.save(), userDaily.save()]);
    }

    return res.json({
      success: true,
      message: "Daily Quiz submitted.",
      correctCount,
      totalQuestions,
      perfect,
      rewards: {
        trophies: trophiesToGive,
        gems: gemsToGive,
      },
      streak: user.dailyQuizStreak,
      results: detailedResults,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit Daily Quiz",
    });
  }
};

export const getUserDailyQuizProgress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const dateKey = getTodayDateKey();

    // 1. Find today's quiz
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

    // 2. Check if user already completed today (one rewarded attempt per day)
    let userDailyProgress = await UserDailyQuiz.findOne({
      userId: user._id,
      dailyQuizId: dailyQuiz._id,
    });

    if (!dailyQuiz) {
      return res.status(404).json({
        success: false,
        message: `No Daily Quiz defined for ${dateKey}`,
      });
    }

    if (!userDailyProgress)
      userDailyProgress = await UserDailyQuiz.create({
        userId: user._id,
        dailyQuizId: dailyQuiz._id,
        completed: false,
        dateKey,
        completedAt: new Date(),
      });

    await userDailyProgress.save();

    return res.json({ userDailyProgress });
  } catch (err) {
    console.log(err);
  }
};

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
      return res.json({
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
        $or: [
          { title: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
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
