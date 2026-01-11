import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import appleSignin from "apple-signin-auth";

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
    const name = payload.name || "";
    const profileImage = payload.picture;

    // Check if user already exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with email (maybe from Apple Sign In?)
      // If so, link the account? For now, let's just create new if googleId not found,
      // or we could check email uniqueness.
      // Since email is unique in schema, we should check it first.
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        // Link Google ID to existing user
        existingUserByEmail.googleId = googleId;
        if (!existingUserByEmail.profileImage)
          existingUserByEmail.profileImage = profileImage;
        user = existingUserByEmail;
        await user.save();
      } else {
        // Create a new user if not found
        user = new User({
          googleId,
          email,
          name,
          profileImage,
        });
        await user.save();
      }
    }

    const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutes

    if (
      user.activeSession &&
      user.lastActiveAt && // Ensure lastActiveAt exists
      new Date() - new Date(user.lastActiveAt) > SESSION_TIMEOUT
    ) {
      // Session is stale → clear it
      user.activeSession = null;
      user.lastActiveAt = null;
    }

    // Generate a unique session token for this device
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Update user's active session and lastActiveAt
    user.activeSession = sessionToken;
    user.lastActiveAt = new Date();
    await user.save();

    // Generate JWT token for API auth
    const jwtToken = jwt.sign(
      { id: user._id, sessionToken },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    const leanUser = await User.findById(user._id)
      .select(
        "title googleId appleId email name profileImage stars gems level role language theme activeSession lastActiveAt firstLogIn unlockedQuizzes completedQuizzes dailyQuizStreak lastDailyQuizDateKey ownedThemes ownedTitles ownedAvatars unlockedQuizzes"
      )
      .lean();

    const responseUser = {
      ...leanUser,
      unlockedQuizzesCount: leanUser.unlockedQuizzes
        ? leanUser.unlockedQuizzes.length
        : 0,
      completedQuizzesCount: leanUser.completedQuizzes
        ? leanUser.completedQuizzes.length
        : 0,
    };

    delete responseUser.unlockedQuizzes;
    delete responseUser.completedQuizzes;

    res.status(200).json({ token: jwtToken, sessionToken, user: responseUser });
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const appleSignIn = async (req, res) => {
  const { identityToken, user: userInfo, email } = req.body;
  // userInfo: { name: { firstName, lastName }, email } (only sent on first login)

  if (!identityToken) {
    return res.status(400).json({ message: "Identity token is required" });
  }

  try {
    // Verify the Identity Token with Apple
    const { sub: appleId, email: tokenEmail } = await appleSignin.verifyIdToken(
      identityToken,
      {
        // Optional: audience: [CLIENT_ID], // client id - can be found in apple developer portal
        ignoreExpiration: true, // During dev, might need this if checking old tokens, but generally false for prod
      }
    );

    // Prefer email from token, fallback to request body (frontend might send it if available)
    const userEmail = tokenEmail || email;

    // Check if user exists by Apple ID
    let user = await User.findOne({ appleId });

    if (!user) {
      // If not found by Apple ID, check by email (maybe they signed in with Google before)
      if (userEmail) {
        user = await User.findOne({ email: userEmail });
        if (user) {
          // Link Apple ID
          user.appleId = appleId;
          await user.save();
        }
      }

      if (!user) {
        // Create new user
        // Construct name
        let name = "Apple User";
        if (userInfo && userInfo.name) {
          const { firstName, lastName } = userInfo.name;
          if (firstName || lastName) {
            name = [firstName, lastName].filter(Boolean).join(" ");
          }
        }

        // Note: Apple only returns name/email on FIRST sign in.
        // If we don't have it, and user doesn't exist, we might have a problem if email is masked/missing.
        // But usually VerifyIdToken returns email.

        if (!userEmail) {
          return res.status(400).json({
            message:
              "Email not found in Apple token. Please try again or authorize email sharing.",
          });
        }

        user = new User({
          appleId,
          email: userEmail,
          name: name,
          // No profile image from Apple usually
        });
        await user.save();
      }
    }

    // --- Session Logic (Same as Google) ---
    const SESSION_TIMEOUT = 2 * 60 * 1000;
    if (
      user.activeSession &&
      user.lastActiveAt &&
      new Date() - new Date(user.lastActiveAt) > SESSION_TIMEOUT
    ) {
      user.activeSession = null;
      user.lastActiveAt = null;
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    user.activeSession = sessionToken;
    user.lastActiveAt = new Date();
    await user.save();

    const jwtToken = jwt.sign(
      { id: user._id, sessionToken },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const leanUser = await User.findById(user._id)
      .select(
        "title googleId appleId email name profileImage stars gems level role language theme activeSession lastActiveAt firstLogIn unlockedQuizzes completedQuizzes dailyQuizStreak lastDailyQuizDateKey ownedThemes ownedTitles ownedAvatars unlockedQuizzes"
      )
      .lean();

    const responseUser = {
      ...leanUser,
      unlockedQuizzesCount: leanUser.unlockedQuizzes
        ? leanUser.unlockedQuizzes.length
        : 0,
      completedQuizzesCount: leanUser.completedQuizzes
        ? leanUser.completedQuizzes.length
        : 0,
    };

    delete responseUser.unlockedQuizzes;
    delete responseUser.completedQuizzes;

    res.status(200).json({ token: jwtToken, sessionToken, user: responseUser });
  } catch (error) {
    console.error("Apple Sign-In Error:", error);
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
