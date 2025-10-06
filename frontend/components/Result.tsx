import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { REGULAR_FONT, ITALIC_FONT } from "@/constants/Styles";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { QuizType } from "@/types";
import QuizLogo from "./ui/QuizLogo";
import Right from "@/assets/svgs/rightAnswers.svg";
import Wrong from "@/assets/svgs/wrongAnswers.svg";

const Result = ({
  quiz,
  selectedLevelIndex,
  correctAnswers,
  total,
  rewards,
}: {
  quiz: QuizType;
  selectedLevelIndex: string;
  correctAnswers: number;
  total: number;
  rewards: number;
}) => {
  const { refreshUser } = useUser();
  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg,
        alignItems: "center",
        height: "100%",
        paddingTop: layout.paddingTop,
        gap: 30,
        paddingBottom: 50,
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Text style={[styles.txt, { fontSize: 20, fontWeight: "bold" }]}>
          You did
        </Text>
        <Text
          style={[
            styles.txt,
            { fontSize: 30, fontWeight: "800", marginTop: 10 },
          ]}
        >
          PERFECT
        </Text>
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.dark.border,
            overflow: "hidden",
            marginVertical: 30,
          }}
        >
          <QuizLogo name={quiz.logoFile} />
        </View>

        <Text style={[styles.txt, { fontSize: 25, fontWeight: "bold" }]}>
          {quiz.title}
        </Text>
        <Text style={[styles.txt_muted, { fontSize: 15, marginTop: 10 }]}>
          {quiz.sections[Number(selectedLevelIndex)].difficulty}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          justifyContent: "space-evenly",
          marginVertical: 20,
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
            {correctAnswers}
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
            {total - correctAnswers}
          </Text>
          <Wrong width={15} height={15} />
        </View>
      </View>
      <View style={{ alignItems: "center", gap: 10 }}>
        <Text style={[styles.txt, { fontSize: 17, fontWeight: "600" }]}>
          Rewards
        </Text>
        <Text style={[styles.txt, { fontSize: 15, fontFamily: ITALIC_FONT }]}>
          +{rewards} trophies
        </Text>
      </View>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-evenly",
          width: "100%",
          marginTop: "auto",
        }}
      >
        <TouchableOpacity
          onPress={async () => {
            try {
              await refreshUser();
              router.replace("/(tabs)");
            } catch (e) {
              console.log(e);
            }
          }}
          activeOpacity={0.7}
          style={[styles.button, { width: "50%" }]}
        >
          <Text style={[styles.txt, { fontSize: 17, fontWeight: "600" }]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await refreshUser();
            router.replace({
              pathname: "/quizLevel/[id]/[section]",
              params: {
                id: quiz._id,
                section: selectedLevelIndex,
              },
            });
          }}
          activeOpacity={0.7}
          style={[styles.button, { width: "30%" }]}
        >
          <Text style={[styles.txt, { fontSize: 17, fontWeight: "600" }]}>
            Replay
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Result;

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  txt_muted: { color: Colors.dark.text_muted, fontFamily: REGULAR_FONT },
  button: {
    backgroundColor: Colors.dark.bg_light,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 50,
  },
});
