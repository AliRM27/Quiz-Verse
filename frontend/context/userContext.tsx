import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import * as SecureStore from "expo-secure-store";
import { fetchUser, deleteUser } from "@/services/api";
import { router } from "expo-router";
import { initI18n } from "@/utils/i18n";
import { updateUser } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

export type User = {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  profileImage: string;
  completedQuizzesCount?: number;
  unlockedQuizzesCount?: number;
  role: string;
  stars: number;
  level: number;
  language: string;
  activeSession: string | null;
  lastActiveAt: any;
  firstLogIn: string;
  theme: { cardColor: string };
  gems: number;
};

type UserContextType = {
  user: User | null;
  token: string | null;
  setUserData: (
    user: User,
    token: string,
    sessionToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  lastIndexCard: number;
  setLastIndexRef: (index: number) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  setUserData: async () => {},
  logout: async () => {},
  loading: true,
  deleteAccount: async () => {},
  isAuthenticated: false,
  refreshUser: async () => {},
  lastIndexCard: 0,
  setLastIndexRef: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastIndexCard, setLastIndexRef] = useState<number>(0);
  const queryClient = useQueryClient();

  const isAuthenticated = !!user && !!token;

  // Fetch user from API using token
  const refreshUser = useCallback(async () => {
    setLoading(true);
    const storedToken = await SecureStore.getItemAsync("token");
    if (storedToken) {
      try {
        const res = await fetchUser(storedToken);
        const baseUser = res?.data;
        setUser(baseUser || null);
        setToken(storedToken);
        initI18n(res?.data.language);
      } catch (err) {
        setUser(null);
        setToken(null);
        await SecureStore.deleteItemAsync("token");
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set user and token after login
  const setUserData = useCallback(
    async (user: User, token: string, sessionToken: string) => {
      setUser(user);
      setToken(token);
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("sessionToken", sessionToken);
    },
    []
  );

  // Logout logic
  const logout = useCallback(
    async (options?: { skipStatusUpdate?: boolean }) => {
      setUser(null);
      setToken(null);
      setLastIndexRef(0);
      queryClient.clear();
      if (!options?.skipStatusUpdate) {
        await updateUser({ activeSession: null, lastActiveAt: null });
      }
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("sessionToken");
      router.replace("/(auth)");
    },
    [queryClient]
  );

  // Delete account logic
  const deleteAccount = useCallback(async () => {
    if (user?._id) {
      try {
        await deleteUser(user._id);
        await logout({ skipStatusUpdate: true });
      } catch (error) {
        console.error("Failed to delete account:", error);
      }
    }
  }, [user, logout]);

  // Memoize context value for performance
  const contextValue = useMemo(
    () => ({
      user,
      token,
      setUserData,
      logout,
      loading,
      deleteAccount,
      isAuthenticated,
      refreshUser,
      lastIndexCard,
      setLastIndexRef,
    }),
    [
      user,
      token,
      setUserData,
      logout,
      loading,
      deleteAccount,
      isAuthenticated,
      refreshUser,
      lastIndexCard,
      setLastIndexRef,
    ]
  );

  // Only render children when not loading
  // if (loading) {
  //   // You can replace this with a custom splash/loading component
  //   return <Text>LOADING</Text>;
  // }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
