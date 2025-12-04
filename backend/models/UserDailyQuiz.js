import mongoose from "mongoose";

const userDailyQuizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dailyQuizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyQuiz",
      required: true,
    },
    dateKey: {
      type: String,
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    perfect: {
      type: Boolean,
      default: false,
    },

    totalRewards: {
      type: Number,
      default: 0,
    },

    rewardsGiven: {
      type: Boolean,
      default: false, // so you can't claim twice
    },

    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// One doc per user per daily quiz
userDailyQuizSchema.index({ userId: 1, dailyQuizId: 1 }, { unique: true });

const UserDailyQuiz = mongoose.model("UserDailyQuiz", userDailyQuizSchema);
export default UserDailyQuiz;
