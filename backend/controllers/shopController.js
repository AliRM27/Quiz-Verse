import User from "../models/User.js";
import Quiz from "../models/Quiz.js";

// Hardcoded shop items for themes and titles
//Ideally these would be in a DB collection, but for MVP hardcoding is fine.
const SHOP_ITEMS = {
  themes: [
    {
      id: "blue",
      name: "Ocean Blue",
      type: "theme",
      price: { gems: 50, stars: 500 },
      description: "A calming deep sea blue theme.",
      value: "blue", // The actual value stored in user.theme.cardColor (or handled by frontend mapping)
    },
    {
      id: "red",
      name: "Fire Red",
      type: "theme",
      price: { gems: 50, stars: 500 },
      description: "A passionate fiery red theme.",
      value: "red",
    },
    {
      id: "purple",
      name: "Royal Purple",
      type: "theme",
      price: { gems: 100, stars: 1000 },
      description: "A luxurious purple theme.",
      value: "purple",
    },
    {
      id: "gold",
      name: "Midas Gold",
      type: "theme",
      price: { gems: 200, stars: 2000 },
      description: "The ultimate status symbol.",
      value: "gold",
    },
  ],
  titles: [
    {
      id: "wizard",
      name: "Quiz Wizard",
      type: "title",
      price: { gems: 30, stars: 300 },
      value: "Quiz Wizard",
    },
    {
      id: "collector",
      name: "Gem Collector",
      type: "title",
      price: { gems: 60, stars: 600 },
      value: "Gem Collector",
    },
    {
      id: "master",
      name: "Trivia Master",
      type: "title",
      price: { gems: 100, stars: 1000 },
      value: "Trivia Master",
    },
  ],
};

export const getShopItems = async (req, res) => {
  try {
    // 1. Get Premium Quizzes
    const premiumQuizzes = await Quiz.find({ isPremium: true }).select(
      "title description logoFile price"
    );

    // Format quizzes to match shop item structure
    const quizzes = premiumQuizzes.map((q) => ({
      id: q._id.toString(),
      name: q.title,
      type: "quiz",
      price: q.price || { gems: 0, stars: 0 }, // fallback
      description: q.description,
      image: q.logoFile,
    }));

    res.json({
      themes: SHOP_ITEMS.themes,
      titles: SHOP_ITEMS.titles,
      quizzes: quizzes,
    });
  } catch (error) {
    console.error("Error fetching shop items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const buyItem = async (req, res) => {
  try {
    const { itemId, type, currency } = req.body; // currency: "gems" | "stars"
    const userId = req.userId;

    if (!itemId || !type || !currency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (currency !== "gems" && currency !== "stars") {
      return res.status(400).json({ message: "Invalid currency" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let item;
    let priceAmount = 0;

    // 1. Find the item and its price
    if (type === "quiz") {
      const quiz = await Quiz.findById(itemId);
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });
      item = {
        id: quiz._id.toString(),
        price: quiz.price,
        name: quiz.title,
      };
    } else if (type === "theme") {
      item = SHOP_ITEMS.themes.find((t) => t.id === itemId);
    } else if (type === "title") {
      item = SHOP_ITEMS.titles.find((t) => t.id === itemId);
    }

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 2. Check Price
    priceAmount = item.price[currency];
    if (priceAmount === undefined || priceAmount === null) {
      return res
        .status(400)
        .json({ message: `Item cannot be bought with ${currency}` });
    }

    // 3. User Balance Check
    const userBalance = currency === "gems" ? user.gems : user.stars;
    if (userBalance < priceAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // 4. Check if already owned
    if (type === "quiz") {
      const alreadyUnlocked = user.unlockedQuizzes.some(
        (uq) => uq.quizId.toString() === itemId
      );
      if (alreadyUnlocked) {
        return res.status(400).json({ message: "Quiz already unlocked" });
      }
    } else if (type === "theme") {
      if (user.ownedThemes.includes(item.value)) {
        return res.status(400).json({ message: "Theme already owned" });
      }
    } else if (type === "title") {
      if (user.ownedTitles.includes(item.value)) {
        return res.status(400).json({ message: "Title already owned" });
      }
    }

    // 5. Execute Transaction
    if (currency === "gems") {
      user.gems -= priceAmount;
    } else {
      user.stars -= priceAmount;
    }

    // 6. Grant Item
    if (type === "quiz") {
      user.unlockedQuizzes.push({ quizId: itemId });
    } else if (type === "theme") {
      user.ownedThemes.push(item.value);
    } else if (type === "title") {
      user.ownedTitles.push(item.value);
    }

    await user.save();

    res.json({
      success: true,
      message: `Bought ${item.name} for ${priceAmount} ${currency}`,
      newBalance: { gems: user.gems, stars: user.stars },
      inventory: {
        ownedThemes: user.ownedThemes,
        ownedTitles: user.ownedTitles,
        unlockedQuizzesStub: user.unlockedQuizzes.map((u) => u.quizId),
      },
    });
  } catch (error) {
    console.error("Error buying item:", error);
    res.status(500).json({ message: "Server error" });
  }
};
