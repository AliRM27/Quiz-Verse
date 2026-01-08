import express from "express";
import { getShopItems, buyItem } from "../controllers/shopController.js";

const router = express.Router();

// GET /api/shop - Get all shop items (themes, titles, premium quizzes)
router.get("/", getShopItems);

// POST /api/shop/buy - Buy an item
router.post("/buy", buyItem);

export default router;
