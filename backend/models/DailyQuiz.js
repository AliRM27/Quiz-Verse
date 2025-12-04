import mongoose from "mongoose";

const dailyQuizSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true, // one daily quiz per date
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      default: "Daily Quiz",
    },
    description: {
      type: String,
      default: "A mix of random gaming questions.",
    },

    // 👇 Embedded question snapshot
    questions: [
      {
        question: {
          en: { type: String, required: true, trim: true },
          de: { type: String, required: true, trim: true },
          ru: { type: String, required: true, trim: true },
        },
        type: {
          type: String,
          required: true,
          enum: ["Multiple Choice", "True/False", "Short Answer", "Numeric"],
        },
        numericAnswer: { type: Number }, // For Numeric type questions
        numericTolerance: { type: Number }, // Acceptable tolerance for Numeric answers
        range: {
          min: { type: Number },
          max: { type: Number },
          step: { type: Number },
        },
        options: [
          {
            text: {
              en: { type: String, required: true, trim: true },
              de: { type: String, required: true, trim: true },
              ru: { type: String, required: true, trim: true },
            },
            isCorrect: { type: Boolean, default: false },
          },
        ],
      },
    ],
    rewards: {
      trophies: {
        type: Number,
        default: 50,
      },
      gems: {
        type: Number,
        default: 10,
      },
    },
    maxAttemptsPerUser: {
      type: Number,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
dailyQuizSchema.index({ unique: true });

const DailyQuiz = mongoose.model("DailyQuiz", dailyQuizSchema);
export default DailyQuiz;
