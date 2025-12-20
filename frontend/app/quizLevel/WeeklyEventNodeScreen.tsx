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
import ArrBack from "@/components/ui/ArrBack";

import { LineDashed } from "@/components/ui/Line";
import Trophy from "@/assets/svgs/trophy.svg";
import Timer from "@/assets/svgs/timer.svg"; // Assuming we have this or similar, otherwise use text/emoji
import { useState } from "react";

import { Feather } from "@expo/vector-icons";

// Duplicated mapping for now
const getIconName = (type?: string): keyof typeof Feather.glyphMap => {
  switch (type) {
    case "mini_quiz": return "cpu";
    case "time_challenge": return "zap";
    case "true_false_sprint": return "check-circle";
    case "survival": return "shield";
    case "mixed_gauntlet": return "shuffle";
    case "emoji_puzzle": return "smile";
    case "quote_guess": return "message-square";
    case "vote": return "thumbs-up";
    default: return "play";
  }
};

const WeeklyEventNodeScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const { nodeIndex, nodeType, nodeTitle, nodeDescription, nodeIcon } =
    useLocalSearchParams<{
      nodeIndex?: string;
      nodeType?: string;
      nodeTitle?: string;
      nodeDescription?: string;
      nodeIcon?: string;
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

  const handleStart = () => {
    completeNode();
  };
  
  const iconName = getIconName(nodeType);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      collapsable={false}
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

      {/* Info Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>REWARDS</Text>
          <View style={styles.statValueRow}>
            <Trophy width={20} height={20} color={Colors.dark.secondary} />
            <Text style={styles.statValue}>50 XP</Text>
          </View>
        </View>

        <View style={styles.dividerVertical} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DIFFICULTY</Text>
          <View style={styles.statValueRow}>
             {/* Mock difficulty based on index? */}
             <Text style={styles.statValue}>{resolvedNodeIndex > 5 ? "Hard" : "Normal"}</Text>
          </View>
        </View>

         <View style={styles.dividerVertical} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DURATION</Text>
           <View style={styles.statValueRow}>
             <Text style={styles.statValue}>~2 min</Text>
          </View>
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
            <Text style={styles.buttonText}>Start Challenge</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  content: {
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    gap: 5
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.dark.text_muted,
    letterSpacing: 1,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.dark.text,
  },
  dividerVertical: {
      width: 1,
      height: 30,
      backgroundColor: Colors.dark.border,
  },

  error: {
    marginTop: 16,
    color: Colors.dark.danger,
    textAlign: "center",
  },
  footer: {
    width: "100%",
    marginTop: 40, 
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
