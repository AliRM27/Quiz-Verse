import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { fetchUser, deleteUser } from "@/services/api"; // Adjust the import path as necessary
import { router } from "expo-router";
import { QuizType } from "@/types";

type User = {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  profileImage: string;
  completedQuizzes: any[];
  progress: any[];
  role: string;
  stars: number;
  level: number;
  lastPlayed: QuizType[];
};

type UserContextType = {
  user: User | null;
  token: string | null;
  setUserData: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
  deleteAccount: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  setUserData: () => {},
  logout: () => {},
  loading: true,
  deleteAccount: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = await SecureStore.getItemAsync("token");
      if (storedToken) {
        setLoading(true);
        try {
          const res = await fetchUser(storedToken);
          setUser(res?.data);
          setToken(storedToken);
          router.replace("/(tabs)"); // 👈 Auto-redirect to home
        } catch {
          await SecureStore.deleteItemAsync("token");
        }
      }
      setLoading(false);
      console.log("User loaded:", user);
    };

    loadUser();
  }, []);

  const setUserData = async (user: User, token: string) => {
    setUser(user);
    setToken(token);
    await SecureStore.setItemAsync("token", token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync("token");
    router.replace("/(auth)"); // Back to login
  };

  const deleteAccount = async () => {
    if (user?._id) {
      try {
        await deleteUser(user._id);
        await logout();
      } catch (error) {
        console.error("Failed to delete account:", error);
      }
    }
  };

  return (
    <UserContext.Provider
      value={{ user, token, setUserData, logout, loading, deleteAccount }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
