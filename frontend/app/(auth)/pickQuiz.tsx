import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";
import NextButton from "@/components/ui/NextButton";
import { useUser } from "@/context/userContext";
import { useQuery } from "@tanstack/react-query";
import { fetchQuizzes, updateUserProgress } from "@/services/api";
import QuizLogo from "@/components/ui/QuizLogo";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { QuizType } from "@/types";

export default function PickQuiz() {
  const { user, loading, refreshUser } = useUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)");
    } else if (
      !loading &&
      user &&
      user.unlockedQuizzes &&
      user.unlockedQuizzes.length > 0
    ) {
      router.replace("/(tabs)");
    }
  }, [loading, user]);

  const { data, isLoading } = useQuery({
    queryKey: ["starter-quizzes"],
    queryFn: fetchQuizzes,
    enabled: Boolean(user && !loading),
  });

  const starterQuizzes: QuizType[] = useMemo(
    () => (data || []).slice(0, 4),
    [data]
  );

  const handleSelect = (quizId: string) => {
    Haptics.selectionAsync();
    setSelected(quizId);
  };

  const handleUnlock = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      await updateUserProgress({ quizId: selected });
      await refreshUser();
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <BackgroundGradient style={styles.container}>
      <View style={{ gap: 10 }}>
        <Text style={styles.title}>Choose Your Starter Quiz</Text>
        <Text style={styles.subtitle}>
          Unlock one premium quiz for free to kick off your collection. You can
          grab more later in the shop.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {starterQuizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz._id}
              activeOpacity={0.8}
              style={[
                styles.quizCard,
                selected === quiz._id && styles.quizCardActive,
              ]}
              onPress={() => handleSelect(quiz._id)}
            >
              <View style={styles.logoWrapper}>
                <QuizLogo name={quiz.logoFile} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeTxt}>Free</Text>
                  </View>
                </View>
                <Text style={styles.quizCompany}>{quiz.company}</Text>
                <Text style={styles.quizMeta}>
                  {quiz.sections.length} sections · {quiz.questionsTotal}{" "}
                  questions · {quiz.rewardsTotal} trophies
                </Text>
                <Text style={styles.quizDescription} numberOfLines={2}>
                  {"A fan-favorite journey for superfans."}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {starterQuizzes.length === 0 && (
            <Text style={styles.emptyState}>
              No quizzes available yet. Please try again shortly.
            </Text>
          )}
        </ScrollView>
      )}

      <NextButton
        onPress={handleUnlock}
        title="Unlock & continue"
        loading={submitting}
        disabled={!selected || submitting}
      />
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 24,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    lineHeight: 22,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quizCard: {
    flexDirection: "row",
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    backgroundColor: Colors.dark.bg,
    padding: 16,
  },
  quizCardActive: {
    borderColor: Colors.dark.text,
    backgroundColor: Colors.dark.bg_dark,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
  },
  quizTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    flex: 1,
    marginRight: 10,
  },
  quizCompany: {
    fontSize: 14,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
  },
  quizMeta: {
    fontSize: 12,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
  },
  quizDescription: {
    fontSize: 13,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  freeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: Colors.dark.highlight,
  },
  freeBadgeTxt: {
    fontSize: 11,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    letterSpacing: 1,
  },
  emptyState: {
    textAlign: "center",
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
  },
});
