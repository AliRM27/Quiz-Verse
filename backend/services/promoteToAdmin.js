import mongoose from "mongoose";
import User from "../models/User.js"; // adjust path

export async function promoteUserToAdmin(email) {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.log("User not found");
  } else {
    console.log(`${email} is now admin!`);
  }

  mongoose.disconnect();
}
