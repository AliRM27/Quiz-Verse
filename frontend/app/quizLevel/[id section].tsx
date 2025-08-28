import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { layout } from "@/constants/Dimensions";
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
import { updateUserProgress } from "@/services/api";
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";

export default function Index() {
  const { id, section } = useLocalSearchParams();
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
  const { user, loading, refreshUser } = useUser();
  const [newCorrectIndexes, setNewCorrectIndexes] = useState(new Set<number>());

  useEffect(() => {
    setNewCorrectIndexes(new Set());
  }, [section, id]);

  if (loading || isLoading) {
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

  const handleNextButton = async () => {
    let isCorrect;
    if (selectedAnswer !== null)
      isCorrect = currQuestion.options[selectedAnswer].isCorrect;
    else
      isCorrect =
        currQuestion.options.find(
          (o: any) =>
            o.isCorrect &&
            o.text.toLowerCase().trim() === shortAnswer.toLowerCase().trim()
        ) !== undefined;

    isCorrect && setCorrectAnswers((p) => p + 1); // if you still show this in UI

    // If this question becomes newly-correct in this run, remember it
    if (isCorrect && !prevAnswered.includes(currQuestionIndex)) {
      setNewCorrectIndexes((prev) => {
        if (prev.has(currQuestionIndex)) return prev;
        const next = new Set(prev);
        next.add(currQuestionIndex);
        return next;
      });
    }

    const isLast = currQuestionIndex === currSection.questions.length - 1;

    if (isLast) {
      setShowResult(true);

      // Prepare payload: only new indexes from this run
      const pending = new Set<number>(newCorrectIndexes);
      if (isCorrect && !prevAnswered.includes(currQuestionIndex)) {
        pending.add(currQuestionIndex);
      }
      const delta = pending.size; // how many NEWly correct this run

      try {
        if (delta > 0) {
          await updateUserProgress({
            quizId: id,
            difficulty: currSection.difficulty,
            updates: {
              questions: delta, // <-- increment by delta
              rewards: 0, // or your trophy logic
              answered: Array.from(pending), // <-- only NEW indexes
            },
          });
        }
        setNewCorrectIndexes(new Set()); // clear buffer after sync
      } catch (err) {
        console.log(err);
      }
    } else {
      setCurrQuestionIndex((p) => p + 1);
    }

    setSelectedAnswer(null);
  };

  if (showResult)
    return (
      <Result
        correctAnswers={correctAnswers}
        total={currSection.questions.length}
      />
    );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          paddingTop: layout.paddingTop,
          paddingBottom: 50,
          paddingHorizontal: 15,
          backgroundColor: Colors.dark.bg_dark,
          height: "100%",
          gap: 20,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <BackArr />
        </Pressable>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={[
                styles.txt,
                {
                  fontSize: 17,
                  marginTop: 15,
                  fontWeight: 600,
                },
              ]}
            >
              Question {currQuestionIndex + 1}
            </Text>
            <Text
              style={[
                styles.txt,
                {
                  fontSize: 25,
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
                width: 60,
                height: 60,
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
                  width: `${currProgress.sections[Number(section)].rewards}%`,
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
            borderColor: Colors.dark.bg_light,
            padding: 20,
            paddingVertical: 30,
            borderRadius: 20,
            elevation: 3,
            shadowColor: Colors.dark.text_muted,
            marginBottom: 10,
            minHeight: "20%",
            justifyContent: "center",
          }}
        >
          <Text
            style={[
              styles.txt,
              { fontSize: 25, textAlign: "center", lineHeight: 35 },
            ]}
          >
            {currQuestion.question}
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
                        borderColor: Colors.dark.bg_light,
                        padding: 15,
                        paddingLeft: 30,
                        borderRadius: 50,
                        elevation: 3,
                        shadowColor: Colors.dark.text_muted,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        justifyContent: "center",
                      },
                      pressedAnswer === index && {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                      selectedAnswer === index && {
                        backgroundColor: Colors.dark.border_muted,
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
                      {o.text}
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
                        borderColor: Colors.dark.bg_light,
                        padding: 15,
                        width: "45%",
                        borderRadius: 50,
                        elevation: 3,
                        shadowColor: Colors.dark.text_muted,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                      },
                      pressedAnswer === index && {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                      selectedAnswer === index && {
                        backgroundColor: Colors.dark.border_muted,
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
                        o.text === "False" && { color: Colors.dark.danger },
                        pressedAnswer === index &&
                          o.text === "False" && {
                            color: Colors.dark.danger_muted,
                          },
                        pressedAnswer === index &&
                          o.text === "True" && {
                            color: Colors.dark.success_muted,
                          },
                      ]}
                    >
                      {o.text}
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
            activeOpacity={0.8}
            disabled={
              !(
                currQuestionIndex <= currSection.questions.length - 1 &&
                (selectedAnswer !== null || shortAnswer.trim() !== "")
              )
            }
            onPress={() => handleNextButton()}
          >
            <CircularProgress
              size={80}
              strokeWidth={3}
              progress={currQuestionIndex + 1}
              fontSize={23}
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
