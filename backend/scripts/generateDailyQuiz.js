import mongoose from "mongoose";
import dotenv from "dotenv";
import OpenAI from "openai";
import DailyQuiz from "../models/DailyQuiz.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to get date key (YYYY-MM-DD) in UTC
function getDateKey(date) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildPrompt() {
  return `
Generate a daily gaming quiz with exactly 10 questions.

General Rules:
1. Theme: General Gaming (retro, modern, esports, studios, characters).
2. Difficulty mix:
   - 3 Easy
   - 4 Medium
   - 3 Hard
3. All questions must be factually correct.
4. Use a MIX of question types.
5. Output MUST be valid JSON only (no markdown, no comments).

Allowed question types (enum):
["Multiple Choice", "True/False", "Short Answer", "Numeric"]

Question Type Rules:

1) Multiple Choice
- Must include exactly 4 options
- Exactly ONE option must have "isCorrect": true

2) True/False
- Must include exactly 2 options:
  - "True"
  - "False"
- Exactly ONE must be correct

3) Short Answer
- MUST include an "options" array.
- The options array represents multiple valid textual variants of the same correct answer.
- ALL options must have "isCorrect": true.
- Each option must be semantically identical but phrased differently.
- Variations may include:
  - Articles (e.g. "Mario" vs "Super Mario")
  - Capitalization differences
  - Common aliases or full names
- No incorrect options are allowed for Short Answer questions.

4) Numeric
- Must include:
  - numericAnswer (number)
  - numericTolerance (number)
- May include an optional "range" object:
  {
    "min": number,
    "max": number,
    "step": number
  }
- No options array

Translations:
- All user-facing text MUST be provided in:
  - English (en)
  - German (de)
  - Russian (ru)

  ⚠️ Important:
- Every question must have an "options" array.
- Each option must include a "text" object with keys "en", "de", "ru".
- None of the "text" fields may be empty or missing.
- If a translation is difficult, copy the English text.
- Example:
{
  "text": {
    "en": "Mario",
    "de": "Mario",
    "ru": "Марио"
  },
  "isCorrect": true
}


JSON Schema (STRICT):

{
  "title": "Daily Gamer Challenge",
  "description": "Test your knowledge on a variety of gaming topics!",
  "questions": [
    {
      "type": "Multiple Choice | True/False | Short Answer | Numeric",
      "difficulty": "Easy | Medium | Hard",

      "question": {
        "en": "",
        "de": "",
        "ru": ""
      },

      // ONLY for Multiple Choice and True/False
      "options": [
        {
          "text": { "en": "", "de": "", "ru": "" },
          "isCorrect": false
        }
      ],

      // ONLY for Numeric
      "numericAnswer": 0,
      "numericTolerance": 0,
      "range": {
        "min": 0,
        "max": 0,
        "step": 1
      }
    }
  ]
}

Field Restrictions:
- Do NOT include unused fields.
- Do NOT include options for Numeric questions.
- Do NOT include numeric fields unless type is Numeric.
- Keep text concise and clear.

Return ONLY the JSON object.
`;
}

/* -------------------------------------------------------------------------- */
/*                          OpenAI Generation (Retry)                           */
/* -------------------------------------------------------------------------- */

