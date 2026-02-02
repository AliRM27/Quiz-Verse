import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import { router } from "expo-router";
import { useTranslation, Trans } from "react-i18next";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { configureGoogleSignIn } from "@/utils/auth";
import { useUser } from "../../context/userContext";
import { googleAuth, appleAuth, updateUser } from "@/services/api";
import GoogleLogo from "@/assets/svgs/GoogleLogo.svg";
import {
  initI18n,
  detectDeviceLanguageCode,
  codeToLanguageName,
  languageMap,
} from "@/utils/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import * as AppleAuthentication from "expo-apple-authentication";

const { width } = Dimensions.get("window");
// Increase card size slightly for better visuals
const CARD_WIDTH = width * 0.35;
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Valid aspect ratio

// Images
const tlouImage = require("@/assets/images/tlou.jpg");
const ghostImage = require("@/assets/images/ghost-of-tsushima.jpg");
const minecraftImage = require("@/assets/images/minecraft.jpg");

export default function Index() {
  const { t } = useTranslation();
  const { setUserData, loading, isAuthenticated } = useUser();
  const [errorMsg, setErrorMsg] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [siginInApple, setSignInApple] = useState(false);
  const insets = useSafeAreaInsets();

  // Shared values for the fan animation
  // Initialize at 0 (center) to fan out on mount
  const card1Rotation = useSharedValue(0);
  const card2Rotation = useSharedValue(0);
  const card3Rotation = useSharedValue(0);

  const card1TranslateX = useSharedValue(0);
  const card3TranslateX = useSharedValue(0);

  const card1TranslateY = useSharedValue(0);
  const card2TranslateY = useSharedValue(0);
  const card3TranslateY = useSharedValue(0);

  const cardScale = useSharedValue(0.8); // Start smaller
  const cardOpacity = useSharedValue(0); // Start invisible

  useEffect(() => {
    configureGoogleSignIn();
  }, [isAuthenticated, loading]);

  useEffect(() => {
    // Sequence the animation: Fade in -> Fan out
    // 1. Fade in and scale up slightly
    cardOpacity.value = withTiming(1, { duration: 500 });
    cardScale.value = withSpring(1, { damping: 12 });

    // 2. Fan out vertically and rotationally after a short delay
    const delay = 300;

    // Left Card (Last of Us)
    card1Rotation.value = withDelay(delay, withSpring(-15, { damping: 12 }));
    card1TranslateX.value = withDelay(delay, withSpring(-40, { damping: 12 }));
    card1TranslateY.value = withDelay(delay, withSpring(10, { damping: 12 }));

    // Right Card (Minecraft)
    card3Rotation.value = withDelay(delay, withSpring(15, { damping: 12 }));
    card3TranslateX.value = withDelay(delay, withSpring(40, { damping: 12 }));
    card3TranslateY.value = withDelay(delay, withSpring(10, { damping: 12 }));

    // Center Card (Ghost - pops up slightly)
    card2TranslateY.value = withDelay(delay, withSpring(-10, { damping: 12 }));
  }, []);

  const animatedCard1Style = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { translateX: card1TranslateX.value },
      { translateY: card1TranslateY.value },
      { rotate: `${card1Rotation.value}deg` },
      { scale: cardScale.value },
    ],
    zIndex: 1,
  }));

  const animatedCard2Style = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { translateY: card2TranslateY.value },
      { rotate: `${card2Rotation.value}deg` },
      { scale: cardScale.value * 1.1 }, // Slightly larger center
    ],
    zIndex: 2,
  }));

  const animatedCard3Style = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { translateX: card3TranslateX.value },
      { translateY: card3TranslateY.value },
      { rotate: `${card3Rotation.value}deg` },
      { scale: cardScale.value },
    ],
    zIndex: 1,
  }));

  if (loading) {
    return (
      <View
        style={[
          defaultStyles.page,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const handleAppleSignIn = async () => {
    if (siginInApple) return; // prevents double taps

    try {
      setSignInApple(true);
      setErrorMsg("");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Apple sign-in succeeded but token missing (rare but possible)
      if (!credential?.identityToken) {
        setErrorMsg("Sign in failed. Please try again.");
        return;
      }

      let res;
      try {
        res = await appleAuth(
          credential.identityToken,
          credential.fullName ?? null,
          credential.email ?? null,
        );
      } catch (backendError) {
        console.log("Backend auth error:", backendError);
        setErrorMsg("Unable to complete sign in. Please try again.");
        return;
      }

      if (!res?.data?.token) {
        setErrorMsg("Sign in unsuccessful. Please try again.");
        return;
      }

      // ✅ From here on, user is authenticated
      const storedLanguage = res.data.user?.language;
      const deviceLangCode = detectDeviceLanguageCode();
      const deviceLanguageName =
        codeToLanguageName[deviceLangCode] ?? "English";

      const effectiveLanguage =
        storedLanguage && storedLanguage !== "English"
          ? storedLanguage
          : deviceLanguageName;

      const userPayload = {
        ...res.data.user,
        language: effectiveLanguage,
      };

      await setUserData(userPayload, res.data.token, res.data.sessionToken);

      initI18n(effectiveLanguage);

      const hasUsername =
        res.data.user?.name && res.data.user.name.trim().length > 0;

      router.replace(hasUsername ? "/(tabs)" : "/(auth)/welcome");
    } catch (e: any) {
      if (e?.code === "ERR_REQUEST_CANCELED") {
        // user canceled → do nothing
        return;
      }

      console.log("Apple Sign-In Error:", e);
      setErrorMsg("Sign in with Apple is temporarily unavailable.");
    } finally {
      setSignInApple(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setErrorMsg("");

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const currentlySignedIn = await GoogleSignin.getCurrentUser();
      if (currentlySignedIn) {
        await GoogleSignin.signOut();
      }

      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        return;
      }

      const tokens = await GoogleSignin.getTokens();
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

      await setUserData(userPayload, res?.data.token, res?.data.sessionToken);

      initI18n(effectiveLanguage);

      if (shouldPersistDeviceLanguage) {
        try {
          await updateUser({ language: deviceLanguageName });
        } catch (e) {
          console.log("Failed to persist device language", e);
        }
      }

      const constLoggedInUser = res?.data.user; // Fixed variable name to avoid conflict if any
      const hasUsername =
        constLoggedInUser?.name && constLoggedInUser.name.trim().length > 0;

      if (!hasUsername) {
        router.replace("/(auth)/welcome");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      let msg = t("authError");
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
    <BackgroundGradient style={[{ justifyContent: "space-between" }]}>
      {/* Top Section: Title */}
      <View style={[styles.topContainer, { paddingTop: insets.top + 40 }]}>
        <Animated.Text
          entering={FadeInUp.delay(200).springify()}
          style={styles.heroTitle}
        >
          {t("authTitle")}
        </Animated.Text>

        {/* <Animated.Text
          entering={FadeInUp.delay(400).springify()}
          style={styles.heroSubtitle}
        >
          {t("authSubtitle")}
        </Animated.Text> */}
      </View>

      {/* Middle Section: Card Fan Animation */}
      <View style={styles.middleContainer}>
        <View style={styles.cardFanContainer}>
          {/* Left Card: The Last of Us */}
          <Animated.View style={[styles.cardWrapper, animatedCard1Style]}>
            <Image
              source={tlouImage}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Right Card: Minecraft */}
          <Animated.View style={[styles.cardWrapper, animatedCard3Style]}>
            <Image
              source={minecraftImage}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Center Card: Ghost of Tsushima */}
          <Animated.View style={[styles.cardWrapper, animatedCard2Style]}>
            <Image
              source={ghostImage}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>
        </View>
      </View>

      {/* Bottom Section: Buttons */}
      <Animated.View
        entering={FadeInDown.delay(1000).springify()}
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {/* Buttons Container */}
        <View style={styles.buttonsWrapper}>
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={16}
              style={[styles.appleButton, siginInApple && { opacity: 0.6 }]}
              onPress={handleAppleSignIn}
            />
          )}

          <TouchableOpacity
            disabled={signingIn}
            onPress={() => handleGoogleSignIn()}
            activeOpacity={0.8}
            style={styles.googleButton}
          >
            <GoogleLogo width={24} height={24} />
            <Text style={styles.googleButtonText}>
              {t("continueWithGoogle")}
            </Text>
            {signingIn && (
              <ActivityIndicator
                size="small"
                color="#000"
                style={{ marginLeft: 10 }}
              />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          <Trans
            i18nKey="authFooter"
            components={[
              <Text
                style={styles.linkText}
                onPress={() =>
                  Linking.openURL("https://quizverseplay.netlify.app/terms")
                }
              />,
              <Text
                style={styles.linkText}
                onPress={() =>
                  Linking.openURL("https://quizverseplay.netlify.app/privacy")
                }
              />,
            ]}
          />
        </Text>
      </Animated.View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  linkText: {
    color: "#fff",
    fontWeight: "bold",
  },
  topContainer: {
    alignItems: "center",
    width: "100%",
  },
  heroTitle: {
    fontSize: 48,
    color: "#fff",
    fontFamily: REGULAR_FONT,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    fontFamily: REGULAR_FONT,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  middleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardFanContainer: {
    width: width,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: "#222", // Fallback color
    overflow: "hidden", // Ensure image clips to radius
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  bottomContainer: {
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  buttonsWrapper: {
    width: "100%",
    gap: 16,
  },
  appleButton: {
    width: "100%",
    height: 56,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    width: "100%",
    height: 56,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  googleButtonText: {
    fontFamily: REGULAR_FONT,
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
  },
  footerText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    textAlign: "center",
    fontFamily: REGULAR_FONT,
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    fontSize: 14,
    fontFamily: REGULAR_FONT,
    marginBottom: 10,
  },
});
