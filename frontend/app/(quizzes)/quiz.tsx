import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Colors } from "@/constants/Colors";
import {
  HEIGHT,
  myHeight,
  myWidth,
  WIDTH,
  isSmallPhone,
} from "@/constants/Dimensions";
import { QuizType } from "@/types";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import CircularProgress from "@/components/ui/CircularProgress";
import QuizLogo from "@/components/ui/QuizLogo";
import Info from "@/components/ui/Info";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import { PRICES } from "@/constants/Prices";
import {
  updateUser,
  updateUserProgress,
  fetchUserProgress,
  buyShopItem,
} from "@/services/api";
import LockOpen from "@/assets/svgs/lock-open.svg";
import Lock from "@/assets/svgs/lock.svg";
import { languageMap } from "@/utils/i18n";
import Trophy from "@/assets/svgs/trophy.svg";
import { fetchQuiz } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/ui/Loader";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

const Quiz = () => {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const { user, refreshUser } = useUser();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const { data, isLoading } = useQuery({
    queryKey: ["quizzes", id],
    queryFn: ({ queryKey }) => fetchQuiz(queryKey[1]),
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id,
  });

  if (!user || isLoading || progressLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

  const quiz: QuizType = data;
  const progressList = progressData?.progress || [];
  const currentProgress = progressList.find((p: any) => p.quizId._id === id);
  const isUnlocked =
    Boolean(currentProgress) ||
    progressData?.unlockedQuizzes?.some((u: any) => u.quizId?._id === id);

  const progressPercent = currentProgress
    ? Math.floor(
        (currentProgress.questionsCompleted / quiz.questionsTotal) * 100
      )
    : 0;

  return (
    <View style={[styles.container, {}]} collapsable={false}>
      <LinearGradient
        colors={["#1a1a1a", "#0d0d0d"]}
        style={[
          styles.header,
          Platform.OS === "android" && { paddingTop: 30 + insets.top },
          Platform.OS === "ios" && { paddingTop: 30 },
        ]}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.headerContent}
        >
          <View style={styles.logoWrapper}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <QuizLogo name={quiz.logoFile} />
              </View>
            </View>
            {!isUnlocked && (
              <View style={styles.lockBadge}>
                <Lock width={16} height={16} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.titleInfo}>
            <Text style={styles.quizTitle} numberOfLines={2}>
              {quiz.title}
            </Text>
            <View style={styles.companyBadge}>
              <Text style={styles.companyText}>
                Fan made quiz • {quiz.company}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Top Stats */}
        <View style={styles.statsRow}>
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>{t("progress")}</Text>
            <View style={styles.statMain}>
              <CircularProgress
                progress={progressPercent}
                size={44}
                strokeWidth={3}
                fontSize={11}
                color={Colors.dark.border_muted}
              />
              <View>
                <Text style={styles.statValue}>{progressPercent}%</Text>
                <Text style={styles.statSubText}>
                  {currentProgress?.questionsCompleted || 0}/
                  {quiz.questionsTotal}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>{t("rewards")}</Text>
            <View style={styles.statMain}>
              <View style={styles.rewardsIconWrapper}>
                <Trophy width={24} height={24} color={Colors.dark.secondary} />
              </View>
              <View>
                <Text style={styles.statValue}>
                  {currentProgress?.rewardsTotal || 0}
                </Text>
                <Text style={styles.statSubText}>
                  Total {quiz.rewardsTotal}
                </Text>
              </View>
            </View>
            <View style={styles.statBarWrapper}>
              <ProgressBar
                color={Colors.dark.secondary}
                progress={currentProgress?.rewardsTotal || 0}
                total={quiz.rewardsTotal}
                height={4}
              />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
      <ScrollView
        collapsable={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
        style={{ flex: 1 }}
      >
        {/* Header Section */}

        <View style={styles.body}>
          {isUnlocked ? (
            <View style={styles.levelsGrid}>
              {quiz.sections.map((lvl, index) => (
                <LevelCard
                  key={index}
                  lvl={lvl}
                  index={index}
                  isSelected={selectedLevelIndex === index}
                  currentProgress={currentProgress}
                  onSelect={() => {
                    Haptics.selectionAsync();
                    setSelectedLevelIndex(index);
                  }}
                  t={t}
                />
              ))}
            </View>
          ) : (
            <Animated.View
              entering={FadeIn.delay(400)}
              style={styles.unlockSection}
            >
              <View style={styles.unlockCard}>
                <Lock
                  width={40}
                  height={40}
                  color={Colors.dark.border}
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.unlockTitle}>{t("unlockNow")}</Text>
                <Text style={styles.unlockDesc}>{t("unlockQuizDesc")}</Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={loading}
                  onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setLoading(true);
                    if (!user) return;
                    if (user?.stars >= PRICES.quizzes.single.price.trophies) {
                      try {
                        const result = await buyShopItem(
                          quiz._id,
                          "quiz",
                          "stars"
                        );

                        if (result.success) {
                          // The backend handles the payment and unlocking
                          await queryClient.invalidateQueries({
                            queryKey: ["userProgress"],
                          });
                          await refreshUser();
                          Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success
                          );
                        } else {
                          // Handle failure (e.g., balance mismatch, already owned)
                          alert(result.message || t("purchaseFailed"));
                          Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Error
                          );
                        }
                      } catch (err) {
                        console.log(err);
                        Haptics.notificationAsync(
                          Haptics.NotificationFeedbackType.Error
                        );
                      }
                    } else {
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Error
                      );
                    }
                    setLoading(false);
                  }}
                  style={styles.unlockButton}
                >
                  <LinearGradient
                    colors={["#FFB11F", "#FF8C00"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.unlockGradient}
                  >
                    {loading ? (
                      <Loader />
                    ) : (
                      <View style={styles.unlockButtonContent}>
                        <Trophy width={24} height={24} color="#fff" />
                        <Text style={styles.unlockButtonText}>
                          {PRICES.quizzes.single.price.trophies} {t("trophys")}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Start Button Overlay */}
      {isUnlocked && (
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={[styles.footer, { bottom: 30 }]}
          collapsable={false}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.replace({
                pathname: "/quizLevel/[id]/[section]",
                params: {
                  id: quiz._id,
                  section: selectedLevelIndex,
                },
              });
            }}
            activeOpacity={0.9}
            style={styles.startButton}
          >
            <LinearGradient
              colors={["#4A00E0", "#8E2DE2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startGradient}
            >
              <Text style={styles.startButtonText}>{t("startQuiz")}</Text>
              <View style={styles.startIcon}>
                <Feather name="play" size={20} color="#fff" fill="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const LevelCard = ({
  lvl,
  index,
  isSelected,
  currentProgress,
  onSelect,
  t,
}: any) => {
  const sectionSummary = currentProgress?.sections?.[index] || {
    questions: 0,
    rewards: 0,
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const progressPercent = Math.floor(
    (sectionSummary.questions / lvl.questions.length) * 100
  );

  return (
    <Animated.View style={[styles.levelCardWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => (scale.value = 0.96)}
        onPressOut={() => (scale.value = 1)}
        onPress={onSelect}
        style={[styles.levelCard, isSelected && styles.levelCardActive]}
      >
        <View style={styles.levelHeader}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{t(lvl.difficulty)}</Text>
          </View>
          {progressPercent === 100 && (
            <View style={styles.completedBadge}>
              <Feather name="check" size={12} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.levelBody}>
          <View style={styles.levelStatItem}>
            <View style={styles.levelStatLabelRow}>
              <Text style={styles.levelStatLabel}>{t("progress")}</Text>
              <Text style={styles.levelStatValue}>
                {sectionSummary.questions}/{lvl.questions.length}
              </Text>
            </View>
            <View style={styles.levelProgressBar}>
              <ProgressBar
                color="#fff"
                progress={sectionSummary.questions}
                total={lvl.questions.length}
                height={3}
              />
            </View>
          </View>

          <View style={styles.levelStatItem}>
            <View style={styles.levelStatLabelRow}>
              <Text style={styles.levelStatLabel}>{t("rewards")}</Text>
              <Text style={styles.levelStatValue}>
                {sectionSummary.rewards}/{lvl.rewards}
              </Text>
            </View>
            <View style={styles.levelProgressBar}>
              <ProgressBar
                color={Colors.dark.secondary}
                progress={sectionSummary.rewards}
                total={lvl.rewards}
                height={3}
              />
            </View>
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <View style={styles.selectedDot} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.bg_dark,
  },
  // Header
  header: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 30,
  },
  logoWrapper: {
    position: "relative",
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 4,
  },
  logoInner: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  lockBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#FF8C00",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1a1a1a",
  },
  titleInfo: {
    flex: 1,
    gap: 8,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    fontFamily: REGULAR_FONT,
    letterSpacing: -0.5,
  },
  companyBadge: {
    backgroundColor: "rgba(255,255,255,0.05)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  companyText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontFamily: REGULAR_FONT,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontFamily: REGULAR_FONT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  statSubText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontFamily: REGULAR_FONT,
  },
  rewardsIconWrapper: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,177,31,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statBarWrapper: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
  },
  // Body
  body: {
    padding: 20,
  },
  levelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  levelCardWrapper: {
    width: (WIDTH - 56) / 2,
  },
  levelCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    minHeight: 160,
  },
  levelCardActive: {
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  completedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.dark.success,
    justifyContent: "center",
    alignItems: "center",
  },
  levelBody: {
    gap: 16,
  },
  levelStatItem: {
    gap: 6,
  },
  levelStatLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelStatLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
  },
  levelStatValue: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "700",
  },
  levelProgressBar: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
  },
  selectedIndicator: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  // Unlock Section
  unlockSection: {
    marginTop: 40,
  },
  unlockCard: {
    backgroundColor: Colors.dark.bg,
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  unlockTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
    fontFamily: REGULAR_FONT,
  },
  unlockDesc: {
    fontSize: 14,
    color: Colors.dark.text_muted,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: REGULAR_FONT,
    lineHeight: 20,
  },
  unlockButton: {
    width: "100%",
    height: 60,
    borderRadius: 20,
    overflow: "hidden",
  },
  unlockGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  unlockButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  unlockButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  startButton: {
    height: 64,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#4A00E0",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  startGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    fontFamily: REGULAR_FONT,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  startIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
  },
  txt: {
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
  },
});

export default Quiz;
