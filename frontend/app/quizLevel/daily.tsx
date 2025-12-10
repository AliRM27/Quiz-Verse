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
import { useSafeAreaBg } from "@/context/safeAreaContext";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import Trophy from "@/assets/svgs/currencyTropht.svg";
import Gem from "@/assets/svgs/currencyDiamond.svg";
import LottieView from "lottie-react-native";

const DailyQuiz = () => {
  const { setSafeBg } = useSafeAreaBg();
  const [currQuestionIndex, setCurrQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(-1);
  const [shortAnswer, setShortAnswer] = useState<string>("");
  const [pressedAnswer, setPressedAnswer] = useState<number | null>(null);
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

  useFocusEffect(
    useCallback(() => {
      // When screen becomes active
      setSafeBg("#131313");

      // When screen loses focus → reset to black
      return () => {
        setSafeBg(Colors.dark.bg_dark);
      };
    }, [])
  );

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
      <View>
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

    // 1. Build answer payload for current question
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

    // 2. Merge into answers (replace if user went back, for future)
    setAnswers((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.index === currQuestionIndex
      );
      if (existingIndex === -1) return [...prev, payload];

      const copy = [...prev];
      copy[existingIndex] = payload;
      return copy;
    });

    // 3. If NOT last question → go to next
    if (!isLastQuestion) {
      setCurrQuestionIndex((p) => p + 1);
      // reset inputs for next question
      setSelectedAnswer(null);
      setShortAnswer("");
      setSliderValue(-1);
      return;
    }

    // 4. If LAST question → submit to backend
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
      // show error toast
    } finally {
      setSubmitting(false);
    }
  };
  type ResultProps = {
    result: DailyQuizSubmitResult;
    questions: any[];
    onClose: () => void | Promise<void>;
    language: string; // user.language
  };

  const Result: React.FC<ResultProps> = ({
    result,
    questions,
    onClose,
    language,
  }) => {
    const { t } = useTranslation();

    const wrongResults = result.results.filter((r) => !r.isCorrect);

    const getUserIndexFromResult = (r: any) =>
      r.userAnswer?.selectedAnswer ??
      r.userAnswer?.selectedOptionIndex ??
      r.userAnswer?.selectedIndex ??
      null;

    return (
      <View
        style={{
          paddingHorizontal: 15,
          backgroundColor: "#131313",
          height: "100%",
          paddingTop: 40,
        }}
      >
        {/* Header */}
        <Text
          style={[
            styles.txt,
            {
              fontWeight: "700",
              fontSize: 24,
              textAlign: "center",
              marginBottom: 20,
            },
          ]}
        >
          {t("dailyQuizResult")}
        </Text>

        {/* Summary Card */}
        <View
          style={{
            borderWidth: 1,
            borderColor: "#1F1D1D",
            backgroundColor: Colors.dark.bg_light,
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={[
              styles.txt,
              {
                fontSize: 13,
                textAlign: "center",
                color: Colors.dark.text_muted,
              },
            ]}
          >
            {result.perfect
              ? t("perfectScore") || "Perfect score!"
              : t("niceTry") || "Nice try! Come back tomorrow for a new quiz."}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 35,
            }}
          >
            <View
              style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
            >
              <Trophy />
              <Text style={[styles.txt, { fontSize: 18, fontWeight: "700" }]}>
                +{result.rewards.trophies}
              </Text>
            </View>
            <View
              style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
            >
              <Gem />
              <Text style={[styles.txt, { fontSize: 18, fontWeight: "700" }]}>
                +{result.rewards.gems}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-evenly",
            marginVertical: 40,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: Colors.dark.success,
              padding: 10,
              paddingHorizontal: 15,
              justifyContent: "space-between",
              width: 100,
              borderRadius: 10,
              backgroundColor: Colors.dark.bg_light,
            }}
          >
            <Text style={[styles.txt, { fontSize: 17, fontWeight: "700" }]}>
              {result.correctCount}
            </Text>
            <Right width={15} height={15} />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#920202",
              padding: 10,
              paddingHorizontal: 15,
              justifyContent: "space-between",
              width: 100,
              borderRadius: 10,
              backgroundColor: Colors.dark.bg_light,
            }}
          >
            <Text style={[styles.txt, { fontSize: 17, fontWeight: "700" }]}>
              {result.totalQuestions - result.correctCount}
            </Text>
            <Wrong width={15} height={15} />
          </View>
        </View>

        {/* Wrong questions list */}
        {wrongResults.length > 0 && (
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.txt,
                {
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 20,
                  textAlign: "center",
                },
              ]}
            >
              {t("questionsMissed")}
            </Text>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
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
                  const correctIdx =
                    r.correctAnswer?.correctOptionIndex ?? null;
                  const userOpt =
                    typeof userIdx === "number" ? q.options[userIdx] : null;
                  const correctOpt =
                    typeof correctIdx === "number"
                      ? q.options[correctIdx]
                      : null;

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
                  <View
                    key={idx}
                    style={{
                      borderRadius: 14,
                      backgroundColor: Colors.dark.bg_light,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#1F1D1D",
                    }}
                  >
                    <Text
                      style={[
                        styles.txtItalic,
                        { fontSize: 15, marginBottom: 15, fontWeight: "600" },
                      ]}
                    >
                      {questionText}
                    </Text>

                    <Text
                      style={[
                        styles.txt,
                        {
                          fontSize: 14,
                          marginBottom: 10,
                          color: Colors.dark.text_muted,
                        },
                      ]}
                    >
                      {t("yourAnswer")}:{" "}
                      <Text
                        style={{
                          fontFamily: ITALIC_FONT,
                          color: Colors.dark.danger,
                        }}
                      >
                        {userAnswerLabel}
                      </Text>
                    </Text>
                    <Text
                      style={[
                        styles.txt,
                        {
                          fontSize: 14,
                          color: Colors.dark.text_muted,
                        },
                      ]}
                    >
                      {t("correctAnswer")}:{" "}
                      <Text
                        style={{
                          fontFamily: ITALIC_FONT,
                          color: Colors.dark.success,
                        }}
                      >
                        {correctAnswerLabel}
                      </Text>
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* If everything correct */}
        {wrongResults.length === 0 && (
          <View style={{ marginTop: 10 }}>
            <Text
              style={[
                styles.txt,
                {
                  fontSize: 14,
                  textAlign: "center",
                  color: Colors.dark.text_muted,
                },
              ]}
            >
              {t("allCorrect")}
            </Text>
          </View>
        )}

        {/* Close button */}
        <TouchableOpacity
          style={{
            marginTop: 20,
            marginBottom: 10,
            backgroundColor: Colors.dark.text,
            borderRadius: 999,
            paddingVertical: 12,
            alignItems: "center",
          }}
          activeOpacity={0.7}
          onPress={onClose}
        >
          <Text
            style={{
              color: Colors.dark.bg_dark,
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            {t("backToEvents")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (showResult && submitResult) {
    const handleResultClose = async () => {
      // await queryClient.refetchQueries({
      //   queryKey: ["dailyQuizUserProgress"],
      //   type: "all",
      // });
      // await refreshUser();
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // router.back();
      setShowResult(false);
      setShowStreakScreen(true);
    };

    return (
      <Result
        result={submitResult}
        questions={dailyQuizData.quiz.questions}
        language={user.language}
        onClose={handleResultClose}
      />
    );
  }

  type StreakScreenProps = {
    baseStreak: number; // before quiz
    newStreak: number; // after quiz
    onClose: () => void;
  };

  const StreakScreen: React.FC<StreakScreenProps> = ({
    baseStreak,
    newStreak,
    onClose,
  }) => {
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

    if (increased) {
      title = `🔥 Streak ${newStreak} days!`;
      subtitle = "You kept your daily streak going. Keep it up!";
    } else if (firstTime) {
      title = "✨ New streak started!";
      subtitle = "You completed your first Daily Quiz streak day.";
    } else if (reset) {
      title = "💔 Streak reset";
      subtitle = `You are back to a 1-day streak. Try to play again tomorrow.`;
    } else {
      // fallback (should rarely happen)
      title = `Streak: ${newStreak} days`;
      subtitle = "Come back tomorrow to grow your streak.";
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#131313",
          paddingHorizontal: 20,
          paddingTop: 60,
          alignItems: "center",
        }}
      >
        {/* Animation */}
        <View style={{ width: 100, height: 100, marginBottom: 20 }}>
          <LottieView
            ref={fireRef}
            autoPlay
            loop={increased || firstTime} // maybe no loop if reset
            source={fireAnimation}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        {/* Text */}
        <Text
          style={[
            styles.txt,
            {
              fontSize: 24,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 10,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.txt,
            {
              fontSize: 14,
              textAlign: "center",
              color: Colors.dark.text_muted,
              marginBottom: 30,
            },
          ]}
        >
          {subtitle}
        </Text>

        {/* Streak progression card */}
        <View
          style={{
            width: "100%",
            borderRadius: 18,
            backgroundColor: Colors.dark.bg_light,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text
            style={[
              styles.txt,
              {
                fontSize: 14,
                marginBottom: 10,
              },
            ]}
          >
            Streak progress
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text
                style={[
                  styles.txt,
                  { fontSize: 12, color: Colors.dark.text_muted },
                ]}
              >
                Previous
              </Text>
              <Text
                style={[
                  styles.txt,
                  { fontSize: 20, fontWeight: "700", marginTop: 2 },
                ]}
              >
                {baseStreak}
              </Text>
            </View>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text
                style={[
                  styles.txt,
                  { fontSize: 12, color: Colors.dark.text_muted },
                ]}
              >
                Current
              </Text>
              <Text
                style={[
                  styles.txt,
                  { fontSize: 22, fontWeight: "700", marginTop: 2 },
                ]}
              >
                {newStreak}
              </Text>
            </View>
          </View>

          {/* Simple progress bar toward 7-day target */}
          <View
            style={{
              borderRadius: 999,
              backgroundColor: Colors.dark.border_muted,
              overflow: "hidden",
              height: 8,
            }}
          >
            <View
              style={{
                width: `${Math.min((newStreak / 7) * 100, 100)}%`,
                height: "100%",
                backgroundColor: Colors.dark.primary,
              }}
            />
          </View>
          <Text
            style={[
              styles.txt,
              {
                fontSize: 12,
                marginTop: 4,
                color: Colors.dark.text_muted,
                textAlign: "right",
              },
            ]}
          >
            {newStreak}/7 days to bonus reward
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={{
            marginTop: "auto",
            marginBottom: 40,
            backgroundColor: Colors.dark.text,
            borderRadius: 999,
            paddingVertical: 12,
            paddingHorizontal: 32,
          }}
          onPress={onClose}
        >
          <Text
            style={{
              color: Colors.dark.bg_dark,
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            Back to Events
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          paddingHorizontal: 15,
          backgroundColor: "#131313",
          height: "100%",
          gap: 20,
        }}
      >
        <Text
          style={[
            styles.txt,
            {
              fontWeight: 700,
              fontSize: 25,
              textAlign: "center",
            },
            isSmallPhone && { fontSize: 20 },
          ]}
        >
          {t("dailyQuiz")}
        </Text>
        <View
          style={{
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
          }}
        >
          <Text
            style={[
              styles.txt,
              {
                fontSize: 14,
                marginTop: 15,
                fontWeight: 600,
                position: "absolute",
                top: -8,
                left: 12,
              },
            ]}
          >
            {t("question")} {currQuestionIndex + 1}
          </Text>
          <Text
            style={[
              styles.txt,
              { fontSize: 25, textAlign: "center" },
              isSmallPhone && { fontSize: 20 },
            ]}
          >
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
            isSmallPhone && {
              flexWrap: "wrap",
              flexDirection: "row",
              justifyContent: "center",
            },
          ]}
        >
          {currQuestion.type === QUESTION_TYPES.SA && (
            <TextInput
              selectionColor={Colors.dark.text}
              placeholder="Type your answer..."
              placeholderTextColor={Colors.dark.text_muted}
              value={shortAnswer}
              onChangeText={(t) => setShortAnswer(t)}
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
              style={{
                width: "100%",
                height: 60,
                borderColor: Colors.dark.border_muted,
                borderWidth: 1,
                paddingHorizontal: 20,
                fontSize: 18,
                borderRadius: 20,
                color: Colors.dark.text,
                fontFamily: REGULAR_FONT,
              }}
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
          {currQuestion.type !== QUESTION_TYPES.SA &&
            currQuestion.type !== QUESTION_TYPES.NUM &&
            currQuestion.options.map((o: any, index: number) => {
              if (currQuestion.type === QUESTION_TYPES.MC)
                return (
                  <Pressable
                    key={index}
                    style={[
                      {
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
                      isSmallPhone && { width: "45%", paddingLeft: 15 },
                      pressedAnswer === index && {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                      selectedAnswer === index && {
                        backgroundColor: "#232423",
                        borderColor: "#323333",
                      },
                    ]}
                    onPressIn={() => setPressedAnswer(index)}
                    onPress={() => {
                      selectedAnswer === index
                        ? setSelectedAnswer(null)
                        : setSelectedAnswer(index);
                      Haptics.selectionAsync();
                    }}
                    onPressOut={() => setPressedAnswer(null)}
                  >
                    <Text
                      style={[
                        styles.txtItalic,
                        { fontSize: 20 },
                        isSmallPhone && { fontSize: 16, textAlign: "center" },
                        pressedAnswer === index && {
                          color: Colors.dark.text_muted,
                        },
                      ]}
                    >
                      {o.text[languageMap[user.language]]}
                    </Text>
                  </Pressable>
                );
              else if (currQuestion.type === QUESTION_TYPES.TF)
                return (
                  <Pressable
                    key={index}
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
                      pressedAnswer === index && {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                      selectedAnswer === index && {
                        backgroundColor: "#232423",
                        borderColor: "#323333",
                      },
                    ]}
                    onPressIn={() => setPressedAnswer(index)}
                    onPress={() => {
                      selectedAnswer === index
                        ? setSelectedAnswer(null)
                        : setSelectedAnswer(index);
                      Haptics.selectionAsync();
                    }}
                    onPressOut={() => setPressedAnswer(null)}
                  >
                    <Text
                      style={[
                        styles.txtItalic,
                        {
                          color: Colors.dark.success,
                          fontSize: 20,
                          textAlign: "center",
                        },
                        o.text["en"] === "False" && {
                          color: Colors.dark.danger,
                        },
                        pressedAnswer === index &&
                          o.text["en"] === "False" && {
                            color: Colors.dark.danger_muted,
                          },
                        pressedAnswer === index &&
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
        <View
          style={[
            {
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: "auto",
            },
            isSmallPhone && { paddingBottom: 10 },
          ]}
        >
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
                (selectedAnswer !== null ? true : false) || sliderValue !== -1
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DailyQuiz;

const styles = StyleSheet.create({
  txt: { color: Colors.dark.text, fontFamily: REGULAR_FONT },
  txtItalic: {
    fontFamily: ITALIC_FONT,
    color: Colors.dark.text,
  },
});
