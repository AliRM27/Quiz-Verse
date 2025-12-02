import { View, Text, TouchableWithoutFeedback, Keyboard } from "react-native";
import ArrBack from "@/components/ui/ArrBack";
import { useSafeAreaBg } from "@/context/safeAreaContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Colors } from "@/constants/Colors";
import { fetchDailyQuiz } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/ui/Loader";

const DailyQuiz = () => {
  const { setSafeBg } = useSafeAreaBg();

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

  if (!dailyQuizData || dailyQuizLoading) {
    return (
      <View>
        <Loader />
      </View>
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
        <ArrBack />
        <Text style={{ color: "white" }}>
          {dailyQuizData.quiz.questions[0].question.en}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DailyQuiz;
