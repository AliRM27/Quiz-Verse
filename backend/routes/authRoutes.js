import express from "express";
import {
  googleSignIn,
  appleSignIn,
  deleteUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/google", googleSignIn);
router.post("/apple", appleSignIn);
router.delete("/", deleteUser);

export default router;
