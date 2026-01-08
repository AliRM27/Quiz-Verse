import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { isSmallPhone, layout } from "@/constants/Dimensions";
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { QuizType } from "@/types";
import QuizLogo from "./ui/QuizLogo";
import Right from "@/assets/svgs/rightAnswers.svg";
import Wrong from "@/assets/svgs/wrongAnswers.svg";
import { useEffect, useRef, useState } from "react";
import CircularProgress from "./ui/CircularProgress";
import { LineDashed } from "./ui/Line";
import ProgressBar from "./animatinos/progressBar";
import { useTranslation } from "react-i18next";
import { streakMilestones, timeBonusThresholds } from "@/utils/rewardsSystem";
import Trophy from "@/assets/svgs/trophy.svg";
import Loader from "./ui/Loader";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProgressDetail } from "@/services/api";
import { languageMap } from "@/utils/i18n";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolate,
} from "react-native-reanimated";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RewardItem = ({
  name,
  rewards,
  milestones,
  bonuses,
  index,
  isMax,
}: {
  name: string;
  rewards: number;
  milestones: any[];
  bonuses: number[];
  index: number;
  isMax?: boolean;
}) => {
  const { t } = useTranslation();

  const getMedalColor = (idx: number) => {
    switch (idx) {
      case 0:
        return "#CD7F32"; // Bronze
      case 1:
        return "#C0C0C0"; // Silver
      case 2:
        return "#FFD700"; // Gold
      default:
        return "#fff";
    }
  };

  const getMedalName = (idx: number) => {
    switch (idx) {
      case 0:
        return "bronze";
      case 1:
        return "silver";
      case 2:
        return "gold";
      default:
        return "";
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(400 + index * 100).duration(500)}
      style={styles.rewardCard}
    >
      <View style={styles.rewardHeader}>
        <View style={styles.rewardLabelContainer}>
          <Text style={styles.rewardLabel}>{t(name)}</Text>
        </View>
        <View style={styles.rewardAmountContainer}>
          {isMax && rewards === 0 ? (
            <Text style={styles.rewardAmount}>{t("max")}</Text>
          ) : (
            <>
              <Text style={styles.rewardAmount}>+{rewards}</Text>
              <Trophy color="#FFB11F" width={14} height={14} />
            </>
          )}
        </View>
      </View>

      {milestones.length > 0 && (
        <View style={styles.milestonesRow}>
          {milestones.map((milestone, idx) => {
            const val = milestone.threshold || milestone.limit;
            const isActive = bonuses.includes(val);
            return (
              <View
                key={idx}
                style={[styles.milstoneWrapper, isActive && { opacity: 1 }]}
              >
                <MaterialCommunityIcons
                  name="medal"
                  size={24}
                  color={
                    isActive ? getMedalColor(idx) : "rgba(255,255,255,0.1)"
                  }
                />
                <Text
                  style={[
                    styles.milestoneText,
                    isActive && { color: getMedalColor(idx) },
                  ]}
                >
                  {t(getMedalName(idx))}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Animated.View>
  );
};

const Result = ({
  quiz,
  selectedLevelIndex,
  correctAnswers,
  total,
  rewards,
  newQuestions,
  questionRewards,
  streak,
  time,
  mult,
  timeNumber,
  streakNumber,
  wrongQuestions,
}: {
  quiz: QuizType;
  selectedLevelIndex: string;
  correctAnswers: number;
  total: number;
  rewards: number;
  newQuestions: number;
  questionRewards: number;
  streak: number;
  time: number;
  mult: number;
  timeNumber: number;
  streakNumber: number;
  wrongQuestions: { index: number; question: Record<string, string> }[];
}) => {
  const { user, refreshUser } = useUser();
  const { t } = useTranslation();
  const [value, setValue] = useState<number>(0);
  const [rewardsValue, setRewardsValue] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const insets = useSafeAreaInsets();
  const [showWrongQuestions, setShowWrongQuestions] = useState(false);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const statusBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      backgroundColor: "#131313",
    };
  });

  const headerParallaxStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["userProgressDetail", quiz._id],
    queryFn: () => fetchUserProgressDetail(quiz._id),
    enabled: !!user?._id,
  });

  const userProgress =
    detailData?.progress?.sections?.[Number(selectedLevelIndex)] || null;
  const quizProgress = quiz.sections[Number(selectedLevelIndex)];
  const hasWrongQuestions = wrongQuestions && wrongQuestions.length > 0;

  useEffect(() => {
    if (!userProgress) return;

    // Initial animation values
    const initialProgress =
      Math.floor(
        ((userProgress.questions - newQuestions) /
          quizProgress.questions.length) *
          100
      ) || 0;
    setValue(initialProgress);
    setRewardsValue(userProgress.rewards - rewards);

    // Staggered cumulative animations
    setTimeout(() => {
      setValue(
        Math.floor(
          (userProgress.questions / quizProgress.questions.length) * 100
        )
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);

    setTimeout(() => {
      setRewardsValue(userProgress.rewards || 0);
    }, 1500);
  }, [userProgress]);

  if (detailLoading || !userProgress || !user) {
    return (
      <View style={[styles.loaderContainer, { paddingTop: insets.top }]}>
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container} collapsable={false}>
      {/* Dynamic Status Bar Background */}
      <Animated.View
        style={[
          styles.statusBarBackground,
          { height: insets.top },
          statusBarAnimatedStyle,
        ]}
      />

      {/* Sticky Header Removed */}

      <Animated.ScrollView
        ref={scrollViewRef as any}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Celebration Header */}
        <Animated.View style={headerParallaxStyle}>
          <LinearGradient
            colors={["#4A00E0", "#8E2DE2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.celebrationHeader, { paddingTop: insets.top + 20 }]}
          >
            <Animated.View
              entering={ZoomIn.duration(800)}
              style={styles.logoBadge}
            >
              <QuizLogo name={quiz.logoFile} style={{ borderRadius: 50 }} />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={{ alignItems: "center" }}
            >
              <Text style={styles.completeTitle}>{t("completed")}</Text>
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              {timeNumber > 0 && (
                <View style={styles.timeTakenBadge}>
                  <Feather
                    name="clock"
                    size={14}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.timeTakenText}>
                    {Math.floor(timeNumber / 60)}:
                    {String(timeNumber % 60).padStart(2, "0")}
                  </Text>
                </View>
              )}
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Summary Row */}
        <View style={styles.statsSummaryRow}>
          <Animated.View
            entering={FadeInDown.delay(400)}
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: "rgba(76, 175, 80, 0.1)" },
              ]}
            >
              <Right width={24} height={24} />
            </View>
            <Text style={styles.summaryValue}>{correctAnswers}</Text>
            <Text style={styles.summaryLabel}>{t("correct")}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500)}
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              ]}
            >
              <Wrong width={24} height={24} />
            </View>
            <Text style={styles.summaryValue}>{total - correctAnswers}</Text>
            <Text style={styles.summaryLabel}>{t("wrong")}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600)}
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: "rgba(255, 177, 31, 0.1)" },
              ]}
            >
              <Ionicons name="flash" size={24} color="#FFB11F" />
            </View>
            <Text style={styles.summaryValue}>{streakNumber}</Text>
            <Text style={styles.summaryLabel}>{t("Streak")}</Text>
          </Animated.View>
        </View>

        {/* Detailed Rewards Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("performanceBreakdown")}</Text>
        </View>

        <View style={styles.rewardsList}>
          {[
            {
              type: "baseReward",
              rewards: questionRewards,
              milestones: [],
              bonuses: [],
              isMax: userProgress.questions >= quizProgress.questions.length,
            },
            {
              type: "Streak",
              rewards: streak,
              milestones: quizProgress.difficulty
                ? (streakMilestones as any)[quizProgress.difficulty]
                : [],
              bonuses: userProgress.streaks || [],
              isMax: !!(
                quizProgress.difficulty &&
                (userProgress.streaks || []).length >=
                  ((streakMilestones as any)[quizProgress.difficulty] || [])
                    .length
              ),
            },
            {
              type: "Time",
              rewards: time,
              milestones: quizProgress.difficulty
                ? (timeBonusThresholds as any)[quizProgress.difficulty]
                : [],
              bonuses: userProgress.timeBonuses || [],
              isMax: !!(
                quizProgress.difficulty &&
                (userProgress.timeBonuses || []).length >=
                  ((timeBonusThresholds as any)[quizProgress.difficulty] || [])
                    .length
              ),
            },
          ].map((item, index) => (
            <RewardItem
              key={index}
              index={index}
              name={item.type}
              rewards={item.rewards}
              milestones={item.milestones}
              bonuses={item.bonuses}
              isMax={item.isMax}
            />
          ))}

          {/* Total Run Rewards */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(500)}
            style={styles.totalRewardsCard}
          >
            <Text style={styles.totalRewardsLabel}>{t("runEarnings")}</Text>
            <View style={styles.totalRewardsValue}>
              <Text style={styles.totalRewardsAmount}>
                +{questionRewards + streak + time}
              </Text>
              <Trophy color="#FFB11F" width={20} height={20} />
            </View>
          </Animated.View>
        </View>

        {/* Progress Bars Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressCard}>
            <CircularProgress
              progress={value}
              size={60}
              strokeWidth={4}
              fontSize={14}
              showNumbers={true}
              totalNum={quizProgress.questions.length}
            />
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>{t("overallProgress")}</Text>
              <Text style={styles.progressSub}>
                {value}% {t("completed")}
              </Text>
            </View>
          </View>

          <View style={styles.rewardsProgressCard}>
            <View style={styles.rewardProgressLabels}>
              <Text style={styles.progressTitle}>{t("totalRewards")}</Text>
              <Text style={styles.rewardCount}>
                {rewardsValue} / {quizProgress.rewards}
              </Text>
            </View>
            <View style={styles.pBarContainer}>
              <ProgressBar
                color={"#FFB11F"}
                progress={rewardsValue}
                total={quizProgress.rewards}
                height={8}
              />
            </View>
          </View>
        </View>

        {/* Wrong Questions Toggle */}
        {hasWrongQuestions && (
          <Animated.View
            entering={FadeIn.delay(800)}
            style={styles.wrongSection}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowWrongQuestions(!showWrongQuestions)}
              style={styles.wrongToggle}
            >
              <Text style={styles.wrongToggleText}>
                {showWrongQuestions
                  ? t("hideWrongAnswers")
                  : t("reviewWrongAnswers")}
              </Text>
              <Feather
                name={showWrongQuestions ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.dark.text_muted}
              />
            </TouchableOpacity>

            {showWrongQuestions && (
              <View style={styles.wrongList}>
                {wrongQuestions.map((item, idx) => (
                  <Animated.View
                    key={idx}
                    entering={FadeInDown.duration(400)}
                    style={styles.wrongCard}
                  >
                    <Text style={styles.wrongQuestionLabel}>
                      {t("question")} {item.index + 1}
                    </Text>
                    <Text style={styles.wrongQuestionText}>
                      {item.question[languageMap[user.language]]}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </Animated.ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await refreshUser();
            router.back();
          }}
          activeOpacity={0.7}
          style={styles.homeButton}
        >
          <Text style={styles.homeButtonText}>{t("home")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await refreshUser();
            router.replace({
              pathname: "/quizLevel/[id]/[section]",
              params: { id: quiz._id, section: selectedLevelIndex },
            });
          }}
          style={styles.replayButton}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#4A00E0", "#8E2DE2"]}
            style={styles.replayGradient}
          >
            <Text style={styles.replayButtonText}>{t("replay")}</Text>
            <Ionicons name="refresh" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131313",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#131313",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    height: 100, // Approximate height, including insets
    overflow: "hidden",
  },
  stickyHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  stickyHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    maxWidth: "70%",
  },
  // Header
  celebrationHeader: {
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    padding: 2,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  completeTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  quizTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 5,
  },
  // Summary Grid
  statsSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -30,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  summaryValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  summaryLabel: {
    color: Colors.dark.text_muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  // Sections
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  rewardsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  rewardCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  rewardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardLabelContainer: {
    flex: 1,
  },
  rewardLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  rewardProgressText: {
    color: Colors.dark.text_muted,
    fontSize: 13,
    marginTop: 2,
  },
  rewardAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 177, 31, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardAmount: {
    color: "#FFB11F",
    fontSize: 16,
    fontWeight: "700",
  },
  milestonesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  milstoneWrapper: {
    alignItems: "center",
    gap: 4,
    opacity: 0.3,
  },
  milestoneText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  // Total Rewards Run
  totalRewardsCard: {
    backgroundColor: "rgba(255, 177, 31, 0.05)",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 177, 31, 0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRewardsLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  totalRewardsValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  totalRewardsAmount: {
    color: "#FFB11F",
    fontSize: 22,
    fontWeight: "800",
  },
  timeTakenBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  timeTakenText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Progress Section
  progressSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 20,
    padding: 20,
    gap: 20,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  progressSub: {
    color: Colors.dark.text_muted,
    fontSize: 13,
    marginTop: 2,
  },
  rewardsProgressCard: {
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 20,
    padding: 20,
  },
  rewardProgressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardCount: {
    color: "#FFB11F",
    fontSize: 14,
    fontWeight: "700",
  },
  pBarContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 4,
    overflow: "hidden",
  },
  // Wrong Section
  wrongSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  wrongToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 10,
  },
  wrongToggleText: {
    color: Colors.dark.text_muted,
    fontSize: 14,
    fontWeight: "600",
  },
  wrongList: {
    gap: 10,
    marginTop: 10,
  },
  wrongCard: {
    backgroundColor: "rgba(244, 67, 54, 0.05)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.1)",
  },
  wrongQuestionLabel: {
    color: Colors.dark.danger,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  wrongQuestionText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "#131313",
    gap: 15,
  },
  homeButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  replayButton: {
    flex: 2,
    height: 56,
    borderRadius: 18,
    overflow: "hidden",
  },
  replayGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  replayButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Result;
