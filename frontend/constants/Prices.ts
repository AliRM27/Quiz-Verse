export const PRICES = {
  currencies: {
    trophies: {
      name: "Trophies",
      description: "Earned by playing quizzes, daily/weekly rewards, events",
    },
    coins: {
      name: "Coins",
      description: "Premium currency bought with real money",
      exchange_rate: {
        "100": 5, // 100 coins = €5
      },
    },
  },
  quizzes: {
    single: {
      price: {
        trophies: 1000,
        coins: 100,
      },
      max_rewards: 1600,
      description:
        "One full game quiz, includes 4 difficulties (Easy → Extreme)",
    },
    starter: {
      price: {
        trophies: 0,
        coins: 0,
      },
      max_rewards: 1600,
      description: "2–3 free quizzes unlocked at first launch",
    },
  },
  bundles: {
    bundle3: {
      quizzes_included: 3,
      price: {
        trophies: 6000,
        coins: 270,
      },
      description: "Fixed bundle of 3 quizzes with slight discount",
    },
    bundle5: {
      quizzes_included: 5,
      price: {
        trophies: 10000,
        coins: 450,
      },
      description: "Fixed bundle of 5 quizzes with bigger discount",
    },
    random_pack: {
      quizzes_included: 1,
      price: {
        trophies: 1500,
        coins: 100,
      },
      description: "Random quiz from a pool (adds excitement)",
    },
  },
  cosmetics: {
    avatar: {
      price: {
        trophies: 500,
        coins: 30,
      },
      description: "Profile avatar, cosmetic only",
    },
    theme: {
      price: {
        trophies: 1200,
        coins: 70,
      },
      description: "UI skin/theme",
    },
    nickname: {
      price: {
        coins: 100,
      },
      description: "Special nickname style, premium-only",
    },
  },
  rewards: {
    daily_quiz: {
      trophies: 100,
      description: "Daily quiz reward for engagement",
    },
    weekly_event: {
      trophies: 500,
      description: "Weekly event reward for active participation",
    },
  },
} as const;

// Optional: define TypeScript type for full structure
export type PricesType = typeof PRICES;
