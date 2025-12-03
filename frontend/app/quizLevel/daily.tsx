import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Button,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import ArrBack from "@/components/ui/ArrBack";
import { useSafeAreaBg } from "@/context/safeAreaContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Colors } from "@/constants/Colors";
import { fetchDailyQuiz } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/ui/Loader";
import { isSmallPhone } from "@/constants/Dimensions";
import { languageMap } from "@/utils/i18n";
import { useUser } from "@/context/userContext";
import CircularProgress from "@/components/ui/CircularProgress";
import { useTranslation } from "react-i18next";
import { QUESTION_TYPES } from "@/types";
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";
import SliderComponent from "@/components/ui/SliderComponent";
import * as Haptics from "expo-haptics";

const DailyQuiz = () => {
  const { setSafeBg } = useSafeAreaBg();
  const [currQuestionIndex, setCurrQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(-1);
  const [questionLoading, setQuestionLoading] = useState<boolean>(false);
  const [shortAnswer, setShortAnswer] = useState<string>("");
  const [pressedAnswer, setPressedAnswer] = useState<number | null>(null);
  const { user } = useUser();
  const { t } = useTranslation();

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

  if (!dailyQuizData || dailyQuizLoading || !user) {
    return (
      <View>
        <Loader />
      </View>
    );
  }

  const currSection = dailyQuizData.quiz.questions;
  const currQuestion = dailyQuizData.quiz.questions[currQuestionIndex];

  const handleNextButton = () => {
    setCurrQuestionIndex((p) => p + 1);
  };

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
        <ArrBack />
        <Text
          style={[
            styles.txt,
            { fontWeight: 700, fontSize: 25, textAlign: "center" },
          ]}
        >
          Daily Quiz
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
              !(
                currQuestionIndex <= currSection.length - 1 &&
                (selectedAnswer !== null ||
                  shortAnswer.trim() !== "" ||
                  sliderValue !== -1)
              ) || questionLoading
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
