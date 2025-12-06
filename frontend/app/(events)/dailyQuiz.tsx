import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewBase,
  InteractionManager,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Colors } from "@/constants/Colors";
import ArrBack from "@/components/ui/ArrBack";
import { useUser } from "@/context/userContext";
import Loader from "@/components/ui/Loader";
import Trophy from "@/assets/svgs/trophy.svg";
import DailyQuiz from "@/assets/svgs/dailyQuiz.svg";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import { LineDashed } from "@/components/ui/Line";
import CircularProgress from "@/components/ui/CircularProgress";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import { isSmallPhone } from "@/constants/Dimensions";
import LottieView from "lottie-react-native";
import { fetchDailyQuiz, fetchUserDailyQuizProgress } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { formatResetTime } from "@/utils/events";
import { router } from "expo-router";

const dailyQuiz = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const fireAnimation = useMemo(
    () => require("@/assets/animations/Fire.json"),
    []
  );
  const fireRef = useRef<LottieView | null>(null);

  const { data: dailyQuizData, isLoading: dailyQuizLoading } = useQuery({
    queryKey: ["dailyQuiz"],
    queryFn: fetchDailyQuiz,
  });

  const {
    data: dailyQuizUserProgressData,
    isLoading: dailyQuizUserProgressDataLoading,
  } = useQuery({
    queryKey: ["dailyQuizUserProgress"],
    queryFn: fetchUserDailyQuizProgress,
  });

  // Lottie
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      fireRef.current?.play();
    });
    return () => task.cancel();
  }, []);

  // ⬇️ Start with null, then set when data arrives
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // When dailyQuizData changes, initialize / reset the timer
  useEffect(() => {
    if (!dailyQuizData?.quiz) return;
    setSecondsLeft(dailyQuizData.quiz.resetsInSeconds);
  }, [dailyQuizData?.quiz?.resetsInSeconds]);

  // Timer effect
  useEffect(() => {
    // no data yet → do nothing
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formattedTime =
    secondsLeft !== null ? formatResetTime(secondsLeft) : "–h –min ⏱️";

  if (
    !user ||
    dailyQuizLoading ||
    !dailyQuizData ||
    secondsLeft === null ||
    !dailyQuizUserProgressData ||
    dailyQuizUserProgressDataLoading
  ) {
    if (dailyQuizData?.success === false)
      return (
        <View
          style={{
            backgroundColor: Colors.dark.bg_dark,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.dark.text }}>
            No Daily Quiz available
          </Text>
        </View>
      );

    return (
      <View
        style={{
          backgroundColor: Colors.dark.bg_dark,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader />
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg_dark,
        height: "100%",
        alignItems: "center",
        gap: 20,
        paddingHorizontal: 20,
      }}
    >
      <ArrBack />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ alignItems: "center", gap: 20 }}>
          <DailyQuiz width={160} height={60} />
          <Text style={[{ fontSize: 15 }, styles.txt_muted]}>
            {formattedTime}
          </Text>
        </View>
        {/* Trophies / Gems summary */}
        {/* <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.txt, { fontSize: 12 }]}>🏆 {user.stars}</Text>
          <Text style={[styles.txt, { fontSize: 12 }]}>💎 {user.gems}</Text>
        </View> */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, gap: 30, paddingTop: 30 }}
      >
        {/* Main Daily Quiz card */}
        <View
          style={{
            borderRadius: 16,
            padding: 16,
            backgroundColor: Colors.dark.bg_light,
          }}
        >
          <Text
            style={[
              {
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 15,
                textAlign: "center",
              },
              styles.txt,
            ]}
          >
            {t("dailyQuiz")}
          </Text>
          <Text style={[{ fontSize: 13, marginBottom: 8 }, styles.txt_muted]}>
            {t("dailyQuizDesc")}
          </Text>

          <Text style={[{ fontSize: 13, marginBottom: 2 }, styles.txt_muted]}>
            🧠 {t("difficultyDaily")}
          </Text>
          <Text style={[{ fontSize: 13 }, styles.txt_muted]}>
            🎁 {t("reward")}: 50 Trophies, 10 Gems
          </Text>
          <View
            style={[
              defaultStyles.containerRow,
              {
                width: "100%",
                justifyContent: "space-evenly",
                height: 120,
                marginVertical: 35,
              },
            ]}
          >
            <View
              style={[
                {
                  height: "100%",
                  width: "40%",
                  justifyContent: "flex-start",
                  gap: 10,
                  borderRadius: 25,
                  backgroundColor: Colors.dark.bg_light,
                  borderColor: Colors.dark.border,
                  alignItems: "center",
                  padding: isSmallPhone ? 13 : 18,
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.txt,
                  {
                    fontSize: 14,
                  },
                ]}
              >
                {t("progress")}
              </Text>
              <LineDashed />
              <CircularProgress
                progress={dailyQuizUserProgressData.correctCount}
                total={dailyQuizData.quiz.questions.length}
                size={46}
                strokeWidth={2}
                fontSize={11}
                percent={false}
              />
            </View>
            <View
              style={[
                {
                  width: "50%",
                  justifyContent: "flex-start",
                  height: "100%",
                  gap: 10,
                  borderRadius: 25,
                  backgroundColor: Colors.dark.bg_light,
                  borderColor: Colors.dark.border,
                  alignItems: "center",
                  padding: isSmallPhone ? 13 : 18,
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.txt,
                  {
                    width: "100%",
                    textAlign: "center",
                    fontSize: 15,
                  },
                ]}
              >
                {t("rewards")}
              </Text>
              <LineDashed />
              <View
                style={{
                  width: "80%",
                  backgroundColor: Colors.dark.border,
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <ProgressBar
                  color={Colors.dark.secondary}
                  progress={dailyQuizUserProgressData.totalRewards}
                  total={dailyQuizData.quiz.rewards.trophies}
                  height={2}
                />
              </View>
              <Text style={[styles.txt, { fontSize: 12 }]}>
                {dailyQuizUserProgressData.totalRewards} /{" "}
                {dailyQuizData.quiz.rewards.trophies}
              </Text>
            </View>
          </View>
          {dailyQuizUserProgressData.completed ? (
            <Text
              style={{
                fontSize: 17,
                color: "#4ade80",
                marginBottom: 15,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {t("completedToday")}
            </Text>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: dailyQuizUserProgressData.completed
                  ? Colors.dark.highlight
                  : Colors.dark.text,
                borderRadius: 999,
                paddingVertical: 10,
                alignItems: "center",
              }}
              activeOpacity={0.7}
              onPress={() => router.navigate("/quizLevel/daily")}
            >
              <Text
                style={{
                  color: Colors.dark.bg_dark,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {t("Start Quiz")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Streak card */}
        <View
          style={{
            borderRadius: 16,
            padding: 16,
            paddingTop: 10,
            backgroundColor: Colors.dark.bg_light,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 20,
            }}
          >
            <Text
              style={[
                {
                  fontSize: 16,
                  fontWeight: "700",
                },
                styles.txt,
              ]}
            >
              {t("dailyStreak")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 3,
                justifyContent: "center",
              }}
            >
              <Text style={[{ fontSize: 20, fontWeight: "700" }, styles.txt]}>
                {user.dailyQuizStreak}
              </Text>
              <LottieView
                ref={fireRef}
                autoPlay={false}
                loop
                source={fireAnimation}
                style={{ width: 35, height: 35 }}
              />
            </View>
          </View>
          <View
            style={{
              borderRadius: 999,
              backgroundColor: Colors.dark.border_muted,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <ProgressBar
              height={5}
              progress={user.dailyQuizStreak}
              color={Colors.dark.primary}
              total={7}
            />
          </View>
          <Text style={[{ fontSize: 13 }, styles.txt_muted]}>
            Reach 7 days for a bonus reward.
          </Text>
        </View>

        {/* Recent days */}
        {/* <View style={{}}>
          <Text
            style={[
              { fontSize: 16, fontWeight: "700", marginBottom: 8 },
              styles.txt,
            ]}
          >
            Recent Days
          </Text>
          <Text style={[{ fontSize: 13, marginBottom: 4 }, styles.txt]}>
            Today – Not started
          </Text>
          <Text style={[{ fontSize: 13, marginBottom: 4 }, styles.txt]}>
            Yesterday – Completed ✔ (4/5)
          </Text>
          <Text style={[{ fontSize: 13, marginBottom: 4 }, styles.txt]}>
            2 days ago – Completed ✔ (5/5)
          </Text>
        </View> */}

        {/* Info / rules */}
        <View
          style={{
            borderRadius: 12,
            padding: 12,
            backgroundColor: Colors.dark.bg_light,
          }}
        >
          <Text
            style={[
              {
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 4,
              },
              styles.txt,
            ]}
          >
            {t("howItWorks")}
          </Text>
          <Text style={[{ fontSize: 12, opacity: 0.8 }, styles.txt]}>
            {t("dailyQuizRules")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default dailyQuiz;

const styles = StyleSheet.create({
  txt: { color: Colors.dark.text, fontFamily: REGULAR_FONT },
  txt_muted: { color: Colors.dark.text_muted, fontFamily: REGULAR_FONT },
});
