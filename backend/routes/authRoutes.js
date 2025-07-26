import express from "express";
import { googleSignIn, deleteUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/google", googleSignIn);
router.delete("/", deleteUser);

export default router;
