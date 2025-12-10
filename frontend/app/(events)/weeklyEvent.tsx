// src/screens/WeeklyEventScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  WeeklyEventResponse,
  WeeklyEventNodeSummary,
  WeeklyEventNodeStatus,
} from "@/types";
import { API_URL } from "@/services/config";
import { useUser } from "@/context/userContext";

// Adjust this to your API base
const API_BASE_URL = API_URL;

const WeeklyEventScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [data, setData] = useState<WeeklyEventResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useUser();

  const fetchWeeklyEvent = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      // include auth token if needed
      const res = await fetch(`${API_BASE_URL}api/events/weekly/current`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to load weekly event");
      }

      const json: WeeklyEventResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Error fetching weekly event:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyEvent();
  }, [fetchWeeklyEvent]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWeeklyEvent();
    setRefreshing(false);
  }, [fetchWeeklyEvent]);

  const handleNodePress = (node: WeeklyEventNodeSummary) => {
    if (node.status === "locked") return;

    // Navigate to node play screen (stub for now)
    navigation.navigate("WeeklyEventNode", {
      nodeIndex: node.index,
      nodeType: node.type,
      nodeTitle: node.title,
    });
  };

  const renderHeader = () => {
    if (!data) return null;
    const { event, progress } = data;

    const startDate = new Date(event.startsAt);
    const endDate = new Date(event.endsAt);

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{event.title}</Text>
        {event.theme?.name ? (
          <Text style={styles.headerSubtitle}>{event.theme.name}</Text>
        ) : null}
        <Text style={styles.headerRange}>
          {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
        </Text>
        {event.description ? (
          <Text style={styles.headerDescription}>{event.description}</Text>
        ) : null}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {progress.currentNodeIndex}/{data.nodes.length}
          </Text>
          {progress.fullCompletionRewardClaimed && (
            <Text style={styles.completedBadge}>Completed</Text>
          )}
        </View>
      </View>
    );
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

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading weekly event...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWeeklyEvent}>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={data.nodes}
        keyExtractor={(item) => item.index.toString()}
        renderItem={renderNode}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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
  container: {
    flex: 1,
    backgroundColor: "#050816",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050816",
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
  headerContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f9fafb",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#a5b4fc",
    marginTop: 4,
  },
  headerRange: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  headerDescription: {
    fontSize: 13,
    color: "#d1d5db",
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 13,
    color: "#e5e7eb",
  },
  completedBadge: {
    fontSize: 12,
    color: "#4ade80",
    fontWeight: "600",
  },
  nodeCard: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
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
    backgroundColor: "#1f2937",
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
    color: "#9ca3af",
  },
  nodeStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  nodeStatusUnlocked: {
    color: "#60a5fa",
  },
  nodeStatusCompleted: {
    color: "#22c55e",
  },
  nodeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f9fafb",
    marginTop: 4,
  },
  nodeDescription: {
    fontSize: 13,
    color: "#9ca3af",
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
    color: "#a5b4fc",
  },
  playButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#6366f1",
  },
  playButtonCompleted: {
    backgroundColor: "#374151",
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f9fafb",
  },
});

export default WeeklyEventScreen;
