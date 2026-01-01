import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
  RefreshControl,
} from "react-native";
import {
  WeeklyEventResponse,
  WeeklyEventNodeSummary,
  WeeklyEventNodeStatus,
} from "@/types";
import { useUser } from "@/context/userContext";
import { fetchWeeklyEvent } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import WeeklyEventLogo from "@/assets/svgs/weeklyEvent.svg";
import { isSmallPhone } from "@/constants/Dimensions";
import { LineDashed } from "@/components/ui/Line";
import CircularProgress from "@/components/ui/CircularProgress";
import { REGULAR_FONT } from "@/constants/Styles";
import LockIcon from "@/assets/svgs/lock.svg";
import { useTranslation } from "react-i18next";
import Loader from "@/components/ui/Loader";
import ArrBack from "@/components/ui/ArrBack";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Journey Configuration
const NODE_SIZE = 80;
const VERTICAL_SPACING = 140;
const WAVE_AMPLITUDE = SCREEN_WIDTH * 0.25; // How wide the zigzag goes
const TOP_PADDING = 40;
const BOTTOM_PADDING = 80;

const WeeklyEventScreen: React.FC = () => {
  const { token } = useUser();
  const { t } = useTranslation();
  const [containerHeight, setContainerHeight] = useState(0);

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
    // 0 = Center
    // 1 = Right
    // 2 = Center
    // 3 = Left
    // 4 = Center ...
    // Using simple Sine wave logic or straight zigzag logic?
    // Let's do a Sine wave for smoothness.
    // Period = ? We want it to go Center -> Right -> Center -> Left -> Center in 4 steps?
    // index: 0(C) -> 1(R) -> 2(C) -> 3(L) -> 4(C)
    // sin(0) = 0
    // sin(PI/2) = 1
    // sin(PI) = 0
    // sin(3PI/2) = -1
    // So angle = index * (Math.PI / 2)

    const xOffset = Math.sin(index * (Math.PI / 2)) * WAVE_AMPLITUDE;
    const x = SCREEN_WIDTH / 2 + xOffset; // Center reference is screen center
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
        // Curve to next point
        const prevPos = getNodePosition(i - 1);
        const midY = (prevPos.y + pos.y) / 2;

        // Cubic bezier for smooth vertical connection
        // Control point 1: (prevX, midY) - keeps it vertical-ish leaving the node
        // Control point 2: (currX, midY) - arrives vertical-ish at next node
        path += `C ${prevPos.x} ${midY}, ${pos.x} ${midY}, ${pos.x} ${pos.y} `;
      }
    });
    return path;
  }, [data?.nodes]);

  const renderNode = (node: WeeklyEventNodeSummary, index: number) => {
    const { x, y } = getNodePosition(index);
    const xOffset = x - SCREEN_WIDTH / 2;
    const isLocked = node.status === "locked";

    // Small position adjust to center the node div (since x,y is center point)
    const left = x - NODE_SIZE / 2;
    const top = y - NODE_SIZE / 2;

    const statusLabel: Record<WeeklyEventNodeStatus, string> = {
      locked: t("locked") || "Locked",
      unlocked: t("play") || "Play",
      completed: t("done") || "Done",
    };

    // Determine label position (Left or Right of the node)
    let isLabelLeft = false;

    if (xOffset > 10) {
      isLabelLeft = true;
    } else if (xOffset < -10) {
      isLabelLeft = false;
    } else {
      isLabelLeft = index % 4 === 0;
    }

    return (
      <View
        key={node.index}
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
          <Text style={styles.nodeIndex}>Level {index + 1}</Text>
          <Text
            style={[styles.nodeTitle, isLocked && styles.textMuted]}
            numberOfLines={2}
          >
            {isLocked ? statusLabel.locked : node.title}
          </Text>
        </View>
      </View>
    );
  };

  // --- End Journey Logic ---

  if ((isLoading || !token) && !data) {
    return (
      <View style={styles.centered}>
        <Loader />
      </View>
    );
  }

  if (errorMessage && !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No weekly event available.</Text>
      </View>
    );
  }

  const { event, progress } = data;
  const startDate = new Date(event.startsAt);
  const endDate = new Date(event.endsAt);
  const totalHeight = TOP_PADDING + data.nodes.length * VERTICAL_SPACING;

  return (
    <View style={styles.screen}>
      <ArrBack onPress={() => router.replace("/(tabs)/(events)")} />

      {/* Header Section (Static) */}
      <View style={{ alignItems: "center", gap: 10, marginBottom: 10 }}>
        <WeeklyEventLogo width={200} height={60} />
        <Text style={[styles.txtMuted, { fontSize: 13 }]}>
          {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
        </Text>
        <View style={styles.headerCard}>
          <View style={styles.progressRow}>
            <View>
              <Text style={[styles.txt, styles.headerTitle]}>
                {event.title}
              </Text>
              <Text style={[styles.txtMuted, { fontSize: 12 }]}>
                {event.description}
              </Text>
            </View>
            <CircularProgress
              progress={
                progress.fullCompletionRewardClaimed
                  ? 10
                  : progress.currentNodeIndex
              }
              total={data.nodes.length}
              size={50}
              strokeWidth={3}
              fontSize={12}
              percent={false}
            />
          </View>
          {progress.fullCompletionRewardClaimed && (
            <Text style={styles.completedBadge}>ALL COMPLETED!</Text>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 50 }}
        style={{ width: "100%" }}
        // refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
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
              <LinearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop
                  offset="0"
                  stopColor={Colors.dark.primary}
                  stopOpacity="0.6"
                />
                <Stop
                  offset="1"
                  stopColor={Colors.dark.secondary}
                  stopOpacity="0.2"
                />
              </LinearGradient>
            </Defs>
            {/* Draw the full path first (background track) */}
            <Path
              d={journeyPath}
              stroke={Colors.dark.border_muted}
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Draw the 'active' path - overlay logic is complex for individual segments,
                     so for now let's just color the whole line slightly or use segments.
                     Refinement: Draw individual segments to color Completed vs Locked differently?
                  */}
            {data.nodes.map((_, i) => {
              if (i === 0) return null;
              const prevNode = data.nodes[i - 1];
              // Connect prevNode to currNode
              const prevPos = getNodePosition(i - 1);
              const currPos = getNodePosition(i);
              const midY = (prevPos.y + currPos.y) / 2;
              const segmentPath = `M ${prevPos.x} ${prevPos.y} C ${prevPos.x} ${midY}, ${currPos.x} ${midY}, ${currPos.x} ${currPos.y}`;

              const isPathActive =
                prevNode.status === "completed" ||
                prevNode.status === "unlocked";
              // If previous node is completed, the path to the current one is 'traversed' (or at least unlocked)

              return (
                <Path
                  key={`path-${i}`}
                  d={segmentPath}
                  stroke={isPathActive ? Colors.dark.info : "transparent"} // Colored overlay
                  strokeWidth={4}
                  fill="none"
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

// 3D Button Component
import { Feather } from "@expo/vector-icons";

// Map node types to Feather icon names
const getIconName = (type?: string): keyof typeof Feather.glyphMap => {
  switch (type) {
    case "mini_quiz":
      return "cpu"; // Brain-like
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
      return "play"; // gamepad isn't in feather, using play or box
  }
};

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

  // Colors
  let mainColor = Colors.dark.bg_light;
  let depthColor = Colors.dark.border;
  let borderColor = Colors.dark.border;
  let iconColor = Colors.dark.text; // Default Icon/Text color

  if (isCompleted) {
    mainColor = "#22c55e"; // Green
    depthColor = "#14532d"; // Dark Green
    borderColor = "#15803d";
    iconColor = "#ffffff";
  } else if (isUnlocked) {
    mainColor = Colors.dark.primary; // Filled Primary
    depthColor = "#0c4a6e"; // Darker Blue/Cyan shade
    borderColor = Colors.dark.primary;
    iconColor = "#ffffff"; // White icon on primary
  } else {
    // Locked
    mainColor = Colors.dark.bg_light;
    depthColor = "#404040"; // Darker Gray
    borderColor = Colors.dark.border;
    iconColor = Colors.dark.text_muted;
  }

  const iconName = getIconName(node.type);

  return (
    <View style={{ width: NODE_SIZE, height: NODE_SIZE }}>
      {/* Depth Layer (Static at bottom) */}
      <View
        style={[
          styles.node3DDepth,
          {
            backgroundColor: depthColor,
            borderColor: borderColor, // Optional: border for the depth too to match
          },
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
            {
              backgroundColor: mainColor,
              borderColor: borderColor,
            },
          ]}
        >
          {isLocked ? (
            <LockIcon width={24} height={24} color={iconColor} />
          ) : (
            <Feather name={iconName} size={32} color={iconColor} />
          )}

          {/* Glare/Highlight effect for 3D curved look */}
          <View style={styles.nodeGlare} />

          {/* Pulse effect for current unlocked level - White Glow since bg is primary */}
          {isUnlocked && <LoopingPulse />}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const LoopingPulse = () => {
  const scale = useSharedValue(1);

  // Setup animation loop
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1, // Infinite
      true // Reverse
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
  txt: {
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  txtMuted: { color: Colors.dark.text_muted, fontFamily: REGULAR_FONT },
  textMuted: { color: Colors.dark.text_muted },
  screen: {
    backgroundColor: Colors.dark.bg_dark,
    height: "100%",
    alignItems: "center",
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.bg_dark,
  },
  errorText: {
    color: "#fca5a5",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#6366f1",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  headerCard: {
    width: "90%",
    padding: 15,
    borderRadius: 20,
    backgroundColor: Colors.dark.bg,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    maxWidth: "80%",
  },
  completedBadge: {
    fontSize: 12,
    color: "#4ade80",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },

  // Journey Styles
  nodeContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    // overflow: 'visible' // Allow labels to spill out
  },
  nodeLabelContainer: {
    position: "absolute",
    // top: '105%' removed
    width: 120, // constrain width
    justifyContent: "center",
  },
  labelLeft: {
    right: "115%", // Push to left of node
    alignItems: "center", // Align text to right (towards node)
  },
  labelRight: {
    left: "115%", // Push to right of node
    alignItems: "center", // Align text to left (towards node)
  },
  nodeIndex: {
    color: Colors.dark.secondary,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  nodeTitle: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center", // Justify handled by flex-start/end
  },
  // 3D Button Styles
  node3DDepth: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 6, // Shifted down to appear as depth
    borderRadius: 999,
    borderWidth: 0, // Depth doesn't strictly need a border if the color is distinct
  },
  node3DSurface: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6, // Initial offset to show the depth layer
  },
  nodeGlare: {
    position: "absolute",
    top: 5,
    width: "60%",
    height: "40%",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  nodeEmoji: {
    fontSize: 32,
  },
  pulseCircle: {
    borderRadius: 999,
    backgroundColor: "white", // Glow white on primary background
    zIndex: -1,
  },
});

export default WeeklyEventScreen;
