// src/screens/WeeklyEventNodeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { WeeklyEventNodeType } from "@/types";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeWeeklyEventNode } from "@/services/api";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";

import { LineDashed } from "@/components/ui/Line";
import Trophy from "@/assets/svgs/trophy.svg";
import Gem from "@/assets/svgs/gem.svg";
import Timer from "@/assets/svgs/timer.svg"; // Assuming we have this or similar, otherwise use text/emoji
import { useState } from "react";

import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Duplicated mapping for now
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

import CircularProgress from "@/components/ui/CircularProgress";
import ProgressBar from "@/components/animatinos/progressBar";

// ...

const WeeklyEventNodeScreen: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    nodeIndex,
    nodeType,
    nodeTitle,
    nodeDescription,
    nodeIcon,
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

  // Parse JSON params (with safety)
  const nodeDataResponse = React.useMemo(() => {
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

  /* 
  // Mutation removed as completion is handled in Game Screen
  const {
    mutate: completeNode,
    isPending,
    error,
  } = useMutation({
    mutationFn: () => completeWeeklyEventNode(resolvedNodeIndex),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["weeklyEvent"] });
      router.back();
    },
  });
  */
  const [isPending, setIsPending] = useState(false); // Mock for UI consistency if needed or just remove loading state usage
  const error: any = null;

  const handleStart = () => {
    // Navigate to Game Screen
    setIsPending(true);
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Ensure Haptics import or skip if consistent
    // Just navigate

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      collapsable={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.iconContainer}>
        <Feather name={iconName} size={48} color={Colors.dark.text} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.typeBadge}>{formatNodeType(nodeType)}</Text>
        <Text style={styles.title}>{resolvedNodeTitle}</Text>
        <Text style={styles.description}>
          {nodeDescription ||
            "Complete this challenge to proceed further in the journey."}
        </Text>
      </View>

      <LineDashed needMargin={true} margin={24} />

      <View style={styles.chartsContainer}>
        {/* Progress Card (Circular) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{t("progress")}</Text>
          <LineDashed />
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <CircularProgress
              progress={Math.floor(
                ((Number(questionsCorrect) || 0) /
                  (nodeType === "vote"
                    ? 1
                    : nodeType === "emoji_puzzle"
                      ? nodeDataResponse.config?.emojiPuzzles?.length || 1
                      : nodeType === "quote_guess"
                        ? nodeDataResponse.config?.quotes?.length || 1
                        : nodeDataResponse.config?.quizConfig?.totalQuestions ||
                          10)) *
                  100
              )}
              size={50}
              strokeWidth={3}
              fontSize={12}
            />
          </View>
        </View>

        {/* Rewards Card (Linear) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{t("rewards")}</Text>
          <LineDashed />
          <View
            style={{
              width: "100%",
              marginTop: 20,
              backgroundColor: Colors.dark.border_muted,
              borderRadius: 10,
            }}
          >
            <ProgressBar
              color={Colors.dark.secondary}
              progress={Number(trophiesCollected) || 0}
              total={nodeDataResponse.reward?.trophies || 0} // Estimate: Completion + 10 Unlock? Or just Completion
              height={3}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginTop: 10,
            }}
          >
            <Text style={styles.chartSubtitle}>
              {Number(trophiesCollected) || 0} /{" "}
              {nodeDataResponse.reward?.trophies || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Basic Info Row (Difficulty, Duration) */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{t("difficulty")}</Text>
          <Text style={styles.infoValue}>
            {t(getDifficultyLabel(nodeDataResponse.config))}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{t("duration")}</Text>
          <Text style={styles.infoValue}>
            {getDurationLabel(nodeDataResponse.config)}
          </Text>
        </View>
      </View>

      {error && (
        <Text style={styles.error}>
          {error instanceof Error ? error.message : "Failed to start node"}
        </Text>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color={Colors.dark.bg} />
          ) : (
            <Text style={styles.buttonText}>{t("start")}</Text>
          )}
        </TouchableOpacity>
      </View>
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
    // Capitalize first letter of the first difficulty
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
    backgroundColor: Colors.dark.bg,
  },
  content: {
    flexGrow: 1, // Allow content to expand and push footer down
    paddingTop: 30,
    gap: 20,
    paddingHorizontal: 24,
    paddingBottom: 50, // More bottom padding
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.bg_light,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  iconEmoji: {
    fontSize: 48,
  },
  textContainer: {
    alignItems: "center",
    gap: 12,
  },
  typeBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    backgroundColor: "rgba(255, 177, 31, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.dark.text_muted,
    textAlign: "center",
    lineHeight: 24,
  },

  // Charts
  chartsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  chartCard: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    gap: 5,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.dark.text,
    marginBottom: 8,
    fontFamily: REGULAR_FONT,
  },
  chartSubtitle: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: "600",
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingVertical: 12,
    borderRadius: 16,
  },
  infoItem: {
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.dark.text_muted,
    fontWeight: "700",
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: "600",
  },

  error: {
    marginTop: 16,
    color: Colors.dark.danger,
    textAlign: "center",
  },
  footer: {
    width: "100%",
    marginTop: "auto", // Push to bottom of flex container
    paddingTop: 40, // Space from content above
  },
  button: {
    width: "100%",
    backgroundColor: "white", // White Button
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "white",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.dark.bg, // Dark text on white button
    fontSize: 18,
    fontWeight: "700",
  },
});

export default WeeklyEventNodeScreen;
