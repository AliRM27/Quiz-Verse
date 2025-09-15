import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { useUser } from "@/context/userContext";
import { router } from "expo-router";
import ArrBack from "@/assets/svgs/backArr.svg";

const Collection = () => {
  const { user, loading } = useUser();
  if (loading || !user) {
    return;
  }
  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg_dark,
        height: "100%",
        paddingVertical: layout.paddingTop,
        paddingHorizontal: 15,
        gap: 20,
        alignItems: "center",
      }}
    >
      <Pressable
        style={{ alignSelf: "flex-start" }}
        onPress={() => router.back()}
      >
        <ArrBack />
      </Pressable>
      <Text style={[styles.txt, { fontSize: 25 }]}>Your Quizzes</Text>
      <View style={{}}>
        {user.unlockedQuizzes.map((quiz, index) => (
          <Text key={index} style={styles.txt}>
            {quiz.quizId.title}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default Collection;

const styles = StyleSheet.create({
  txt: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
  },
  txt_muted: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text_muted,
  },
});
