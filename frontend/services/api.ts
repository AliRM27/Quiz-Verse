import axios from "axios";
import { API_URL } from "./config";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Alert, DevSettings } from "react-native";
import {
  DailyAnswerPayload,
  WeeklyEventResponse,
  WeeklyEventNodeType,
} from "@/types";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.code === "ECONNABORTED") {
      // Only retry once
      if (!config._retry) {
        config._retry = true;
        console.log("Timeout occurred, retrying request...");
        return api(config);
      }

      Alert.alert(
        "Request Timeout",
        "The server took too long to respond. Please try again."
      );
    } else if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
      router.replace("/(auth)");
    }

    return Promise.reject(error);
  }
);

export const fetchQuizzes = async () => {
  try {
    const res = await api.get("api/quizzes");
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const fetchUser = async (savedToken: string) => {
  try {
    const res = await api.get("api/users/me", {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const fetchDailyQuiz = async () => {
  try {
    const res = await api.get("api/events/daily-quiz");
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const submitDailyQuiz = async (answers: DailyAnswerPayload[]) => {
  try {
    const res = await api.post("api/events/daily-quiz/submit", {
      answers,
    });
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const fetchUserDailyQuizProgress = async () => {
  try {
    const res = await api.get("api/events/daily-quiz/userprogress");
    return res.data.userDailyProgress;
  } catch (err) {
    console.log(err);
  }
};

export const fetchWeeklyEvent = async (): Promise<WeeklyEventResponse> => {
  try {
    const res = await api.get("api/events/weekly/current");
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const completeWeeklyEventNode = async (
  nodeIndex: number,
  payload?: { score?: number; nodeType?: WeeklyEventNodeType }
) => {
  try {
    const res = await api.post(`api/events/weekly/node/${nodeIndex}/complete`, {
      score: 100,
      ...payload,
    });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const fetchWeeklyNodeQuestions = async (nodeIndex: number) => {
  try {
    const res = await api.get(`api/events/weekly/node/${nodeIndex}/questions`);
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const submitWeeklyVote = async (nodeIndex: number, optionId: string) => {
  try {
    const res = await api.post(`api/events/weekly/node/${nodeIndex}/vote`, {
      optionId,
    });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const fetchUserProgress = async () => {
  try {
    const res = await api.get("api/users/me/progress");
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const fetchUserProgressDetail = async (quizId: string | string[]) => {
  try {
    const res = await api.get(`api/users/me/progress/${quizId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const fetchUserHistory = async () => {
  try {
    const res = await api.get("api/users/me/history");
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateUser = async (updatedData: any) => {
  try {
    const res = await api.patch("api/users/me", updatedData);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserProgress = async (update: {
  quizId: string | string[];
  difficulty?: string;
  updates?: {
    questions: number;
    rewards: number;
    answered: number[];
    streaks: number[];
    timeBonuses: number[];
    timeRewards: number;
    streaksRewards: number;
  };
}) => {
  try {
    const res = await api.patch("api/users/updateProgress", update);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const searchQuizzes = async (query: string) => {
  try {
    const res = await api.get("api/quizzes/search", {
      params: { query }, // cleaner than string concatenation
    });
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchQuiz = async (id: string | string[]) => {
  try {
    const res = await api.get(`api/quizzes/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const googleAuth = async (idToken: string) => {
  try {
    const res = await api.post("api/auth/google", { idToken });
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const fetchLogo = async ({ name }: any) => {
  try {
    const res = await api.get("logos/" + name);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const res = await api.delete("api/auth", {
      data: { userId },
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const claimShareReward = async () => {
  try {
    const res = await api.post("api/users/reward-share");
    return res.data;
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

export const fetchShopItems = async () => {
  try {
    const res = await api.get("api/shop");
    return res.data;
  } catch (err) {
    console.log(err);
    return { themes: [], titles: [], quizzes: [] };
  }
};

export const buyShopItem = async (
  itemId: string,
  type: string,
  currency: "gems" | "stars"
) => {
  try {
    const res = await api.post("api/shop/buy", {
      itemId,
      type,
      currency,
    });
    return res.data;
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: err.response?.data?.message || "Purchase failed",
    };
  }
};
