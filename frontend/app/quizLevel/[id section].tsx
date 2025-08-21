import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Button,
} from "react-native";
import React, { useState } from "react";
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

export default function Index() {
  const { id, section } = useLocalSearchParams();
  const [currQuestionIndex, setCurrQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [pressedAnswer, setPressedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const { data, isLoading } = useQuery({
    queryKey: ["quizLevel", id],
    queryFn: ({ queryKey }) => fetchQuiz(queryKey[1]),
  });
  const { user, loading } = useUser();

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

  const handleNextButton = async () => {
    if (
      currQuestionIndex <= currSection.questions.length - 1 &&
      selectedAnswer !== null
    ) {
      const isCorrect = currQuestion.options[selectedAnswer].isCorrect;
      // Copy the current answered array
      const updatedAnswered = [
        ...currProgress.sections[Number(section)].answered,
      ];

      // Add current question index if correct and not already recorded
      if (isCorrect && !updatedAnswered.includes(currQuestionIndex)) {
        updatedAnswered.push(currQuestionIndex);
      }

      if (currQuestionIndex === currSection.questions.length - 1) {
        // Last question
        setShowResult(true);

        try {
          await updateUserProgress({
            quizId: id,
            difficulty: currSection.difficulty,
            updates: {
              questions: updatedAnswered.length, // total correct answers
              rewards: 0, // or your trophy logic
              answered: updatedAnswered, // store indexes of correct answers
            },
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        // Not last question
        setCurrQuestionIndex((p) => p + 1);
      }

      setSelectedAnswer(null);
    }
  };

  if (showResult)
    return (
      <Result
        correctAnswers={correctAnswers}
        total={currSection.questions.length}
      />
    );

  return (
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
        {currQuestion.options.map((o: any, index: number) => {
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
                    justifyContent: "center",
                  },
                  pressedAnswer === index && { elevation: 0 },
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
                    styles.txt,
                    { fontSize: 25 },
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
                  },
                  pressedAnswer === index && { elevation: 0 },
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
                    styles.txt,
                    {
                      color: Colors.dark.success,
                      fontSize: 25,
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
        <Pressable onPress={() => handleNextButton()}>
          <CircularProgress
            size={80}
            strokeWidth={3}
            progress={currQuestionIndex + 1}
            fontSize={30}
            percent={false}
            total={currSection.questions.length}
            arrow={selectedAnswer !== null ? true : false}
          />
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={[styles.txt, { fontSize: 20 }]}>3</Text>
          <Hint />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  txt: {
    fontFamily: "Italic-Regular",
    color: Colors.dark.text,
  },
});
