import User from "../models/User.js";
import Quiz from "../models/Quiz.js";
import ShopItem from "../models/ShopItem.js";

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

    // 2. Get Shop Items (Themes, Titles)
    const shopItems = await ShopItem.find({});

    const themes = shopItems.filter((i) => i.type === "theme");
    const titles = shopItems.filter((i) => i.type === "title");
    const avatars = shopItems.filter((i) => i.type === "avatar");

    res.json({
      themes,
      titles,
      avatars,
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

      // Enforce the new economy price: 1000 Trophies (Stars)
      // We override whatever is in the DB to match the client-side constant.
      const ENFORCED_PRICE = 1000;

      item = {
        id: quiz._id.toString(),
        price: {
          stars: ENFORCED_PRICE,
          gems: quiz.price?.gems || 100, // fallback gems price if needed
        },
        name: quiz.title,
      };
    } else {
      // For themes and titles, check ShopItem collection
      // We look up by 'id' field, not _id, because frontend sends 'blue', 'red' etc.
      // But wait, the seed script used 'id' as the string identifier (e.g. 'blue').
      // Let's use findOne with id.
      const shopItem = await ShopItem.findOne({ id: itemId, type });
      if (shopItem) {
        item = shopItem;
      }
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
    } else if (type === "avatar") {
      if (user.ownedAvatars.includes(item.value)) {
        return res.status(400).json({ message: "Avatar already owned" });
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
    } else if (type === "avatar") {
      user.ownedAvatars.push(item.value);
    }

    await user.save();

    res.json({
      success: true,
      message: `Bought ${item.name} for ${priceAmount} ${currency}`,
      newBalance: { gems: user.gems, stars: user.stars },
      inventory: {
        ownedThemes: user.ownedThemes,
        ownedTitles: user.ownedTitles,
        ownedAvatars: user.ownedAvatars,
        unlockedQuizzesStub: user.unlockedQuizzes.map((u) => u.quizId),
      },
    });
  } catch (error) {
    console.error("Error buying item:", error);
    res.status(500).json({ message: "Server error" });
  }
};