async function generateQuizWithRetry(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI request (attempt ${attempt})...`);

      return await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2500,
        temperature: 0.7,
      });
    } catch (error) {
      console.error(`OpenAI error on attempt ${attempt}`);

      if (attempt === retries) {
        throw error;
      }

      // Exponential backoff: 2s, 4s, 6s
      await new Promise((res) => setTimeout(res, attempt * 2000));
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                            Validation Helpers                                */
/* -------------------------------------------------------------------------- */

function validateQuizData(data) {
  if (!data?.title || !data?.description) {
    throw new Error("Missing title or description");
  }

  if (!Array.isArray(data.questions) || data.questions.length !== 10) {
    throw new Error("Quiz must contain exactly 10 questions");
  }

  for (const q of data.questions) {
    // Common checks
    if (
      !q.type ||
      !q.difficulty ||
      !q.question?.en ||
      !q.question?.de ||
      !q.question?.ru
    ) {
      throw new Error("Missing common question fields");
    }

    switch (q.type) {
      /* ------------------------- Multiple Choice ------------------------- */
      case "Multiple Choice": {
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error("Multiple Choice must have exactly 4 options");
        }

        const correctCount = q.options.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          throw new Error(
            "Multiple Choice must have exactly one correct option"
          );
        }

        break;
      }

      /* --------------------------- True / False --------------------------- */
      case "True/False": {
        if (!Array.isArray(q.options) || q.options.length !== 2) {
          throw new Error("True/False must have exactly 2 options");
        }

        const correctCount = q.options.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          throw new Error("True/False must have exactly one correct option");
        }

        break;
      }

      /* --------------------------- Short Answer --------------------------- */
      case "Short Answer": {
        if (!Array.isArray(q.options) || q.options.length < 1) {
          throw new Error("Short Answer must have at least one option");
        }

        const allCorrect = q.options.every((o) => o.isCorrect === true);
        if (!allCorrect) {
          throw new Error("All Short Answer options must be correct");
        }

        break;
      }

      /* ----------------------------- Numeric ------------------------------ */
      case "Numeric": {
        if (typeof q.numericAnswer !== "number") {
          throw new Error("Numeric question must have numericAnswer");
        }

        if (typeof q.numericTolerance !== "number") {
          throw new Error("Numeric question must have numericTolerance");
        }

        if (q.range) {
          const { min, max, step } = q.range;
          if (
            typeof min !== "number" ||
            typeof max !== "number" ||
            typeof step !== "number"
          ) {
            throw new Error("Numeric range must include min, max, and step");
          }
        }

        break;
      }

      /* --------------------------- Unknown Type ---------------------------- */
      default:
        throw new Error(`Unknown question type: ${q.type}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                            Main Script Logic                                 */
/* -------------------------------------------------------------------------- */

async function generateDailyQuiz() {
  try {
    /* ----------------------------- MongoDB -------------------------------- */

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    /* ----------------------------- Target Date ----------------------------- */

    let targetDate = new Date();
    targetDate.setUTCDate(targetDate.getUTCDate() + 1); // Tomorrow (UTC)

    // Optional CLI override: node generateDailyQuiz.js 2026-01-05
    if (process.argv[2]) {
      const argDate = new Date(process.argv[2]);
      if (!isNaN(argDate.getTime())) {
        targetDate = argDate;
      }
    }

    const dateKey = getDateKey(targetDate);
    console.log(`📅 Generating Daily Quiz for ${dateKey}`);

    /* -------------------------- Check Existing ----------------------------- */

    const existing = await DailyQuiz.findOne({ dateKey });
    if (existing) {
      console.log("⚠️ Quiz already exists. Skipping generation.");
      return;
    }

    /* --------------------------- Generate Quiz ----------------------------- */

    const prompt = buildPrompt();
    const completion = await generateQuizWithRetry(prompt);

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Empty response from OpenAI");
    }

    const quizData = JSON.parse(rawContent);
    validateQuizData(quizData);

    console.log(`🧠 Generated ${quizData.questions.length} questions`);

    /* ----------------------------- Save Quiz ------------------------------- */

    const startsAt = new Date(targetDate);
    startsAt.setUTCHours(0, 0, 0, 0);

    const endsAt = new Date(targetDate);
    endsAt.setUTCHours(23, 59, 59, 999);

    const newQuiz = new DailyQuiz({
      dateKey,
      startsAt,
      endsAt,
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions,
      rewards: {
        trophies: 150,
        gems: 1,
      },
      isPublished: true,
    });

    await newQuiz.save();

    console.log(`🎉 Daily Quiz created successfully (ID: ${newQuiz._id})`);
  } catch (error) {
    console.error("❌ Error generating daily quiz:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

generateDailyQuiz();
