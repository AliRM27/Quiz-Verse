import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { REGULAR_FONT } from "@/constants/Styles";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { QuizType } from "@/types";
import QuizLogo from "./ui/QuizLogo";
import Right from "@/assets/svgs/rightAnswers.svg";
import Wrong from "@/assets/svgs/wrongAnswers.svg";
import { useEffect, useState } from "react";
import CircularProgress from "./ui/CircularProgress";
import { LineDashed } from "./ui/Line";
import ProgressBar from "./animatinos/progressBar";
import { useTranslation } from "react-i18next";
import { streakMilestones, timeBonusThresholds } from "@/utils/rewardsSystem";

const RewardComponent = ({
  name,
  rewards,
  total,
  progress,
  bonuses,
  difficulty,
}: {
  name: string;
  rewards: number;
  total: number;
  progress: number;
  bonuses: number[];
  difficulty?: "Easy" | "Medium" | "Hard" | "Extreme";
}) => {
  let milestones: any[] = [];

  if (name === "Streak") {
    milestones = difficulty ? streakMilestones[difficulty] : [];
  } else if (name === "Time")
    milestones = difficulty ? timeBonusThresholds[difficulty] : [];

  return (
    <View style={styles.rewardStats}>
      <Text style={[styles.txt]}>
        {name} rewards: +{rewards}
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {milestones.map((bonus, index) => {
          let number = bonus.threshold | bonus.limit;

          return (
            <View
              key={index}
              style={[
                {
                  borderWidth: 1,
                  borderColor: Colors.dark.border,
                  borderRadius: 30,
                  width: 36,
                  height: 36,
                  justifyContent: "center",
                  alignItems: "center",
                },
                (number === bonuses[index] || number === bonuses[index]) && {
                  borderColor: Colors.dark.text,
                },
              ]}
            >
              <Text
                style={[
                  styles.txt,
                  { fontSize: 12 },
                  bonus.threshold && { fontSize: 15 },
                  number !== bonuses[index] &&
                    number !== bonuses[index] && {
                      color: Colors.dark.border,
                    },
                ]}
              >
                {number}
                {bonus.limit && "s"}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.txt]}>
        {progress} / {total}
      </Text>
    </View>
  );
};

const Result = ({
  quiz,
  selectedLevelIndex,
  correctAnswers,
  total,
  rewards,
  newQuestions,
  questionRewards,
  streak,
  time,
  mult,
}: {
  quiz: QuizType;
  selectedLevelIndex: string;
  correctAnswers: number;
  total: number;
  rewards: number;
  newQuestions: number;
  questionRewards: number;
  streak: number;
  time: number;
  mult: number;
}) => {
  const { refreshUser, user } = useUser();
  const { t } = useTranslation();
  const [value, setValue] = useState<number>(0);
  const [rewardsValue, setRewardsValue] = useState<number>(0);
  const [showAnimation, setShowAnimation] = useState<string>("");

  const userProgress = user?.progress.find((p) => p.quizId._id === quiz._id)
    .sections[Number(selectedLevelIndex)];

  const quizProgress = quiz.sections[Number(selectedLevelIndex)];

  useEffect(() => {
    setValue(
      Math.floor(
        ((userProgress.questions - newQuestions) /
          quizProgress.questions.length) *
          100
      ) || 0
    );
    setRewardsValue(userProgress.rewards - rewards);

    if (newQuestions) {
      setTimeout(() => {
        setValue(
          Math.floor(
            (userProgress.questions / quizProgress.questions.length) * 100
          )
        );
        setShowAnimation("1");
      }, 2000);
    }

    if (rewards > 0) {
      setTimeout(
        () => {
          setRewardsValue(userProgress.rewards || 0);
          setShowAnimation("2");
        },
        newQuestions ? 3500 : 1500
      );
    }

    setTimeout(() => {
      setShowAnimation("3");
    }, 5000);
  }, []);

  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg,
        alignItems: "center",
        height: "100%",
        paddingTop: 30,
        gap: 30,
        paddingBottom: 50,
      }}
    >
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 100,
            height: 100,
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
          {quizProgress.difficulty}{" "}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          justifyContent: "space-evenly",
          marginVertical: 10,
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
      <View style={{ width: "100%", paddingHorizontal: 10 }}>
        {[
          {
            type: "Questions",
            rewards: questionRewards,
            total: total * mult,
            progress: userProgress.questions * mult,
          },
          {
            type: "Streak",
            rewards: streak,
            total: 100,
            progress: userProgress.streaksRewards,
          },
          {
            type: "Time",
            rewards: time,
            total: 50,
            progress: userProgress.timeRewards,
          },
          {
            type: "Total",
            rewards: rewards,
            total: quizProgress.rewards,
            progress: userProgress.rewards,
          },
        ].map(
          (
            r: {
              type: string;
              rewards: number;
              total: number;
              progress: any;
            },
            index
          ) => {
            let bonuses = [];
            if (r.type === "Streak")
              bonuses = userProgress.streaks.sort(
                (a: number, b: number) => a - b
              );
            else if (r.type === "Time")
              bonuses = userProgress.timeBonuses.sort(
                (a: number, b: number) => b - a
              );

            return (
              <RewardComponent
                key={index}
                name={r.type}
                rewards={r.rewards}
                total={r.total}
                progress={r.progress}
                bonuses={bonuses}
                difficulty={
                  r.type === "Streak" || r.type === "Time"
                    ? (quizProgress.difficulty as
                        | "Easy"
                        | "Medium"
                        | "Hard"
                        | "Extreme")
                    : undefined
                }
              />
            );
          }
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          width: "100%",
          height: 130,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: Colors.dark.border_muted,
            padding: 15,
            borderRadius: 20,
            alignItems: "center",
            height: "100%",
            gap: 10,
            width: "30%",
          }}
        >
          {showAnimation === "1" && (
            <Text style={[styles.txt, { fontSize: 16, fontWeight: "600" }]}>
              +{" "}
              {newQuestions &&
                Math.floor(
                  (newQuestions / quizProgress.questions.length) * 100
                )}{" "}
              %
            </Text>
          )}
          <Text style={[styles.txt, { fontSize: 16, fontWeight: "600" }]}>
            {t("progress")}
          </Text>
          <LineDashed needMargin={true} margin={5} />
          <CircularProgress
            progress={value}
            size={50}
            strokeWidth={3}
            fontSize={12}
          />
        </View>
        <View
          style={{
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: Colors.dark.border_muted,
            padding: 15,
            borderRadius: 20,
            width: "50%",
            height: "100%",
          }}
        >
          {showAnimation === "2" && (
            <Text style={[styles.txt, { fontSize: 16, fontWeight: "600" }]}>
              + {rewards}
            </Text>
          )}
          <Text style={[styles.txt, { fontSize: 16, fontWeight: "600" }]}>
            {t("rewards")}
          </Text>
          <LineDashed needMargin={true} margin={15} />
          <View
            style={{
              width: "80%",
              backgroundColor: Colors.dark.border_muted,
              borderRadius: 6,
            }}
          >
            <ProgressBar
              color={"#FFB11F"}
              progress={rewardsValue}
              total={quizProgress.rewards}
              height={3}
            />
          </View>
          <Text style={[styles.txt, { fontSize: 13 }]}>
            {rewardsValue} / {quizProgress.rewards}
          </Text>
        </View>
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
            router.replace("/(tabs)");
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
  rewardStats: {
    borderBottomWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 15,
    fontSize: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
