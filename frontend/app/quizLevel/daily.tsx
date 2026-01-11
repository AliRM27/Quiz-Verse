import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import ArrBack from "@/components/ui/ArrBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Colors } from "@/constants/Colors";
import { fetchDailyQuiz, submitDailyQuiz } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/ui/Loader";
import { isSmallPhone } from "@/constants/Dimensions";
import { languageMap } from "@/utils/i18n";
import { useUser } from "@/context/userContext";
import CircularProgress from "@/components/ui/CircularProgress";
import { useTranslation } from "react-i18next";
import { DailyAnswerPayload, QUESTION_TYPES } from "@/types";
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";
import SliderComponent from "@/components/ui/SliderComponent";
import * as Haptics from "expo-haptics";
import Right from "@/assets/svgs/rightAnswers.svg";
import Wrong from "@/assets/svgs/wrongAnswers.svg";
import Trophy from "@/assets/svgs/trophy.svg";
import Gem from "@/assets/svgs/gem.svg";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ClipboardCheck } from "lucide-react-native";

const DailyQuiz = () => {
  const [currQuestionIndex, setCurrQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(-1);
  const [shortAnswer, setShortAnswer] = useState<string>("");
  const { user, refreshUser } = useUser();
  const { t } = useTranslation();

  type DailyQuizSubmitResult = {
    success: boolean;
    message: string;
    correctCount: number;
    totalQuestions: number;
    perfect: boolean;
    rewards: {
      trophies: number;
      gems: number;
    };
    streak: number;
    results: {
      index: number;
      type: string;
      isCorrect: boolean;
      userAnswer: any;
      correctAnswer: any;
    }[];
  };

  const [answers, setAnswers] = useState<DailyAnswerPayload[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showStreakScreen, setShowStreakScreen] = useState<boolean>(false);
  const [submitResult, setSubmitResult] =
    useState<DailyQuizSubmitResult | null>(null);
  const [baseStreak, setBaseStreak] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const insets = useSafeAreaInsets();

  const { data: dailyQuizData, isLoading: dailyQuizLoading } = useQuery({
    queryKey: ["dailyQuiz"],
    queryFn: fetchDailyQuiz,
  });

  useEffect(() => {
    if (dailyQuizData?.streak?.current != null) {
      setBaseStreak(dailyQuizData.streak.current);
    }
  }, [dailyQuizData?.streak?.current]);

  if (!dailyQuizData || dailyQuizLoading || !user) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Loader />
      </View>
    );
  }

  const currSection = dailyQuizData.quiz.questions;
  const currQuestion = dailyQuizData.quiz.questions[currQuestionIndex];
  const isLastQuestion = currQuestionIndex === currSection.length - 1;

  const handleNextButton = async () => {
    if (
      selectedAnswer === null &&
      shortAnswer.trim() === "" &&
      sliderValue === -1
    ) {
      return;
    }

    Haptics.selectionAsync();

    const current = currQuestion;

    let payload: DailyAnswerPayload = {
      index: currQuestionIndex,
      type: current.type,
    };

    if (
      current.type === QUESTION_TYPES.MC ||
      current.type === QUESTION_TYPES.TF
    ) {
      payload.selectedOptionIndex = selectedAnswer!;
    } else if (current.type === QUESTION_TYPES.SA) {
      payload.textAnswer = shortAnswer.trim();
    } else if (current.type === QUESTION_TYPES.NUM) {
      payload.numericAnswer = sliderValue;
    }

    setAnswers((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.index === currQuestionIndex
      );
      if (existingIndex === -1) return [...prev, payload];
      const copy = [...prev];
      copy[existingIndex] = payload;
      return copy;
    });

    if (!isLastQuestion) {
      setCurrQuestionIndex((p) => p + 1);
      setSelectedAnswer(null);
      setShortAnswer("");
      setSliderValue(-1);
      return;
    }

    try {
      setSubmitting(true);

      const finalAnswers: DailyAnswerPayload[] = (() => {
        const existing = [...answers];
        const existingIndex = existing.findIndex(
          (a) => a.index === currQuestionIndex
        );
        if (existingIndex === -1) {
          return [...existing, payload];
        } else {
          existing[existingIndex] = payload;
          return existing;
        }
      })();

      const res = await submitDailyQuiz(finalAnswers);
      setSubmitResult(res);
      setShowResult(true);
    } catch (err) {
      console.error("Failed to submit daily quiz:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Result Component
  if (showResult && submitResult) {
    const handleResultClose = async () => {
      setShowResult(false);
      setShowStreakScreen(true);
    };

    return (
      <Result
        result={submitResult}
        questions={dailyQuizData.quiz.questions}
        language={user.language}
        onClose={handleResultClose}
        t={t}
      />
    );
  }

  // Streak Screen
  if (showStreakScreen && submitResult && baseStreak !== null) {
    return (
      <StreakScreen
        baseStreak={baseStreak}
        newStreak={submitResult.streak}
        onClose={async () => {
          await queryClient.refetchQueries({
            queryKey: ["dailyQuizUserProgress"],
            type: "all",
          });
          await refreshUser();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        }}
        t={t}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ArrBack />

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(0).springify()}
          style={styles.screenTitle}
        >
          {t("dailyQuiz")}
        </Animated.Text>

        {/* Question Card */}
        <Animated.View entering={FadeIn.delay(100).springify()}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.questionCard}
          >
            {/* Question badge */}
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>
                {t("question")} {currQuestionIndex + 1}
              </Text>
            </View>

            <Text
              style={[styles.questionText, isSmallPhone && { fontSize: 18 }]}
            >
              {currQuestion.question[languageMap[user.language]]}
            </Text>

            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
          </LinearGradient>
        </Animated.View>

        {/* Options */}
        <ScrollView
          scrollEnabled={currQuestion.type === QUESTION_TYPES.MC}
          contentContainerStyle={[
            styles.optionsContainer,
            currQuestion.type === QUESTION_TYPES.TF && styles.tfContainer,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {currQuestion.type === QUESTION_TYPES.SA && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <TextInput
                selectionColor={Colors.dark.text}
                placeholder="Type your answer..."
                placeholderTextColor={Colors.dark.text_muted}
                value={shortAnswer}
                onChangeText={(t) => setShortAnswer(t)}
                autoCorrect={false}
                autoCapitalize="none"
                autoFocus
                style={styles.textInput}
              />
            </Animated.View>
          )}

          {currQuestion.type === QUESTION_TYPES.NUM && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <SliderComponent
                value={sliderValue}
                setValue={setSliderValue}
                min={currQuestion.range.min}
                max={currQuestion.range.max}
                step={currQuestion.range.step}
              />
            </Animated.View>
          )}

          {currQuestion.type === QUESTION_TYPES.MC &&
            currQuestion.options.map((o: any, index: number) => (
              <OptionButton
                key={index}
                index={index}
                option={o}
                isSelected={selectedAnswer === index}
                userLanguage={user.language}
                onPress={() => {
                  selectedAnswer === index
                    ? setSelectedAnswer(null)
                    : setSelectedAnswer(index);
                  Haptics.selectionAsync();
                }}
              />
            ))}

          {currQuestion.type === QUESTION_TYPES.TF &&
            currQuestion.options.map((o: any, index: number) => (
              <TFButton
                key={index}
                index={index}
                option={o}
                isSelected={selectedAnswer === index}
                userLanguage={user.language}
                onPress={() => {
                  selectedAnswer === index
                    ? setSelectedAnswer(null)
                    : setSelectedAnswer(index);
                  Haptics.selectionAsync();
                }}
              />
            ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity
            activeOpacity={0.6}
            disabled={
              submitting ||
              !(
                currQuestionIndex <= currSection.length - 1 &&
                (selectedAnswer !== null ||
                  shortAnswer.trim() !== "" ||
                  sliderValue !== -1)
              )
            }
            onPress={() => handleNextButton()}
          >
            <CircularProgress
              size={isSmallPhone ? 75 : 80}
              strokeWidth={3}
              progress={currQuestionIndex + 1}
              fontSize={isSmallPhone ? 16 : 18}
              percent={false}
              total={currSection.length}
              arrow={
                (selectedAnswer !== null ? true : false) ||
                sliderValue !== -1 ||
                shortAnswer.trim() !== ""
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Option Button Component
const OptionButton = ({
  index,
  option,
  isSelected,
  userLanguage,
  onPress,
}: {
  index: number;
  option: any;
  isSelected: boolean;
  userLanguage: string;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 50).springify()}
      style={animatedStyle}
    >
      <Pressable
        style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View
          style={[styles.optionIndex, isSelected && styles.optionIndexSelected]}
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
        <Text
          style={[styles.optionText, isSelected && styles.optionTextSelected]}
        >
          {option.text[languageMap[userLanguage]]}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// True/False Button Component
const TFButton = ({
  index,
  option,
  isSelected,
  userLanguage,
  onPress,
}: {
  index: number;
  option: any;
  isSelected: boolean;
  userLanguage: string;
  onPress: () => void;
}) => {
  const isTrue = option.text["en"] === "True";
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 100).springify()}
      style={[animatedStyle, { width: "48%" }]}
    >
      <Pressable
        style={[
          styles.tfButton,
          isTrue ? styles.tfButtonTrue : styles.tfButtonFalse,
          isSelected && styles.tfButtonSelected,
        ]}
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        onPress={onPress}
      >
        <Feather
          name={isTrue ? "check-circle" : "x-circle"}
          size={24}
          color={isTrue ? "#4ade80" : "#f87171"}
        />
        <Text
          style={[
            styles.tfText,
            isTrue ? styles.tfTextTrue : styles.tfTextFalse,
          ]}
        >
          {option.text[languageMap[userLanguage]]}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// Result Component
type ResultProps = {
  result: {
    perfect: boolean;
    rewards: { trophies: number; gems: number };
    correctCount: number;
    totalQuestions: number;
    results: any[];
  };
  questions: any[];
  onClose: () => void | Promise<void>;
  language: string;
  t: any;
};

const Result: React.FC<ResultProps> = ({
  result,
  questions,
  onClose,
  language,
  t,
}) => {
  const insets = useSafeAreaInsets();
  const wrongResults = result.results.filter((r) => !r.isCorrect);

  const getUserIndexFromResult = (r: any) =>
    r.userAnswer?.selectedAnswer ??
    r.userAnswer?.selectedOptionIndex ??
    r.userAnswer?.selectedIndex ??
    null;

  return (
    <View style={[styles.resultContainer, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.Text
        entering={FadeInDown.delay(0).springify()}
        style={styles.resultTitle}
      >
        {t("dailyQuizResult")}
      </Animated.Text>

      {/* Summary Card */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <LinearGradient
          colors={
            result.perfect ? ["#22c55e", "#16a34a"] : ["#667eea", "#764ba2"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultCard}
        >
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          <LinearGradient
            colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0)"]}
            style={styles.glossOverlay}
          />

          <Text style={styles.resultMessage}>
            {result.perfect
              ? t("perfectScore") || "Perfect score!"
              : t("niceTry") || "Nice try! Come back tomorrow."}
          </Text>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <Trophy color="#FFD700" width={28} height={28} />
              <Text style={styles.rewardValue}>+{result.rewards.trophies}</Text>
            </View>
            <View style={styles.rewardItem}>
              <Gem color="#60a5fa" width={28} height={28} />
              <Text style={styles.rewardValue}>+{result.rewards.gems}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Score Cards */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.scoreCardsRow}
      >
        <View style={[styles.scoreCard, styles.scoreCardCorrect]}>
          <Text style={styles.scoreValue}>{result.correctCount}</Text>
          <Right width={18} height={18} />
        </View>
        <View style={[styles.scoreCard, styles.scoreCardWrong]}>
          <Text style={styles.scoreValue}>
            {result.totalQuestions - result.correctCount}
          </Text>
          <Wrong width={18} height={18} />
        </View>
      </Animated.View>

      {/* Wrong Questions */}
      {wrongResults.length > 0 && (
        <View style={{ flex: 1, width: "100%" }}>
          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={styles.wrongQuestionsTitle}
          >
            {t("questionsMissed")}
          </Animated.Text>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {wrongResults.map((r, idx) => {
              const q = questions[r.index];
              if (!q) return null;

              const questionText = q.question[languageMap[language]];

              let userAnswerLabel = "";
              let correctAnswerLabel = "";

              if (
                r.type === QUESTION_TYPES.MC ||
                r.type === QUESTION_TYPES.TF
              ) {
                const userIdx = getUserIndexFromResult(r);
                const correctIdx = r.correctAnswer?.correctOptionIndex ?? null;
                const userOpt =
                  typeof userIdx === "number" ? q.options[userIdx] : null;
                const correctOpt =
                  typeof correctIdx === "number" ? q.options[correctIdx] : null;

                userAnswerLabel = userOpt
                  ? userOpt.text[languageMap[language]]
                  : "No answer";
                correctAnswerLabel = correctOpt
                  ? correctOpt.text[languageMap[language]]
                  : "-";
              } else if (r.type === QUESTION_TYPES.NUM) {
                userAnswerLabel =
                  r.userAnswer?.numericAnswer !== undefined &&
                  r.userAnswer?.numericAnswer !== null
                    ? String(r.userAnswer.numericAnswer)
                    : "No answer";
                correctAnswerLabel =
                  r.correctAnswer?.numericAnswer !== undefined
                    ? String(r.correctAnswer.numericAnswer)
                    : "-";
              } else if (r.type === QUESTION_TYPES.SA) {
                userAnswerLabel = r.userAnswer?.textAnswer || "No answer";
                correctAnswerLabel = r.correctAnswer?.correctTextEn || "-";
              }

              return (
                <Animated.View
                  key={idx}
                  entering={FadeInDown.delay(350 + idx * 50).springify()}
                  style={styles.wrongQuestionCard}
                >
                  <Text style={styles.wrongQuestionText}>{questionText}</Text>

                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>{t("yourAnswer")}:</Text>
                    <Text style={styles.answerWrong}>{userAnswerLabel}</Text>
                  </View>

                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>
                      {t("correctAnswer")}:
                    </Text>
                    <Text style={styles.answerCorrect}>
                      {correctAnswerLabel}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* All Correct */}
      {wrongResults.length === 0 && (
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.allCorrectContainer}
        >
          <ClipboardCheck size={64} color={Colors.dark.text} strokeWidth={1} />
          <Text style={styles.allCorrectText}>{t("allCorrect")}</Text>
        </Animated.View>
      )}

      {/* Close Button */}
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={{ width: "100%" }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={onClose}
        >
          <Text style={styles.backButtonText}>{t("backToEvents")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Streak Screen Component
type StreakScreenProps = {
  baseStreak: number;
  newStreak: number;
  onClose: () => void;
  t: any;
};

const StreakScreen: React.FC<StreakScreenProps> = ({
  baseStreak,
  newStreak,
  onClose,
  t,
}) => {
  const insets = useSafeAreaInsets();
  const fireAnimation = useMemo(
    () => require("@/assets/animations/Fire.json"),
    []
  );
  const fireRef = useRef<LottieView | null>(null);

  const increased = newStreak > baseStreak;
  const reset = newStreak === 1 && baseStreak > 1;
  const firstTime = baseStreak === 0 && newStreak === 1;

  useEffect(() => {
    fireRef.current?.play();
  }, []);

  let title = "";
  let subtitle = "";
  let gradientColors: [string, string] = ["#f59e0b", "#d97706"];

  if (increased) {
    title = `🔥 Streak ${newStreak} days!`;
    subtitle = "You kept your daily streak going. Keep it up!";
    gradientColors = ["#f59e0b", "#d97706"];
  } else if (firstTime) {
    title = "✨ New streak started!";
    subtitle = "You completed your first Daily Quiz streak day.";
    gradientColors = ["#22c55e", "#16a34a"];
  } else if (reset) {
    title = "💔 Streak reset";
    subtitle = "You are back to a 1-day streak. Try again tomorrow.";
    gradientColors = ["#ef4444", "#dc2626"];
  } else {
    title = `Streak: ${newStreak} days`;
    subtitle = "Come back tomorrow to grow your streak.";
  }

  return (
    <View style={[styles.streakContainer, { paddingTop: insets.top }]}>
      {/* Animation */}
      <Animated.View
        entering={FadeInDown.delay(0).springify()}
        style={styles.fireContainer}
      >
        <LottieView
          ref={fireRef}
          autoPlay
          loop={increased || firstTime}
          source={fireAnimation}
          style={{ width: "100%", height: "100%" }}
        />
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={FadeInDown.delay(100).springify()}
        style={styles.streakTitle}
      >
        {title}
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(150).springify()}
        style={styles.streakSubtitle}
      >
        {subtitle}
      </Animated.Text>

      {/* Progress Card */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakCard}
        >
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          <LinearGradient
            colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0)"]}
            style={styles.glossOverlay}
          />

          <Text style={styles.streakCardTitle}>Streak Progress</Text>

          <View style={styles.streakStatsRow}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatLabel}>Previous</Text>
              <Text style={styles.streakStatValue}>{baseStreak}</Text>
            </View>
            <Feather
              name="arrow-right"
              size={24}
              color="rgba(255,255,255,0.6)"
            />
            <View style={styles.streakStat}>
              <Text style={styles.streakStatLabel}>Current</Text>
              <Text style={styles.streakStatValueLarge}>{newStreak}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.streakProgressBar}>
            <View
              style={[
                styles.streakProgressFill,
                { width: `${Math.min((newStreak / 7) * 100, 100)}%` },
              ]}
            />
          </View>

          <Text style={styles.streakProgressText}>
            {newStreak}/7 days to bonus reward
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Button */}
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={{ marginTop: "auto", width: "100%" }}
      >
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>Back to Events</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default DailyQuiz;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    paddingHorizontal: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    justifyContent: "center",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    fontFamily: REGULAR_FONT,
    marginTop: 10,
  },
  // Question Card
  questionCard: {
    borderRadius: 24,
    padding: 24,
    paddingVertical: 40,
    minHeight: 160,
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  questionBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  questionBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  questionText: {
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 30,
  },
  decorativeCircle1: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    left: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  // Options
  optionsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  tfContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  textInput: {
    width: "100%",
    height: 60,
    borderColor: Colors.dark.border_muted,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 18,
    borderRadius: 20,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    backgroundColor: Colors.dark.bg_light,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.dark.bg_light,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    padding: 16,
    borderRadius: 16,
  },
  optionButtonSelected: {
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    borderColor: "#667eea",
  },
  optionIndex: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.dark.border_muted,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIndexSelected: {
    backgroundColor: "#667eea",
  },
  optionIndexText: {
    color: Colors.dark.text_muted,
    fontSize: 14,
    fontWeight: "700",
  },
  optionIndexTextSelected: {
    color: "#fff",
  },
  optionText: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: REGULAR_FONT,
  },
  optionTextSelected: {
    color: "#fff",
  },
  // True/False Buttons
  tfButton: {
    alignItems: "center",
    gap: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: Colors.dark.bg_light,
  },
  tfButtonTrue: {
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  tfButtonFalse: {
    borderColor: "rgba(248, 113, 113, 0.3)",
  },
  tfButtonSelected: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tfText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: ITALIC_FONT,
  },
  tfTextTrue: {
    color: "#4ade80",
  },
  tfTextFalse: {
    color: "#f87171",
  },
  // Bottom Nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
  },
  // Result Screen
  resultContainer: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: REGULAR_FONT,
  },
  resultCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  glossOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rewardsRow: {
    flexDirection: "row",
    gap: 40,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  scoreCardsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.dark.bg_light,
    borderWidth: 1,
  },
  scoreCardCorrect: {
    borderColor: "rgba(74, 222, 128, 0.5)",
  },
  scoreCardWrong: {
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  wrongQuestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: REGULAR_FONT,
  },
  wrongQuestionCard: {
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    gap: 10,
  },
  wrongQuestionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.text,
    fontFamily: ITALIC_FONT,
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  answerLabel: {
    color: Colors.dark.text_muted,
    fontSize: 14,
    marginRight: 4,
  },
  answerWrong: {
    color: "#f87171",
    fontSize: 14,
    fontFamily: ITALIC_FONT,
  },
  answerCorrect: {
    color: "#4ade80",
    fontSize: 14,
    fontFamily: ITALIC_FONT,
  },
  allCorrectContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  allCorrectText: {
    fontSize: 18,
    color: Colors.dark.text_muted,
    textAlign: "center",
    fontFamily: REGULAR_FONT,
  },
  backButton: {
    width: "100%",
    backgroundColor: Colors.dark.text,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: Colors.dark.bg_dark,
    fontSize: 16,
    fontWeight: "700",
  },
  // Streak Screen
  streakContainer: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  fireContainer: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: REGULAR_FONT,
  },
  streakSubtitle: {
    fontSize: 14,
    color: Colors.dark.text_muted,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: REGULAR_FONT,
    paddingHorizontal: 20,
  },
  streakCard: {
    width: "100%",
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  streakCardTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
    fontWeight: "600",
  },
  streakStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  streakStat: {
    alignItems: "center",
  },
  streakStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  streakStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  streakStatValueLarge: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  streakProgressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    marginBottom: 8,
  },
  streakProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 999,
  },
  streakProgressText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
});
