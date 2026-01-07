import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/context/userContext";
import { Colors } from "@/constants/Colors";
import SettingsIcon from "@/assets/svgs/settings.svg";
import EditIcon from "@/assets/svgs/edit.svg";
import { REGULAR_FONT, ITALIC_FONT } from "@/constants/Styles";
import QuizLogo from "@/components/ui/QuizLogo";
import React, { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import NextArr from "@/assets/svgs/nextArr.svg";
import PrevArr from "@/assets/svgs/prevArr.svg";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import BookDashed from "@/assets/svgs/book-dashed.svg";
import ProfileCardModal from "@/components/ui/ProfileCardModal";
import Loader from "@/components/ui/Loader";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProgress, fetchUserHistory } from "@/services/api";
import { QuizType } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedScrollHandler,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Trophy from "@/assets/svgs/trophy.svg";
import Gem from "@/assets/svgs/gem.svg";

export default function Profile() {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Shared Value for scroll position
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["userHistory"],
    queryFn: fetchUserHistory,
    enabled: !!user?._id,
  });

  const progressList = progressData?.progress || [];
  const lastPlayed = historyData?.lastPlayed || [];
  const [categroyPressed, setCategoryPressed] = useState<string>("");
  const [currIndex, setCurrIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setCategoryPressed(t("uncompleted"));
    }
  }, [user]);

  const progressMap = useMemo(() => {
    const map = new Map();
    progressList.forEach((p: QuizType) => {
      map.set(p.quizId._id, p);
    });
    return map;
  }, [progressList]);

  // Animated Styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = scrollY.value * 0.5; // Parallax effect
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      "clamp" // Scale up on pull-down
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const safeAreaAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50], // Fade in as user scrolls 50px
      [0, 1],
      "clamp"
    );

    return {
      opacity,
    };
  });

  if (!user || loading || progressLoading || historyLoading)
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );

  let filteredQuizzes = progressList.filter((quiz: any) => {
    if (
      !quiz.completed &&
      !quiz.perfected &&
      categroyPressed === t("uncompleted")
    ) {
      return true;
    } else if (
      categroyPressed === t("completed") &&
      quiz.completed &&
      !quiz.perfected
    ) {
      return true;
    } else if (
      categroyPressed === t("perfect") &&
      quiz.completed &&
      quiz.perfected
    ) {
      return true;
    }
    return false;
  });

  const goNext = () => {
    if (currIndex < filteredQuizzes.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrIndex(currIndex + 1);
    }
  };

  const goPrev = () => {
    if (currIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrIndex(currIndex - 1);
    }
  };

  const currentQuizData = filteredQuizzes[currIndex];
  const currentProgressInfo = progressMap.get(currentQuizData?.quizId._id) || {
    questionsCompleted: 0,
    rewardsTotal: 0,
  };

  return (
    <View style={styles.container}>
      {/* Safe Area Cover - Fades in on scroll */}
      <Animated.View
        style={[
          styles.safeAreaCover,
          { height: insets.top },
          safeAreaAnimatedStyle,
        ]}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <LinearGradient
              colors={["#1A1A1A", "#131313"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
            >
              <View style={styles.headerTop}>
                <TouchableOpacity
                  onPress={() => setIsVisible(true)}
                  activeOpacity={0.8}
                  style={styles.profileImageWrapper}
                >
                  <View
                    style={[
                      styles.profileBorder,
                      { borderColor: user.theme.cardColor },
                    ]}
                  >
                    <View style={styles.profileInner}>
                      <Image
                        src={user?.profileImage}
                        style={styles.profileImage}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={styles.userTitle}>
                    Level {user.level || 1} Explorer
                  </Text>
                </View>

                <View style={styles.headerActions}>
                  <TouchableOpacity
                    onPress={() => router.push("/(settings)/editProfile")}
                    style={styles.actionButton}
                  >
                    <EditIcon width={22} height={22} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push("/(settings)")}
                    style={styles.actionButton}
                  >
                    <SettingsIcon width={22} height={22} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats Bar */}
              <View style={styles.statsBar}>
                <StatItem
                  icon={
                    <Trophy
                      width={20}
                      height={20}
                      color={Colors.dark.secondary}
                    />
                  }
                  label={user.stars}
                  name={t("rewards")}
                />
                <View style={styles.statDivider} />
                <StatItem
                  icon={
                    <Gem width={20} height={20} color={Colors.dark.primary} />
                  }
                  label={user.gems}
                  name={t("gems")}
                />
                <View style={styles.statDivider} />
                <StatItem
                  icon={<Feather name="award" size={20} color="#fff" />}
                  label={progressList.length}
                  name={t("quizzes")}
                />
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Content Container with background to cover parallax gap if any */}
        <View
          style={{
            backgroundColor: Colors.dark.bg_dark,
            zIndex: 1,
            paddingTop: 10,
          }}
        >
          {/* Last Played Section */}
          {lastPlayed.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>{t("lastPlayed")}</Text>
              <View style={styles.lastPlayedContainer}>
                {lastPlayed.slice(0, 2).map((quiz: QuizType, index: number) => (
                  <LastPlayedCard
                    key={index}
                    quiz={quiz}
                    progressMap={progressMap}
                    index={index}
                    t={t}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Collection Section */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("yourQuizzes")}</Text>
              <TouchableOpacity
                onPress={() => router.push("/(quizzes)/collection")}
              >
                <Text style={styles.viewAllText}>{t("viewAll")} →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.collectionContainer}>
              {/* Category Tabs */}
              <View style={styles.tabsContainer}>
                {[t("uncompleted"), t("completed"), t("perfect")].map(
                  (category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setCategoryPressed(category);
                        setCurrIndex(0);
                      }}
                      style={[
                        styles.tabButton,
                        categroyPressed === category && styles.tabButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          categroyPressed === category && styles.tabTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Collection Showcase */}
              <View style={styles.showcaseContainer}>
                {filteredQuizzes.length > 0 ? (
                  <View style={styles.showcaseContent}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        router.push({
                          pathname: "/(quizzes)/quiz",
                          params: { id: currentQuizData.quizId._id },
                        });
                      }}
                      style={styles.showcaseLogoWrapper}
                    >
                      <QuizLogo name={currentQuizData.quizId.logoFile} />
                    </TouchableOpacity>

                    <View style={styles.showcaseInfo}>
                      <Text style={styles.showcaseTitle} numberOfLines={1}>
                        {currentQuizData.quizId.title}
                      </Text>

                      <View style={styles.progressRow}>
                        <View style={styles.statMini}>
                          <Text style={styles.statLabelMini}>
                            {t("progress")}
                          </Text>
                          <View style={styles.miniBar}>
                            <ProgressBar
                              color={Colors.dark.text}
                              total={currentQuizData.quizId.questionsTotal}
                              progress={currentProgressInfo.questionsCompleted}
                              height={4}
                            />
                          </View>
                        </View>

                        <View style={styles.statMini}>
                          <Text style={styles.statLabelMini}>
                            {t("rewards")}
                          </Text>
                          <View style={styles.miniBar}>
                            <ProgressBar
                              color={Colors.dark.secondary}
                              total={currentQuizData.quizId.rewardsTotal}
                              progress={currentProgressInfo.rewardsTotal}
                              height={4}
                            />
                          </View>
                        </View>

                        {categroyPressed === t("completed") && (
                          <View
                            style={[
                              styles.rankBadge,
                              { borderColor: Colors.dark.success },
                            ]}
                          >
                            <Text style={styles.rankText}>A</Text>
                          </View>
                        )}
                        {categroyPressed === t("perfect") && (
                          <View
                            style={[
                              styles.rankBadge,
                              { borderColor: "#ef4444" },
                            ]}
                          >
                            <Text style={styles.rankText}>S</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <BookDashed
                      width={40}
                      height={40}
                      color={Colors.dark.border}
                    />
                    <Text style={styles.emptyText}>{t("noQuizzes")}</Text>
                  </View>
                )}

                {/* Pagination */}
                <View style={styles.pagination}>
                  <TouchableOpacity onPress={goPrev} disabled={currIndex === 0}>
                    <PrevArr
                      width={20}
                      height={20}
                      color={
                        currIndex === 0 ? Colors.dark.border : Colors.dark.text
                      }
                    />
                  </TouchableOpacity>

                  <View style={styles.pageIndicator}>
                    <Text style={styles.pageText}>
                      {filteredQuizzes.length === 0 ? 0 : currIndex + 1} /{" "}
                      {filteredQuizzes.length}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={goNext}
                    disabled={
                      currIndex === filteredQuizzes.length - 1 ||
                      filteredQuizzes.length === 0
                    }
                  >
                    <NextArr
                      width={20}
                      height={20}
                      color={
                        currIndex === filteredQuizzes.length - 1 ||
                        filteredQuizzes.length === 0
                          ? Colors.dark.border
                          : Colors.dark.text
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        <ProfileCardModal isVisible={isVisible} setIsVisible={setIsVisible} />
      </Animated.ScrollView>
    </View>
  );
}

// Sub-components
const StatItem = ({ icon, label, name }: any) => (
  <View style={styles.statItem}>
    {icon}
    <Text style={styles.statValue}>{label}</Text>
    <Text style={styles.statLabel}>{name}</Text>
  </View>
);

const LastPlayedCard = ({ quiz, progressMap, index, t }: any) => {
  const quizId = quiz.quizId;
  const progress = progressMap.get(quizId._id) || {
    questionsCompleted: 0,
    rewardsTotal: 0,
  };

  const percent = Math.floor(
    (progress.questionsCompleted / quizId.questionsTotal) * 100
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: "/(quizzes)/quiz",
          params: { id: quizId._id },
        });
      }}
      style={[
        styles.lastPlayedCard,
        index === 0 && styles.lastPlayedCardBorder,
      ]}
    >
      <View style={styles.lpHeader}>
        <View style={styles.lpLogoWrapper}>
          <QuizLogo name={quizId.logoFile} />
        </View>
        <Text style={styles.lpTitle} numberOfLines={2}>
          {quizId.title}
        </Text>
      </View>

      <View style={styles.lpStats}>
        <View style={styles.lpStatItem}>
          <Text style={styles.lpStatLabel}>{t("progress")}</Text>
          <View style={styles.lpBar}>
            <ProgressBar
              color={Colors.dark.text}
              height={4}
              total={quizId.questionsTotal}
              progress={progress.questionsCompleted}
            />
          </View>
          <Text style={styles.lpPercent}>{percent}%</Text>
        </View>

        <View style={styles.lpStatItem}>
          <Text style={styles.lpStatLabel}>{t("rewards")}</Text>
          <View style={styles.lpBar}>
            <ProgressBar
              color={Colors.dark.secondary}
              height={4}
              total={quizId.rewardsTotal}
              progress={progress.rewardsTotal}
            />
          </View>
          <Text style={styles.lpPercent}>
            {progress.rewardsTotal}/{quizId.rewardsTotal}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.bg_dark,
  },
  // Header
  header: {
    width: "100%",
    marginBottom: 20,
  },
  headerGradient: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  profileImageWrapper: {
    transform: [{ rotate: "45deg" }],
    padding: 3,
  },
  profileBorder: {
    borderWidth: 3,
    borderRadius: 22,
    padding: 3,
  },
  profileInner: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 76,
    height: 76,
    transform: [{ rotate: "-45deg" }],
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  userTitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: REGULAR_FONT,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
  },
  // Stats Bar
  statsBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "center",
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    marginBottom: 16,
  },
  viewAllText: {
    color: Colors.dark.text_muted,
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 16,
  },
  // Last Played
  lastPlayedContainer: {
    flexDirection: "row",
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    overflow: "hidden",
  },
  lastPlayedCard: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  lastPlayedCardBorder: {
    borderRightWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  lpHeader: {
    alignItems: "center",
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  lpLogoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  lpTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    height: 34,
  },
  lpStats: {
    gap: 10,
  },
  lpStatItem: {
    gap: 4,
  },
  lpStatLabel: {
    fontSize: 11,
    color: Colors.dark.text_muted,
    textTransform: "uppercase",
  },
  lpBar: {
    backgroundColor: Colors.dark.border_muted,
    borderRadius: 4,
  },
  lpPercent: {
    fontSize: 10,
    color: Colors.dark.text,
    fontWeight: "600",
  },
  // Collection
  collectionContainer: {
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.dark.bg_dark,
    padding: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: Colors.dark.text,
  },
  tabText: {
    fontSize: 12,
    color: Colors.dark.text_muted,
    fontWeight: "600",
  },
  tabTextActive: {
    color: Colors.dark.bg,
    fontWeight: "800",
  },
  showcaseContainer: {
    minHeight: 180,
    justifyContent: "space-between",
  },
  showcaseContent: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  showcaseLogoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  showcaseInfo: {
    flex: 1,
    gap: 12,
  },
  showcaseTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark.text,
  },
  progressRow: {
    gap: 10,
  },
  statMini: {
    gap: 4,
  },
  statLabelMini: {
    fontSize: 10,
    color: Colors.dark.text_muted,
    textTransform: "uppercase",
  },
  miniBar: {
    backgroundColor: Colors.dark.border_muted,
    borderRadius: 4,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: -40,
  },
  rankText: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.dark.text,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  pageIndicator: {
    backgroundColor: Colors.dark.bg_dark,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageText: {
    fontSize: 13,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    fontWeight: "600",
  },
  emptyState: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
  },
  safeAreaCover: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.bg_dark,
    zIndex: 100, // Ensure it sits on top of scrolling content
  },
});
