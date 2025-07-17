import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import { BackgroundGradient } from "@/components/ui/gradients/background";
//import {ButtonGradient} from "@/components/ui/gradients/buttons";
import { defaultStyles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import GoogleLogo from "@/assets/svgs/GoogleLogo.svg";
import AppleLogo from "@/assets/svgs/AppleLogo.svg";
import { AuthButton } from "@/components/ui/AuthButton";
import { router } from "expo-router";
import { Auth } from "@/constants/Dimensions";

export default function Index() {
  const [showAnimation, setShowAnimation] = useState(true);
  return (
    <BackgroundGradient style={[defaultStyles.page, { gap: Auth.gap.screen }]}>
      <View style={{ gap: Auth.gap.txt }}>
        <Text style={defaultStyles.title}>Welcome to QuizVerse</Text>
        <Text style={styles.txt}>
          Choose your favorite way to sign in and you’ll be in before you know
          it.
        </Text>
      </View>
      <Text
        style={{ alignSelf: "center", fontSize: 20, color: Colors.dark.text }}
      >
        Complete your favorite Quizzes.
      </Text>
      <View style={{ gap: Auth.gap.button }}>
        <AuthButton
          title={"Continue with Google"}
          Logo={GoogleLogo}
          onPress={() => {
            router.replace("/(auth)/createUsername");
            setTimeout(() => {
              setShowAnimation((p) => !p);
            }, 2000);
          }}
        />
        <AuthButton
          title={"Continue with Apple"}
          Logo={AppleLogo}
          onPress={() => {
            router.replace("/(auth)/createUsername");
            setTimeout(() => {
              setShowAnimation((p) => !p);
            }, 2000);
          }}
        />
        <Text
          style={{ fontSize: 17, textAlign: "center", color: Colors.dark.text }}
        >
          Play as Guest
        </Text>
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text_muted,
    fontSize: 15,
  },
});
