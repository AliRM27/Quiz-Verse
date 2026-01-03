// scripts/generateDefaultWeeklyEvent.ts
import mongoose from "mongoose";
import { WeeklyEvent } from "../models/WeeklyEvent.js";
import Quiz from "../models/Quiz.js";
import dotenv from "dotenv";

dotenv.config();

async function generateDefaultWeeklyEvent() {
  // 1. Connect to Mongo
  await mongoose.connect(process.env.MONGO_URI as string);

  // 2. Define week basics
  const weekKey = "2026-W01";
  const startsAt = new Date("2026-01-03T00:00:00.000Z");
  const endsAt = new Date("2026-01-09T23:59:59.999Z");

  // 3. Check if event already exists
  const existing = await WeeklyEvent.findOne({ weekKey });
  if (existing) {
    console.log(`WeeklyEvent ${weekKey} already exists. Aborting.`);
    await mongoose.disconnect();
    return;
  }

  // IDs provided by user
  const quizzes = await Quiz.find({}).limit(5);
  const quizIds = quizzes.map((quiz) => quiz._id.toString());

  // 5. Build nodes (10 nodes as requested)
  const nodes = [
    {
      index: 0,
      type: "mini_quiz",
      title: "Warm-Up Quiz",
      description: "A short mixed quiz to get started.",
      config: {
        quizConfig: {
          quizIds,
          allowedDifficulties: ["easy", "normal"],
          totalQuestions: 6,
          randomOrder: true,
        },
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 20, gems: 0 },
    },
    {
      index: 1,
      type: "time_challenge",
      title: "60s Time Challenge",
      description: "Answer as many as you can before time runs out!",
      config: {
        quizConfig: {
          quizIds,
          allowedDifficulties: ["easy", "normal"],
          totalQuestions: 6,
          randomOrder: true,
        },
        modeConfig: {
          timeLimitSeconds: 60,
        },
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 25, gems: 1 },
    },
    {
      index: 2,
      type: "true_false_sprint",
      title: "True or False Sprint",
      description: "Quick True/False speed round.",
      config: {
        quizConfig: {
          quizIds,
          allowedDifficulties: ["easy", "normal"],
          totalQuestions: 6,
          randomOrder: true,
        },
        modeConfig: {
          perQuestionTimeLimitSeconds: 5,
          maxQuestions: 10,
        },
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 25, gems: 1 },
    },
    {
      index: 3,
      type: "survival",
      title: "Survival Mode",
      description: "You only have 3 hearts. How far can you go?",
      config: {
        quizConfig: {
          quizIds,
          allowedDifficulties: ["easy", "normal"],
          totalQuestions: 6,
          randomOrder: true,
        },
        modeConfig: {
          lives: 3,
          maxQuestions: 15,
        },
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 30, gems: 2 },
    },
    {
      index: 4,
      type: "emoji_puzzle",
      title: "Emoji Puzzle",
      description: "Guess the game from the emojis.",
      config: {
        quizConfig: {
          quizIds: [],
          allowedDifficulties: [],
          randomOrder: true,
        },
        emojiPuzzles: [
          {
            promptEmoji: "🐴🤠🌵",
            correctAnswer: "Red Dead Redemption 2",
            options: [
              "Red Dead Redemption 2",
              "GTA V",
              "The Last of Us",
              "Cyberpunk 2077",
            ],
          },
          {
            promptEmoji: "🧟‍♂️🎮👧",
            correctAnswer: "The Last of Us",
            options: [
              "The Last of Us",
              "Resident Evil 2",
              "Days Gone",
              "Dying Light",
            ],
          },
          {
            promptEmoji: "🐲⚔️🌌",
            correctAnswer: "Elden Ring",
            options: ["Elden Ring", "Skyrim", "Dark Souls 3", "Bloodborne"],
          },
        ],
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 30, gems: 2 },
    },
    {
      index: 5,
      type: "quote_guess",
      title: "Guess the Game",
      description: "Which game is this quote from?",
      config: {
        quizConfig: {
          quizIds: [],
          allowedDifficulties: [],
          randomOrder: true,
        },
        quotes: [
          {
            quote: {
              en: "When you’re lost in the darkness, look for the light.",
              de: "Wenn du dich in der Dunkelheit verlierst, suche nach dem Licht.",
              ru: "Когда ты потерялся во тьме, ищи свет.",
            },
            correctAnswer: "The Last of Us",
            options: [
              "The Last of Us",
              "Uncharted 4",
              "Resident Evil 4",
              "God of War",
            ],
          },
          {
            quote: {
              en: "We can’t change what’s done. We can only move on.",
              de: "Wir können nicht ändern, was geschehen ist. Wir können nur weitermachen.",
              ru: "Мы не можем изменить то, что уже сделано. Мы можем только двигаться дальше.",
            },
            correctAnswer: "Red Dead Redemption 2",
            options: [
              "Red Dead Redemption 2",
              "GTA V",
              "The Witcher 3",
              "Ghost of Tsushima",
            ],
          },
        ],
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 30, gems: 2 },
    },
    {
      index: 6,
      type: "mini_quiz",
      title: "Hard Mode Quiz",
      description: "A short quiz with tougher questions.",
      config: {
        quizConfig: {
          quizIds,
          allowedDifficulties: ["hard", "extreme"],
          totalQuestions: 6,
          randomOrder: true,
        },
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 35, gems: 2 },
    },
    {
      index: 7,
      type: "mixed_gauntlet",
      title: "Mixed Gauntlet",
      description: "10 questions from different games. Can you handle it?",
      config: {
        quizConfig: {
          quizIds,
          allowedDifficulties: ["easy", "normal", "hard"],
          totalQuestions: 10,
          randomOrder: true,
        },
        modeConfig: {
          maxQuestions: 10,
        },
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 40, gems: 3 },
    },
    {
      index: 8,
      type: "vote",
      title: "Vote: Game of the Week",
      description: "Pick your favorite from this selection.",
      config: {
        quizConfig: {
          quizIds: [],
          allowedDifficulties: [],
          randomOrder: true,
        },
        vote: {
          question: "Which game would you replay right now?",
          options: [
            { id: "rdr2", label: "Red Dead Redemption 2" },
            { id: "tlou", label: "The Last of Us" },
            { id: "gta5", label: "GTA V" },
            { id: "witcher3", label: "The Witcher 3" },
          ],
          multiSelect: false,
        },
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 15, gems: 1 },
    },
    {
      index: 9,
      type: "time_challenge",
      title: "Final Rush",
      description: "Hard questions, short time. Finish strong!",
      config: {
        quizConfig: {
          quizIds,
          allowedDifficulties: ["hard", "extreme"],
          totalQuestions: 6,
          randomOrder: true,
        },
        modeConfig: {
          timeLimitSeconds: 45,
        },
      },
      unlockReward: { trophies: 10, gems: 0 },
      completionReward: { trophies: 50, gems: 5 },
    },
  ];

  // 6. Create the WeeklyEvent in DB
  const event = await WeeklyEvent.create({
    weekKey,
    title: "Weekly Event",
    description: "Mixed gaming challenges for the week.",
    startsAt,
    endsAt,
    isActive: true,
    nodes,
    fullCompletionReward: {
      trophies: 150,
      gems: 10,
    },
    theme: {
      name: "Default Week",
      primaryColor: "#8b5cf6",
      bannerImageUrl: "",
    },
  });

  console.log("Created WeeklyEvent:", event._id.toString());
  await mongoose.disconnect();
}

generateDefaultWeeklyEvent().catch((err) => {
  console.error(err);
  process.exit(1);
});
