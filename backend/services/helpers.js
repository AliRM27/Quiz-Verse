import { WeeklyEvent } from "../models/WeeklyEvent.js";
import { UserWeeklyEventProgress } from "../models/UserWeeklyEventProgress.js";

export async function getActiveWeeklyEvent() {
  const now = new Date();

  // simplest: find event that is active for current date
  const event = await WeeklyEvent.findOne({
    isActive: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  });

  return event; // can be null
}

export async function grantReward(userDoc, reward) {
  if (!userDoc || !reward) {
    return { trophies: 0, gems: 0, applied: false };
  }

  const trophies = Math.max(0, Number(reward.trophies) || 0);
  const gems = Math.max(0, Number(reward.gems) || 0);

  if (!trophies && !gems) {
    return { trophies: 0, gems: 0, applied: false };
  }

  userDoc.stars = (userDoc.stars || 0) + trophies;
  userDoc.gems = (userDoc.gems || 0) + gems;

  return { trophies, gems, applied: true };
}

export async function getOrCreateUserEventProgress(user, event) {
  let progress = await UserWeeklyEventProgress.findOne({
    userId: user._id,
    eventId: event._id,
  });

  if (progress) {
    return progress;
  }

  const unlockedAt = new Date();

  progress = await UserWeeklyEventProgress.create({
    userId: user._id,
    eventId: event._id,
    weekKey: event.weekKey,
    currentNodeIndex: 0,
    nodeProgress: event?.nodes?.length ? [{ index: 0, unlockedAt }] : [],
  });

  /* 
     Removed unlockReward logic. 
     Previously: const rewardResult = grantReward(user, firstNode?.unlockReward);
  */
  // const firstNode = event?.nodes?.[0];
  // const rewardResult = grantReward(user, firstNode?.unlockReward);

  // if (rewardResult.applied) {
  //   await user.save();
  // }

  return progress;
}
