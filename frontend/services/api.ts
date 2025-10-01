import axios from "axios";
import { API_URL } from "./config";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Alert, DevSettings } from "react-native";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    const sessionToken = await SecureStore.getItemAsync("sessionToken"); // NEW

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (sessionToken) {
      config.headers["x-session-token"] = sessionToken; // NEW
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor (e.g., handle token expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      router.replace("/(auth)");
      // Handle invalid/expired token, e.g., redirect to login
    } else if (error.response?.status === 403) {
      Alert.alert(
        "Session Ended",
        "Your account has been logged in on another device.",
        [
          {
            text: "OK",
            onPress: () => DevSettings.reload(),
          },
        ],
        { cancelable: false }
      );
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
  difficulty: string;
  updates: {
    questions: number;
    rewards: number;
    answered: number[];
    streaks: number[];
    timeBonuses: number[];
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

export const fetchUnlockedQuizzes = async (userId: string | undefined) => {
  try {
    const res = await api.get("api/quizzes/unlocked/" + userId);
    return res.data;
  } catch (err) {
    console.log(err);
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
