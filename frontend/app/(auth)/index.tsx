import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import { defaultStyles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { Auth } from "@/constants/Dimensions";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { configureGoogleSignIn } from "@/utils/auth";
import { useUser } from "../../context/userContext";
import { googleAuth } from "@/services/api";

export default function Index() {
  const { setUserData } = useUser();

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

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
      <View style={{ gap: Auth.gap.button, width: "100%" }}>
        <GoogleSigninButton
          style={{
            width: "100%",
            height: 50,
            borderWidth: 1,
          }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          onPress={async () => {
            try {
              await GoogleSignin.hasPlayServices();
              const userInfo = await GoogleSignin.signIn();
              const tokens = await GoogleSignin.getTokens();

              const res = await googleAuth(tokens.idToken);

              setUserData(res?.data.user, res?.data.token);
              router.replace("/(auth)/createUsername");
            } catch (error) {
              console.log("Login error:", error);
            }
          }}
        />
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
