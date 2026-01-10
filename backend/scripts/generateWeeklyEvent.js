import mongoose from "mongoose";
import dotenv from "dotenv";
import OpenAI from "openai";
import { WeeklyEvent } from "../models/WeeklyEvent.js";

dotenv.config();

// Helper: Get Week Key
function getWeekKey(date) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// Helper: Get Start/End Dates for a Week Key
function getDatesFromWeekKey(weekString) {
  const [yearStr, weekStr] = weekString.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const startsAt = new Date(simple);
  startsAt.setUTCHours(0, 0, 0, 0);
  const endsAt = new Date(simple);
  endsAt.setUTCDate(endsAt.getUTCDate() + 6);
  endsAt.setUTCHours(23, 59, 59, 999);
  return { startsAt, endsAt };
}

// Build AI Prompt
function buildWeeklyPrompt(theme) {
  return `
    Generate a Weekly Event content pack for the theme: "${theme}".
    Output must be a single JSON object with:

    1. theme: {name, description, primaryColor}
    2. emojiPuzzles: 5 puzzles {promptEmoji, correctAnswer, options: ["String", "String", "String", "String"]}
    3. quotes: 5 quotes {quote: {en,de,ru}, correctAnswer, options: ["String", "String", "String", "String"]}
    4. vote: {question, options: [{id,label}]}
    5. questions: 35 questions {
      question: {en, de, ru}, 
      type: "Multiple Choice", 
      options: [{ text: {en: "String", de: "String", ru: "String"}, isCorrect: boolean }], 
      difficulty: "easy"|"medium"|"hard"
    }
    
    IMPORTANT: 
    - For 'questions' (Item 5), 'options' MUST be Objects with {text, isCorrect}.
    - For 'emojiPuzzles' (Item 2) and 'quotes' (Item 3), 'options' MUST be simple Strings.
    - Questions MUST be unique.
    - Distribution: 10 Easy, 15 Medium, 10 Hard.
  `;
}

