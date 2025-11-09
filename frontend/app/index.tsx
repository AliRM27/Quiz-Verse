import { useEffect } from "react";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { updateUser } from "@/services/api";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, loading } = useUser();
  useEffect(() => {
    const run = async () => {
      // Wait until user state finished loading
      if (loading) return;

      // If logged in
      if (user) {
        const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 mins
        if (
          user.activeSession &&
          Date.now() - new Date(user.lastActiveAt).getTime() > SESSION_TIMEOUT
        ) {
          const sessionToken = generateSessionToken();
          user.activeSession = sessionToken;
          user.lastActiveAt = new Date();
          await SecureStore.setItemAsync("sessionToken", sessionToken);
          await updateUser({
            activeSession: sessionToken,
            lastActiveAt: user.lastActiveAt,
          });
        }

        const needsUsername = !user.name || user.name.trim() === "";
        const needsStarterQuiz =
          !needsUsername && (user.unlockedQuizzes?.length ?? 0) === 0;

        if (needsUsername) {
          router.replace("/(auth)/welcome");
        } else if (needsStarterQuiz) {
          router.replace("/(auth)/pickQuiz");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        // Not logged in → go to auth
        router.replace("/(auth)");
      }

      // Hide splash only after routing
      await SplashScreen.hideAsync();
    };

    run();
  }, [loading, user]);

  function generateSessionToken(length = 64) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  return null;
}
