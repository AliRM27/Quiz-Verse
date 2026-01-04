import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";
import Trophy from "@/assets/svgs/trophy.svg";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import CircularProgress from "@/components/ui/CircularProgress";
import ProgressBar from "@/components/animatinos/progressBar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
// Icon mapping for node types
const getIconName = (type?: string): keyof typeof Feather.glyphMap => {
  switch (type) {
    case "mini_quiz":
      return "cpu";
    case "time_challenge":
      return "zap";
    case "true_false_sprint":
      return "check-square";
    case "survival":
      return "shield";
    case "mixed_gauntlet":
      return "shuffle";
    case "emoji_puzzle":
      return "smile";
    case "quote_guess":
      return "message-square";
    case "vote":
      return "thumbs-up";
    default:
      return "play";
  }
};

// Gradient colors for each node type
const getGradientColors = (type?: string): [string, string] => {
  switch (type) {
    case "mini_quiz":
      return ["#667eea", "#764ba2"];
    case "time_challenge":
      return ["#f59e0b", "#d97706"];
    case "true_false_sprint":
      return ["#22c55e", "#16a34a"];
    case "survival":
      return ["#ef4444", "#dc2626"];
    case "mixed_gauntlet":
      return ["#8b5cf6", "#6d28d9"];
    case "emoji_puzzle":
      return ["#f093fb", "#f5576c"];
    case "quote_guess":
      return ["#4facfe", "#00f2fe"];
    case "vote":
      return ["#a855f7", "#7c3aed"];
    default:
      return ["#667eea", "#764ba2"];
  }
};

const WeeklyEventNodeScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    nodeIndex,
    nodeType,
    nodeTitle,
    nodeDescription,
    nodeReward,
    nodeConfig,
    questionsCorrect,
    trophiesCollected,
  } = useLocalSearchParams<{
    nodeIndex?: string;
    nodeType?: string;
    nodeTitle?: string;
    nodeDescription?: string;
    nodeIcon?: string;
    nodeReward?: string;
    nodeConfig?: string;
    questionsCorrect?: string;
    trophiesCollected?: string;
  }>();

  const nodeDataResponse = useMemo(() => {
    try {
      return {
        reward: nodeReward ? JSON.parse(nodeReward as string) : null,
        config: nodeConfig ? JSON.parse(nodeConfig as string) : null,
      };
    } catch (e) {
      return { reward: null, config: null };
    }
  }, [nodeReward, nodeConfig]);

  const resolvedNodeIndex = Number(nodeIndex ?? 0);
  const resolvedNodeTitle = nodeTitle ?? "Weekly Event Node";

  const [isPending, setIsPending] = useState(false);

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

  const handleStart = () => {
    setIsPending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    router.dismiss();

    setTimeout(
      () =>
        router.push({
          pathname: "/quizLevel/weekly/[nodeIndex]",
          params: {
            nodeIndex: resolvedNodeIndex,
            nodeTitle: resolvedNodeTitle,
            nodeType: nodeType,
          },
        }),
      0
    );

    setIsPending(false);
  };

  const iconName = getIconName(nodeType);
  const gradientColors = getGradientColors(nodeType);

  // Calculate progress
  const totalQuestions =
    nodeType === "vote"
      ? 1
      : nodeType === "emoji_puzzle"
        ? nodeDataResponse.config?.emojiPuzzles?.length || 1
        : nodeType === "quote_guess"
          ? nodeDataResponse.config?.quotes?.length || 1
          : nodeDataResponse.config?.quizConfig?.totalQuestions || 10;

  const progressPercent = Math.floor(
    ((Number(questionsCorrect) || 0) / totalQuestions) * 100
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Icon with Gradient Background */}
      <Animated.View entering={FadeInDown.delay(0).springify()}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <View style={styles.iconGlow} />
          <Feather name={iconName} size={48} color="#fff" />
        </LinearGradient>
      </Animated.View>

      {/* Text Content */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.textContainer}
      >
        <View style={[styles.typeBadge, { borderColor: gradientColors[0] }]}>
          <Text style={[styles.typeBadgeText, { color: gradientColors[0] }]}>
            {formatNodeType(nodeType)}
          </Text>
        </View>
        <Text style={styles.title}>{resolvedNodeTitle}</Text>
        <Text style={styles.description}>
          {nodeDescription ||
            "Complete this challenge to proceed further in the journey."}
        </Text>
      </Animated.View>

      {/* Divider */}
      <Animated.View
        entering={FadeIn.delay(200).springify()}
        style={styles.divider}
      >
        <View style={styles.dividerLine} />
        <View
          style={[styles.dividerDot, { backgroundColor: gradientColors[0] }]}
        />
        <View style={styles.dividerLine} />
      </Animated.View>

      {/* Stats Cards */}
      <Animated.View
        entering={FadeInDown.delay(250).springify()}
        style={styles.chartsContainer}
      >
        {/* Progress Card */}
        <View style={styles.chartCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
            style={styles.chartCardGradient}
          />
          <Text style={styles.chartTitle}>{t("progress")}</Text>
          <View style={styles.chartContent}>
            <CircularProgress
              progress={progressPercent}
              size={56}
              strokeWidth={4}
              fontSize={14}
              color={Colors.dark.border_muted}
            />
          </View>
        </View>

        {/* Rewards Card */}
        <View style={styles.chartCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
            style={styles.chartCardGradient}
          />
          <Text style={styles.chartTitle}>{t("rewards")}</Text>
          <View style={styles.rewardContent}>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                color={Colors.dark.secondary}
                progress={Number(trophiesCollected) || 0}
                total={nodeDataResponse.reward?.trophies || 0}
                height={4}
              />
            </View>
            <View style={styles.rewardRow}>
              <Trophy color={Colors.dark.secondary} width={16} height={16} />
              <Text style={styles.rewardText}>
                {Number(trophiesCollected) || 0} /{" "}
                {nodeDataResponse.reward?.trophies || 0}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Info Row */}
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={styles.infoRow}
      >
        <View style={styles.infoItem}>
          <Feather
            name="bar-chart-2"
            size={18}
            color={Colors.dark.text_muted}
          />
          <View>
            <Text style={styles.infoLabel}>{t("difficulty")}</Text>
            <Text style={styles.infoValue}>
              {t(getDifficultyLabel(nodeDataResponse.config))}
            </Text>
          </View>
        </View>
        <View style={styles.infoSeparator} />
        <View style={styles.infoItem}>
          <Feather name="clock" size={18} color={Colors.dark.text_muted} />
          <View>
            <Text style={styles.infoLabel}>{t("duration")}</Text>
            <Text style={styles.infoValue}>
              {getDurationLabel(nodeDataResponse.config)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Start Button */}
      <Animated.View
        entering={FadeInDown.delay(350).springify()}
        style={styles.footer}
      >
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={1}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            onPress={handleStart}
            disabled={isPending}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>{t("start")}</Text>
                  <Feather name="play" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

function formatNodeType(type?: string) {
  if (!type) return "Challenge";
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDifficultyLabel(config: any) {
  if (config?.quizConfig?.allowedDifficulties?.length > 0) {
    const diff = config.quizConfig.allowedDifficulties[0];
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  }
  return "—";
}

function getDurationLabel(config: any) {
  if (config?.modeConfig?.timeLimitSeconds) {
    const min = Math.ceil(config.modeConfig.timeLimitSeconds / 60);
    return `~${min} min`;
  }
  return "~2 min";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
  },
  content: {
    flexGrow: 1,
    paddingTop: 40,
    gap: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  // Icon
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  iconGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
  },
  // Text
  textContainer: {
    alignItems: "center",
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark.text,
    textAlign: "center",
    fontFamily: REGULAR_FONT,
  },
  description: {
    fontSize: 15,
    color: Colors.dark.text_muted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border_muted,
  },
  dividerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Charts
  chartsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  chartCard: {
    flex: 1,
    backgroundColor: Colors.dark.bg_light,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  chartCardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.text_muted,
    marginBottom: 12,
    fontFamily: REGULAR_FONT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardContent: {
    width: "100%",
    gap: 10,
    flex: 1,
    justifyContent: "center",
  },
  progressBarContainer: {
    width: "100%",
    backgroundColor: Colors.dark.border_muted,
    borderRadius: 10,
    overflow: "hidden",
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: "700",
  },
  // Info Row
  infoRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.dark.bg_light,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoSeparator: {
    width: 1,
    height: 30,
    backgroundColor: Colors.dark.border_muted,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.dark.text_muted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "700",
    marginTop: 2,
  },
  // Footer
  footer: {
    width: "100%",
    marginTop: "auto",
    paddingTop: 20,
  },
  button: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default WeeklyEventNodeScreen;
