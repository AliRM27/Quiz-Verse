import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { HEIGHT, layout, myHeight } from "@/constants/Dimensions";
import { Colors } from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchQuiz } from "@/services/api";
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

export default function Index() {
  const { id, section } = useLocalSearchParams<{
    id: string;
    section: string;
  }>();
  const [currQuestionIndex, setCurrQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
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
  const [rewards, setRewards] = useState<number>(0);
  const [questionRewards, setQuestionRewards] = useState<number>(0);
  const [streakRewards, setStreakRewards] = useState<number>(0);
  const [timeRewards, setTimeRewards] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mult, setMult] = useState<number>(0);

  let unlockedStreaksVar: Set<number> = new Set();

  const newCorrectIndexesRef = useRef<Set<number>>(new Set());

  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [newQuestions, setNewQuestions] = useState<number>(0);
  const [questionLoading, setQuestionLoading] = useState<boolean>(false);

  useEffect(() => {
    newCorrectIndexesRef.current = new Set();
  }, []);

  useEffect(() => {
    // Start timer at first question
    if (currQuestionIndex === 0 && startTime === null) {
      setStartTime(Date.now());
      setTimeLeft(0);
    }

    // Update timer every second
    let interval: NodeJS.Timeout | null = null;
    if (startTime !== null) {
      interval = setInterval(() => {
        setTimeLeft(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currQuestionIndex, startTime]);

  if (loading || isLoading || !user) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          paddingTop: layout.paddingTop,
          backgroundColor: Colors.dark.bg_dark,
        }}
      >
        <ActivityIndicator size={40} color={Colors.dark.text} />
      </View>
    );
  }

  const currSection = data.sections[Number(section)];
  const currQuestion =
    data.sections[Number(section)].questions[currQuestionIndex];
  const currProgress = user?.progress.find((q) => q.quizId._id === data._id);
  const prevAnswered = currProgress.sections[Number(section)].answered ?? [];
  const sectionProgress = currProgress.sections[Number(section)];

  unlockedStreaksVar = new Set(sectionProgress.streaks);

  const handleNextButton = async () => {
    setQuestionLoading(true);
    let isCorrect: boolean;

    // --- Determine if the answer is correct ---
    if (selectedAnswer !== null) {
      isCorrect = currQuestion.options[selectedAnswer].isCorrect;
    } else {
      isCorrect =
        currQuestion.options.find(
          (o: any) =>
            o.isCorrect &&
            o.text[languageMap[user.language]].toLowerCase().trim() ===
              shortAnswer.toLowerCase().trim()
        ) !== undefined;
    }

    // --- Track current streak locally ---
    const newCurrentStreak = isCorrect ? currentStreak + 1 : 0;
    const newMaxStreak = Math.max(maxStreak, newCurrentStreak);

    if (isCorrect) setCorrectAnswers((p) => p + 1);
    else setCurrentStreak(0);

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
    } else {
      setCurrQuestionIndex((p) => p + 1);
    }
    setShortAnswer("");
    setSelectedAnswer(null);
    setQuestionLoading(false);
  };

  const handleUserLastPlayed = async () => {
    if (user.lastPlayed.length === 0) {
      user.lastPlayed = [{ quizId: data._id }];
      await updateUser({ lastPlayed: user.lastPlayed });
    } else if (user.lastPlayed[0].quizId._id !== data._id) {
      user.lastPlayed = [{ quizId: data._id }, ...user.lastPlayed];
      user.lastPlayed.length > 2 && user.lastPlayed.pop();
      await updateUser({ lastPlayed: user?.lastPlayed });
    }
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
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          paddingTop: layout.paddingTop,
          paddingBottom: 40,
          paddingHorizontal: 15,
          backgroundColor: "#131313",
          height: "100%",
          gap: 20,
        }}
      >
        <Pressable
          onPress={async () => {
            try {
              if (user.lastPlayed.length === 0) {
                user.lastPlayed = [{ quizId: data._id }];
                await updateUser({ lastPlayed: user.lastPlayed });
              } else if (user.lastPlayed[0].quizId._id !== data._id) {
                user.lastPlayed = [{ quizId: data._id }, ...user.lastPlayed];
                user.lastPlayed.length > 2 && user.lastPlayed.pop();
                await updateUser({ lastPlayed: user?.lastPlayed });
              }
              await refreshUser();
              router.replace("/(tabs)");
            } catch (err) {
              console.log(err);
            }
          }}
        >
          <BackArr />
        </Pressable>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ gap: 10 }}>
            <Text
              style={[
                styles.txt,
                {
                  fontSize: 25,
                  fontWeight: "600",
                },
              ]}
            >
              {data.title}
            </Text>
          </View>
          <View
            style={{
              alignItems: "center",
              gap: 10,
              width: "20%",
            }}
          >
            <View
              style={{
                width: HEIGHT * (60 / myHeight),
                height: HEIGHT * (60 / myHeight),
                borderRadius: 10,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: Colors.dark.border,
              }}
            >
              <QuizLogo name={data.logoFile} />
            </View>
            <View
              style={{
                width: "100%",
                backgroundColor: Colors.dark.border,
                borderRadius: 6,
              }}
            >
              <View
                style={{
                  width: `${(currProgress.sections[Number(section)].rewards / data.sections[Number(section)].rewards) * 100}%`,
                  height: 2,
                  borderRadius: 6,
                  backgroundColor: Colors.dark.secondary,
                }}
              />
            </View>
            <Text style={[styles.txt]}>{currSection.difficulty}</Text>
          </View>
        </View>
        <View
          style={{
            borderWidth: 1,
            backgroundColor: Colors.dark.bg_light,
            borderColor: "#1F1D1D",
            padding: 20,
            paddingVertical: 30,
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
                top: -10,
                left: 10,
              },
            ]}
          >
            {t("question")} {currQuestionIndex + 1}
          </Text>
          <Text
            style={[
              styles.txt,
              { fontSize: 25, textAlign: "center", lineHeight: 35 },
            ]}
          >
            {currQuestion.question[languageMap[user.language]]}
          </Text>
        </View>
        <View
          style={[
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
          {currQuestion.type !== QUESTION_TYPES.SA &&
            currQuestion.options.map((o: any, index: number) => {
              if (currQuestion.type === QUESTION_TYPES.MC)
                return (
                  <Pressable
                    key={index}
                    style={[
                      {
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
                    onPress={() =>
                      selectedAnswer === index
                        ? setSelectedAnswer(null)
                        : setSelectedAnswer(index)
                    }
                    onPressOut={() => setPressedAnswer(null)}
                  >
                    <Text
                      style={[
                        styles.txtItalic,
                        { fontSize: 20 },
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
                    onPress={() =>
                      selectedAnswer === index
                        ? setSelectedAnswer(null)
                        : setSelectedAnswer(index)
                    }
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
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: "auto",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
            }}
          >
            <Heart />
            <Text style={[styles.txt, { fontSize: 20 }]}>2</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.6}
            disabled={
              !(
                currQuestionIndex <= currSection.questions.length - 1 &&
                (selectedAnswer !== null || shortAnswer.trim() !== "")
              ) || questionLoading
            }
            onPress={() => handleNextButton()}
          >
            <CircularProgress
              size={80}
              strokeWidth={3}
              progress={currQuestionIndex + 1}
              fontSize={18}
              percent={false}
              total={currSection.questions.length}
              arrow={
                (selectedAnswer !== null ? true : false) ||
                shortAnswer.trim() !== ""
              }
            />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={[styles.txt, { fontSize: 20 }]}>3</Text>
            <Hint />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  txt: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
  },
  txtItalic: {
    fontFamily: ITALIC_FONT,
    color: Colors.dark.text,
  },
});
