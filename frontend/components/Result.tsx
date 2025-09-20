import { View, Text, StyleSheet, Button } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { REGULAR_FONT, ITALIC_FONT } from "@/constants/Styles";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";

const Result = ({
  correctAnswers,
  total,
  rewards,
}: {
  correctAnswers: number;
  total: number;
  rewards: number;
}) => {
  const { refreshUser } = useUser();
  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg_dark,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        paddingTop: layout.paddingTop,
        paddingHorizontal: 15,
      }}
    >
      <Text style={styles.txt}>
        Result: {correctAnswers} / {total}
      </Text>
      <Text style={styles.txt}>Rewards: {rewards}</Text>
      <Button
        title={"Back Home"}
        onPress={async () => {
          await refreshUser();
          router.back();
        }}
      />
    </View>
  );
};

export default Result;

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
});
