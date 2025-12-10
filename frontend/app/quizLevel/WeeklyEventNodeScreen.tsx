// src/screens/WeeklyEventNodeScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { WeeklyEventNodeType } from "@/types";
import { API_URL } from "@/services/config";

const API_BASE_URL = API_URL;

type WeeklyEventNodeRouteParams = {
  WeeklyEventNode: {
    nodeIndex: number;
    nodeType: WeeklyEventNodeType;
    nodeTitle: string;
  };
};

const WeeklyEventNodeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<WeeklyEventNodeRouteParams, "WeeklyEventNode">>();

  const { nodeIndex, nodeType, nodeTitle } = route.params;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteNode = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}api/events/weekly/node/${nodeIndex}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // later you can send score/time/etc here
            score: 100,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to complete node");
      }

      const json = await res.json();
      console.log("Node completed:", json);

      // After completion, go back to weekly list and refresh there
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{nodeTitle}</Text>
      <Text style={styles.subtitle}>
        Type: <Text style={styles.bold}>{nodeType}</Text>
      </Text>

      {/* TODO: here you will render the actual mini-event UI based on nodeType */}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleCompleteNode}
        disabled={submitting}
      >
        {submitting ? (
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
