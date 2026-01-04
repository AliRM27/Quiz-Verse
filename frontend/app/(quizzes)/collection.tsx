import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/context/userContext";
import { router } from "expo-router";
import QuizLogo from "@/components/ui/QuizLogo";
import { QuizType } from "@/types";
import { useTranslation } from "react-i18next";
import ArrBack from "@/components/ui/ArrBack";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProgress } from "@/services/api";
import { LinearGradient } from "expo-linear-gradient";
import ProgressBar from "@/components/animatinos/progressBar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const CARD_MARGIN = 12;
const CARD_WIDTH =
  (width - 48 - CARD_MARGIN * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

const Collection = () => {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id,
  });

  if (loading || !user || isLoading) {
    return null;
  }

  // The 'progress' field contains the user's progress for each quiz
  const quizzes = data?.progress || [];

  const renderQuizCard = ({ item, index }: { item: any; index: number }) => {
    const questionsCompleted = item.questionsCompleted || 0;
    const totalQuestions = item.quizId.questionsTotal || 1;
    const progress = (questionsCompleted / totalQuestions) * 100;
    const isCompleted = item.completed;
    const isPerfect = item.perfected;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100)
          .duration(600)
          .springify()}
        style={styles.cardContainer}
      >
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(quizzes)/quiz",
              params: { id: item.quizId._id },
            });
          }}
          activeOpacity={0.8}
          style={styles.cardWrapper}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
            style={styles.cardGradient}
          >
            <View style={styles.logoContainer}>
              <QuizLogo name={item.quizId.logoFile} />
              {(isCompleted || isPerfect) && (
                <View
                  style={[
                    styles.statusBadge,
                    isPerfect ? styles.perfectBadge : styles.completedBadge,
                  ]}
                >
                  <Ionicons
                    name={isPerfect ? "trophy" : "checkmark-circle"}
                    size={12}
                    color="#fff"
                  />
                </View>
              )}
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.quizTitle} numberOfLines={1}>
                {item.quizId.title}
              </Text>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{t("progress")}</Text>
                  <Text style={styles.progressValue}>
                    {Math.round(progress)}%
                  </Text>
                </View>
                <View style={styles.progressBarWrapper}>
                  <ProgressBar
                    progress={questionsCompleted}
                    total={totalQuestions}
                    color={isPerfect ? Colors.dark.primary : Colors.dark.text}
                    height={4}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <ArrBack />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t("yourQuizzes")}</Text>
        </View>
      </View>

      <FlatList
        numColumns={COLUMN_COUNT}
        data={quizzes}
        renderItem={renderQuizCard}
        keyExtractor={(item) => item._id || item.quizId._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={48}
              color="rgba(255,255,255,0.1)"
            />
            <Text style={styles.emptyText}>{t("noQuizzes")}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Collection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN / 2,
    marginBottom: 16,
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardGradient: {
    padding: 12,
    gap: 12,
  },
  logoContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statusBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.dark.bg_dark,
  },
  completedBadge: {
    backgroundColor: "#00C853",
  },
  perfectBadge: {
    backgroundColor: "#FFD93D",
  },
  cardInfo: {
    gap: 8,
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  progressSection: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: REGULAR_FONT,
  },
  progressValue: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    fontFamily: REGULAR_FONT,
  },
  progressBarWrapper: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    overflow: "hidden",
  },
  emptyContainer: {
    flex: 1,
    height: 400,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 16,
    fontFamily: REGULAR_FONT,
  },
});
