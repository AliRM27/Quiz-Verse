import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { isSmallPhone, layout } from "@/constants/Dimensions";
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { QuizType } from "@/types";
import QuizLogo from "./ui/QuizLogo";
import Right from "@/assets/svgs/rightAnswers.svg";
import Wrong from "@/assets/svgs/wrongAnswers.svg";
import { useEffect, useRef, useState } from "react";
import CircularProgress from "./ui/CircularProgress";
import { LineDashed } from "./ui/Line";
import ProgressBar from "./animatinos/progressBar";
import { useTranslation } from "react-i18next";
import { streakMilestones, timeBonusThresholds } from "@/utils/rewardsSystem";
import Trophy from "@/assets/svgs/trophy.svg";
import Loader from "./ui/Loader";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProgressDetail } from "@/services/api";

const RewardComponent = ({
  name,
  rewards,
  total,
  progress,
  bonuses,
  difficulty,
  mult,
}: {
  name: string;
  rewards: number;
  total: number;
  progress: number;
  bonuses: number[];
  difficulty?: "Easy" | "Medium" | "Hard" | "Extreme";
  mult?: number;
}) => {
  let milestones: any[] = [];
  const { t } = useTranslation();

  if (name === "Streak") {
    milestones = difficulty ? streakMilestones[difficulty] : [];
  } else if (name === "Time")
    milestones = difficulty ? timeBonusThresholds[difficulty] : [];

  return (
    <View
      style={[styles.rewardStats, name === "Total" && { borderBottomWidth: 0 }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Text style={[styles.txt, { fontSize: 15, fontWeight: "600" }]}>
          {t(name)}
          {/* {number !== undefined &&
            " (" + number + (name === "Time" ? "s" : "") + ") "} */}
          :
        </Text>
        {progress === total && rewards === 0 ? (
          <Text
            style={[
              {
                fontFamily: ITALIC_FONT,
                color: Colors.dark.secondary,
              },
            ]}
          >
            {" "}
            {t("max")}
          </Text>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Text
              style={[
                {
                  fontFamily: ITALIC_FONT,
                  color: Colors.dark.text,
                },
                name === "Total" && {
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors.dark.secondary,
                  fontFamily: REGULAR_FONT,
                },
              ]}
            >
              {"+"}
              {rewards}
            </Text>
            <Trophy color={Colors.dark.secondary} width={13} height={13} />
          </View>
        )}
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {milestones.map((bonus, index) => {
          let number = bonus.threshold | bonus.limit;
          let color = "";

          switch (index) {
            case 0:
              color = "rgba(154, 81, 81, 1)";
              break;
            case 1:
              color = "rgba(192, 192, 192, 1)";
              break;
            case 2:
              color = Colors.dark.secondary;
              break;
          }

          return (
            <View
              key={index}
              style={[
                {
                  borderWidth: 1,
                  borderColor: color,
                  borderRadius: 30,
                  width: 35,
                  height: 35,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: 0.4,
                },

                (number === bonuses[index] || number === bonuses[index]) && {
                  opacity: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.txt,
                  { fontSize: 11 },
                  bonus.threshold && { fontSize: 14 },
                ]}
              >
                {number}
                {bonus.limit && "s"}
              </Text>
            </View>
          );
        })}
        {/* {milestones.length === 0 && mult && (
          <Text style={[styles.txt, { fontSize: 15 }]}>
            {mult}x{rewards / mult}
          </Text>
        )} */}
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
  timeNumber,
  streakNumber,
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
  timeNumber: number;
  streakNumber: number;
}) => {
  const { user, refreshUser } = useUser();
  const { t } = useTranslation();
  const [value, setValue] = useState<number>(0);
  const [rewardsValue, setRewardsValue] = useState<number>(0);
  const [showAnimation, setShowAnimation] = useState<string>("");
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [loading, setloading] = useState(false);
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["userProgressDetail", quiz._id],
    queryFn: () => fetchUserProgressDetail(quiz._id),
    enabled: !!user?._id,
  });
  const userProgress =
    detailData?.progress?.sections?.[Number(selectedLevelIndex)] || null;

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const quizProgress = quiz.sections[Number(selectedLevelIndex)];

  useEffect(() => {
    scrollToBottom();
    if (!userProgress) return;
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
  }, [userProgress]);

  if (detailLoading || !userProgress) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.dark.bg,
        }}
      >
        <Loader />
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg,
        alignItems: "center",
        height: "100%",
        paddingTop: 30,
        gap: 20,
        paddingBottom: 50,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          alignItems: "center",
          gap: 30,
          paddingBottom: 50,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 30 }}>
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
            <View style={{ gap: 10 }}>
              <Text style={[styles.txt, { fontSize: 15, fontWeight: "600" }]}>
                {t("Questions")}: {questionRewards / mult}
              </Text>
              <Text style={[styles.txt, { fontSize: 15, fontWeight: "600" }]}>
                {t("Streak")}🔥: {streakNumber}
              </Text>
              <Text style={[styles.txt, { fontSize: 15, fontWeight: "600" }]}>
                {t("Time")}⏱️: {timeNumber}s
              </Text>
            </View>
          </View>

          <Text style={[styles.txt, { fontSize: 25, fontWeight: "bold" }]}>
            {quiz.title}
          </Text>
          <Text style={[styles.txt_muted, { fontSize: 15, marginTop: 10 }]}>
            {t(quizProgress.difficulty)}
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
        <Text
          style={[
            styles.txt,
            {
              alignSelf: "flex-start",
              fontSize: 16,
              fontWeight: "600",
              marginLeft: 15,
            },
          ]}
        >
          {t("rewards")}
        </Text>
        <View
          style={{
            width: "99%",
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: Colors.dark.border_muted,
            borderRadius: 10,
          }}
        >
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
                  mult={r.type === "Questions" ? mult : undefined}
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
            <Text
              style={[
                styles.txt,
                { fontSize: 15, fontWeight: "600" },
                isSmallPhone && { fontSize: 13 },
              ]}
            >
              {t("progress")}
            </Text>
            <LineDashed needMargin={true} margin={5} />
            <CircularProgress
              progress={value}
              size={50}
              strokeWidth={3}
              fontSize={12}
              showNumbers={true}
              totalNum={quizProgress.questions.length}
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
      </ScrollView>
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
            } catch (err) {
              console.log(err);
              return;
            }
            router.back();
          }}
          activeOpacity={0.7}
          style={[styles.button, { minWidth: "40%" }]}
        >
          <Text
            style={[
              styles.txt,
              {
                fontSize: 17,
                fontWeight: "600",
                color: Colors.dark.bg_dark,
              },
            ]}
          >
            {t("home")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            try {
              await refreshUser();
            } catch (err) {
              console.log(err);
              return;
            }
            router.replace({
              pathname: "/quizLevel/[id]/[section]",
              params: {
                id: quiz._id,
                section: selectedLevelIndex,
              },
            });
          }}
          activeOpacity={0.7}
          style={[styles.button, { minWidth: "40%" }]}
        >
          <Text
            style={[
              styles.txt,
              { fontSize: 17, fontWeight: "600", color: Colors.dark.bg_dark },
            ]}
          >
            {t("replay")}
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
    backgroundColor: Colors.dark.text,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 50,
  },
  rewardStats: {
    borderBottomWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
