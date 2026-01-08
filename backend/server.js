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
  eventRoutes,
  legalRoutes,
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
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", protect, quizRoutes);
app.use("/api/events", protect, eventRoutes);
app.use("/api/categories", protect, categoryRoutes);
app.use("/api/shop", protect, shopRoutes);
app.use("/api/users", protect, profileRoutes);
app.use("/api/admin", adminRoutes); // add protect, isAdmin later
app.use("/api/upload-logo", uploadLogoRoute);
app.use("/logos", staticRoutes);
app.use("/legal", legalRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong",
  });
});

app.listen(PORT, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`Server running on port ${PORT}`);
});
