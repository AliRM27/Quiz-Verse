import mongoose from "mongoose";
import dotenv from "dotenv";
import OpenAI from "openai";
import Quiz from "../models/Quiz.js";
import Category from "../models/Category.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* -------------------------------------------------------------------------- */
/*                            Configuration                                   */
/* -------------------------------------------------------------------------- */

const LANGUAGES = ["en", "de", "ru", "fr", "es"];
const SECTIONS_CONFIG = [
  { title: "Easy", difficulty: "Easy", questionsCount: 20, reward: 350 },
  { title: "Medium", difficulty: "Medium", questionsCount: 15, reward: 375 },
  { title: "Hard", difficulty: "Hard", questionsCount: 10, reward: 400 },
  { title: "Extreme", difficulty: "Extreme", questionsCount: 5, reward: 475 },
];

/* -------------------------------------------------------------------------- */
/*                             Prompt Builders                                */
/* -------------------------------------------------------------------------- */

// 1. Initial Prompt: Title, Descriptions, Tags
function buildMetadataPrompt(gameName) {
  return `
Create the metadata for a gaming quiz about: "${gameName}".
Output strict JSON only.

Schema:
{
  "title": "String (Exact Match of '${gameName}')",
  "description": "String (English)",
  "company": "Developer Name",
  "tags": ["Tag1", "Tag2", "Tag3"], // 3-5 tags
  "isPremium": false,
  "rewardsTotal": 1600,
  "description": "",
}
`;
}

// 2. Section Prompt: Questions for a specific difficulty
function buildSectionPrompt(gameName, section) {
  return `
Generate questions for a quiz about "${gameName}".
Section: "${section.title}"
Difficulty: "${section.difficulty}"
Quantity: ${section.questionsCount} questions.

Strict JSON Output Only.

Requirements:
1. **Languages**: user-facing text must include keys: ${LANGUAGES.join(", ")}.
2. **Question Types**: Mix of "Multiple Choice", "True/False", "Short Answer", "Numeric".
3. **Accuracy**: Must be factually correct.
4. **Question answers**: The correct answer shouldnt be always the first option. Randomize the options.
5. **True/False balance rule**:
- Exactly 50% of True/False questions MUST have "True" as correct.
- Exactly 50% MUST have "False" as correct.
- False statements must be believable but clearly incorrect.
- Do NOT mark all statements as True.

Schema:
{
  "questions": [
    {
      "type": "Multiple Choice", // Enum: Multiple Choice, True/False, Short Answer, Numeric
      "question": { "en": "...", "de": "...", "ru": "...", "fr": "...", "es": "..." },
      
      // FOR Multiple Choice (4 opts) & True/False (2 opts)
      "options": [
        { "text": { "en": "...", "de": "...", "ru": "...", "fr": "...", "es": "..." }, "isCorrect": true },
        { "text": { ... }, "isCorrect": false }
      ],

      // FOR Short Answer (1 correct, multiple variants)
      // "options": [ { "text": { ... }, "isCorrect": true } ], 

      // FOR Numeric MUST HAVE
      // "numericAnswer": 123,
      // "numericTolerance": 5,
      // "range": { "min": 0, "max": 200, "step": 1 },
    }
  ]
}
`;
}

/* -------------------------------------------------------------------------- */
/*                            OpenAI Interaction                              */
/* -------------------------------------------------------------------------- */

async function callOpenAI(prompt, model = "gpt-4.1-mini") {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");
    return JSON.parse(content);
  } catch (err) {
    console.error("OpenAI Call Failed:", err);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                            Helper Functions                                */
/* -------------------------------------------------------------------------- */

function normalizeQuestions(questions) {
  return questions.map((q) => {
    if (q.type === "Multiple Choice" && q.options && Array.isArray(q.options)) {
      // Shuffle options using Fisher-Yates algorithm
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }
    }
    return q;
  });
}

/* -------------------------------------------------------------------------- */
/*                               Main Logic                                   */
/* -------------------------------------------------------------------------- */

async function main() {
  const gameName = process.argv.slice(2).join(" ");
  if (!gameName) {
    console.error('❌ Usage: node scripts/generateQuiz.js "Game Name"');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // 1. Get/Create Category
    let category = await Category.findOne({ name: "Games" });
    if (!category) category = await Category.create({ name: "Games" });

    // 2. Generate Metadata
    console.log(`📝 Generating Metadata for "${gameName}"...`);
    const metaData = await callOpenAI(buildMetadataPrompt(gameName));
    console.log(`   -> Title: ${metaData.title}`);

    // 3. Generate Sections Loop
    const sections = [];
    for (const config of SECTIONS_CONFIG) {
      console.log(
        `🧠 Generating Section: ${config.title} (${config.questionsCount} questions)...`
      );

      let attempts = 0;
      let sectionQuestions = [];

      while (attempts < 3) {
        try {
          const result = await callOpenAI(buildSectionPrompt(gameName, config));
          if (result.questions && Array.isArray(result.questions)) {
            sectionQuestions = result.questions;
            if (sectionQuestions.length >= config.questionsCount) {
              // Trim if AI generated too many allowed, though usually it respects count
              sectionQuestions = sectionQuestions.slice(
                0,
                config.questionsCount
              );
              break;
            }
          }
        } catch (e) {
          console.warn(`   ⚠️ Attempt ${attempts + 1} failed. Retrying...`);
        }
        attempts++;
      }

      if (sectionQuestions.length === 0) {
        throw new Error(
          `Failed to generate questions for section ${config.title}`
        );
      }

      sections.push({
        title: config.title,
        difficulty: config.difficulty,
        rewards: config.reward,
        questions: normalizeQuestions(sectionQuestions),
      });
      console.log(`   ✅ Validated ${sectionQuestions.length} questions.`);
    }

    // 4. Construct Final Quiz
    const totalQuestions = sections.reduce(
      (sum, sec) => sum + sec.questions.length,
      0
    );

    const newQuiz = new Quiz({
      title: metaData.title,
      logoFile: "controller_icon.png",
      description: metaData.description,
      company: metaData.company || "Unknown",
      category: category._id,
      rewardsTotal: 1600,
      questionsTotal: totalQuestions,
      isPremium: metaData.isPremium || false,
      price: { gems: 0, stars: 0 },
      tags: metaData.tags || [],
      sections: sections,
    });

    await newQuiz.save();
    console.log(`🎉 Quiz Saved! ID: ${newQuiz._id}`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   Total Rewards: ${1600}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Error:", error);
    process.exit(1);
  }
}

main();
