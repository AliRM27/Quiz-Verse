import { Schema, model, Types } from "mongoose";

const WeeklyEventVoteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    eventId: { type: Types.ObjectId, ref: "WeeklyEvent", required: true },
    nodeIndex: { type: Number, required: true },
    optionId: { type: String, required: true },
  },
  { timestamps: true }
);

// Ensure one vote per user per node
WeeklyEventVoteSchema.index(
  { userId: 1, eventId: 1, nodeIndex: 1 },
  { unique: true }
);

export const WeeklyEventVote = model("WeeklyEventVote", WeeklyEventVoteSchema);
