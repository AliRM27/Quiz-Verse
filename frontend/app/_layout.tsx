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
import { Colors } from "@/constants/Colors";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initI18n } from "@/utils/i18n";
import { useEffect } from "react";

import { useNotifications } from "@/hooks/useNotifications";

// Initialize i18n with device language on app launch
initI18n();

export default function RootLayout() {
  // const { scheduleDailyQuizNotification, scheduleWeeklyEventNotification } =
  //   useNotifications();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    // "LibertinusMono-Regular": require("@/assets/fonts/LibertinusMono-Regular.ttf"),
    // "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    Inter: require("@/assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
    "Inter-Italic": require("@/assets/fonts/Inter-Italic.ttf"),
    "Roboto-Medium": require("@/assets/fonts/Roboto-Medium.ttf"),
  });

  // Schedule notifications on app launch (idempotent usually, but good to ensure)
  // useEffect(() => {
  //   scheduleDailyQuizNotification();
  //   scheduleWeeklyEventNotification();
  // }, []);

  const queryClient = new QueryClient();

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
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
                  name="quizLevel/daily"
                  options={{ animation: "none", gestureEnabled: false }}
                />
                <Stack.Screen
                  name="(auth)/index"
                  options={{ animation: "none", gestureEnabled: false }}
                />
                <Stack.Screen name="+not-found" />
                <Stack.Screen
                  name="quizLevel/WeeklyEventNodeScreen"
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
                  name="quizLevel/weekly/[nodeIndex]"
                  options={{ animation: "none", gestureEnabled: false }}
                />
              </Stack>
            </UserProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
