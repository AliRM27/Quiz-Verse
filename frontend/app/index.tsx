import { Button } from "react-native";
import { defaultStyles } from "@/constants/Styles";
import Logo from "@/assets/svgs/logo.svg";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/context/userContext";

export default function Index() {
  const { user, loading } = useUser();
  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)");
    }
  }, [loading, user]);

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
