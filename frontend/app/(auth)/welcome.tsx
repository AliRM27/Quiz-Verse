import { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import NextButton from "@/components/ui/NextButton";
import { useUser } from "@/context/userContext";
import { router } from "expo-router";

const createSlides = () => [
  {
    title: "Welcome to QuizVerse",
    headline: "The quiz adventure built for superfans.",
    description:
      "Jump into hand-crafted trivia journeys curated around the worlds you love. Each quiz is designed to test knowledge, unlock moments, and keep you coming back.",
  },
  {
    title: "Master Every Difficulty",
    headline: "Four stages, from warm-up to extreme.",
    description:
      "Start easy, then climb through Medium, Hard, and Extreme. Every section offers new question types, twists, and bragging rights when you conquer them all.",
  },
  {
    title: "Collect Trophies & Bonuses",
    headline: "Precision and speed matter.",
    description:
      "Earn trophies for every correct answer, stack time bonuses for quick thinking, and unlock streak rewards when you stay flawless through the toughest challenges.",
  },
  {
    title: "Build Your Quiz Legacy",
    headline: "Track progress, customize, and grow.",
    description:
      "Watch your profile level up as you complete collections, unlock unique cosmetics, and secure a spot among the most dedicated QuizVerse players.",
  },
];

export default function Welcome() {
  const slides = useMemo(() => createSlides(), []);
  const [step, setStep] = useState(0);
  const stepLabels = useMemo(
    () => ["Step 1", "Step 2", "Step 3", "Step 4"],
    []
  );
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)");
    } else if (
      !loading &&
      user &&
      user.name &&
      user.name.trim().length > 0
    ) {
      router.replace("/(tabs)");
    }
  }, [loading, user]);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }
    router.replace("/(auth)/createUsername");
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

  return (
    <BackgroundGradient style={[defaultStyles.page, styles.container]}>
      <View style={styles.progressContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.illustrationWrapper}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{stepLabels[step]}</Text>
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.headline}>{currentSlide.headline}</Text>
        <Text style={styles.description}>{currentSlide.description}</Text>
      </View>

      <NextButton
        onPress={handleNext}
        title={step === slides.length - 1 ? "Choose my username" : "Next"}
      />
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.border_muted,
  },
  progressDotActive: {
    backgroundColor: Colors.dark.text,
  },
  illustrationWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
  },
  illustration: {
    width: "80%",
    height: "100%",
  },
  placeholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.dark.bg_light,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 26,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  textBlock: {
    gap: 16,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    fontWeight: "600",
    textAlign: "center",
  },
  headline: {
    fontSize: 20,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    textAlign: "center",
    lineHeight: 22,
  },
});
