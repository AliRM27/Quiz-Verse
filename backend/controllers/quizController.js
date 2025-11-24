import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

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
