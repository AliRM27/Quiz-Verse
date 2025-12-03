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
import { defaultStyles } from "@/constants/Styles";
import { LineDashed } from "@/components/ui/Line";
import CircularProgress from "@/components/ui/CircularProgress";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import { isSmallPhone } from "@/constants/Dimensions";
import LottieView from "lottie-react-native";
import { fetchDailyQuiz } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { formatResetTime } from "@/utils/events";
import { router } from "expo-router";

const dailyQuiz = () => {
  const [hasCompletedToday, sethasCompletedToday] = useState(false);
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

  if (!user || dailyQuizLoading || !dailyQuizData || secondsLeft === null) {
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
            Daily Quiz
          </Text>
          <Text style={[{ fontSize: 13, marginBottom: 8 }, styles.txt_muted]}>
            5 random gaming questions.
          </Text>

          <Text style={[{ fontSize: 13, marginBottom: 2 }, styles.txt_muted]}>
            🧠 Difficulty: Mixed
          </Text>
          <Text style={[{ fontSize: 13 }, styles.txt_muted]}>
            🎁 Reward: +50 Trophies, +10 Gems
          </Text>

          {hasCompletedToday && (
            <Text
              style={{
                fontSize: 12,
                color: "#4ade80",
                marginBottom: 12,
                fontWeight: "600",
              }}
            >
              Completed today ✅
            </Text>
          )}
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
                progress={0}
                size={46}
                strokeWidth={2}
                fontSize={11}
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
                  progress={0}
                  total={50}
                  height={2}
                />
              </View>
              <Text style={[styles.txt, { fontSize: 12 }]}>
                {0} / {50}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.dark.text,
              borderRadius: 999,
              paddingVertical: 10,
              alignItems: "center",
            }}
            onPress={() => router.navigate("/quizLevel/daily")}
          >
            <Text
              style={{
                color: Colors.dark.bg_dark,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Start Quiz
            </Text>
          </TouchableOpacity>
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
              Daily Streak
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 5,
                justifyContent: "center",
              }}
            >
              <Text style={[{ fontSize: 20, fontWeight: "700" }, styles.txt]}>
                3
              </Text>
              {/* <LottieView
                ref={fireRef}
                autoPlay={false}
                loop
                source={fireAnimation}
                style={{ width: 35, height: 35 }}
              /> */}
            </View>
          </View>
          {/* Fake progress bar */}
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
              progress={3}
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
            How it works
          </Text>
          <Text style={[{ fontSize: 12, opacity: 0.8 }, styles.txt]}>
            • One new Daily Quiz every day.{"\n"}• You can play each Daily Quiz
            once.{"\n"}• Complete it to earn trophies and gems.{"\n"}• Keep your
            streak to unlock bigger rewards.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default dailyQuiz;

const styles = StyleSheet.create({
  txt: { color: Colors.dark.text, fontFamily: "Inter" },
  txt_muted: { color: Colors.dark.text_muted, fontFamily: "Inter" },
});
