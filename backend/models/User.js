import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  profileImage: { type: String },
  stars: { type: Number, default: 0 }, // In-game currency
  unlockedQuizzes: [
    { quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" } },
  ],
  completedQuizzes: [
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      completedAt: { type: Date, default: Date.now },
    },
  ],
  lastPlayed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
  },
  progress: [
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      questionsTotal: { type: Number, default: 0 }, // Optional aggregate
      rewardsTotal: { type: Number, default: 0 }, // Total trophies earned in all sections
      sections: [
        {
          difficulty: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard", "Extreme"], // Updated
          },
          questions: { type: Number, default: 0 }, // Questions attempted/completed
          rewards: { type: Number, default: 0 }, // Trophies earned
          maxRewards: { type: Number }, // Max possible trophies
          completed: { type: Boolean, default: false }, // Finished at least once
          perfected: { type: Boolean, default: false }, // Got all trophies
        },
      ],
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);
export default User;
