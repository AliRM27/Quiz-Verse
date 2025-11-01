import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();

// Create upload folder if it doesn't exist
const uploadPath = "uploads/logos";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

let quizName = "";
// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    quizName =
      req.body.quizName?.toLowerCase().replace(/\s+/g, "-") || "default";
    const ext = file.originalname.split(".").pop();
    cb(null, `${quizName}.${ext}`);
  },
});
const upload = multer({ storage });

router.post("/", upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  return res.json({ name: quizName });
});

export default router;
