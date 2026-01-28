import express from "express";
const router = express.Router();

router.get("/privacy", (req, res) => {
  res.redirect("https://quizverseplay.netlify.app/privacy.html");
});

router.get("/terms", (req, res) => {
  res.redirect("https://quizverseplay.netlify.app/terms.html");
});

export default router;
