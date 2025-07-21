import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve SVGs from public/logos
router.use("/", express.static(path.join(__dirname, "../uploads/logos")));

export default router;
