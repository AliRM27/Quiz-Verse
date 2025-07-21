import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();

// Create upload folder if it doesn't exist
const uploadPath = "uploads/logos";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const publicUrl = `${process.env.SERVER_URL}/logos/${req.file.filename}`;
  return res.json({ url: publicUrl });
});

export default router;
