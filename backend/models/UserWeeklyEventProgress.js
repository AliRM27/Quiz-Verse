import { Schema, model, Types } from "mongoose";

const NodeProgressSchema = new Schema(
  {
    index: { type: Number, required: true }, // node index in WeeklyEvent.nodes

    unlockedAt: { type: Date }, // when node became available
    completedAt: { type: Date }, // when user first completed it

    attempts: { type: Number, default: 0 }, // how many times user played this node
    questionsCorrect: { type: Number, default: 0 },
    trophiesCollected: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserWeeklyEventProgressSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },

    // Link to WeeklyEvent
    eventId: { type: Types.ObjectId, ref: "WeeklyEvent", required: true },

    // Duplicate key for simpler querying
    weekKey: { type: String, required: true },

    // The index of the node the user should play next
    currentNodeIndex: { type: Number, default: 0 },

    // Progress information per node the user has seen
    nodeProgress: { type: [NodeProgressSchema], default: [] },

    // Has the user already received the fullCompletionReward?
    fullCompletionRewardClaimed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Each user can only have one progress doc per event
UserWeeklyEventProgressSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true }
);

export const UserWeeklyEventProgress = model(
  "UserWeeklyEventProgress",
  UserWeeklyEventProgressSchema
);
