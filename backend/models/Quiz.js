import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  logoFile: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  rewardsTotal: {
    type: Number,
    required: true,
  },
  questionsTotal: {
    type: Number,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  price: {
    gems: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
  },
  tags: {
    type: [{ type: String, trim: true }],
    default: [],
  },
  sections: [
    {
      title: {
        type: String,
        trim: true,
      },
      difficulty: {
        type: String,
        required: true,
        enum: ["Easy", "Medium", "Hard", "Extreme"],
      },
      rewards: {
        type: Number,
        required: true,
      },
      questions: [
        {
          question: {
            en: { type: String, required: true, trim: true },
            de: { type: String, required: true, trim: true },
            ru: { type: String, required: true, trim: true },
            fr: { type: String, required: true, trim: true },
            es: { type: String, required: true, trim: true },
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
                fr: { type: String, required: true, trim: true },
                es: { type: String, required: true, trim: true },
              },
              isCorrect: { type: Boolean, default: false },
            },
          ],
          explanation: { type: String, trim: true },
        },
      ],
    },
  ],
});

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
