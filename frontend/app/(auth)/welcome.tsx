import { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import { REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import NextButton from "@/components/ui/NextButton";
import { useUser } from "@/context/userContext";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import BookIcon from "@/assets/svgs/book-dashed.svg";
import TrophyIcon from "@/assets/svgs/trophy.svg";
import Bow from "@/assets/svgs/bow-arrow.svg";
import { updateUser } from "@/services/api";
import Level from "@/assets/svgs/gauge.svg";
import { useTranslation } from "react-i18next";

const createSlides = (t: ReturnType<typeof useTranslation>["t"]) => [
  {
    title: t("welcomeSlide1Title"),
    headline: t("welcomeSlide1Headline"),
    description: t("welcomeSlide1Description"),
    Icon: Bow,
    accent: "#6A7EFC",
    meta: t("welcomeSlide1Meta"),
  },
  {
    title: t("welcomeSlide2Title"),
    headline: t("welcomeSlide2Headline"),
    description: t("welcomeSlide2Description"),
    Icon: Level,
    accent: Colors.dark.info,
    meta: t("welcomeSlide2Meta"),
  },
  {
    title: t("welcomeSlide3Title"),
    headline: t("welcomeSlide3Headline"),
    description: t("welcomeSlide3Description"),
    Icon: TrophyIcon,
    accent: Colors.dark.secondary,
    meta: t("welcomeSlide3Meta"),
  },
  {
    title: t("welcomeSlide4Title"),
    headline: t("welcomeSlide4Headline"),
    description: t("welcomeSlide4Description"),
    Icon: BookIcon,
    accent: Colors.dark.primary,
    meta: t("welcomeSlide4Meta"),
    type: "username",
  },
];

export default function Welcome() {
  const { t } = useTranslation();
  const slides = useMemo(() => createSlides(t), [t]);
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const { user, loading, refreshUser } = useUser();
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  const handleNextSlide = () => {
    Haptics.selectionAsync();
    if (step < slides.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: -20,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep((prev) => prev + 1);
        fadeAnim.setValue(0);
        translateAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      });
      return;
    }
  };
  const handleUsernameSubmit = async () => {
    const trimmed = username.trim();
    if (
      trimmed.length < 3 ||
      trimmed.length > 12 ||
      !/^[a-zA-Z0-9_]+$/.test(trimmed)
    ) {
      setUsernameError(
        "Use 3-12 characters with letters, numbers, or underscores."
      );
      return;
    }
    setUsernameError("");
    setSavingUsername(true);
    try {
      await updateUser({ name: trimmed });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(auth)/pickQuiz");
    } catch (error) {
      console.error("Failed to update username:", error);
      setUsernameError("Something went wrong. Please try again.");
    } finally {
      setSavingUsername(false);
    }
  };
  const handlePrimaryAction = () => {
    if (slides[step].type === "username") {
      handleUsernameSubmit();
    } else {
      handleNextSlide();
    }
  };

  if (loading || !user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.dark.bg_dark,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  const currentSlide = slides[step];
  const CurrentIcon = currentSlide.Icon;
  const isUsernameStep = currentSlide.type === "username";
  const trimmedUsername = username.trim();
  const isUsernameValid =
    trimmedUsername.length >= 3 &&
    trimmedUsername.length <= 12 &&
    /^[a-zA-Z0-9_]+$/.test(trimmedUsername);

  return (
    <BackgroundGradient>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        enabled={Platform.OS === "ios"}
      >
        <ScrollView
          contentContainerStyle={[
            {
              flexGrow: 1,
            },
            styles.container,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <View style={[{ gap: 40 }, { paddingBottom: 100 }]}>
            <View style={styles.progressContainer}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressSegment,
                    index <= step && styles.progressSegmentActive,
                  ]}
                />
              ))}
            </View>

            <Animated.View
              style={[
                styles.textBlock,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: translateAnim }],
                },
              ]}
            >
              <View style={styles.metaRow}>
                <View style={styles.iconMeta}>
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: currentSlide.accent },
                    ]}
                  >
                    <CurrentIcon
                      width={30}
                      height={30}
                      color={Colors.dark.bg_dark}
                    />
                  </View>
                  <Text style={styles.metaText}>{currentSlide.meta}</Text>
                </View>
              </View>
              <Text style={styles.title}>{currentSlide.title}</Text>
              <Text style={styles.headline}>{currentSlide.headline}</Text>
              <Text style={styles.description}>{currentSlide.description}</Text>

              {isUsernameStep && (
                <View style={styles.inputCard}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Username</Text>
                    <Text style={styles.counter}>{username.length}/12</Text>
                  </View>

                  <TextInput
                    onFocus={() => {
                      setScrollEnabled(true);
                    }}
                    onBlur={() => {
                      setScrollEnabled(false);
                    }}
                    cursorColor={Colors.dark.text}
                    selectionColor={Colors.dark.text}
                    placeholder="Type your username"
                    placeholderTextColor={Colors.dark.text_muted}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (usernameError) setUsernameError("");
                    }}
                    style={[
                      styles.input,
                      !isUsernameValid &&
                        username.length > 0 && {
                          borderColor: Colors.dark.danger,
                        },
                    ]}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    maxLength={12}
                  />
                </View>
              )}
            </Animated.View>
          </View>
          <NextButton
            onPress={handlePrimaryAction}
            title={isUsernameStep ? "Save & continue" : "Next"}
            loading={isUsernameStep ? savingUsername : false}
            disabled={isUsernameStep && !isUsernameValid}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  progressContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.dark.bg_light,
  },
  progressSegmentActive: {
    backgroundColor: Colors.dark.text,
  },
  textBlock: {
    gap: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 40,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    borderColor: Colors.dark.bg,
    shadowColor: "#ffffffff",
    shadowOpacity: 0.4,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
  },
  emojiTicker: {
    fontSize: 28,
    color: Colors.dark.bg_dark,
    textAlign: "center",
  },
  metaText: {
    fontSize: 15,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  stepText: {
    fontSize: 13,
    color: Colors.dark.text_muted,
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    fontWeight: "600",
  },
  headline: {
    fontSize: 20,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  description: {
    fontSize: 15,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    lineHeight: 22,
  },
  inputCard: {
    marginTop: 24,
    gap: 25,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 13,
    color: Colors.dark.text_muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  counter: {
    fontSize: 12,
    color: Colors.dark.text_muted,
  },
  input: {
    backgroundColor: Colors.dark.bg_light,
    padding: 20,
    fontSize: 15,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    borderRadius: 35,
  },
  error: {
    color: Colors.dark.danger,
    fontSize: 14,
  },
});
