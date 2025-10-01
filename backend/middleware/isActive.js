import User from "../models/User.js";

export async function checkActiveSession(req, res, next) {
  const userId = req.userId; // from your JWT auth
  const sessionToken = req.headers["x-session-token"];

  if (!sessionToken) {
    return res.status(401).json({ error: "Session token required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.activeSession !== sessionToken && user.activeSession !== null) {
    return res
      .status(403)
      .json({ error: "Your account is active on another device." });
  }

  // Update lastActiveAt to refresh timeout
  user.lastActiveAt = new Date();
  await user.save();

  next();
}
