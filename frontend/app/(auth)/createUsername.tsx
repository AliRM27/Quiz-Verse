import { useMemo, useState } from "react";
import { Text, View, TextInput, StyleSheet } from "react-native";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import NextButton from "@/components/ui/NextButton";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/context/userContext";
import { router } from "expo-router";
import { updateUser } from "@/services/api";

const TOTAL_STEPS = 4;

export default function CreateUsername() {
  const { user, refreshUser } = useUser();
  const [val, setVal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const progressSegments = useMemo(() => {
    return Array.from({ length: TOTAL_STEPS }, (_, index) => ({
      active: index <= TOTAL_STEPS - 1, // already on final step
    }));
  }, []);

  if (!user) {
    return (
      <View style={styles.fallback}>
        <Text style={{ color: Colors.dark.text }}>User not found</Text>
      </View>
    );
  }

  const handleUsernameChange = async () => {
    setError("");
    if (
      val.trim() === "" ||
      val.length < 3 ||
      val.length > 20 ||
      !/^[a-zA-Z0-9_]+$/.test(val)
    ) {
      setError(
        "Username must be 3-20 characters long and can only contain letters, numbers, and underscores."
      );
      return;
    }

    setLoading(true);
    try {
      await updateUser({ name: val.trim() });
      await refreshUser();
      router.replace("/(auth)/pickQuiz");
    } catch (err) {
      console.error("Failed to update username:", err);
      setError("Failed to update username. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundGradient style={styles.container}>
      <View style={{ gap: 32 }}>
        <View style={{ gap: 12 }}>
          <Text style={styles.title}>Create your username</Text>
          <Text style={styles.subtitle}>
            This is how other QuizVerse players will spot you on leaderboards
            and events. Keep it clean, unique, and between 3–20 characters.
          </Text>
        </View>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          cursorColor={Colors.dark.text}
          placeholder="Type your username"
          placeholderTextColor={Colors.dark.text_muted}
          value={val}
          onChangeText={(text) => setVal(text)}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <NextButton
        onPress={handleUsernameChange}
        loading={loading}
        title="Continue"
        disabled={val.length < 3}
      />
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 32,
  },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.bg_dark,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.dark.bg_light,
  },
  progressSegmentActive: {
    backgroundColor: Colors.dark.text,
  },
  step: {
    fontSize: 13,
    letterSpacing: 1,
    color: Colors.dark.text_muted,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.text_muted,
    lineHeight: 22,
  },
  inputCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.dark.text_muted,
    letterSpacing: 0.5,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  input: {
    fontSize: 18,
    color: Colors.dark.text,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  error: {
    color: Colors.dark.danger,
    fontSize: 14,
  },
});
