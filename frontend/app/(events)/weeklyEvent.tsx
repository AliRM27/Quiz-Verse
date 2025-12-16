import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
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
import { useTranslation } from "react-i18next";
import Loader from "@/components/ui/Loader";
import ArrBack from "@/components/ui/ArrBack";
import ProgressBar from "@/components/animatinos/progressBar";

const WeeklyEventScreen: React.FC = () => {
  const { token } = useUser();
  const { t } = useTranslation();

  const { data, isLoading, isError, error, refetch, isRefetching } =
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

    router.push({
      pathname: "/quizLevel/WeeklyEventNodeScreen",
      params: {
        nodeIndex: node.index,
        nodeType: node.type,
        nodeTitle: node.title,
      },
    });
  };

  const renderNode = ({ item }: { item: WeeklyEventNodeSummary }) => {
    const isUnlocked = item.status === "unlocked";
    const isCompleted = item.status === "completed";

    const statusLabel: Record<WeeklyEventNodeStatus, string> = {
      locked: "Locked",
      unlocked: "Ready",
      completed: "Completed",
    };

    return (
      <TouchableOpacity
        key={item.index}
        style={[
          styles.nodeCard,
          isCompleted && styles.nodeCardCompleted,
          item.status === "locked" && styles.nodeCardLocked,
        ]}
        onPress={() => handleNodePress(item)}
        activeOpacity={item.status === "locked" ? 1 : 0.8}
      >
        <View style={styles.nodeIconContainer}>
          <Text style={styles.nodeIcon}>{item.iconKey || "🎮"}</Text>
        </View>

        <View style={styles.nodeContent}>
          <View style={styles.nodeHeaderRow}>
            <Text style={styles.nodeIndex}>Node {item.index + 1}</Text>
            <Text
              style={[
                styles.nodeStatus,
                isUnlocked && styles.nodeStatusUnlocked,
                isCompleted && styles.nodeStatusCompleted,
              ]}
            >
              {statusLabel[item.status]}
            </Text>
          </View>

          <Text style={styles.nodeTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.nodeDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.nodeFooterRow}>
            <Text style={styles.nodeType}>{formatNodeType(item.type)}</Text>

            {item.status !== "locked" && (
              <View
                style={[
                  styles.playButton,
                  isCompleted && styles.playButtonCompleted,
                ]}
              >
                <Text style={styles.playButtonText}>
                  {isCompleted ? "Replay" : "Play"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

  return (
    <View style={styles.screen}>
      <ArrBack />
      <View style={{ alignItems: "center", gap: 20 }}>
        <WeeklyEventLogo width={250} height={80} />
        <Text style={[styles.txtMuted, { fontSize: 15 }]}>
          {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerCard}>
          <Text style={[styles.txt, styles.headerTitle]}>{event.title}</Text>
          {event.theme?.name ? (
            <Text style={[styles.txtAccent, styles.headerSubtitle]}>
              {event.theme.name}
            </Text>
          ) : null}
          {event.description ? (
            <Text style={[styles.txtMuted, styles.headerDescription]}>
              {event.description}
            </Text>
          ) : null}
          <View style={styles.progressRow}>
            <View style={styles.progressPill}>
              <Text style={[styles.txt, { fontSize: 17 }]}>
                {t("progress")}
              </Text>
              <LineDashed />
              <CircularProgress
                progress={progress.currentNodeIndex}
                total={data.nodes.length}
                size={60}
                strokeWidth={3}
                fontSize={15}
                percent={false}
              />
            </View>
            {/* <View style={styles.progressPill}>
              <Text style={[styles.txt, { fontSize: 14 }]}>Weekly rewards</Text>
              <LineDashed />
              <View style={styles.rewardBar}>
                <ProgressBar
                  color={Colors.dark.secondary}
                  progress={progress.currentNodeIndex}
                  total={data.nodes.length}
                  height={2}
                />
              </View>
              <Text style={[styles.txtMuted, { fontSize: 12 }]}>
                {progress.fullCompletionRewardClaimed
                  ? "All claimed"
                  : `${progress.currentNodeIndex} / ${data.nodes.length}`}
              </Text>
            </View> */}
          </View>
          {progress.fullCompletionRewardClaimed && (
            <Text style={styles.completedBadge}>Completed</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.txt, styles.sectionTitle]}>Nodes</Text>
          <View style={{ gap: 12 }}>
            {data.nodes.map((node) =>
              renderNode({
                item: node,
              })
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={[styles.txt, styles.infoTitle]}>{t("howItWorks")}</Text>
          <Text style={[styles.txtMuted, styles.infoText]}>
            {event.description ||
              "Complete each node to unlock the next and claim the weekly rewards."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

function formatNodeType(type: string) {
  switch (type) {
    case "mini_quiz":
      return "Mini Quiz";
    case "time_challenge":
      return "Time Challenge";
    case "true_false_sprint":
      return "True/False Sprint";
    case "survival":
      return "Survival";
    case "mixed_gauntlet":
      return "Mixed Gauntlet";
    case "emoji_puzzle":
      return "Emoji Puzzle";
    case "quote_guess":
      return "Quote Guess";
    case "vote":
      return "Vote";
    default:
      return type;
  }
}

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  txtMuted: { color: Colors.dark.text_muted, fontFamily: REGULAR_FONT },
  txtAccent: { color: Colors.dark.secondary, fontFamily: REGULAR_FONT },
  screen: {
    backgroundColor: Colors.dark.bg_dark,
    height: "100%",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 30,
    gap: 24,
    width: "100%",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.bg_dark,
  },
  loadingText: {
    marginTop: 8,
    color: "#e5e7eb",
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
    width: "100%",
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.dark.bg_light,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 2,
  },
  headerDescription: {
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  progressRow: {
    width: "100%",
    flexDirection: "row",
    height: 150,
    marginTop: 20,
    gap: 10,
  },
  completedBadge: {
    fontSize: 12,
    color: "#4ade80",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  progressPill: {
    width: "100%",
    gap: 15,
    borderRadius: 20,
    backgroundColor: Colors.dark.bg_light,
    borderColor: Colors.dark.border,
    alignItems: "center",
    padding: isSmallPhone ? 13 : 16,
    borderWidth: 1,
  },
  nodeCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.dark.bg_light,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  nodeCardLocked: {
    opacity: 0.5,
  },
  nodeCardCompleted: {
    borderColor: "#22c55e",
  },
  nodeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: Colors.dark.bg_dark,
  },
  nodeIcon: {
    fontSize: 24,
  },
  nodeContent: {
    flex: 1,
  },
  nodeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nodeIndex: {
    fontSize: 12,
    color: Colors.dark.text_muted,
  },
  nodeStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.text_muted,
  },
  nodeStatusUnlocked: {
    color: Colors.dark.primary,
  },
  nodeStatusCompleted: {
    color: "#22c55e",
  },
  nodeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: 4,
  },
  nodeDescription: {
    fontSize: 13,
    color: Colors.dark.text_muted,
    marginTop: 2,
  },
  nodeFooterRow: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  nodeType: {
    fontSize: 12,
    color: Colors.dark.secondary,
  },
  playButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.dark.text,
  },
  playButtonCompleted: {
    backgroundColor: Colors.dark.bg_dark,
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.bg_dark,
  },
  section: {
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  infoCard: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: Colors.dark.bg_light,
    borderColor: Colors.dark.border,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
  },
  rewardBar: {
    width: "90%",
    backgroundColor: Colors.dark.border,
    borderRadius: 6,
    marginTop: 10,
  },
});

export default WeeklyEventScreen;
