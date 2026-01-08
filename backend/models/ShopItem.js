import mongoose from "mongoose";

const ShopItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["theme", "title", "avatar"], // We can add more later
      required: true,
    },
    price: {
      gems: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
    },
    description: {
      type: String,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShopItem", ShopItemSchema);
