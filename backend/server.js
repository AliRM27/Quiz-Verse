import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import {
  authRoutes,
  categoryRoutes,
  shopRoutes,
  profileRoutes,
  quizRoutes,
  adminRoutes,
  staticRoutes,
  uploadLogoRoute,
} from "./routes/imports.js";
import { protect } from "./middleware/protect.js";
import { isAdmin } from "./middleware/isAdmin.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 7777;
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
//entry point
app.get("/", (req, res) => {
  res.send("Welcome to Quiz Verse");
});

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/users", protect, profileRoutes);
app.use("/api/admin", adminRoutes); // add protect, isAdmin later
app.use("/api/upload-logo", uploadLogoRoute);
app.use("/logos", staticRoutes);

app.listen(PORT, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`Server running on port ${PORT}`);
});
