import { Schema, model, Types } from "mongoose";

/**
 * Simple reward structure used for:
 * - per-node unlock reward
 * - per-node completion reward
 * - full event completion reward
 */
const RewardSchema = new Schema(
  {
    trophies: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * Emoji puzzle item – used in emoji_puzzle nodes.
 * Keep it simple for now (no localization).
 */
const EmojiPuzzleItemSchema = new Schema(
  {
    promptEmoji: { type: String, required: true }, // e.g. "🐴🤠🌵"
    correctAnswer: { type: String, required: true }, // e.g. "Red Dead Redemption 2"
    options: [{ type: String }], // optional multiple-choice answers
  },
  { _id: false }
);

/**
 * Quote guess item – used in quote_guess nodes.
 */
const QuoteGuessItemSchema = new Schema(
  {
    quote: {
      en: { type: String, required: true },
      de: { type: String, required: true },
      ru: { type: String, required: true },
    }, // localized quote text
    correctAnswer: { type: String, required: true }, // e.g. "The Last of Us"
    options: [{ type: String }], // optional MC answers
  },
  { _id: false }
);

/**
 * Vote / opinion poll – used in vote nodes.
 */
const VoteOptionSchema = new Schema(
  {
    id: { type: String, required: true }, // stable option id
    label: { type: String, required: true }, // text shown to user
  },
  { _id: false }
);

const VoteConfigSchema = new Schema(
  {
    question: { type: String, required: true },
    options: { type: [VoteOptionSchema], required: true },
    multiSelect: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Node config:
 * - For quiz-based modes: quizConfig + modeConfig
 * - For emoji / quote / vote: the specific arrays/objects
 */
const WeeklyEventNodeConfigSchema = new Schema(
  {
    // Quiz-based modes (mini_quiz, time_challenge, true_false_sprint,
    // survival, mixed_gauntlet)
    quizConfig: {
      quizIds: [{ type: Types.ObjectId, ref: "Quiz" }], // source quizzes
      allowedDifficulties: [
        {
          type: String,
          enum: ["easy", "normal", "hard", "extreme"],
        },
      ],
      totalQuestions: { type: Number }, // how many questions to use
      randomOrder: { type: Boolean, default: true },
    },

    // Mode-specific options shared by several modes
    modeConfig: {
      // time_challenge: global time limit (seconds)
      timeLimitSeconds: { type: Number },

      // true_false_sprint: per-question timer
      perQuestionTimeLimitSeconds: { type: Number },

      // survival: how many lives/hearts
      lives: { type: Number },

      // mixed_gauntlet or caps in other modes
      maxQuestions: { type: Number },
    },

    // Emoji puzzles (emoji_puzzle)
    emojiPuzzles: { type: [EmojiPuzzleItemSchema], default: undefined },

    // Quotes (quote_guess)
    quotes: { type: [QuoteGuessItemSchema], default: undefined },

    // Vote / poll (vote)
    vote: { type: VoteConfigSchema, default: undefined },
  },
  { _id: false }
);

/**
 * Weekly event node:
 * a single step in the event path.
 */
const WeeklyEventNodeSchema = new Schema(
  {
    index: { type: Number, required: true }, // 0-based order in the path

    type: {
      type: String,
      enum: [
        "mini_quiz",
        "time_challenge",
        "true_false_sprint",
        "survival",
        "mixed_gauntlet",
        "emoji_puzzle",
        "quote_guess",
        "vote",
      ],
      required: true,
    },

    title: { type: String, required: true }, // e.g. "Speed Round"
    description: { type: String, default: "" }, // short description

    config: { type: WeeklyEventNodeConfigSchema, default: {} },

    // Rewards for this node
    completionReward: {
      type: RewardSchema,
      default: () => ({ trophies: 20, gems: 0 }),
    },
  },
  { _id: false }
);

/**
 * WeeklyEvent:
 * One document per week (e.g. "2025-W50").
 */
const WeeklyEventSchema = new Schema(
  {
    // e.g. "2025-W50" or any unique string per week
    weekKey: { type: String, required: true, unique: true },

    title: { type: String, default: "Weekly Event" },
    description: { type: String, default: "" },

    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },

    isActive: { type: Boolean, default: true },

    // The ordered list of nodes for this week
    nodes: {
      type: [WeeklyEventNodeSchema],
      validate: [
        (arr) => arr.length > 0,
        "WeeklyEvent must have at least one node",
      ],
    },

    // Reward when the user completes ALL nodes
    fullCompletionReward: {
      type: RewardSchema,
      default: () => ({ trophies: 100, gems: 10 }),
    },

    // Optional visual theme for the week (can use later)
    theme: {
      name: { type: String, default: "" }, // e.g. "Horror Week"
      primaryColor: { type: String, default: "" }, // hex color
      bannerImageUrl: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

export const WeeklyEvent = model("WeeklyEvent", WeeklyEventSchema);
