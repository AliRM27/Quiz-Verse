import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

export const googleSignIn = async (req, res) => {
  const { idToken } = req.body;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.given_name || payload.name;
    const profileImage = payload.picture;

    // Check if user already exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create a new user if not found
      user = new User({
        googleId,
        email,
        name,
        profileImage,
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