// Main
async function generateWeeklyEvent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const themeName = process.argv[2] || "Gaming Classics";
    const weekKey = getWeekKey(new Date()); // e.g., "2026-W02"
    const { startsAt, endsAt } = getDatesFromWeekKey(weekKey);

    console.log(`📅 Generating Weekly Event for ${weekKey} (${themeName})`);

    // Check if exists
    const existing = await WeeklyEvent.findOne({ weekKey });
    if (existing) {
      console.log(`⚠️ Event for ${weekKey} already exists. Skipping.`);
      process.exit(0);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildWeeklyPrompt(themeName);

    console.log("🧠 Requesting content from OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a creative game master." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(completion.choices[0].message.content);
    console.log("✨ Content received. Validating structure...");

    // Validation
    if (!content.questions || !Array.isArray(content.questions)) {
      throw new Error("Missing 'questions' array in generated content.");
    }
    content.questions.forEach((q, i) => {
      if (!q.options || !Array.isArray(q.options)) {
        throw new Error(`Question ${i} missing options array.`);
      }
      // Check if options are strings (BAD) vs objects (GOOD)
      const isStringOption = typeof q.options[0] === "string";
      if (isStringOption) {
        throw new Error(
          `Question ${i} has STRING options. Expected Objects with {text, isCorrect}. Prompt ignored by LLM.`
        );
      }
      // Check fields
      q.options.forEach((opt, oIdx) => {
        if (!opt.text || (!opt.text.en && !opt.text.English)) {
          throw new Error(
            `Question ${i} Option ${oIdx} missing 'text' object.`
          );
        }
      });
    });

    // Validate Emoji Puzzles (Must be strings)
    if (content.emojiPuzzles) {
      content.emojiPuzzles.forEach((p, i) => {
        if (p.options && Array.isArray(p.options)) {
          if (typeof p.options[0] !== "string") {
            throw new Error(
              `Emoji Puzzle ${i} has OBJECT options. Expected simple Strings. Prompt ignored by LLM.`
            );
          }
        }
      });
    }

    // Validate Quotes (Must be strings)
    if (content.quotes) {
      content.quotes.forEach((q, i) => {
        if (q.options && Array.isArray(q.options)) {
          if (typeof q.options[0] !== "string") {
            throw new Error(
              `Quote ${i} has OBJECT options. Expected simple Strings. Prompt ignored by LLM.`
            );
          }
        }
      });
    }

    console.log("✅ Structure validated. Building Event nodes...");

    console.log("✅ Structure validated. Building Event nodes...");

    // Partition questions by difficulty
    const easyQs = content.questions.filter((q) => q.difficulty === "easy");
    const mediumQs = content.questions.filter((q) => q.difficulty === "medium");
    const hardQs = content.questions.filter((q) => q.difficulty === "hard");

    // Nodes with direct questions
    const nodes = [
      {
        index: 0,
        type: "mini_quiz",
        title: "Warm-Up",
        description: "Start easy.",
        config: {
          // Take first 5 Easy
          questions: easyQs.slice(0, 5),
        },
        completionReward: { trophies: 20, gems: 0 },
      },
      {
        index: 1,
        type: "time_challenge",
        title: "Speed Run",
        description: "Go fast!",
        config: {
          // Take next 5 Easy (or mix with Medium if needed)
          // Let's use easyQs 5-10
          questions:
            easyQs.slice(5, 10).length >= 5
              ? easyQs.slice(5, 10)
              : [
                  ...easyQs.slice(5),
                  ...mediumQs.slice(0, 5 - (easyQs.length - 5)),
                ],
        },
        completionReward: { trophies: 25, gems: 0 },
      },
      {
        index: 2,
        type: "survival",
        title: "Survival",
        description: "Don't die.",
        config: {
          // Take 5 Medium (skipping any used by Speed Run if overlap, but we planned 10 easy so speed run should take easy)
          // If speed run took easy, we take medium 0-5
          questions: mediumQs.slice(0, 5),
        },
        completionReward: { trophies: 30, gems: 1 },
      },
      {
        index: 3,
        type: "mixed_gauntlet",
        title: "The Gauntlet",
        description: "Things are heating up.",
        config: {
          questions: mediumQs.slice(5, 10),
        },
        completionReward: { trophies: 40, gems: 1 },
      },
      {
        index: 4,
        type: "emoji_puzzle",
        title: "Emoji Decode",
        description: "Guess the game.",
        config: { emojiPuzzles: content.emojiPuzzles },
        completionReward: { trophies: 40, gems: 1 },
      },
      {
        index: 5,
        type: "quote_guess",
        title: "Who Said It?",
        description: "Famous lines.",
        config: { quotes: content.quotes },
        completionReward: { trophies: 40, gems: 1 },
      },
      {
        index: 6,
        type: "mini_quiz",
        title: "Hard Mode",
        description: "Serious challenge.",
        config: {
          questions: hardQs.slice(0, 5),
        },
        completionReward: { trophies: 50, gems: 1 },
      },
      {
        index: 7,
        type: "time_challenge",
        title: "Rush Hour",
        description: "Keep the pace!",
        config: {
          questions: mediumQs.slice(10, 15),
          modeConfig: { timeLimitSeconds: 60 },
        },
        completionReward: { trophies: 55, gems: 2 },
      },
      {
        index: 8,
        type: "vote",
        title: "Community Vote",
        description: "Your voice matters.",
        config: {
          vote: {
            question: content.vote.question,
            options: content.vote.options,
            multiSelect: false,
          },
        },
        completionReward: { trophies: 10, gems: 0 },
      },
      {
        index: 9,
        type: "time_challenge",
        title: "Final Boss",
        description: "The ultimate test.",
        config: {
          questions: hardQs.slice(5, 10),
          modeConfig: { timeLimitSeconds: 90 },
        },
        completionReward: { trophies: 100, gems: 3 },
      },
    ];

    const event = await WeeklyEvent.create({
      weekKey,
      title: content.theme.name,
      description: content.theme.description || "Weekly Challenge",
      startsAt,
      endsAt,
      isActive: true,
      nodes,
      theme: {
        name: content.theme.name,
        primaryColor: content.theme.primaryColor,
        bannerImageUrl: "",
      },
      fullCompletionReward: { trophies: 300, gems: 3 },
    });

    console.log(`🎉 Weekly Event Created: ${event._id} (Week: ${weekKey})`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

generateWeeklyEvent();
