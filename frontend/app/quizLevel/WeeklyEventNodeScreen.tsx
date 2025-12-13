// src/screens/WeeklyEventNodeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { WeeklyEventNodeType } from "@/types";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeWeeklyEventNode } from "@/services/api";

const WeeklyEventNodeScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const { nodeIndex, nodeType, nodeTitle } = useLocalSearchParams<{
    nodeIndex?: string;
    nodeType?: WeeklyEventNodeType;
    nodeTitle?: string;
  }>();

  const resolvedNodeIndex = Number(nodeIndex ?? 0);
  const resolvedNodeTitle = nodeTitle ?? "Weekly Event Node";

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{resolvedNodeTitle}</Text>
      <Text style={styles.subtitle}>
        Type: <Text style={styles.bold}>{nodeType}</Text>
      </Text>

      {/* TODO: here you will render the actual mini-event UI based on nodeType */}

      {error && (
        <Text style={styles.error}>
          {error instanceof Error ? error.message : "Failed to complete node"}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, isPending && styles.buttonDisabled]}
        onPress={() => completeNode()}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Finish Node (test)</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f9fafb",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#9ca3af",
  },
  bold: {
    fontWeight: "600",
    color: "#a5b4fc",
  },
  error: {
    marginTop: 16,
    color: "#fca5a5",
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#6366f1",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "600",
  },
});

export default WeeklyEventNodeScreen;
