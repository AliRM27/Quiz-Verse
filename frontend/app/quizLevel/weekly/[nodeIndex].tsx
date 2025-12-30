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
  ActivityIndicator,
  Alert,
  Button,
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
import { useSafeAreaBg } from "@/context/safeAreaContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  QUESTION_TYPES,
  DailyAnswerPayload,
  WeeklyEventNodeType,
} from "@/types";
import Hint from "@/assets/svgs/hint.svg";
import Heart from "@/assets/svgs/heartQuiz.svg";
import CircularProgress from "@/components/ui/CircularProgress";
import { languageMap } from "@/utils/i18n";
import { Feather } from "@expo/vector-icons";
import Right from "@/assets/svgs/rightAnswers.svg";
import Wrong from "@/assets/svgs/wrongAnswers.svg";
import Trophy from "@/assets/svgs/currencyTropht.svg";
import Gem from "@/assets/svgs/currencyDiamond.svg";

// Import custom hook
import { useGameMode } from "@/hooks/useGameMode";
import ArrBack from "@/components/ui/ArrBack";

export default function WeeklyGameScreen() {
  const { setSafeBg } = useSafeAreaBg();

  useFocusEffect(
    useCallback(() => {
      setSafeBg("#131313");
      return () => {
        setSafeBg(Colors.dark.bg_dark);
      };
    }, [])
  );

  const { nodeIndex, nodeTitle, nodeType } = useLocalSearchParams<{
    nodeIndex: string;
    nodeTitle: string;
    nodeType: string;
  }>();

  const { user, refreshUser: refreshUserContext } = useUser();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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

  const { status, timeLeft, lives, handleAnswer, stopGame } = useGameMode({
    nodeType: resolvedNodeType,
    config: {
      timeLimitSeconds: questionData?.timeLimit || 60,
      maxLives: 3,
    },
    onGameOver: (reason) => {
      Alert.alert(
        reason === "time" ? "Time's Up!" : "Game Over!",
        reason === "time" ? "You ran out of time." : "You ran out of lives.",
        [{ text: "Try Again", onPress: () => router.back() }]
      );
    },
  });
  // Pre-process questions if it's vote mode, we might not have 'questions' array in the same way
  // But our backend for vote returns { type: 'vote', ... }
  // Let's normalize.
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

  if (isLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Loader width={50} height={50} />
      </View>
    );
  }

  if (error || (!questionData?.questions && !isVoteMode)) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.txt, { color: "white" }]}>
          Failed to load questions.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={[styles.txt, { color: Colors.dark.secondary }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const questions = questionData.questions || [];
  const currQuestion = questions[currQuestionIndex];
  const isLastQuestion =
    questions.length > 0 ? currQuestionIndex === questions.length - 1 : true;

  const handleNextButton = async () => {
    if (questionLoading) return; // Allow interaction even if status not playing for vote?
    // Actually vote mode might not use the game timer hook the same way if it's just a poll.
    // If it's a "vote" node, we probably just submit and that's it (complete node).

    if (isVoteMode) {
      if (!selectedAnswer && !userVote) return;

      setQuestionLoading(true);
      try {
        // map selected index to option id
        if (!voteSubmitted) {
          const optionId = questionData.options[selectedAnswer!].id;
          const res = await submitWeeklyVote(Number(nodeIndex), optionId);
          setVoteStats(res.stats);
          setUserVote(optionId);
          setVoteSubmitted(true);
          setQuestionLoading(false);
          // Don't auto complete yet, let user see stats then press "Next" to finish node?
          // Or just finish immediately? usually users want to see the poll result.
          return;
        } else {
          // Already submitted, pressing next means finish node
          const res = await completeWeeklyEventNode(Number(nodeIndex), {
            score: 100,
            questionsCorrect: 1,
          } as any);
          await queryClient.invalidateQueries({ queryKey: ["weeklyEvent"] });
          await refreshUserContext();
          setCompletionResult({
            ...res,
            score: 100, // Dummy score for vote
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

    // Call Hook
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

    // Delay
    setTimeout(async () => {
      if (status !== "playing") {
        setQuestionLoading(false);
        return; // Hook handles game over
      }

      if (isLastQuestion) {
        stopGame(); // Stop timer
        // Complete ...
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
        t={t}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          paddingHorizontal: 15,
          backgroundColor: "#131313",
          flex: 1,
          gap: 20,
        }}
      >
        {/* Helper Header for Modes */}
        <ModeHeader
          nodeType={resolvedNodeType}
          timeLeft={timeLeft}
          lives={lives}
          maxLives={3}
        />
        <ArrBack />
        <Text
          style={[
            styles.txt,
            { fontSize: 20, fontWeight: "600", textAlign: "center" },
          ]}
        >
          {nodeTitle || "Weekly Event"}
        </Text>

        {/* VOTE MODE UI */}

        {nodeType === "vote" ? (
          <VoteModeView
            questionData={currQuestion}
            onAnswer={handleAnswer}
            onVote={isVoteMode}
            voteSubmitted={voteSubmitted}
            isVoteMode={isVoteMode}
            questionIndex={currQuestionIndex}
            totalQuestions={questions.length}
          />
        ) : (
          <>
            <View style={styles.questionCard}>
              <Text style={styles.questionIndex}>
                {t("question")} {currQuestionIndex + 1}
              </Text>
              <Text style={styles.questionText}>
                {currQuestion.question[languageMap[user.language]]}
              </Text>
            </View>

            <ScrollView
              scrollEnabled={currQuestion.type === QUESTION_TYPES.MC}
              contentContainerStyle={[
                { gap: 15 },
                currQuestion.type === QUESTION_TYPES.TF && {
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 10,
                },
              ]}
            >
              {currQuestion.type === QUESTION_TYPES.SA && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Type answer..."
                  placeholderTextColor={Colors.dark.text_muted}
                  value={shortAnswer}
                  onChangeText={setShortAnswer}
                />
              )}

              {currQuestion.type === QUESTION_TYPES.NUM && (
                <SliderComponent
                  value={sliderValue}
                  setValue={setSliderValue}
                  min={currQuestion.range.min}
                  max={currQuestion.range.max}
                  step={currQuestion.range.step}
                />
              )}
              {currQuestion.type === QUESTION_TYPES.MC &&
                currQuestion.options.map((o: any, idx: number) => {
                  return (
                    <Pressable
                      key={idx}
                      style={[
                        styles.optionButton,
                        selectedAnswer === idx && {
                          backgroundColor: "#232423",
                          borderColor: "#323333",
                        },
                        pressedAnswer === idx && {
                          shadowOpacity: 0,
                          elevation: 0,
                        },
                      ]}
                      onPressIn={() => setPressedAnswer(idx)}
                      onPress={() => {
                        selectedAnswer === idx
                          ? setSelectedAnswer(null)
                          : setSelectedAnswer(idx);
                        Haptics.selectionAsync();
                      }}
                      onPressOut={() => setPressedAnswer(null)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { fontSize: 20 },
                          isSmallPhone && { fontSize: 16 },
                          pressedAnswer === idx && {
                            color: Colors.dark.text_muted,
                          },
                        ]}
                      >
                        {o.text[languageMap[user.language]]}
                      </Text>
                    </Pressable>
                  );
                })}
              {currQuestion.type === QUESTION_TYPES.TF &&
                currQuestion.options.map((o: any, idx: number) => {
                  return (
                    <Pressable
                      key={idx}
                      style={[
                        {
                          borderWidth: 1,
                          backgroundColor: Colors.dark.bg_light,
                          borderColor: "#1F1D1D",
                          padding: 15,
                          width: "45%",
                          borderRadius: 50,
                          elevation: 7,
                          shadowColor: "black",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.5,
                          shadowRadius: 1,
                        },
                        pressedAnswer === idx && {
                          shadowOpacity: 0,
                          elevation: 0,
                        },
                        selectedAnswer === idx && {
                          backgroundColor: "#232423",
                          borderColor: "#323333",
                        },
                      ]}
                      onPressIn={() => setPressedAnswer(idx)}
                      onPress={() => {
                        selectedAnswer === idx
                          ? setSelectedAnswer(null)
                          : setSelectedAnswer(idx);
                        Haptics.selectionAsync();
                      }}
                      onPressOut={() => setPressedAnswer(null)}
                    >
                      <Text
                        style={[
                          {
                            color: Colors.dark.success,
                            fontSize: 20,
                            textAlign: "center",
                            fontFamily: ITALIC_FONT,
                          },
                          o.text["en"] === "False" && {
                            color: Colors.dark.danger,
                          },
                          isSmallPhone && { fontSize: 16 },
                          pressedAnswer === idx &&
                            o.text["en"] === "False" && {
                              color: Colors.dark.danger_muted,
                            },
                          pressedAnswer === idx &&
                            o.text["en"] === "True" && {
                              color: Colors.dark.success_muted,
                            },
                        ]}
                      >
                        {o.text[languageMap[user.language]]}
                      </Text>
                    </Pressable>
                  );
                })}
            </ScrollView>
          </>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: "auto",
            paddingBottom: 20,
          }}
        >
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
              (isVoteMode && !selectedAnswer && !voteSubmitted) || // disable if vote mode and nothing selected/voted
              questionLoading
            }
            onPress={() => handleNextButton()}
          >
            <CircularProgress
              size={isSmallPhone ? 75 : 80}
              strokeWidth={3}
              progress={
                isVoteMode ? (voteSubmitted ? 1 : 0) : currQuestionIndex + 1
              }
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

// Mode Header Component
const ModeHeader = ({ nodeType, timeLeft, lives, maxLives }: any) => {
  if (nodeType === "time_challenge") {
    return (
      <View style={styles.modeHeader}>
        <Feather name="clock" size={20} color={Colors.dark.secondary} />
        <Text style={styles.modeText}>{timeLeft}s</Text>
      </View>
    );
  }
  if (nodeType === "survival") {
    return (
      <View style={styles.modeHeader}>
        {Array.from({ length: maxLives }).map((_, i) => (
          <Heart
            key={i}
            width={24}
            height={24}
            color={i < lives ? "#FF4B4B" : "#333"}
            fill={i < lives ? "#FF4B4B" : "none"}
          />
        ))}
      </View>
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
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{questionData.question}</Text>
      </View>
      <ScrollView contentContainerStyle={{ gap: 15, paddingBottom: 20 }}>
        {questionData.options.map((opt: any, idx: number) => {
          const isSelected = selectedAnswer === idx;
          const isUserChoice = userVote === opt.id;
          const percent =
            voteSubmitted && voteStats && voteStats[opt.id]
              ? voteStats[opt.id].percentage
              : 0;

          return (
            <Pressable
              key={opt.id}
              disabled={voteSubmitted}
              style={[
                styles.optionButton,
                isSelected &&
                  !voteSubmitted && {
                    backgroundColor: "#232423",
                    borderColor: "#323333",
                  },
                // Highlight the one user voted for if submitted
                isUserChoice && {
                  borderColor: Colors.dark.success,
                  borderWidth: 2,
                },
              ]}
              onPress={() => {
                if (!voteSubmitted) {
                  setSelectedAnswer(idx === selectedAnswer ? null : idx);
                  Haptics.selectionAsync();
                }
              }}
            >
              {/* Background progress bar */}
              {voteSubmitted && (
                <View
                  style={{
                    marginTop: "auto",
                    paddingBottom: 20,
                    width: `${percent}%`,
                    backgroundColor: isUserChoice
                      ? "rgba(76, 175, 80, 0.2)"
                      : "rgba(255, 255, 255, 0.1)",
                    borderRadius: 50,
                  }}
                />
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { fontSize: 18, zIndex: 1 },
                    isSmallPhone && { fontSize: 16 },
                  ]}
                >
                  {opt.label}
                </Text>

                {voteSubmitted && (
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {percent}%
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
};

// Inline Result Component
const WeeklyResult = ({
  result,
  questions,
  wrongQuestions,
  user,
  nodeTitle,
  t,
}: any) => {
  return (
    <View style={styles.resultContainer}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60, alignItems: "center" }}
      >
        <Text style={styles.resultTitle}>
          {t("weeklyEventCompleted") || "Challenge Complete!"}
        </Text>

        {/* Score Summary */}
        <View style={styles.resultCard}>
          <Text style={styles.resultSubtitle}>
            {result.questionsCorrect === result.totalQuestions
              ? t("perfectScore") || "Perfect Score!"
              : t("wellDone") || "Well Done!"}
          </Text>

          <View style={styles.rewardRow}>
            <View style={styles.rewardItem}>
              <Trophy width={24} height={24} />
              <Text style={styles.rewardText}>
                +{" "}
                {(result.rewardsGranted || []).reduce(
                  (acc: number, r: any) => acc + (r.reward?.trophies || 0),
                  0
                )}
              </Text>
            </View>
            <View style={styles.rewardItem}>
              <Gem width={24} height={24} />
              <Text style={styles.rewardText}>
                +{" "}
                {(result.rewardsGranted || []).reduce(
                  (acc: number, r: any) => acc + (r.reward?.gems || 0),
                  0
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: Colors.dark.success }]}>
            <Text style={styles.statNumber}>{result.questionsCorrect}</Text>
            <Right width={16} height={16} />
          </View>
          <View style={[styles.statBox, { borderColor: "#920202" }]}>
            <Text style={styles.statNumber}>
              {result.totalQuestions - result.questionsCorrect}
            </Text>
            <Wrong width={16} height={16} />
          </View>
        </View>

        {/* Wrong Questions Logic reused */}
        {wrongQuestions.length > 0 && (
          <View style={{ width: "100%", paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={styles.sectionHeader}>{t("questionsMissed")}</Text>
            {wrongQuestions.map((item: any, idx: number) => (
              <View key={idx} style={styles.wrongQuestionCard}>
                <Text style={styles.wrongQuestionText}>
                  {item.question.question[languageMap[user.language]]}
                </Text>
                {/* Simplified Answer Display */}
                <Text style={styles.answerLabel}>
                  {t("yourAnswer")}:{" "}
                  <Text style={{ color: Colors.dark.danger }}>
                    {getWrongAnswerLabel(item, user.language)}
                  </Text>
                </Text>
                <Text style={styles.answerLabel}>
                  {t("correctAnswer")}:{" "}
                  <Text style={{ color: Colors.dark.success }}>
                    {getCorrectAnswerLabel(item, user.language)}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.homeButtonText}>Return to Map</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

function getWrongAnswerLabel(item: any, lang: string) {
  if (item.userAnswer.textAnswer) return item.userAnswer.textAnswer;
  if (item.userAnswer.selectedAnswer !== null) {
    return item.question.options[item.userAnswer.selectedAnswer]?.text[
      languageMap[lang]
    ];
  }
  if (item.userAnswer.numericAnswer !== -1)
    return item.userAnswer.numericAnswer;
  return "-";
}

function getCorrectAnswerLabel(item: any, lang: string) {
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#131313",
    justifyContent: "center",
    alignItems: "center",
  },
  txt: { fontFamily: REGULAR_FONT, color: Colors.dark.text },
  questionCard: {
    borderWidth: 1,
    backgroundColor: Colors.dark.bg_light,
    borderColor: "#1F1D1D",
    padding: 20,
    paddingVertical: 40,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    marginBottom: 10,
    minHeight: "20%",
    justifyContent: "center",
  },
  questionIndex: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
    fontSize: 14,
    marginTop: 15,
    fontWeight: 600,
    position: "absolute",
    top: -8,
    left: 12,
  },
  questionText: { fontSize: 22, color: "white", textAlign: "center" },
  textInput: {
    width: "100%",
    height: 60,
    borderColor: Colors.dark.border_muted,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    color: "white",
    fontFamily: REGULAR_FONT,
  },
  optionButton: {
    width: "100%",
    borderWidth: 1,
    backgroundColor: Colors.dark.bg_light,
    borderColor: "#1F1D1D",
    padding: 15,
    paddingLeft: 30,
    borderRadius: 50,
    elevation: 7,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    justifyContent: "center",
  },
  selectedOption: { backgroundColor: "#232423", borderColor: "#323333" },
  optionText: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: ITALIC_FONT,
  },
  modeHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  modeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    fontFamily: REGULAR_FONT,
  },

  // Method result styles
  resultContainer: {
    alignItems: "center",
    height: "100%",
    gap: 20,
    backgroundColor: "#131313",
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: REGULAR_FONT,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  resultCard: {
    width: "90%",
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderColor: "#333",
    borderWidth: 1,
  },
  resultSubtitle: {
    fontSize: 20,
    color: "white",
    marginBottom: 15,
    fontFamily: ITALIC_FONT,
  },
  rewardRow: { flexDirection: "row", gap: 20, marginTop: 10 },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 12,
  },
  rewardText: { color: "white", fontSize: 16, fontWeight: "bold" },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
    width: "90%",
    justifyContent: "center",
  },
  statBox: {
    width: 100,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  statNumber: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 18,
    color: Colors.dark.text_muted,
    marginBottom: 15,
    marginLeft: 5,
  },
  wrongQuestionCard: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderColor: "#333",
    borderWidth: 1,
  },
  wrongQuestionText: { color: "white", fontSize: 16, marginBottom: 10 },
  answerLabel: { fontSize: 14, color: "#999", marginTop: 4 },
  homeButton: {
    marginTop: 30,
    backgroundColor: Colors.dark.secondary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  homeButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
