import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { layout } from "@/constants/Dimensions";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchQuiz } from "@/services/api";

export default function Index() {
  const { id } = useLocalSearchParams();
  const { data, isLoading } = useQuery({
    queryKey: ["quizLevel", id],
    queryFn: ({ queryKey }) => fetchQuiz(queryKey[1]),
  });

  if (isLoading) {
    return (
      <View
        style={{
          alignItems: "center",
          paddingTop: layout.paddingTop,
          backgroundColor: Colors.dark.bg_dark,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  console.log(data);

  return (
    <View
      style={{
        alignItems: "center",
        paddingTop: layout.paddingTop,
        backgroundColor: Colors.dark.bg_dark,
        height: "100%",
      }}
    >
      <Text style={{ color: Colors.dark.text }}>{data.title}</Text>
    </View>
  );
}
