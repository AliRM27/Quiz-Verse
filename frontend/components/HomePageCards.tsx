import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { WIDTH, HEIGHT, myHeight, myWidth } from "@/constants/Dimensions";
import { defaultStyles } from "@/constants/Styles";
import CircularProgress from "@/components/ui/CircularProgress";
import * as Haptics from "expo-haptics";
import RotatingGradient from "./ui/gradients/GlowingView";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProgress } from "@/services/api";
import QuizLogo from "@/components/ui/QuizLogo";
import { useUser } from "@/context/userContext";
import { REGULAR_FONT } from "@/constants/Styles";
import Info from "./ui/Info";
import { useTranslation } from "react-i18next";
import ProgressBar from "./animatinos/progressBar";
import { router } from "expo-router";
import Loader from "./ui/Loader";
import { isSmallPhone } from "@/constants/Dimensions";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Trophy from "@/assets/svgs/trophy.svg";

const ITEM_WIDTH = HEIGHT * (150 / myHeight);
const ITEM_SPACING = (WIDTH - ITEM_WIDTH) / 2;

export default function HomePageCards() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const { user, loading, lastIndexCard, setLastIndexRef } = useUser();
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollToCard = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }, []);

  const { t } = useTranslation();

  const {
    data: progressData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id && !loading,
  });

  const { height } = useWindowDimensions();

  const unlockedQuizzes = progressData?.unlockedQuizzes || [];
  const progressList = progressData?.progress || [];
  const quiz = unlockedQuizzes[currentIndex]?.quizId;

  const currentProgress = useMemo(() => {
    if (!quiz?._id) return undefined;
    return progressList.find((quizObj: any) => quizObj.quizId._id === quiz._id);
  }, [progressList, quiz]);

  useEffect(() => {
    if (flatListRef.current && lastIndexCard > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: lastIndexCard,
          animated: false,
        });
      }, 0);
      setCurrentIndex(lastIndexCard);
    }
  }, []);

  if (loading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={32} color={Colors.dark.text_muted} />
        <Text style={styles.errorText}>Failed to load quizzes</Text>
      </View>
    );
  }

  if (!unlockedQuizzes || unlockedQuizzes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="lock" size={32} color={Colors.dark.text_muted} />
        <Text style={styles.emptyText}>No quizzes unlocked yet.</Text>
      </View>
    );
  }

  const progressPercent =
    quiz?.questionsTotal > 0
      ? Math.floor(
          ((currentProgress?.questionsCompleted || 0) / quiz.questionsTotal) *
            100
        )
      : 0;

  return (
    <View style={defaultStyles.container}>
      {/* Quiz Cards Carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={unlockedQuizzes}
        keyExtractor={(item) => item._id || item.quizId._id}
        horizontal
        maxToRenderPerBatch={5}
        windowSize={5}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: ITEM_SPACING }}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        bounces={true}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event: any) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / ITEM_WIDTH
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }: any) => {
          const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cardTouchable}
                onPress={() => {
                  if (index === currentIndex) {
                    setLastIndexRef(index);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push({
                      pathname: "/(quizzes)/quiz",
                      params: { id: quiz._id },
                    });
                    return;
                  }
                  Haptics.selectionAsync();
                  setLastIndexRef(index);
                  scrollToCard(index);
                }}
              >
                <RotatingGradient isOn={index === currentIndex}>
                  <View style={styles.logoContainer}>
                    <QuizLogo name={item.quizId.logoFile} />
                  </View>
                </RotatingGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      {/* Quiz Title */}
      <Text
        style={[
          styles.quizTitle,
          { marginVertical: Math.max(height * 0.01, 8) },
          isSmallPhone && { fontSize: 22 },
        ]}
      >
        {quiz?.title}
      </Text>

      {/* Quiz Info */}
      <View style={styles.infoContainer}>
        <Text
          style={{
            fontFamily: REGULAR_FONT,
            color: Colors.dark.text_muted,
            fontSize: 11,
            textAlign: "center",
          }}
        >
          <Info company={quiz?.company} title={quiz?.title} />
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={[styles.statsContainer, isSmallPhone && { minHeight: 110 }]}>
        {/* Progress Card */}
        <View style={styles.statCard}>
          <LinearGradient
            colors={["rgba(102, 126, 234, 0.1)", "rgba(118, 75, 162, 0.05)"]}
            style={styles.statCardGradient}
          />
          <View style={styles.statHeader}>
            <Feather name="bar-chart-2" size={14} color={Colors.dark.primary} />
            <Text style={styles.statTitle}>{t("progress")}</Text>
          </View>
          <View style={styles.statContent}>
            <CircularProgress
              progress={progressPercent}
              size={48}
              strokeWidth={3}
              fontSize={12}
              color={Colors.dark.border_muted}
            />
          </View>
        </View>

        {/* Rewards Card */}
        <View style={[styles.statCard, { flex: 1.2 }]}>
          <LinearGradient
            colors={["rgba(255, 177, 31, 0.1)", "rgba(255, 177, 31, 0.02)"]}
            style={styles.statCardGradient}
          />
          <View style={styles.statHeader}>
            <Trophy width={14} height={14} color={Colors.dark.secondary} />
            <Text style={styles.statTitle}>{t("rewards")}</Text>
          </View>
          <View style={styles.rewardContent}>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                color={Colors.dark.secondary}
                total={quiz?.rewardsTotal || 0}
                progress={currentProgress?.rewardsTotal || 0}
                height={3}
              />
            </View>
            <Text style={styles.rewardText}>
              {currentProgress?.rewardsTotal || 0} / {quiz?.rewardsTotal || 0}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: "82%",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: Colors.dark.text_muted,
    fontSize: 14,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.dark.text_muted,
    fontSize: 14,
  },
  card: {
    width: ITEM_WIDTH,
    alignItems: "center",
  },
  cardTouchable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  logoContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    overflow: "hidden",
    borderRadius: 16,
  },
  quizTitle: {
    color: Colors.dark.text,
    fontSize: 26,
    fontFamily: REGULAR_FONT,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 16,
    width: "65%",
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 120,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    overflow: "hidden",
  },
  statCardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
  statTitle: {
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: REGULAR_FONT,
    fontWeight: "600",
  },
  statContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardContent: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
  },
  progressBarContainer: {
    width: "100%",
    backgroundColor: Colors.dark.border_muted,
    borderRadius: 10,
    overflow: "hidden",
  },
  rewardText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  playButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
