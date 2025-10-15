import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  profileImage: { type: String },
  stars: { type: Number, default: 0 }, // In-game currency
  level: { type: Number, default: 0 },
  unlockedQuizzes: [
    { quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" } },
  ],
  completedQuizzes: [
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      completedAt: { type: Date, default: Date.now },
    },
  ],
  lastPlayed: [
    { quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" } },
  ],
  progress: [
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      questionsCompleted: { type: Number, default: 0 }, // Optional aggregate
      rewardsTotal: { type: Number, default: 0 }, // Total trophies earned in all sections
      completed: { type: Boolean, default: false }, // Finished at least once
      perfected: { type: Boolean, default: false }, // Got all trophies
      sections: [
        {
          difficulty: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard", "Extreme"], // Updated
          },
          answered: { type: [Number], default: [] },
          questions: { type: Number, default: 0 }, // Questions attempted/completed
          rewards: { type: Number, default: 0 }, // Trophies earned
          streaks: { type: [Number], default: [] }, // Longest correct answer streaks
          timeBonuses: { type: [Number], default: [] }, // ✅ NEW - Time-based bonuses earned
        },
      ],
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  language: {
    type: String,
    required: true,
    default: "English",
  },
  activeSession: {
    type: String,
    default: null,
  },
  lastActiveAt: {
    type: Date,
    default: null,
  },
  firstLogIn: {
    type: Date,
    default: Date.now,
  },
  theme: {
    cardColor: {
      type: String,
      default: "green",
    },
  },
});

const User = mongoose.model("User", userSchema);
export default User;
