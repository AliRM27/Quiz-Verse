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
import ProfileIcon from "@/assets/svgs/profilePic.svg";

const createSlides = () => [
  {
    title: "Discover Your Worlds",
    headline: "Curated trivia journeys built for superfans.",
    description:
      "Follow fandom-focused quiz collections packed with lore drops, easter eggs, and narrative beats. Every season adds fresh adventures to master.",
    Icon: BookIcon,
    accent: "#6A7EFC",
    meta: "Curated Collections",
  },
  {
    title: "Climb Every Difficulty",
    headline: "Four stages unlock as you prove yourself.",
    description:
      "Start on Easy, then unlock Medium, Hard, and Extreme tiers loaded with emoji puzzles, numeric inputs, and other twists that keep you guessing.",
    Icon: ChampionshipIcon,
    accent: Colors.dark.secondary,
    meta: "Easy → Extreme",
  },
  {
    title: "Stack Rewards & Bonuses",
    headline: "Finish faster, answer smarter, earn more.",
    description:
      "Collect trophies per question, chase streak badges for flawless runs, and beat the clock for time bonuses that supercharge your totals.",
    Icon: TrophyIcon,
    accent: Colors.dark.primary,
    meta: "Trophies · Streaks · Time",
  },
  {
    title: "Claim Your Starter Quiz",
    headline: "Pick a free unlock to begin your legacy.",
    description:
      "After setting a username, you’ll pick one premium quiz to unlock forever — the perfect launch pad before exploring the full shop.",
    Icon: ProfileIcon,
    accent: Colors.dark.highlight,
    meta: "Free Unlock",
  },
];

export default function Welcome() {
  const slides = useMemo(() => createSlides(), []);
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1 / slides.length)).current;
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)");
    } else if (!loading && user && user.name && user.name.trim().length > 0) {
      router.replace("/(tabs)");
    }
  }, [loading, user]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / slides.length,
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, step, slides.length]);

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

  return (
    <BackgroundGradient style={styles.container}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
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
              style={[styles.iconBadge, { backgroundColor: currentSlide.accent }]}
            >
              <CurrentIcon width={28} height={28} color={Colors.dark.bg_dark} />
            </View>
            <Text style={styles.metaText}>{currentSlide.meta}</Text>
          </View>
          <Text style={styles.stepText}>
            Step {step + 1} / {slides.length}
          </Text>
        </View>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.headline}>{currentSlide.headline}</Text>
        <Text style={styles.description}>{currentSlide.description}</Text>
      </Animated.View>

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
    paddingTop: 120,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 40,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.dark.bg_light,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
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
  metaText: {
    fontSize: 13,
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
