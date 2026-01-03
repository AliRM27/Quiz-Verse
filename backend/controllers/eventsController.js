import User from "../models/User.js";
import Quiz from "../models/Quiz.js";
import {
  getActiveWeeklyEvent,
  getOrCreateUserEventProgress,
} from "../services/helpers.js";
import { grantReward } from "../services/helpers.js";
import { WeeklyEventVote } from "../models/WeeklyEventVote.js";

export const getCurrentWeeklyEvent = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const event = await getActiveWeeklyEvent();
    if (!event) {
      return res.status(404).json({ message: "No active weekly event" });
    }

    const progress = await getOrCreateUserEventProgress(user, event);

    // Build node statuses
    const nodesWithStatus = event.nodes.map((node) => {
      const nodeProg = progress.nodeProgress.find(
        (np) => np.index === node.index
      );

      let status = "locked";
      if (nodeProg?.completedAt) status = "completed";
      else if (nodeProg?.unlockedAt) status = "unlocked";

      return {
        index: node.index,
        type: node.type,
        title: node.title,
        description: node.description,
        iconKey: node.iconKey,
        status,
        completionReward: node.completionReward,
        config: node.config,
        questionsCorrect: nodeProg?.questionsCorrect || 0,
        trophiesCollected: nodeProg?.trophiesCollected || 0,
      };
    });

    return res.json({
      event: {
        id: event._id,
        weekKey: event.weekKey,
        title: event.title,
        description: event.description,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        theme: event.theme,
      },
      progress: {
        currentNodeIndex: progress.currentNodeIndex,
        fullCompletionRewardClaimed: progress.fullCompletionRewardClaimed,
      },
      nodes: nodesWithStatus,
    });
  } catch (err) {
    console.error("Error in GET /events/weekly/current", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const completeWeeklyEvent = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const nodeIndex = parseInt(req.params.index, 10);
    const { score, questionsCorrect } = req.body; // optional, from client

    const event = await getActiveWeeklyEvent();
    if (!event) {
      return res.status(404).json({ message: "No active weekly event" });
    }

    if (
      Number.isNaN(nodeIndex) ||
      nodeIndex < 0 ||
      nodeIndex >= event.nodes.length
    ) {
      return res.status(400).json({ message: "Invalid node index" });
    }

    const node = event.nodes[nodeIndex];

    let progress = await getOrCreateUserEventProgress(user, event);

    // Check if user is allowed to complete this node
    if (nodeIndex > progress.currentNodeIndex) {
      return res.status(400).json({
        message: "This node is not unlocked yet",
      });
    }

    // Find or create nodeProgress entry
    let nodeProg = progress.nodeProgress.find((np) => np.index === nodeIndex);

    const now = new Date();

    if (!nodeProg) {
      // Node was never unlocked? You can decide what to do.
      // For simplicity: unlock it now
      nodeProg = {
        index: nodeIndex,
        unlockedAt: now,
        completedAt: undefined,
        attempts: 0,
        bestScore: 0,
      };
      progress.nodeProgress.push(nodeProg);
      // Optional: grant unlock reward here if you want.
      await grantReward(user, node.unlockReward);
    }

    nodeProg.attempts += 1;

    if (typeof questionsCorrect === "number") {
      nodeProg.questionsCorrect = Math.max(
        nodeProg.questionsCorrect || 0,
        questionsCorrect
      );
    } else if (typeof score === "number") {
      // Fallback or deprecated usage
      nodeProg.bestScore = Math.max(nodeProg.bestScore || 0, score);
    }

    let rewardsGranted = [];

    // First-time completion?
    if (!nodeProg.completedAt) {
      nodeProg.completedAt = now;

      // Grant completion reward
      if (node.completionReward) {
        await grantReward(user, node.completionReward);
        rewardsGranted.push({
          type: "node_completion",
          nodeIndex,
          reward: node.completionReward,
        });
        // Update trophiesCollected
        nodeProg.trophiesCollected =
          (nodeProg.trophiesCollected || 0) +
          (node.completionReward.trophies || 0);
      }
    }

    // If this was the currentNodeIndex, unlock next node
    if (nodeIndex === progress.currentNodeIndex) {
      const nextIndex = progress.currentNodeIndex + 1;

      if (nextIndex < event.nodes.length) {
        progress.currentNodeIndex = nextIndex;

        // create progress entry for next node if not exists
        let nextNodeProg = progress.nodeProgress.find(
          (np) => np.index === nextIndex
        );
        if (!nextNodeProg) {
          nextNodeProg = {
            index: nextIndex,
            unlockedAt: now,
            completedAt: undefined,
            attempts: 0,
            bestScore: 0,
          };
          progress.nodeProgress.push(nextNodeProg);
        } else if (!nextNodeProg.unlockedAt) {
          nextNodeProg.unlockedAt = now;
        }

        /* 
           Removed unlockReward logic.
           Previously checked nextNode.unlockReward and granted it.
        */
        // const nextNode = event.nodes[nextIndex];
        // if (nextNode && nextNode.unlockReward) { ... }
      }
    }
    // Check full completion
    const allCompleted = event.nodes.every((n) =>
      progress.nodeProgress.some((np) => np.index === n.index && np.completedAt)
    );

    if (allCompleted && !progress.fullCompletionRewardClaimed) {
      progress.fullCompletionRewardClaimed = true;
      if (event.fullCompletionReward) {
        await grantReward(user, event.fullCompletionReward);
        rewardsGranted.push({
          type: "event_completion",
          reward: event.fullCompletionReward,
        });
      }
    }

    await user.save();
    await progress.save();

    return res.json({
      message: "Node completed",
      currentNodeIndex: progress.currentNodeIndex,
      rewardsGranted,
      fullCompletionRewardClaimed: progress.fullCompletionRewardClaimed,
    });
  } catch (err) {
    console.error("Error in POST /events/weekly/node/:index/complete", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWeeklyNodeQuestions = async (req, res) => {
  try {
    const nodeIndex = parseInt(req.params.index, 10);
    const event = await getActiveWeeklyEvent();

    if (!event) {
      return res.status(404).json({ message: "No active weekly event" });
    }

    if (
      Number.isNaN(nodeIndex) ||
      nodeIndex < 0 ||
      nodeIndex >= event.nodes.length
    ) {
      return res.status(400).json({ message: "Invalid node index" });
    }

    const node = event.nodes[nodeIndex];

    // --- NEW: Handle Special Node Types ---

    // 1. Vote Node
    if (node.type === "vote") {
      if (!node.config || !node.config.vote) {
        return res.status(400).json({ message: "Vote configuration missing" });
      }

      // Check if user voted
      const userVote = await WeeklyEventVote.findOne({
        userId: req.userId,
        eventId: event._id,
        nodeIndex: nodeIndex,
      });

      // Get vote stats
      const votes = await WeeklyEventVote.aggregate([
        { $match: { eventId: event._id, nodeIndex: nodeIndex } },
        { $group: { _id: "$optionId", count: { $sum: 1 } } },
      ]);

      const totalVotes = votes.reduce((acc, v) => acc + v.count, 0);
      const stats = {};
      votes.forEach((v) => {
        stats[v._id] = {
          count: v.count,
          percentage:
            totalVotes > 0 ? Math.round((v.count / totalVotes) * 100) : 0,
        };
      });

      return res.json({
        type: "vote",
        question: node.config.vote.question,
        options: node.config.vote.options,
        multiSelect: node.config.vote.multiSelect,
        userVote: userVote ? userVote.optionId : null,
        stats: stats,
        totalVotes,
      });
    }

    // 2. Quote Guess Node
    if (node.type === "quote_guess") {
      if (!node.config || !node.config.quotes) {
        return res.json({ questions: [], timeLimit: 60 });
      }

      // Map to a structure similar to questions so frontend can reuse or adapt easily
      // We will map strictly to a "question-like" object
      let quotes = node.config.quotes.map((q, i) => ({
        _id: `quote_${i}`,
        type: "Multiple Choice", // Using MC logic on frontend
        question: q.quote, // Quote is now localized object
        options: (q.options || []).map((opt) => ({
          text: { en: opt },
          isCorrect: opt === q.correctAnswer,
        })),
        // Add the correct answer as an option if not present or just ensure it's there
        // For now, assuming options include the correct answer or we need to generate/mix them?
        // The schema has 'options' and 'correctAnswer'. We should probably ensure correctAnswer is in options.
        // Let's assume the admin entered options including the correct one.
      }));

      // Shuffle quotes if needed
      // Deterministic Shuffle (reusing logic below or simplifying)
      const seedString = `${event.weekKey}-${nodeIndex}`;
      let seed = 0;
      for (let i = 0; i < seedString.length; i++) {
        seed = (seed << 5) - seed + seedString.charCodeAt(i);
        seed |= 0;
      }
      const seededRandom = () => {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };

      for (let i = quotes.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [quotes[i], quotes[j]] = [quotes[j], quotes[i]];
      }

      // Limit items?
      // const max = node.config.modeConfig?.maxQuestions || 10;
      // quotes = quotes.slice(0, max);

      return res.json({
        questions: quotes,
        timeLimit: node.config.modeConfig?.timeLimitSeconds || 60,
        type: "quote_guess",
      });
    }

    // 3. Emoji Puzzle Node
    if (node.type === "emoji_puzzle") {
      if (!node.config || !node.config.emojiPuzzles) {
        return res.json({ questions: [], timeLimit: 60 });
      }

      // Map to question structure
      let puzzles = node.config.emojiPuzzles.map((p, i) => ({
        _id: `emoji_${i}`,
        type:
          p.options && p.options.length > 0
            ? "Multiple Choice"
            : "Short Answer",
        question: { en: p.promptEmoji },
        options:
          p.options && p.options.length > 0
            ? p.options.map((opt) => ({
                text: { en: opt },
                isCorrect: opt === p.correctAnswer,
              }))
            : [],
        // logic for SA
        // We might need to handle SA validation on frontend using string match
        // For SA, we can pass the correct answer text in a hidden field or similar?
        // Or frontend verifies vs backend? Currently frontend verifies.
        // Let's attach correct answer to the first 'true' option if it's SA or just a special field.
        // Existing frontend uses 'options' for SA validation too (finding the one with isCorrect).
        // So for SA:
        tempCorrectAnswer: p.correctAnswer,
      }));

      // For SA, we need to construct the 'options' array expected by frontend validation logic
      puzzles = puzzles.map((p) => {
        if (p.type === "Short Answer") {
          p.options = [{ text: { en: p.tempCorrectAnswer }, isCorrect: true }];
        }
        delete p.tempCorrectAnswer;
        return p;
      });

      // Shuffle...
      const seedString = `${event.weekKey}-${nodeIndex}-emoji`;
      let seed = 0;
      for (let i = 0; i < seedString.length; i++) {
        seed = (seed << 5) - seed + seedString.charCodeAt(i);
        seed |= 0;
      }
      const seededRandom = () => {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      for (let i = puzzles.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [puzzles[i], puzzles[j]] = [puzzles[j], puzzles[i]];
      }

      return res.json({
        questions: puzzles,
        timeLimit: node.config.modeConfig?.timeLimitSeconds || 60,
        type: "emoji_puzzle",
      });
    }

    // --- End Special Types ---

    // Existing logic for Quiz-based nodes
    if (!node.config || !node.config.quizConfig) {
      return res.status(400).json({ message: "Node configuration missing" });
    }

    const { quizIds, totalQuestions, allowedDifficulties } =
      node.config.quizConfig;

    // Dynamically import Quiz model to avoid circular dependency issues if any,
    // or just consistency. Assuming 'Quiz' is not imported at top.
    // Checking imports: User is imported. Quiz is NOT imported.

    // Note: Adjust path if Quiz.js export default or named. Usually default in this project.
    // Checking previous files... user didn't show Quiz model file but `import User from "../models/User.js"` suggests default export.

    // Safety check if QuizIds provided
    if (!quizIds || quizIds.length === 0) {
      return res.json({ questions: [], timeLimit: 60 });
    }

    const quizzes = await Quiz.find({ _id: { $in: quizIds } });

    // Aggregate questions
    let allQuestions = [];
    quizzes.forEach((quiz) => {
      quiz.sections.forEach((section) => {
        if (
          !allowedDifficulties ||
          allowedDifficulties.length === 0 ||
          allowedDifficulties.includes(section.difficulty.toLowerCase())
        ) {
          // Attach source quiz title to each question
          const questionsWithTitle = section.questions.map((q) => {
            const qObj = q.toObject ? q.toObject() : { ...q };
            qObj.sourceQuizTitle = quiz.title;
            return qObj;
          });
          allQuestions = allQuestions.concat(questionsWithTitle);
        }
      });
    });

    // Filter by Node Type Logic
    if (node.type === "true_false_sprint") {
      allQuestions = allQuestions.filter((q) => q.type === "True/False");
    }
    // Future: Add other type filters here (e.g. quote_guess) if they map to specific question types

    // Deterministic Shuffle
    // Create a seed string based on event and node
    const seedString = `${event.weekKey}-${nodeIndex}`;

    // Simple hash function to get a numeric seed
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed << 5) - seed + seedString.charCodeAt(i);
      seed |= 0; // Convert to 32bit integer
    }

    // Mulberry32 seeded RNG
    const seededRandom = () => {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const shouldShuffle = node.config.quizConfig?.randomOrder !== false;

    if (shouldShuffle) {
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }
    }

    // Slice
    const selectedQuestions = allQuestions.slice(0, totalQuestions || 10);

    return res.json({
      questions: selectedQuestions,
      timeLimit: node.config.modeConfig?.timeLimitSeconds || 60,
    });
  } catch (err) {
    console.error("Error in GET /events/weekly/node/:index/questions", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const submitWeeklyVote = async (req, res) => {
  try {
    const nodeIndex = parseInt(req.params.index, 10);
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({ message: "Option ID required" });
    }

    const event = await getActiveWeeklyEvent();
    if (!event) {
      return res.status(404).json({ message: "No active weekly event" });
    }

    const node = event.nodes[nodeIndex];
    if (!node || node.type !== "vote") {
      return res.status(400).json({ message: "Invalid node for voting" });
    }

    // Validate Option ID
    const isValidOption = node.config.vote.options.some(
      (o) => o.id === optionId
    );
    if (!isValidOption) {
      return res.status(400).json({ message: "Invalid option" });
    }

    // Upsert Vote
    await WeeklyEventVote.findOneAndUpdate(
      {
        userId: req.userId,
        eventId: event._id,
        nodeIndex: nodeIndex,
      },
      {
        optionId: optionId,
      },
      { upsert: true, new: true }
    );

    // Return updated stats
    const votes = await WeeklyEventVote.aggregate([
      { $match: { eventId: event._id, nodeIndex: nodeIndex } },
      { $group: { _id: "$optionId", count: { $sum: 1 } } },
    ]);

    const totalVotes = votes.reduce((acc, v) => acc + v.count, 0);
    const stats = {};
    votes.forEach((v) => {
      stats[v._id] = {
        count: v.count,
        percentage:
          totalVotes > 0 ? Math.round((v.count / totalVotes) * 100) : 0,
      };
    });

    return res.json({
      message: "Vote submitted",
      stats,
      totalVotes,
      userVote: optionId,
    });
  } catch (err) {
    console.error("Error in POST /events/weekly/node/:index/vote", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
