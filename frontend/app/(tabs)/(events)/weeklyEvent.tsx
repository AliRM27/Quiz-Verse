import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  WeeklyEventResponse,
  WeeklyEventNodeSummary,
  WeeklyEventNodeStatus,
} from "@/types";
import { useUser } from "@/context/userContext";
import { fetchWeeklyEvent } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import WeeklyEventLogo from "@/assets/svgs/weeklyEvent.svg";
import CircularProgress from "@/components/ui/CircularProgress";
import { REGULAR_FONT } from "@/constants/Styles";
import LockIcon from "@/assets/svgs/lock.svg";
import { useTranslation } from "react-i18next";
import Loader from "@/components/ui/Loader";
import ArrBack from "@/components/ui/ArrBack";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Journey Configuration
const NODE_SIZE = 80;
const VERTICAL_SPACING = 140;
const WAVE_AMPLITUDE = SCREEN_WIDTH * 0.25;
const TOP_PADDING = 40;

const WeeklyEventScreen: React.FC = () => {
  const { token } = useUser();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, error, refetch } =
    useQuery<WeeklyEventResponse>({
      queryKey: ["weeklyEvent"],
      queryFn: fetchWeeklyEvent,
      enabled: !!token,
    });

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Failed to load weekly event"
    : null;

  const handleNodePress = (node: WeeklyEventNodeSummary) => {
    if (node.status === "locked") return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    router.push({
      pathname: "/quizLevel/WeeklyEventNodeScreen",
      params: {
        nodeIndex: node.index,
        nodeType: node.type,
        nodeTitle: node.title,
        nodeDescription: node.description,
        nodeIcon: node.iconKey,
        nodeReward: JSON.stringify(node.completionReward),
        nodeConfig: JSON.stringify(node.config),
        questionsCorrect: node.questionsCorrect?.toString(),
        trophiesCollected: node.trophiesCollected?.toString(),
      },
    });
  };

  // --- Journey Logic ---
  const getNodePosition = (index: number) => {
    const xOffset = Math.sin(index * (Math.PI / 2)) * WAVE_AMPLITUDE;
    const x = SCREEN_WIDTH / 2 + xOffset;
    const y = TOP_PADDING + index * VERTICAL_SPACING;
    return { x, y };
  };

  const journeyPath = useMemo(() => {
    if (!data?.nodes) return "";

    let path = "";
    data.nodes.forEach((_, i) => {
      const pos = getNodePosition(i);
      if (i === 0) {
        path += `M ${pos.x} ${pos.y} `;
      } else {
        const prevPos = getNodePosition(i - 1);
        const midY = (prevPos.y + pos.y) / 2;
        path += `C ${prevPos.x} ${midY}, ${pos.x} ${midY}, ${pos.x} ${pos.y} `;
      }
    });
    return path;
  }, [data?.nodes]);

  const renderNode = (node: WeeklyEventNodeSummary, index: number) => {
    const { x, y } = getNodePosition(index);
    const xOffset = x - SCREEN_WIDTH / 2;
    const isLocked = node.status === "locked";

    const left = x - NODE_SIZE / 2;
    const top = y - NODE_SIZE / 2;

    const statusLabel: Record<WeeklyEventNodeStatus, string> = {
      locked: t("locked") || "Locked",
      unlocked: t("play") || "Play",
      completed: t("done") || "Done",
    };

    let isLabelLeft = false;
    if (xOffset > 10) {
      isLabelLeft = true;
    } else if (xOffset < -10) {
      isLabelLeft = false;
    } else {
      isLabelLeft = index % 4 === 0;
    }

    return (
      <Animated.View
        key={node.index}
        entering={FadeIn.delay(index * 80).springify()}
        style={[
          styles.nodeContainer,
          { left, top, width: NODE_SIZE, height: NODE_SIZE },
        ]}
      >
        <JourneyNodeButton
          node={node}
          onPress={() => handleNodePress(node)}
          disabled={isLocked}
        />

        <View
          style={[
            styles.nodeLabelContainer,
            isLabelLeft ? styles.labelLeft : styles.labelRight,
          ]}
        >
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {index + 1}</Text>
          </View>
          <Text
            style={[styles.nodeTitle, isLocked && styles.textMuted]}
            numberOfLines={2}
          >
            {isLocked ? statusLabel.locked : node.title}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // --- Loading State ---
  if ((isLoading || !token) && !data) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Loader />
      </View>
    );
  }

  // --- Error State ---
  if (errorMessage && !data) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.errorCard}
        >
          <Feather name="alert-circle" size={48} color="#fca5a5" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // --- No Data State ---
  if (!data) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.errorCard}
        >
          <Feather name="calendar" size={48} color={Colors.dark.text_muted} />
          <Text style={styles.errorText}>No weekly event available.</Text>
        </Animated.View>
      </View>
    );
  }

  const { event, progress } = data;
  const startDate = new Date(event.startsAt);
  const endDate = new Date(event.endsAt);
  const totalHeight = TOP_PADDING + data.nodes.length * VERTICAL_SPACING;
  const completedNodes = data.nodes.filter(
    (n) => n.status === "completed"
  ).length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <ArrBack onPress={() => router.replace("/(tabs)/(events)")} />

      {/* Header Section */}
      <Animated.View
        entering={FadeInDown.delay(0).springify()}
        style={styles.headerContainer}
      >
        <WeeklyEventLogo width={200} height={60} />

        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Feather name="calendar" size={14} color={Colors.dark.primary} />
          <Text style={styles.dateBadgeText}>
            {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
          </Text>
        </View>
      </Animated.View>

      {/* Journey ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Progress Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={["#f093fb", "#f5576c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            {/* Decorative circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Gloss */}
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.glossOverlay}
            />

            <View style={styles.progressRow}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{event.title}</Text>
                <Text style={styles.headerDescription}>
                  {event.description}
                </Text>
              </View>
              <View style={styles.progressCircleContainer}>
                <CircularProgress
                  progress={
                    progress.fullCompletionRewardClaimed
                      ? data.nodes.length
                      : completedNodes
                  }
                  total={data.nodes.length}
                  size={56}
                  strokeWidth={4}
                  fontSize={14}
                  percent={false}
                  color="rgba(255,255,255,0.3)"
                />
              </View>
            </View>

            {progress.fullCompletionRewardClaimed && (
              <View style={styles.completedBadge}>
                <Feather name="award" size={16} color="#4ade80" />
                <Text style={styles.completedBadgeText}>
                  {t("allCompleted").toUpperCase()}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
        <View
          style={{ height: totalHeight, width: "100%", position: "relative" }}
        >
          {/* Path Background */}
          <Svg
            width={SCREEN_WIDTH}
            height={totalHeight}
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <SvgLinearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#f093fb" stopOpacity="0.6" />
                <Stop offset="1" stopColor="#f5576c" stopOpacity="0.2" />
              </SvgLinearGradient>
            </Defs>

            {/* Background track */}
            <Path
              d={journeyPath}
              stroke={Colors.dark.border_muted}
              strokeWidth={16}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active path segments */}
            {data.nodes.map((_, i) => {
              if (i === 0) return null;
              const prevNode = data.nodes[i - 1];
              const prevPos = getNodePosition(i - 1);
              const currPos = getNodePosition(i);
              const midY = (prevPos.y + currPos.y) / 2;
              const segmentPath = `M ${prevPos.x} ${prevPos.y} C ${prevPos.x} ${midY}, ${currPos.x} ${midY}, ${currPos.x} ${currPos.y}`;

              const isPathActive =
                prevNode.status === "completed" ||
                prevNode.status === "unlocked";

              return (
                <Path
                  key={`path-${i}`}
                  d={segmentPath}
                  stroke={isPathActive ? "#f5576c" : "transparent"}
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>

          {/* Nodes */}
          {data.nodes.map((node, i) => renderNode(node, i))}
        </View>
      </ScrollView>
    </View>
  );
};

// Map node types to Feather icon names
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

// Enhanced 3D Button Component
const JourneyNodeButton = ({
  node,
  onPress,
  disabled,
}: {
  node: WeeklyEventNodeSummary;
  onPress: () => void;
  disabled: boolean;
}) => {
  const isUnlocked = node.status === "unlocked";
  const isCompleted = node.status === "completed";
  const isLocked = node.status === "locked";

  const translateY = useSharedValue(0);

  const handlePressIn = () => {
    translateY.value = withTiming(6, { duration: 100 });
    Haptics.selectionAsync();
  };

  const handlePressOut = () => {
    translateY.value = withTiming(0, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Colors with gradient-matching theme
  let mainColor = Colors.dark.bg_light;
  let depthColor = Colors.dark.border;
  let borderColor = Colors.dark.border;
  let iconColor = Colors.dark.text;

  if (isCompleted) {
    mainColor = "#22c55e";
    depthColor = "#14532d";
    borderColor = "#15803d";
    iconColor = "#ffffff";
  } else if (isUnlocked) {
    mainColor = "#f5576c";
    depthColor = "#991b1b";
    borderColor = "#f5576c";
    iconColor = "#ffffff";
  } else {
    mainColor = Colors.dark.bg_light;
    depthColor = "#404040";
    borderColor = Colors.dark.border;
    iconColor = Colors.dark.text_muted;
  }

  const iconName = getIconName(node.type);

  return (
    <View style={{ width: NODE_SIZE, height: NODE_SIZE }}>
      {/* Depth Layer */}
      <View
        style={[
          styles.node3DDepth,
          { backgroundColor: depthColor, borderColor: borderColor },
        ]}
      />

      {/* Main Touchable Layer */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.node3DSurface,
            animatedStyle,
            { backgroundColor: mainColor, borderColor: borderColor },
          ]}
        >
          {isLocked ? (
            <LockIcon width={24} height={24} color={iconColor} />
          ) : (
            <Feather name={iconName} size={32} color={iconColor} />
          )}

          {/* Glare effect */}
          <View style={styles.nodeGlare} />

          {/* Pulse effect for unlocked */}
          {isUnlocked && <LoopingPulse />}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const LoopingPulse = () => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.5,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.pulseCircle, animatedStyle]}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    alignItems: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.bg_dark,
  },
  // Error Card
  errorCard: {
    alignItems: "center",
    gap: 16,
    padding: 32,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    marginHorizontal: 20,
  },
  errorText: {
    color: Colors.dark.text,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#f5576c",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  // Header
  headerContainer: {
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  dateBadge: {
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
  dateBadgeText: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: "500",
  },
  // Header Card
  headerCard: {
    width: SCREEN_WIDTH * 0.9,
    padding: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  decorativeCircle1: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    left: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
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
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
  },
  progressCircleContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    padding: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  completedBadgeText: {
    fontSize: 12,
    color: "#4ade80",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // ScrollView
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    paddingVertical: 30,
    gap: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  // Node Styles
  nodeContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  nodeLabelContainer: {
    position: "absolute",
    width: 120,
    justifyContent: "center",
    gap: 4,
  },
  labelLeft: {
    right: "115%",
    alignItems: "center",
  },
  labelRight: {
    left: "115%",
    alignItems: "center",
  },
  levelBadge: {
    backgroundColor: "rgba(245, 87, 108, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(245, 87, 108, 0.3)",
  },
  levelBadgeText: {
    color: "#f5576c",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nodeTitle: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  textMuted: {
    color: Colors.dark.text_muted,
  },
  // 3D Button Styles
  node3DDepth: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 6,
    borderRadius: 999,
  },
  node3DSurface: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  nodeGlare: {
    position: "absolute",
    top: 5,
    width: "60%",
    height: "40%",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  pulseCircle: {
    borderRadius: 999,
    backgroundColor: "white",
    zIndex: -1,
  },
});

export default WeeklyEventScreen;
