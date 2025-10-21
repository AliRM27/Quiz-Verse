type Difficulty = "Easy" | "Medium" | "Hard" | "Extreme";

export const timeBonusThresholds: Record<
  Difficulty,
  { limit: number; reward: number }[]
> = {
  Easy: [
    { limit: 250, reward: 5 },
    { limit: 200, reward: 15 },
    { limit: 150, reward: 30 },
  ],
  Medium: [
    { limit: 200, reward: 5 },
    { limit: 160, reward: 15 },
    { limit: 120, reward: 30 },
  ],
  Hard: [
    { limit: 150, reward: 5 },
    { limit: 120, reward: 15 },
    { limit: 90, reward: 30 },
  ],
  Extreme: [
    { limit: 100, reward: 5 },
    { limit: 70, reward: 15 },
    { limit: 50, reward: 30 },
  ],
};

export function calculateNewTimeBonuses(
  difficulty: Difficulty,
  timeTaken: number,
  alreadyUnlocked: number[] = []
): { bonus: number; newlyUnlocked: number[] } {
  const thresholds = timeBonusThresholds[difficulty];

  const unlockedNow = thresholds.filter((t) => timeTaken <= t.limit);

  const newlyUnlocked = unlockedNow
    .filter((t) => !alreadyUnlocked.includes(t.limit))
    .map((t) => t.limit);

  const bonus = thresholds
    .filter((t) => newlyUnlocked.includes(t.limit))
    .reduce((sum, t) => sum + t.reward, 0);

  return { bonus, newlyUnlocked };
}

export const streakMilestones: Record<
  Difficulty,
  { threshold: number; reward: number }[]
> = {
  Easy: [
    { threshold: 5, reward: 5 },
    { threshold: 11, reward: 15 },
    { threshold: 17, reward: 30 },
    { threshold: 20, reward: 50 }, // all correct
  ],
  Medium: [
    { threshold: 4, reward: 5 },
    { threshold: 8, reward: 15 },
    { threshold: 12, reward: 30 },
    { threshold: 15, reward: 50 },
  ],
  Hard: [
    { threshold: 3, reward: 5 },
    { threshold: 6, reward: 15 },
    { threshold: 8, reward: 30 },
    { threshold: 10, reward: 50 },
  ],
  Extreme: [
    { threshold: 2, reward: 5 },
    { threshold: 3, reward: 15 },
    { threshold: 4, reward: 30 },
    { threshold: 5, reward: 50 },
  ],
};

export const calculateNewStreakRewards = (
  maxStreak: number,
  difficulty: Difficulty,
  unlocked: Set<number>
) => {
  const milestones = streakMilestones[difficulty] || [];
  let bonus = 0;
  const newlyUnlocked: number[] = [];

  for (const { threshold, reward } of milestones) {
    if (maxStreak >= threshold && !unlocked.has(threshold)) {
      bonus += reward;
      newlyUnlocked.push(threshold);
    }
  }

  return { bonus, newlyUnlocked };
};
