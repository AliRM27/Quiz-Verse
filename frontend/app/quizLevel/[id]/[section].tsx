import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useEffect, useRef, useState, useMemo } from "react";
import { HEIGHT, isSmallPhone, layout, myHeight } from "@/constants/Dimensions";
import { Colors } from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchQuiz,
  fetchUserHistory,
  fetchUserProgressDetail,
} from "@/services/api";
import BackArr from "@/assets/svgs/backArr.svg";
import QuizLogo from "@/components/ui/QuizLogo";
import { useUser } from "@/context/userContext";
import { QUESTION_TYPES } from "@/types";
import Hint from "@/assets/svgs/hint.svg";
import Heart from "@/assets/svgs/heartQuiz.svg";
import CircularProgress from "@/components/ui/CircularProgress";
import Result from "@/components/Result";
import { updateUserProgress, updateUser } from "@/services/api";
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";
import { languageMap } from "@/utils/i18n";
import { useTranslation } from "react-i18next";
import {
  calculateNewTimeBonuses,
  calculateNewStreakRewards,
} from "@/utils/rewardsSystem";
import SliderComponent from "@/components/ui/SliderComponent";
import * as Haptics from "expo-haptics";
import Loader from "@/components/ui/Loader";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { id, section } = useLocalSearchParams<{
    id: string;
    section: string;
  }>();
  const [currQuestionIndex, setCurrQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(-1);
  const [pressedAnswer, setPressedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [shortAnswer, setShortAnswer] = useState<string>("");
  const { data, isLoading } = useQuery({
    queryKey: ["quizLevel", id],
    queryFn: ({ queryKey }) => fetchQuiz(queryKey[1]),
  });
  const { t } = useTranslation();
  const { user, loading, refreshUser } = useUser();
  const queryClient = useQueryClient();
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["userHistory"],
    queryFn: fetchUserHistory,
    enabled: !!user?._id,
  });
  const lastPlayedHistory = historyData?.lastPlayed || [];
  const { data: progressDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["userProgressDetail", id],
    queryFn: () => fetchUserProgressDetail(id),
    enabled: !!user?._id,
  });
  const [rewards, setRewards] = useState<number>(0);
  const [questionRewards, setQuestionRewards] = useState<number>(0);
  const [streakRewards, setStreakRewards] = useState<number>(0);
  const [timeRewards, setTimeRewards] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mult, setMult] = useState<number>(0);

  let unlockedStreaksVar: Set<number> = new Set();

  const newCorrectIndexesRef = useRef<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [newQuestions, setNewQuestions] = useState<number>(0);
  const [questionLoading, setQuestionLoading] = useState<boolean>(false);
  const [wrongQuestions, setWrongQuestions] = useState<
    { index: number; question: Record<string, string> }[]
  >([]);

  useEffect(() => {
    newCorrectIndexesRef.current = new Set();
  }, []);

  useEffect(() => {
    // Start timer at first question
    if (currQuestionIndex === 0 && startTime === null) {
      setStartTime(Date.now());
      setTimeLeft(0);
    }

    if (startTime !== null && intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currQuestionIndex, startTime]);

  if (loading || isLoading || historyLoading || detailLoading || !user) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          paddingTop: insets.top,
          backgroundColor: "#131313",
        }}
      >
        <Loader width={50} height={50} />
      </View>
    );
  }

  const currSection = data.sections[Number(section)];
  const currQuestion =
    data.sections[Number(section)].questions[currQuestionIndex];
  const currProgress = progressDetail?.progress;
  const prevAnswered = currProgress.sections[Number(section)].answered ?? [];
  const sectionProgress = currProgress.sections[Number(section)];

  unlockedStreaksVar = new Set(sectionProgress.streaks);

  const handleNextButton = async () => {
    Haptics.selectionAsync();
    setQuestionLoading(true);
    let isCorrect: boolean = false;

    // --- Determine if the answer is correct ---
    if (currQuestion.type === "Numeric") {
      if (sliderValue !== null) {
        const userValue = sliderValue;
        if (!isNaN(userValue) && currQuestion.numericAnswer !== undefined) {
          const minAcceptable =
            currQuestion.numericAnswer - (currQuestion.numericTolerance ?? 0);
          const maxAcceptable =
            currQuestion.numericAnswer + (currQuestion.numericTolerance ?? 0);
          isCorrect = userValue >= minAcceptable && userValue <= maxAcceptable;
        }
      }
    } else if (selectedAnswer !== null) {
      isCorrect = currQuestion.options[selectedAnswer].isCorrect;
    } else {
      const normalize = (s: string) =>
        s
          .toLowerCase()
          .trim()
          .replace(/[.,!?]/g, "");

      isCorrect =
        currQuestion.options.find(
          (o: any) =>
            o.isCorrect &&
            (Object.values(o.text) as string[]).some(
              (txt: string) => normalize(txt) === normalize(shortAnswer)
            )
        ) !== undefined;
    }

    // --- Track current streak locally ---
    const newCurrentStreak = isCorrect ? currentStreak + 1 : 0;
    const newMaxStreak = Math.max(maxStreak, newCurrentStreak);

    if (isCorrect) setCorrectAnswers((p) => p + 1);
    else setCurrentStreak(0);
    if (!isCorrect) {
      setWrongQuestions((prev) => [
        ...prev,
        { index: currQuestionIndex, question: currQuestion.question },
      ]);
    }

    // --- Base rewards for first-time correct answers (per-question) ---
    let perQuestionReward = 0;
    if (isCorrect && !prevAnswered.includes(currQuestionIndex)) {
      switch (currSection.difficulty) {
        case "Easy":
          perQuestionReward = 10;
          break;
        case "Medium":
          perQuestionReward = 15;
          break;
        case "Hard":
          perQuestionReward = 25;
          break;
        case "Extreme":
          perQuestionReward = 65;
          break;
      }

      // update UI immediately for each question
      setRewards((p) => p + perQuestionReward);
      setQuestionRewards((p) => p + perQuestionReward);

      // update state-set for UI

      // ALSO update the local ref immediately (so final calculations are accurate)
      newCorrectIndexesRef.current.add(currQuestionIndex);
    }

    setCurrentStreak(newCurrentStreak);
    setMaxStreak(newMaxStreak);

    const isLast = currQuestionIndex === currSection.questions.length - 1;

    if (isLast) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      handleUserLastPlayed();

      // --- Calculate streak bonus using "answers-style" system ---
      const { bonus: streakBonus, newlyUnlocked } = calculateNewStreakRewards(
        newMaxStreak,
        currSection.difficulty,
        unlockedStreaksVar // should still be loaded from DB on quiz start
      );

      // merged streaks for DB (local)
      const localMergedStreaks = new Set(unlockedStreaksVar);
      newlyUnlocked.forEach((t) => localMergedStreaks.add(t));

      // apply streak bonus to UI
      if (streakBonus > 0) {
        setRewards((p) => p + streakBonus);
        setStreakRewards((p) => p + streakBonus);
      }

      // --- Prepare new answered questions from the local ref (robust) ---
      const pending = new Set<number>(newCorrectIndexesRef.current);

      // Also ensure the very last question is included if it was just answered correctly
      if (isCorrect && !prevAnswered.includes(currQuestionIndex)) {
        pending.add(currQuestionIndex);
        newCorrectIndexesRef.current.add(currQuestionIndex);
      }

      const deltaQuestions = pending.size;

      setNewQuestions(deltaQuestions);

      // --- Compute total base reward from the number of NEW correct questions ---
      // reward per question is the same across the section, so:
      let rewardPerQ = 0;
      switch (currSection.difficulty) {
        case "Easy":
          rewardPerQ = 10;
          break;
        case "Medium":
          rewardPerQ = 15;
          break;
        case "Hard":
          rewardPerQ = 25;
          break;
        case "Extreme":
          rewardPerQ = 65;
          break;
      }
      const totalBaseReward = deltaQuestions * rewardPerQ;

      // final total reward to persist
      const totalRewardDelta = totalBaseReward + streakBonus;

      const prevTimeBonuses =
        currProgress.sections[Number(section)].timeBonuses ?? [];

      const { bonus: timeBonus, newlyUnlocked: newTimeBonuses } =
        calculateNewTimeBonuses(
          currSection.difficulty,
          timeLeft,
          prevTimeBonuses
        );

      if (timeBonus > 0) {
        setRewards((p) => p + timeBonus);
        setTimeRewards((p) => p + timeBonus);
      }

      try {
        const totalNewRewards = totalRewardDelta + timeBonus;

        if (deltaQuestions > 0 || totalNewRewards > 0) {
          const currSectionProgress = currProgress.sections[Number(section)];

          // Prevent total rewards from exceeding the max for that difficulty
          const maxPossible = currSectionProgress.maxRewards ?? Infinity; // depends on your schema
          const newTotal = Math.min(
            currSectionProgress.rewards + totalNewRewards,
            maxPossible
          );

          await updateUserProgress({
            quizId: id,
            difficulty: currSection.difficulty,
            updates: {
              questions: deltaQuestions,
              rewards: newTotal - currSectionProgress.rewards, // only the allowed increase
              answered: Array.from(pending),
              streaks: Array.from(localMergedStreaks),
              timeBonuses: Array.from(
                new Set([...prevTimeBonuses, ...newTimeBonuses])
              ),
              streaksRewards: streakBonus,
              timeRewards: timeBonus,
            },
          });
          await queryClient.invalidateQueries({ queryKey: ["userProgress"] });
          await queryClient.invalidateQueries({
            queryKey: ["userProgressDetail", id],
          });

          const finalRewardGain = newTotal - currSectionProgress.rewards;
          if (finalRewardGain > 0) {
            await updateUser({ stars: user.stars + finalRewardGain });
          }
          await refreshUser();
        }

        // --- Reset for next quiz ---

        newCorrectIndexesRef.current = new Set(); // reset local ref
        setCurrentStreak(0);
      } catch (err) {
        console.log(err);
      }
      switch (currSection.difficulty) {
        case "Easy":
          setMult(10);
          break;
        case "Medium":
          setMult(15);
          break;
        case "Hard":
          setMult(25);
          break;
        case "Extreme":
          setMult(65);
          break;
      }
      setShowResult(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setCurrQuestionIndex((p) => p + 1);
    }
    setShortAnswer("");
    setSelectedAnswer(null);
    setQuestionLoading(false);
    setSliderValue(-1);
  };

  const updateLastPlayedList = async () => {
    if (!data?._id) return;
    const simplified = lastPlayedHistory.map((entry: any) => ({
      quizId: entry.quizId._id || entry.quizId,
    }));
    const filtered = simplified.filter(
      (entry: any) => entry.quizId !== data._id
    );
    const updated = [{ quizId: data._id }, ...filtered].slice(0, 2);
    await updateUser({ lastPlayed: updated });
    await queryClient.invalidateQueries({ queryKey: ["userHistory"] });
  };

  const handleUserLastPlayed = async () => {
    await updateLastPlayedList();
  };

  if (showResult) {
    return (
      <Result
        quiz={data}
        selectedLevelIndex={section}
        correctAnswers={correctAnswers}
        total={currSection.questions.length}
        rewards={rewards}
        newQuestions={newQuestions}
        questionRewards={questionRewards}
        streak={streakRewards}
        time={timeRewards}
        mult={mult}
        timeNumber={timeLeft}
        streakNumber={maxStreak}
        wrongQuestions={wrongQuestions}
      />
    );
  }

  const isNextDisabled =
    !(
      currQuestionIndex <= currSection.questions.length - 1 &&
      (selectedAnswer !== null ||
        shortAnswer.trim() !== "" ||
        sliderValue !== -1)
    ) || questionLoading;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header Section */}
            <LinearGradient
              colors={["#1a1a1a", "#131313"]}
              style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
              <View style={styles.headerTop}>
                <TouchableOpacity
                  onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    try {
                      await updateLastPlayedList();
                      await refreshUser();
                      router.back();
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                  style={styles.backButton}
                >
                  <Feather name="chevron-left" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {data.title}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {t(currSection.difficulty)} • {currQuestionIndex + 1}/
                    {currSection.questions.length}
                  </Text>
                </View>

                <View style={styles.logoContainer}>
                  <QuizLogo name={data.logoFile} />
                </View>
              </View>

              {/* Progress Bar
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${((currQuestionIndex + 1) / currSection.questions.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View> */}
            </LinearGradient>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              style={{ flex: 1 }}
            >
              {/* Question Card */}
              <Animated.View
                entering={FadeInDown.duration(600).springify()}
                style={styles.questionCard}
              >
                <Text style={styles.questionLabel}>
                  {t("question")} {currQuestionIndex + 1}
                </Text>
                <Text
                  style={[
                    styles.questionText,
                    isSmallPhone && { fontSize: 20, lineHeight: 0 },
                  ]}
                >
                  {currQuestion.question[languageMap[user.language]]}
                </Text>
              </Animated.View>

              {/* Interaction Area */}
              <View style={styles.interactionArea}>
                {currQuestion.type === QUESTION_TYPES.SA && (
                  <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <TextInput
                      selectionColor={Colors.dark.text}
                      placeholder="Type your answer..."
                      placeholderTextColor={Colors.dark.text_muted}
                      value={shortAnswer}
                      onChangeText={(text) => setShortAnswer(text)}
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={styles.textInput}
                    />
                  </Animated.View>
                )}

                {currQuestion.type === QUESTION_TYPES.NUM && (
                  <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <SliderComponent
                      value={sliderValue}
                      setValue={setSliderValue}
                      min={currQuestion.range.min}
                      max={currQuestion.range.max}
                      step={currQuestion.range.step}
                    />
                  </Animated.View>
                )}

                {(currQuestion.type === QUESTION_TYPES.MC ||
                  currQuestion.type === QUESTION_TYPES.TF) && (
                  <View
                    style={
                      currQuestion.type === QUESTION_TYPES.TF
                        ? styles.tfRow
                        : styles.mcColumn
                    }
                  >
                    {currQuestion.options.map((option: any, index: number) => (
                      <OptionButton
                        key={index}
                        text={option.text[languageMap[user.language]]}
                        isTF={currQuestion.type === QUESTION_TYPES.TF}
                        isSelected={selectedAnswer === index}
                        isFalse={option.text["en"] === "False"}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSelectedAnswer(
                            selectedAnswer === index ? null : index
                          );
                        }}
                        index={index}
                      />
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Footer with Circular Progress */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isNextDisabled}
          onPress={() => handleNextButton()}
        >
          <CircularProgress
            size={80}
            strokeWidth={4}
            progress={currQuestionIndex + 1}
            total={currSection.questions.length}
            fontSize={18}
            percent={false}
            arrow={!isNextDisabled}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const OptionButton = ({
  text,
  isTF,
  isSelected,
  isFalse,
  onPress,
  index,
}: any) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 100).springify()}
      style={[isTF ? styles.tfButtonWrapper : styles.mcButtonWrapper]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
          isTF && isFalse && isSelected && styles.optionButtonFalse,
          isTF && !isFalse && isSelected && styles.optionButtonTrue,
        ]}
      >
        <View style={styles.optionContent}>
          {!isTF && (
            <View
              style={[
                styles.optionIndex,
                isSelected && styles.optionIndexSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionIndexText,
                  isSelected && styles.optionIndexTextSelected,
                ]}
              >
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
          )}
          <Text
            style={[
              styles.optionText,
              isSelected && styles.optionTextSelected,
              isTF && styles.tfOptionText,
            ]}
          >
            {text}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Feather name="check-circle" size={18} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131313",
  },
  txt: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
  },
  txtItalic: {
    fontFamily: ITALIC_FONT,
    color: Colors.dark.text,
  },
  // Header
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: REGULAR_FONT,
    marginTop: 2,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  // Progress Bar
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.dark.secondary,
    borderRadius: 4,
  },
  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: REGULAR_FONT,
  },
  // Scroll Content
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  // Question Card
  questionCard: {
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 24,
    lineHeight: 34,
    color: "#fff",
    fontFamily: REGULAR_FONT,
    fontWeight: "600",
  },
  // Interaction Area
  interactionArea: {
    gap: 16,
  },
  textInput: {
    width: "100%",
    height: 64,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    fontSize: 18,
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  // Options
  mcColumn: {
    gap: 12,
  },
  mcButtonWrapper: {
    width: "100%",
  },
  tfRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  tfButtonWrapper: {
    flex: 1,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 15,
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  optionIndexSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  optionIndexText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: REGULAR_FONT,
  },
  optionIndexTextSelected: {
    color: "#fff",
  },
  optionButton: {
    width: "100%",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionButtonSelected: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  optionButtonTrue: {
    borderColor: Colors.dark.success,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  optionButtonFalse: {
    borderColor: Colors.dark.danger,
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  optionText: {
    fontSize: 17,
    color: "rgba(255,255,255,0.8)",
    fontFamily: REGULAR_FONT,
    flex: 1,
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  tfOptionText: {
    textAlign: "center",
    flex: 0,
    width: "100%",
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  // Footer
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
});
