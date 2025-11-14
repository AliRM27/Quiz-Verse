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
import { Colors } from "@/constants/Colors";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    // "LibertinusMono-Regular": require("@/assets/fonts/LibertinusMono-Regular.ttf"),
    // "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-Italic": require("@/assets/fonts/Inter-Italic.ttf"),
    Inter: require("@/assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
    "Roboto-Medium": require("@/assets/fonts/Roboto-Medium.ttf"),
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
              <Stack.Screen
                name="(tabs)"
                options={{ animation: "fade", gestureEnabled: false }}
              />
              <Stack.Screen
                name="(auth)/welcome"
                options={{ gestureEnabled: false, animation: "fade" }}
              />
              <Stack.Screen
                name="(auth)/pickQuiz"
                options={{ gestureEnabled: false, animation: "fade" }}
              />
              <Stack.Screen name="index" />
              <Stack.Screen name="(settings)/index" />
              <Stack.Screen name="(quizzes)/collection" />
              <Stack.Screen
                name="(quizzes)/quiz"
                options={{
                  contentStyle: {
                    backgroundColor: Colors.dark.bg,
                    height: "100%",
                  },
                  presentation: "formSheet",
                  gestureDirection: "vertical",
                  animation: "slide_from_bottom",
                  sheetGrabberVisible: true,
                  sheetInitialDetentIndex: 0,
                  sheetAllowedDetents: [1],
                  sheetCornerRadius: 50,
                  sheetExpandsWhenScrolledToEdge: true,
                  sheetElevation: 24,
                }}
              />
              <Stack.Screen
                name="quizLevel/[id]/[section]"
                options={{ animation: "none", gestureEnabled: false }}
              />
              <Stack.Screen
                name="(auth)/index"
                options={{ animation: "none", gestureEnabled: false }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </UserProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
