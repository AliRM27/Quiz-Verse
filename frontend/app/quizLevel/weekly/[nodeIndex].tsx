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
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT, ITALIC_FONT } from "@/constants/Styles";
import { isSmallPhone } from "@/constants/Dimensions";
import {
  fetchWeeklyNodeQuestions,
  completeWeeklyEventNode,
  submitWeeklyVote,
} from "@/services/api";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import SliderComponent from "@/components/ui/SliderComponent";
import * as Haptics from "expo-haptics";
import Loader from "@/components/ui/Loader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QUESTION_TYPES, WeeklyEventNodeType } from "@/types";
import { Heart } from "lucide-react-native";
import CircularProgress from "@/components/ui/CircularProgress";
import { languageMap } from "@/utils/i18n";
import { Feather } from "@expo/vector-icons";
import { ClipboardCheck } from "lucide-react-native";
import Right from "@/assets/svgs/rightAnswers.svg";
import Wrong from "@/assets/svgs/wrongAnswers.svg";
import Trophy from "@/assets/svgs/trophy.svg";
import Gem from "@/assets/svgs/gem.svg";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

// Import custom hook
import { useGameMode } from "@/hooks/useGameMode";
import ArrBack from "@/components/ui/ArrBack";

export default function WeeklyGameScreen() {
  const insets = useSafeAreaInsets();

  const { nodeIndex, nodeTitle, nodeType } = useLocalSearchParams<{
    nodeIndex: string;
    nodeTitle: string;
    nodeType: string;
  }>();

  const { user, refreshUser: refreshUserContext } = useUser();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    data: questionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["weeklyNodeQuestions", nodeIndex],
    queryFn: () => fetchWeeklyNodeQuestions(Number(nodeIndex)),
  });

  const [currQuestionIndex, setCurrQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(-1);
  const [shortAnswer, setShortAnswer] = useState<string>("");
  const [pressedAnswer, setPressedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  // Game State
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [questionLoading, setQuestionLoading] = useState<boolean>(false);
  const [wrongQuestions, setWrongQuestions] = useState<
    { index: number; question: any; userAnswer: any; correctAnswer: any }[]
  >([]);
  const [completionResult, setCompletionResult] = useState<any>(null);

  // Vote Mode State
  const [voteSubmitted, setVoteSubmitted] = useState<boolean>(false);
  const [voteStats, setVoteStats] = useState<any>(null);
  const [userVote, setUserVote] = useState<string | null>(null);

  // --- Game Mode Integration ---
  const resolvedNodeType = (nodeType as WeeklyEventNodeType) || "mini_quiz";

  const handleGameOver = useCallback((reason: "time" | "lives") => {
    Alert.alert(
      reason === "time" ? "Time's Up!" : "Game Over!",
      reason === "time" ? "You ran out of time." : "You ran out of lives.",
      [{ text: "Try Again", onPress: () => router.back() }]
    );
  }, []);

  const { status, timeLeft, lives, handleAnswer, stopGame } = useGameMode({
    nodeType: resolvedNodeType,
    config: {
      timeLimitSeconds: questionData?.timeLimit || 60,
      maxLives: 3,
    },
    onGameOver: handleGameOver,
  });

  const isVoteMode = questionData?.type === "vote";

  // Initialize vote state from backend data if available
  useEffect(() => {
    if (isVoteMode && questionData) {
      if (questionData.userVote) {
        setVoteSubmitted(true);
        setUserVote(questionData.userVote);
        setVoteStats(questionData.stats);
      }
    }
  }, [isVoteMode, questionData]);

  // Loading state
  if (isLoading || !user) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Loader width={50} height={50} />
      </View>
    );
  }

  // Error state
  if (error || (!questionData?.questions && !isVoteMode)) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Animated.View entering={FadeInDown.springify()}>
          <View style={styles.errorCard}>
            <Feather name="alert-circle" size={48} color="#fca5a5" />
            <Text style={styles.errorText}>Failed to load questions.</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  const questions = questionData.questions || [];
  const currQuestion = isVoteMode ? questionData : questions[currQuestionIndex];
  const isLastQuestion =
    !isVoteMode && questions.length > 0
      ? currQuestionIndex === questions.length - 1
      : true;

  const handleNextButton = async () => {
    if (questionLoading) return;

    if (isVoteMode) {
      if (!selectedAnswer && !userVote) return;

      setQuestionLoading(true);
      try {
        if (!voteSubmitted) {
          const optionId = questionData.options[selectedAnswer!].id;
          const res = await submitWeeklyVote(Number(nodeIndex), optionId);
          setVoteStats(res.stats);
          setUserVote(optionId);
          setVoteSubmitted(true);
          setQuestionLoading(false);
          return;
        } else {
          const res = await completeWeeklyEventNode(Number(nodeIndex), {
            score: 100,
            questionsCorrect: 1,
          } as any);
          await queryClient.invalidateQueries({ queryKey: ["weeklyEvent"] });
          await refreshUserContext();
          setCompletionResult({
            ...res,
            score: 100,
            questionsCorrect: 1,
            totalQuestions: 1,
            rewardsGranted: res.rewardsGranted,
          });
          setShowResult(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to submit vote.");
        setQuestionLoading(false);
      }
      return;
    }

    if (status !== "playing") return;

    // Validation
    if (
      (currQuestion.type === QUESTION_TYPES.MC && selectedAnswer === null) ||
      (currQuestion.type === QUESTION_TYPES.TF && selectedAnswer === null) ||
      (currQuestion.type === QUESTION_TYPES.SA && shortAnswer.trim() === "") ||
      (currQuestion.type === QUESTION_TYPES.NUM && sliderValue === -1)
    ) {
      return;
    }

    Haptics.selectionAsync();
    setQuestionLoading(true);

    let isCorrect = false;

    // Check Answer Logic
    if (currQuestion.type === "Numeric") {
      if (sliderValue !== null) {
        const userValue = sliderValue;
        const min =
          currQuestion.numericAnswer - (currQuestion.numericTolerance ?? 0);
        const max =
          currQuestion.numericAnswer + (currQuestion.numericTolerance ?? 0);
        isCorrect = userValue >= min && userValue <= max;
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
              (txt) => normalize(txt) === normalize(shortAnswer)
            )
        ) !== undefined;
    }

    handleAnswer(isCorrect);

    if (isCorrect) {
      setCorrectAnswersCount((p) => p + 1);
    } else {
      setWrongQuestions((prev) => [
        ...prev,
        {
          index: currQuestionIndex,
          question: currQuestion,
          userAnswer: {
            selectedAnswer,
            textAnswer: shortAnswer,
            numericAnswer: sliderValue,
          },
          correctAnswer: {
            correctOptionIndex: currQuestion.options?.findIndex(
              (o: any) => o.isCorrect
            ),
            numericAnswer: currQuestion.numericAnswer,
            correctTextEn: currQuestion.options?.find((o: any) => o.isCorrect)
              ?.text["en"],
          },
        },
      ]);
    }

    setTimeout(async () => {
      if (resolvedNodeType === "survival" && !isCorrect && lives <= 1) {
        setQuestionLoading(false);
        return;
      }

      if (status !== "playing") {
        setQuestionLoading(false);
        return;
      }

      if (isLastQuestion) {
        stopGame();
        try {
          const finalCorrect = isCorrect
            ? correctAnswersCount + 1
            : correctAnswersCount;
          const score = Math.floor((finalCorrect / questions.length) * 100);
          const res = await completeWeeklyEventNode(Number(nodeIndex), {
            score,
            questionsCorrect: finalCorrect,
          } as any);
          await queryClient.invalidateQueries({ queryKey: ["weeklyEvent"] });
          await refreshUserContext();
          setCompletionResult({
            ...res,
            score,
            questionsCorrect: finalCorrect,
            totalQuestions: questions.length,
            rewardsGranted: res.rewardsGranted,
          });
          setShowResult(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
          console.error(e);
        }
      } else {
        setCurrQuestionIndex((p) => p + 1);
        setShortAnswer("");
        setSelectedAnswer(null);
        setQuestionLoading(false);
        setSliderValue(-1);
      }
    }, 0);
  };

  /** RESULT VIEW **/
  if (showResult && completionResult) {
    return (
      <WeeklyResult
        result={completionResult}
        questions={questions}
        wrongQuestions={wrongQuestions}
        user={user}
        nodeTitle={nodeTitle}
        nodeType={nodeType}
        t={t}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: 10 },
        ]}
      >
        <ArrBack />

        {/* Mode Header */}
        <ModeHeader
          nodeType={resolvedNodeType}
          timeLeft={timeLeft}
          lives={lives}
          maxLives={3}
        />

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <Text style={styles.screenTitle}>{nodeTitle || "Weekly Event"}</Text>
        </Animated.View>

        {/* VOTE MODE UI */}
        {nodeType === "vote" ? (
          <VoteModeView
            questionData={currQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            voteSubmitted={voteSubmitted}
            userVote={userVote}
            voteStats={voteStats}
          />
        ) : (
          <>
            {/* Question Card */}
            <Animated.View entering={FadeIn.delay(100).springify()}>
              <LinearGradient
                colors={["#2a2a3e", "#1a1a2e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.questionCard}
              >
                {/* Question badge */}
                <View style={styles.questionBadge}>
                  <Text
                    style={[
                      styles.questionBadgeText,
                      isSmallPhone && { fontSize: 10 },
                    ]}
                  >
                    {t("question")} {currQuestionIndex + 1}
                  </Text>
                </View>

                {currQuestion.sourceQuizTitle && (
                  <Text style={styles.sourceQuizTitle}>
                    {currQuestion.sourceQuizTitle}
                  </Text>
                )}

                <Text
                  style={[
                    styles.questionText,
                    isSmallPhone && { fontSize: 17 },
                  ]}
                >
                  {nodeType === "emoji_puzzle"
                    ? `${t("whatGame")}\n \n ${currQuestion.question[languageMap["English"]]}`
                    : currQuestion.question[languageMap[user.language]]}
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
                    style={styles.textInput}
                    placeholder="Type answer..."
                    placeholderTextColor={Colors.dark.text_muted}
                    value={shortAnswer}
                    onChangeText={setShortAnswer}
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
                currQuestion.options.map((o: any, idx: number) => (
                  <OptionButton
                    key={idx}
                    index={idx}
                    option={o}
                    isSelected={selectedAnswer === idx}
                    nodeType={nodeType}
                    userLanguage={user.language}
                    onPress={() => {
                      selectedAnswer === idx
                        ? setSelectedAnswer(null)
                        : setSelectedAnswer(idx);
                      Haptics.selectionAsync();
                    }}
                  />
                ))}

              {currQuestion.type === QUESTION_TYPES.TF &&
                currQuestion.options.map((o: any, idx: number) => (
                  <TFButton
                    key={idx}
                    index={idx}
                    option={o}
                    isSelected={selectedAnswer === idx}
                    userLanguage={user.language}
                    onPress={() => {
                      selectedAnswer === idx
                        ? setSelectedAnswer(null)
                        : setSelectedAnswer(idx);
                      Haptics.selectionAsync();
                    }}
                  />
                ))}
            </ScrollView>
          </>
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            activeOpacity={0.6}
            disabled={
              (!isVoteMode &&
                !(
                  currQuestionIndex <= questions.length - 1 &&
                  (selectedAnswer !== null ||
                    shortAnswer.trim() !== "" ||
                    sliderValue !== -1)
                )) ||
              (isVoteMode && !selectedAnswer && !voteSubmitted) ||
              questionLoading
            }
            onPress={() => handleNextButton()}
          >
            <CircularProgress
              size={isSmallPhone ? 75 : 80}
              strokeWidth={3}
              progress={isVoteMode ? 1 : currQuestionIndex + 1}
              fontSize={isSmallPhone ? 16 : 18}
              percent={false}
              total={isVoteMode ? 1 : questions.length}
              arrow={
                isVoteMode
                  ? selectedAnswer !== null || voteSubmitted
                  : (selectedAnswer !== null ? true : false) ||
                    shortAnswer.trim() !== "" ||
                    sliderValue !== -1
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// Enhanced Option Button Component
const OptionButton = ({
  index,
  option,
  isSelected,
  nodeType,
  userLanguage,
  onPress,
}: {
  index: number;
  option: any;
  isSelected: boolean;
  nodeType: string;
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

  // Safe text extraction
  const getOptionText = () => {
    if (!option) return "";
    // Handle specific node types that default to English or specific keys
    if (nodeType === "quote_guess" || nodeType === "emoji_puzzle") {
      return option.text?.["en"] || option.text?.["English"] || "";
    }
    // Handle standard questions
    if (option.text) {
      return option.text[languageMap[userLanguage]] || option.text["en"] || "";
    }
    // Fallback for legacy string options (if any)
    if (typeof option === "string") return option;
    return "";
  };

  return (
    <Animated.View entering={FadeInDown.delay(150 + index * 50).springify()}>
      <Animated.View style={animatedStyle}>
        <Pressable
          style={[
            styles.optionButton,
            isSelected && styles.optionButtonSelected,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
        >
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
          <Text
            style={[styles.optionText, isSelected && styles.optionTextSelected]}
          >
            {getOptionText()}
          </Text>
        </Pressable>
      </Animated.View>
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
      style={{ width: "48%" }}
    >
      <Animated.View style={animatedStyle}>
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
    </Animated.View>
  );
};

// Mode Header Component
const ModeHeader = ({ nodeType, timeLeft, lives, maxLives }: any) => {
  if (nodeType === "time_challenge") {
    return (
      <Animated.View entering={FadeInDown.delay(50).springify()}>
        <View style={styles.modeHeader}>
          <LinearGradient
            colors={["#f59e0b", "#d97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.timerBadge}
          >
            <Feather name="clock" size={18} color="#fff" />
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  }
  if (nodeType === "survival") {
    return (
      <Animated.View entering={FadeInDown.delay(50).springify()}>
        <View style={styles.modeHeader}>
          <View style={styles.livesContainer}>
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart
                key={i}
                width={28}
                height={28}
                color={i < lives ? "#ef4444" : "#333"}
                fill={i < lives ? "#ef4444" : "none"}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    );
  }
  return null;
};

// Vote Component
const VoteModeView = ({
  questionData,
  selectedAnswer,
  setSelectedAnswer,
  voteSubmitted,
  userVote,
  voteStats,
}: any) => {
  return (
    <>
      <Animated.View entering={FadeIn.delay(100).springify()}>
        <LinearGradient
          colors={["#2a2a3e", "#1a1a2e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.questionCard}
        >
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <Text style={styles.questionText}>{questionData.question}</Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {questionData.options.map((opt: any, idx: number) => {
          const isSelected = selectedAnswer === idx;
          const isUserChoice = userVote === opt.id;
          const percent =
            voteSubmitted && voteStats && voteStats[opt.id]
              ? voteStats[opt.id].percentage
              : 0;

          return (
            <Animated.View
              key={opt.id}
              entering={FadeInDown.delay(150 + idx * 50).springify()}
            >
              <Pressable
                disabled={voteSubmitted}
                style={[
                  styles.voteOption,
                  isSelected && !voteSubmitted && styles.voteOptionSelected,
                  isUserChoice && styles.voteOptionUserChoice,
                ]}
                onPress={() => {
                  if (!voteSubmitted) {
                    setSelectedAnswer(idx === selectedAnswer ? null : idx);
                    Haptics.selectionAsync();
                  }
                }}
              >
                {/* Progress bar background */}
                {voteSubmitted && (
                  <View
                    style={[
                      styles.voteProgressBar,
                      {
                        width: `${percent}%`,
                        backgroundColor: isUserChoice
                          ? "rgba(76, 175, 80, 0.25)"
                          : "rgba(255, 255, 255, 0.1)",
                      },
                    ]}
                  />
                )}

                <View style={styles.voteOptionContent}>
                  <Text style={styles.voteOptionText}>{opt.label}</Text>
                  {voteSubmitted && (
                    <Text style={styles.votePercentage}>{percent}%</Text>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </>
  );
};

// Result Component
const WeeklyResult = ({
  result,
  wrongQuestions,
  user,
  nodeTitle,
  nodeType,
  t,
}: any) => {
  const insets = useSafeAreaInsets();
  const trophies = (result.rewardsGranted || []).reduce(
    (acc: number, r: any) => acc + (r.reward?.trophies || 0),
    0
  );
  const gems = (result.rewardsGranted || []).reduce(
    (acc: number, r: any) => acc + (r.reward?.gems || 0),
    0
  );

  const isPerfect = result.questionsCorrect === result.totalQuestions;

  return (
    <View
      style={[
        styles.resultContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0).springify()}>
        <Text style={styles.resultTitle}>
          {nodeTitle || t("weeklyEventCompleted") || "Weekly Event Result"}
        </Text>
      </Animated.View>

      {/* Main Result Card */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <LinearGradient
          colors={isPerfect ? ["#22c55e", "#16a34a"] : ["#f5576c", "#f093fb"]}
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
            {isPerfect
              ? t("perfectScore") || "Perfect Score!"
              : t("wellDone") || "Well Done!"}
          </Text>

          {/* Rewards */}
          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <Trophy color="#FFD700" width={28} height={28} />
              <Text style={styles.rewardValue}>+{trophies}</Text>
            </View>
            <View style={styles.rewardItem}>
              <Gem color="#60a5fa" width={28} height={28} />
              <Text style={styles.rewardValue}>+{gems}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Score Cards */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <View style={styles.scoreCardsRow}>
          <View style={[styles.scoreCard, styles.scoreCardCorrect]}>
            <Text style={styles.scoreValue}>{result.questionsCorrect}</Text>
            <Right width={18} height={18} />
          </View>
          <View style={[styles.scoreCard, styles.scoreCardWrong]}>
            <Text style={styles.scoreValue}>
              {result.totalQuestions - result.questionsCorrect}
            </Text>
            <Wrong width={18} height={18} />
          </View>
        </View>
      </Animated.View>

      {/* Wrong Questions List */}
      {wrongQuestions.length > 0 ? (
        <View style={{ flex: 1, width: "100%" }}>
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={styles.wrongQuestionsTitle}>
              {t("questionsMissed")}
            </Text>
          </Animated.View>

          <ScrollView
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {wrongQuestions.map((item: any, idx: number) => (
              <Animated.View
                key={idx}
                entering={FadeInDown.delay(350 + idx * 50).springify()}
              >
                <View style={styles.wrongQuestionCard}>
                  <Text style={styles.wrongQuestionText}>
                    {nodeType === "emoji_puzzle"
                      ? `${t("whatGame")} ${item.question.question[languageMap["English"]]}`
                      : item.question.question[languageMap[user.language]]}
                  </Text>

                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>{t("yourAnswer")}:</Text>
                    <Text style={styles.answerWrong}>
                      {getWrongAnswerLabel(item, user.language, nodeType)}
                    </Text>
                  </View>

                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>
                      {t("correctAnswer")}:
                    </Text>
                    <Text style={styles.answerCorrect}>
                      {getCorrectAnswerLabel(item, user.language)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={{ flex: 1, width: "100%" }}
        >
          <View style={styles.allCorrectContainer}>
            <ClipboardCheck
              size={64}
              color={Colors.dark.text}
              strokeWidth={1}
            />
            <Text style={styles.allCorrectText}>
              {t("allCorrect") || "All answers correct!"}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Back Button */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <View style={{ width: "100%" }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>{t("backToEvents")}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

function getWrongAnswerLabel(item: any, lang: string, nodeType?: string) {
  // For emoji_puzzle and quote_guess, only English is available
  const effectiveLang =
    nodeType === "emoji_puzzle" || nodeType === "quote_guess"
      ? "English"
      : lang;

  if (item.userAnswer.textAnswer) return item.userAnswer.textAnswer;
  if (item.userAnswer.selectedAnswer !== null) {
    return item.question.options[item.userAnswer.selectedAnswer]?.text[
      languageMap[effectiveLang]
    ];
  }
  if (item.userAnswer.numericAnswer !== -1)
    return item.userAnswer.numericAnswer;
  return "-";
}

function getCorrectAnswerLabel(item: any, lang: string) {
  if (item.question.type === QUESTION_TYPES.NUM) {
    return item.correctAnswer.numericAnswer;
  }
  if (item.correctAnswer.correctTextEn) return item.correctAnswer.correctTextEn;
  if (item.correctAnswer.correctOptionIndex !== undefined) {
    return item.question.options[item.correctAnswer.correctOptionIndex]?.text[
      languageMap[lang]
    ];
  }
  if (item.correctAnswer.numericAnswer !== undefined)
    return item.correctAnswer.numericAnswer;
  return "-";
}

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
  errorCard: {
    alignItems: "center",
    gap: 16,
    padding: 32,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  errorText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#f5576c",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    fontFamily: REGULAR_FONT,
  },
  // Question Card
  questionCard: {
    borderRadius: 24,
    padding: 24,
    paddingVertical: 36,
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
    backgroundColor: "rgba(245, 87, 108, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 87, 108, 0.3)",
  },
  questionBadgeText: {
    color: "#f5576c",
    fontSize: 12,
    fontWeight: "700",
  },
  sourceQuizTitle: {
    color: Colors.dark.text_muted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: ITALIC_FONT,
  },
  questionText: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 28,
  },
  decorativeCircle1: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorativeCircle2: {
    position: "absolute",
    left: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.03)",
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
    borderRadius: 20,
    paddingHorizontal: 20,
    color: "white",
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
    backgroundColor: "rgba(245, 87, 108, 0.15)",
    borderColor: "#f5576c",
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
    backgroundColor: "#f5576c",
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
  // Mode Header
  modeHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  livesContainer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.dark.bg_light,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  // Bottom Nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingBottom: 20,
  },
  // Vote Mode
  voteOption: {
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    overflow: "hidden",
  },
  voteOptionSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(96, 165, 250, 0.1)",
  },
  voteOptionUserChoice: {
    borderColor: "#4ade80",
    borderWidth: 2,
  },
  voteProgressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  voteOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
  },
  voteOptionText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  votePercentage: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "700",
  },
  // Result Screen
  resultContainer: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    paddingHorizontal: 16,
    paddingTop: 20,
    width: "100%",
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
    fontSize: 22,
    fontWeight: "800",
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
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  scoreCard: {
    width: "30%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
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
  },
  backButtonText: {
    color: Colors.dark.bg_dark,
    fontSize: 16,
    fontWeight: "700",
  },
});
