import { Button } from "react-native";
import { defaultStyles } from "@/constants/Styles";
import Logo from "@/assets/svgs/logo.svg";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import { act, useEffect } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/context/userContext";
import { updateUser } from "@/services/api";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const { user, loading } = useUser();
  useEffect(() => {
    const authCheck = async () => {
      if (!loading && user) {
        const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutes
        if (
          user.activeSession &&
          new Date().getTime() - new Date(user.lastActiveAt).getTime() >
            SESSION_TIMEOUT
        ) {
          // Session is stale → clear it
          const sessionToken = generateSessionToken();
          user.activeSession = sessionToken;
          user.lastActiveAt = new Date();
          await SecureStore.setItemAsync("sessionToken", sessionToken);
          await updateUser({
            activeSession: sessionToken,
            lastActiveAt: user.lastActiveAt,
          });
        }
        router.replace("/(tabs)");
      }
    };

    authCheck();
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

  return (
    <BackgroundGradient style={defaultStyles.container}>
      <Logo width={250} height={250} />
      <Button
        color={Colors.dark.text}
        title={"Go to Login"}
        onPress={() => router.replace("/(auth)")}
      />
    </BackgroundGradient>
  );
}
