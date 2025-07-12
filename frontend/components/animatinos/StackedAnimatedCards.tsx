import React from "react";
import { Dimensions, View, StyleSheet, Text } from "react-native";
import { MotiView } from "moti";
import Rdr2Logo from "@/assets/svgs/quizzes/rdr2Logo.svg";
import Dbh from "@/assets/svgs/quizzes/dbhLogo.svg";
import { Colors } from "@/constants/Colors";

const windowWidth = Dimensions.get("window").width;

const cards = [
  <Dbh key={0} style={{ position: "absolute", top: -10, left: -13 }} />,
  <Rdr2Logo key={1} style={{ position: "absolute", top: -10, left: -13 }} />,
  <Dbh key={0} style={{ position: "absolute", top: -10, left: -13 }} />,
  <Rdr2Logo key={1} style={{ position: "absolute", top: -10, left: -13 }} />,
  <Dbh key={0} style={{ position: "absolute", top: -10, left: -13 }} />,
  <Rdr2Logo key={1} style={{ position: "absolute", top: -10, left: -13 }} />,
  <Dbh key={0} style={{ position: "absolute", top: -10, left: -13 }} />,
  <Rdr2Logo key={1} style={{ position: "absolute", top: -10, left: -13 }} />,
];

export default function StackedAnimatedCards() {
  return (
    <View style={styles.container}>
      {cards.map((style, index) => (
        <MotiView
          key={index}
          from={{ translateX: -windowWidth / 2 }}
          animate={{ translateX: windowWidth }}
          transition={{
            loop: false,
            type: "timing",
            duration: 5000,
            delay: index * 6000, // each card starts after the previous finishes
          }}
          style={[styles.card]}
        >
          {cards[index]}
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 140, // same as card height
    width: windowWidth,
    overflow: "hidden",
    position: "relative", // parent for absolute children
  },
  card: {
    width: 140,
    height: 140,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: Colors.dark.text,
  },
});
