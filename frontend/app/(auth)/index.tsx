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
import { googleAuth, updateUser } from "@/services/api";
import GoogleLogo from "@/assets/svgs/GoogleLogo.svg";
import {
  initI18n,
  detectDeviceLanguageCode,
  codeToLanguageName,
  languageMap,
} from "@/utils/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { setUserData, loading, isAuthenticated } = useUser();
  const [errorMsg, setErrorMsg] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const insets = useSafeAreaInsets();

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
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // 🔑 Force the chooser on Android – if there’s a cached account, clear it first
      const currentlySignedIn = await GoogleSignin.getCurrentUser();
      if (currentlySignedIn) {
        await GoogleSignin.signOut(); // or await GoogleSignin.revokeAccess();
      }

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

      const storedLanguage = res?.data.user?.language;
      const storedLanguageCode = storedLanguage
        ? languageMap[storedLanguage]
        : undefined;
      const deviceLangCode = detectDeviceLanguageCode();
      const deviceLanguageName =
        codeToLanguageName[deviceLangCode] ?? "English";
      const shouldPersistDeviceLanguage =
        !storedLanguage ||
        !storedLanguageCode ||
        (storedLanguage === "English" && deviceLanguageName !== "English");
      const effectiveLanguage = shouldPersistDeviceLanguage
        ? deviceLanguageName
        : storedLanguage || "English";
      const userPayload = {
        ...res?.data.user,
        language: effectiveLanguage,
      };

      // Set user data and route
      await setUserData(userPayload, res?.data.token, res?.data.sessionToken);

      initI18n(effectiveLanguage);

      if (shouldPersistDeviceLanguage) {
        try {
          await updateUser({ language: deviceLanguageName });
        } catch (e) {
          console.log("Failed to persist device language", e);
        }
      }

      const loggedInUser = res?.data.user;
      const hasUsername =
        loggedInUser?.name && loggedInUser.name.trim().length > 0;

      if (!hasUsername) {
        router.replace("/(auth)/welcome");
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
    <BackgroundGradient
      style={[defaultStyles.page, { justifyContent: "space-between" }]}
    >
      <View
        style={{
          paddingTop: insets.top + 60,
          paddingHorizontal: 20,
          alignItems: "center",
        }}
      >
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 40 }}>⚡️</Text>
        </View>
        <Text style={styles.heroTitle}>QuizVerse</Text>
        <Text style={styles.heroSubtitle}>The ultimate trivia showdown.</Text>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Get Started</Text>
          <Text style={styles.cardBody}>
            Sign in to track your progress, compete in events, and climb the
            leaderboard.
          </Text>

          <TouchableOpacity
            disabled={signingIn}
            onPress={() => handleGoogleSignIn()}
            activeOpacity={0.8}
            style={styles.googleButton}
          >
            <GoogleLogo width={24} height={24} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
            {signingIn && (
              <ActivityIndicator
                size="small"
                color="#000"
                style={{ marginLeft: 10 }}
              />
            )}
          </TouchableOpacity>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroTitle: {
    fontSize: 42,
    color: "#fff",
    fontFamily: REGULAR_FONT,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    fontFamily: REGULAR_FONT,
    textAlign: "center",
    maxWidth: "80%",
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    padding: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
    textAlign: "center",
  },
  cardBody: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
    fontFamily: REGULAR_FONT,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButtonText: {
    fontFamily: "Roboto-Medium",
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
});
