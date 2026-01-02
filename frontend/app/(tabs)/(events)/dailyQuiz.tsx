import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  InteractionManager,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import ArrBack from "@/components/ui/ArrBack";
import { useUser } from "@/context/userContext";
import Loader from "@/components/ui/Loader";
import DailyQuiz from "@/assets/svgs/dailyQuiz.svg";
import { REGULAR_FONT } from "@/constants/Styles";
import CircularProgress from "@/components/ui/CircularProgress";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import LottieView from "lottie-react-native";
import { fetchDailyQuiz, fetchUserDailyQuizProgress } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { formatResetTime } from "@/utils/events";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Trophy from "@/assets/svgs/trophy.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DailyQuizScreen = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const fireAnimation = useMemo(
    () => require("@/assets/animations/Fire.json"),
    []
  );
  const fireRef = useRef<LottieView | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top on focus
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const {
    data: dailyQuizData,
    isLoading: dailyQuizLoading,
    isRefetching: dailyQuizRefetching,
    refetch: refetchDailyQuiz,
  } = useQuery({
    queryKey: ["dailyQuiz"],
    queryFn: fetchDailyQuiz,
    enabled: !!user,
  });

  const {
    data: dailyQuizUserProgressData,
    isLoading: dailyQuizUserProgressDataLoading,
    isRefetching: progressRefetching,
    refetch: refetchDailyQuizUserProgress,
  } = useQuery({
    queryKey: ["dailyQuizUserProgress"],
    queryFn: fetchUserDailyQuizProgress,
    enabled: !!user && !!dailyQuizData?.quiz,
  });

  // Lottie
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      fireRef.current?.play();
    });
    return () => task.cancel();
  }, []);

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!dailyQuizData?.quiz) return;
    setSecondsLeft(dailyQuizData.quiz.resetsInSeconds);
  }, [dailyQuizData?.quiz?.resetsInSeconds]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formattedTime =
    secondsLeft !== null ? formatResetTime(secondsLeft) : "–h –min ⏱️";

  const noDailyQuizAvailable =
    !dailyQuizLoading && (!dailyQuizData || dailyQuizData?.success === false);

  // Button animation
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // No quiz available state
  if (noDailyQuizAvailable) {
    return (
      <View style={styles.centeredContainer}>
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.emptyStateCard}
        >
          <Feather name="calendar" size={48} color={Colors.dark.text_muted} />
          <Text style={styles.emptyStateText}>No Daily Quiz available</Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                opacity:
                  dailyQuizRefetching || progressRefetching || dailyQuizLoading
                    ? 0.7
                    : 1,
              },
            ]}
            disabled={dailyQuizRefetching || progressRefetching}
            onPress={() => {
              refetchDailyQuiz();
              refetchDailyQuizUserProgress();
            }}
            activeOpacity={0.8}
          >
            {dailyQuizLoading || dailyQuizUserProgressDataLoading ? (
              <Loader black={true} />
            ) : (
              <Text style={styles.retryButtonText}>Reload</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // Loading state
  if (
    !user ||
    dailyQuizLoading ||
    dailyQuizUserProgressDataLoading ||
    !dailyQuizData ||
    !dailyQuizUserProgressData
  ) {
    return (
      <View style={styles.centeredContainer}>
        <Loader />
      </View>
    );
  }

  const isCompleted = dailyQuizUserProgressData.completed;

  return (
    <View style={styles.container}>
      <ArrBack onPress={() => router.replace("/(tabs)/(events)")} />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(0).springify()}
        style={styles.header}
      >
        <DailyQuiz width={180} height={65} />
        <View style={styles.timerBadge}>
          <Feather name="clock" size={14} color={Colors.dark.primary} />
          <Text style={styles.timerText}>{formattedTime}</Text>
        </View>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollsToTop
      >
        {/* Main Quiz Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Gloss */}
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.glossOverlay}
            />

            <View style={styles.mainCardContent}>
              <Text style={styles.mainCardTitle}>{t("dailyQuiz")}</Text>
              <Text style={styles.mainCardSubtitle}>{t("dailyQuizDesc")}</Text>

              {/* Info badges */}
              <View style={styles.infoBadgesRow}>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeIcon}>🧠</Text>
                  <Text style={styles.infoBadgeText}>
                    {t("difficultyDaily")}
                  </Text>
                </View>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeIcon}>🎁</Text>
                  <Text style={styles.infoBadgeText}>
                    {dailyQuizData.quiz.rewards.trophies}
                  </Text>
                  <Trophy
                    width={20}
                    height={20}
                    color={Colors.dark.secondary}
                  />
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                {/* Progress */}
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>{t("progress")}</Text>
                  <CircularProgress
                    progress={dailyQuizUserProgressData.correctCount}
                    total={dailyQuizData.quiz.questions.length}
                    size={50}
                    strokeWidth={4}
                    fontSize={14}
                    percent={false}
                    color={"rgba(255,255,255,0.2)"}
                  />
                </View>

                {/* Rewards */}
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>{t("rewards")}</Text>
                  <View style={styles.rewardProgressContainer}>
                    <View style={styles.progressBarBg}>
                      <ProgressBar
                        color="#FFD700"
                        progress={dailyQuizUserProgressData.totalRewards}
                        total={dailyQuizData.quiz.rewards.trophies}
                        height={6}
                      />
                    </View>
                    <Text style={styles.rewardText}>
                      {dailyQuizUserProgressData.totalRewards} /{" "}
                      {dailyQuizData.quiz.rewards.trophies}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              {isCompleted ? (
                <View style={styles.completedBadge}>
                  <Feather name="check-circle" size={20} color="#4ade80" />
                  <Text style={styles.completedText}>
                    {t("completedToday")}
                  </Text>
                </View>
              ) : (
                <Animated.View style={buttonAnimatedStyle}>
                  <TouchableOpacity
                    style={styles.startButton}
                    activeOpacity={1}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.navigate("/quizLevel/daily");
                    }}
                  >
                    <Text style={styles.startButtonText}>{t("startQuiz")}</Text>
                    <Feather name="arrow-right" size={18} color="#667eea" />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
        {/* Streak Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <LinearGradient
            colors={["#ff6b6b", "#ee5a24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <View style={styles.decorativeCircle3} />

            <LinearGradient
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.glossOverlay}
            />

            <View style={styles.streakHeader}>
              <View>
                <Text style={styles.streakTitle}>{t("dailyStreak")}</Text>
                <Text style={styles.streakSubtitle}>
                  Reach 7 days for bonus!
                </Text>
              </View>
              <View style={styles.streakCountContainer}>
                <Text style={styles.streakCount}>{user.dailyQuizStreak}</Text>
                <LottieView
                  ref={fireRef}
                  autoPlay={false}
                  loop
                  source={fireAnimation}
                  style={styles.fireAnimation}
                />
              </View>
            </View>

            {/* Streak Progress */}
            <View style={styles.streakProgressContainer}>
              <View style={styles.streakProgressBg}>
                <ProgressBar
                  height={8}
                  progress={user.dailyQuizStreak}
                  color="#FFD700"
                  total={7}
                />
              </View>
              <View style={styles.streakDots}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <View
                    key={day}
                    style={[
                      styles.streakDot,
                      user.dailyQuizStreak >= day && styles.streakDotActive,
                    ]}
                  >
                    {user.dailyQuizStreak >= day && (
                      <Feather name="check" size={10} color="#fff" />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
        {/* How it Works Card */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.infoCard}
        >
          <View style={styles.infoHeader}>
            <Feather name="info" size={18} color={Colors.dark.primary} />
            <Text style={styles.infoTitle}>{t("howItWorks")}</Text>
          </View>
          <Text style={styles.infoText}>{t("dailyQuizRules")}</Text>
        </Animated.View>
        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default DailyQuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    paddingHorizontal: 20,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateCard: {
    alignItems: "center",
    gap: 16,
    padding: 32,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  emptyStateText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.dark.primary,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.dark.bg_light,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  timerText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 20,
  },
  // Main Card
  mainCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mainCardContent: {
    padding: 24,
    gap: 16,
  },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mainCardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  infoBadgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoBadgeIcon: {
    fontSize: 14,
  },
  infoBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
  },
  rewardProgressContainer: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  progressBarBg: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    overflow: "hidden",
  },
  rewardText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  completedText: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "700",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "700",
  },
  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    left: -30,
    bottom: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorativeCircle3: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  glossOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  // Streak Card
  streakCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  streakSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  streakCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakCount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  fireAnimation: {
    width: 45,
    height: 45,
  },
  streakProgressContainer: {
    gap: 12,
  },
  streakProgressBg: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    overflow: "hidden",
  },
  streakDots: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  streakDotActive: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  // Info Card
  infoCard: {
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "700",
  },
  infoText: {
    color: Colors.dark.text_muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
