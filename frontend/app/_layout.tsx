import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/context/userContext";
import { useEffect } from "react";
import { fetchUnlockedQuizzes } from "@/services/api";
import { useUser } from "@/context/userContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    "LibertinusMono-Regular": require("@/assets/fonts/LibertinusMono-Regular.ttf"),
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-Italic": require("@/assets/fonts/Inter-Italic.ttf"),
  });
  const { user, isAuthenticated } = useUser();

  const queryClient = new QueryClient();

  useEffect(() => {
    if (isAuthenticated && user) {
      queryClient.prefetchQuery({
        queryKey: ["quizzes", user._id],
        queryFn: () => fetchUnlockedQuizzes(user._id),
      });
    }
  }, [user]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <UserProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)/createUsername" />
              <Stack.Screen name="index" />
              <Stack.Screen
                name="quizLevel/[id]"
                options={{ animation: "none" }}
              />
              <Stack.Screen
                name="(auth)/index"
                options={{ animation: "none" }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </UserProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
