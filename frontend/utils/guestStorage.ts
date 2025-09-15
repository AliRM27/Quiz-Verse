// lib/guestStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_DATA_KEY = "quizverse_guest_data";

export type SectionProgress = {
  difficulty: string;
  answered: number[];
  questions: number;
  rewards: number;
};

export type QuizProgress = {
  quizId: string;
  questionsCompleted: number;
  rewardsTotal: number;
  completed: boolean;
  perfected: boolean;
  sections: SectionProgress[];
};

export type GuestData = {
  name: string;
  stars: number;
  level: number;
  unlockedQuizzes: { quizId: string }[];
  completedQuizzes: { quizId: string }[];
  lastPlayed: { quizId: string }[];
  progress: QuizProgress[];
  language: string;
  profileImage: string;
};

export async function saveGuestData(data: GuestData) {
  await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
}

export async function loadGuestData(): Promise<GuestData | null> {
  const data = await AsyncStorage.getItem(GUEST_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export async function clearGuestData() {
  await AsyncStorage.removeItem(GUEST_DATA_KEY);
}

// Optional helper: update just one field
export async function updateGuestField<T extends keyof GuestData>(
  field: T,
  value: GuestData[T]
) {
  const current = await loadGuestData();
  const updated = { ...current, [field]: value } as GuestData;
  await saveGuestData(updated);
  return updated;
}

export async function initGuestData() {
  const existing = await loadGuestData();
  if (!existing) {
    const defaultData: GuestData = {
      name: "",
      profileImage: "",
      stars: 0,
      level: 1,
      completedQuizzes: [],
      unlockedQuizzes: [],
      lastPlayed: [],
      progress: [],
      language: "English",
    };
    await saveGuestData(defaultData);
    return defaultData;
  }
  return existing;
}
