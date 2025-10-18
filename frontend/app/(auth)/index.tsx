import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { Auth } from "@/constants/Dimensions";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { configureGoogleSignIn } from "@/utils/auth";
import { useUser } from "../../context/userContext";
import { googleAuth } from "@/services/api";
import GoogleLogo from "@/assets/svgs/GoogleLogo.svg";
import { initI18n } from "@/utils/i18n";

export default function Index() {
  const { setUserData, loading, isAuthenticated } = useUser();
  const [errorMsg, setErrorMsg] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
    // If already authenticated, redirect to tabs
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <View
        style={[
          defaultStyles.page,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setErrorMsg("");

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // If no userInfo or no idToken, treat it as cancelled or failed
      if (!userInfo.data?.idToken) {
        return;
      }

      // Optional: clear out stale sessions if you want strictly fresh sign-ins
      // await GoogleSignin.signOut();

      // Get fresh tokens
      const tokens = await GoogleSignin.getTokens();

      // Call your backend
      const res = await googleAuth(tokens.idToken);

      // Set user data and route
      await setUserData(
        res?.data.user,
        res?.data.token,
        res?.data.sessionToken
      );

      initI18n(res?.data.user.language);

      if (res?.data.user?.name === "") {
        router.replace("/(auth)/createUsername");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      let msg = "Login error. Please try again.";
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        msg = "Sign in cancelled.";
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        msg = "Sign in already in progress.";
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        msg = "Google Play Services not available.";
      }

      setErrorMsg(msg);
      console.log("Login error:", error);
    } finally {
      setSigningIn(false);
    }
  };

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
      <View
        style={{
          gap: Auth.gap.button,
          width: "100%",
          justifyContent: "center",

          marginTop: "auto",
        }}
      >
        <TouchableOpacity
          disabled={signingIn}
          onPress={() => handleGoogleSignIn()}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.dark.text,
            paddingHorizontal: 16,
            gap: 10,
            height: 44,
            borderRadius: 30,
          }}
        >
          <GoogleLogo width={20} height={20} />
          <Text
            style={{
              fontFamily: "Roboto-Medium",
              color: "black",
              fontSize: 15,
            }}
          >
            Contniue with Google
          </Text>
          {signingIn && <ActivityIndicator />}
        </TouchableOpacity>
        {errorMsg ? (
          <Text style={{ color: "red", marginTop: 10, textAlign: "center" }}>
            {errorMsg}
          </Text>
        ) : null}
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text_muted,
    fontSize: 15,
    fontFamily: REGULAR_FONT,
  },
});
