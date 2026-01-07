import express from "express";
import { getShopItems, buyItem } from "../controllers/shopController.js";
import { checkActiveSession } from "../middleware/isActive.js";

const router = express.Router();

// GET /api/shop - Get all shop items (themes, titles, premium quizzes)
router.get("/", checkActiveSession, getShopItems);

// POST /api/shop/buy - Buy an item
router.post("/buy", checkActiveSession, buyItem);

export default router;
