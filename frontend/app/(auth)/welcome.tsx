import { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import { REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import NextButton from "@/components/ui/NextButton";
import { useUser } from "@/context/userContext";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import BookIcon from "@/assets/svgs/book-dashed.svg";
import ChampionshipIcon from "@/assets/svgs/championship.svg";
import TrophyIcon from "@/assets/svgs/trophy.svg";
import Bow from "@/assets/svgs/bow-arrow.svg";

const createSlides = () => [
  {
    title: "Play Quizzes You Love",
    headline: "Fan-made trivia, quick rewards, zero fluff.",
    description:
      "Pick a universe, dive into handcrafted questions, earn trophies, and keep exploring—all inside one focused, mobile-native experience.",
    Icon: Bow,
    accent: "#6A7EFC",
    meta: "Instant Gameplay",
  },
  {
    title: "Climb Every Difficulty",
    headline: "Four stages unlock as you prove yourself.",
    description:
      "Start on Easy, then unlock Medium, Hard, and Extreme tiers loaded with emoji puzzles, numeric inputs, and other twists that keep you guessing.",
    Icon: ChampionshipIcon,
    emojiSequence: ["🐣", "💪", "🔥", "☠️"],
    accent: Colors.dark.info,
    meta: "Easy → Extreme",
  },
  {
    title: "Stack Rewards & Bonuses",
    headline: "Finish faster, answer smarter, earn more.",
    description:
      "Collect trophies per question, chase streak badges for flawless runs, and beat the clock for time bonuses that supercharge your totals.",
    Icon: TrophyIcon,
    accent: Colors.dark.secondary,
    meta: "Trophies · Streaks · Time",
  },
  {
    title: "Claim Your Starter Quiz",
    headline: "Pick a free unlock to begin your legacy.",
    description:
      "After setting a username, you’ll pick one premium quiz to unlock forever — the perfect launch pad before exploring the full shop.",
    Icon: BookIcon,
    accent: Colors.dark.primary,
    meta: "Free Unlock",
  },
];

export default function Welcome() {
  const slides = useMemo(() => createSlides(), []);
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)");
    } else if (!loading && user && user.name && user.name.trim().length > 0) {
      router.replace("/(tabs)");
    }
  }, [loading, user]);

  const handleNext = () => {
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
  const CurrentIcon = currentSlide.Icon;
  const showEmojiTicker =
    currentSlide.emojiSequence && currentSlide.emojiSequence.length > 0;

  return (
    <BackgroundGradient style={styles.container}>
      <View style={{ gap: 100 }}>
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
          <View style={styles.iconMeta}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: currentSlide.accent },
              ]}
            >
              {showEmojiTicker ? (
                <AnimatedEmojiTicker emojis={currentSlide.emojiSequence!} />
              ) : (
                <CurrentIcon
                  width={28}
                  height={28}
                  color={Colors.dark.bg_dark}
                />
              )}
            </View>
            <Text style={styles.metaText}>{currentSlide.meta}</Text>
          </View>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.headline}>{currentSlide.headline}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </Animated.View>
      </View>
      <NextButton
        onPress={handleNext}
        title={step === slides.length - 1 ? "Choose my username" : "Next"}
      />
    </BackgroundGradient>
  );
}

const AnimatedEmojiTicker = ({ emojis }: { emojis: string[] }) => {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (emojis.length === 0) return;

    const cycle = () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % emojis.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    };

    const interval = setInterval(cycle, 2000);
    return () => {
      clearInterval(interval);
      opacity.stopAnimation();
      opacity.setValue(1);
    };
  }, [emojis, opacity]);

  if (!emojis.length) return null;

  return (
    <Animated.Text style={[styles.emojiTicker, { opacity }]}>
      {emojis[index]}
    </Animated.Text>
  );
};

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
    borderWidth: 1,
    borderColor: Colors.dark.bg,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
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
});
