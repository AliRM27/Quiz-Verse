import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import ShopItem from "./models/ShopItem.js";

dotenv.config();

const SHOP_ITEMS = [
  // Themes
  {
    id: "blue",
    name: "Ocean Blue",
    type: "theme",
    price: { gems: 50, stars: 500 },
    description: "A calming deep sea blue theme.",
    value: "blue",
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
  // Titles
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
  // Avatars
  {
    id: "avatar_cyberpunk",
    name: "Cyber Punk",
    type: "avatar",
    price: { gems: 100, stars: 1000 },
    value: "/assets/avatars/avatar_cyberpunk.png",
  },
  {
    id: "avatar_viking",
    name: "Viking Warrior",
    type: "avatar",
    price: { gems: 100, stars: 1000 },
    value: "/assets/avatars/avatar_viking.png",
  },
  {
    id: "avatar_cat",
    name: "Cool Cat",
    type: "avatar",
    price: { gems: 150, stars: 1500 },
    value: "/assets/avatars/avatar_cat.png",
  },
  {
    id: "avatar_space",
    name: "Space Explorer",
    type: "avatar",
    price: { gems: 150, stars: 1500 },
    value: "/assets/avatars/avatar_space.png",
  },
  {
    id: "avatar_wizard",
    name: "Mystic Wizard",
    type: "avatar",
    price: { gems: 200, stars: 2000 },
    value: "/assets/avatars/avatar_wizard.png",
  },
];

const seedShop = async () => {
  try {
    await connectDB();

    console.log("Clearing existing shop items...");
    await ShopItem.deleteMany({});

    console.log("Seeding new shop items...");
    await ShopItem.insertMany(SHOP_ITEMS);

    console.log("Shop items seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding shop items:", error);
    process.exit(1);
  }
};

seedShop();
