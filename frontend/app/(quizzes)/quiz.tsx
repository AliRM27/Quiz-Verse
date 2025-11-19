import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { HEIGHT, myHeight, myWidth, WIDTH } from "@/constants/Dimensions";
import { QuizType } from "@/types";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import { LineDashed } from "@/components/ui/Line";
import CircularProgress from "@/components/ui/CircularProgress";
import RotatingGradient from "@/components/ui/gradients/GlowingView";
import QuizLogo from "@/components/ui/QuizLogo";
import Info from "@/components/ui/Info";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import { PRICES } from "@/constants/Prices";
import {
  updateUser,
  updateUserProgress,
  fetchUserProgress,
} from "@/services/api";
import LockOpen from "@/assets/svgs/lock-open.svg";
import Lock from "@/assets/svgs/lock.svg";
import { languageMap } from "@/utils/i18n";
import Trophy from "@/assets/svgs/trophy.svg";
import { fetchQuiz } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/ui/Loader";
import * as Haptics from "expo-haptics";

const Quiz = () => {
  const { id } = useLocalSearchParams();
  const opacity = useRef(new Animated.Value(1)).current;
  const { t } = useTranslation();
  const { user, refreshUser } = useUser();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);
  const [ready, setReady] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["quizzes", id],
    queryFn: ({ queryKey }) => fetchQuiz(queryKey[1]),
  });
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id,
  });

  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    opacity.setValue(1);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [ready]);

  if (!user) return null;

  if (!ready || isLoading || progressLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.dark.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader />
      </View>
    );
  }

  const quiz: QuizType = data;
  const progressList = progressData?.progress || [];
  const currentProgress = progressList.find((p: any) => p.quizId._id === id);
  const isUnlocked = Boolean(currentProgress);

  return (
    <>
      <View
        collapsable={false}
        style={{ alignItems: "center", gap: 15, marginTop: 50 }}
      >
        <Animated.View style={{ opacity: isUnlocked ? opacity : 1 }}>
          <RotatingGradient>
            <TouchableOpacity
              disabled={!isUnlocked}
              activeOpacity={0.6}
              style={styles.logoContainer}
              onPress={() => {
                router.replace({
                  pathname: "/quizLevel/[id]/[section]",
                  params: {
                    id: quiz._id,
                    section: selectedLevelIndex,
                  },
                });
              }}
            >
              <QuizLogo name={quiz.logoFile} />
            </TouchableOpacity>
          </RotatingGradient>
        </Animated.View>

        <View style={{ width: "100%", alignItems: "center", gap: 5 }}>
          <Text style={[styles.txt, { fontSize: 24 }]}>{quiz.title}</Text>
          <Text
            style={[
              styles.txt_muted,
              {
                fontSize: 10,
                width: "60%",
                textAlign: "center",
              },
            ]}
          >
            <Info company={quiz.company} title={quiz.title} />
          </Text>
        </View>
      </View>
      <ScrollView
        collapsable={false}
        horizontal={false}
        style={{ width: "100%", height: "100%", marginTop: 50 }}
        contentContainerStyle={{
          alignItems: "center",
          gap: 35,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={isUnlocked}
      >
        <View
          style={[
            defaultStyles.containerRow,
            {
              width: "100%",
              justifyContent: "space-evenly",
              height: HEIGHT * (115 / myHeight),
              flexWrap: "wrap",
            },
          ]}
        >
          <View
            style={[
              defaultStyles.containerBackground,
              {
                height: "100%",
                paddingVertical: HEIGHT * (10 / myHeight),
                width: "30%",
                justifyContent: "flex-start",
                gap: HEIGHT * (10 / myHeight),
                borderRadius: 25,
                backgroundColor: Colors.dark.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.txt,
                {
                  fontSize:
                    WIDTH * ((t("progress").length > 11 ? 15 : 14) / myWidth),
                },
              ]}
            >
              {t("progress")}
            </Text>
            <LineDashed />
            <View>
              <CircularProgress
                progress={
                  currentProgress
                    ? Math.floor(
                        (currentProgress?.questionsCompleted /
                          quiz.questionsTotal) *
                          100
                      )
                    : 0
                }
                size={HEIGHT * (50 / myHeight)}
                strokeWidth={3}
                fontSize={12}
              />
            </View>
          </View>
          <View
            style={[
              defaultStyles.containerBackground,
              {
                width: "50%",
                paddingVertical: 10,
                height: "100%",
                justifyContent: "flex-start",
                gap: HEIGHT * (10 / myHeight),
                borderRadius: 25,
                backgroundColor: Colors.dark.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.txt,
                {
                  width: "100%",
                  textAlign: "center",
                  fontSize: WIDTH * (15 / myWidth),
                },
              ]}
            >
              {t("rewards")}
            </Text>
            <LineDashed />
            <View
              style={{
                width: "80%",
                backgroundColor: Colors.dark.border_muted,
                borderRadius: 6,
                marginTop: HEIGHT * (10 / myHeight),
              }}
            >
              <ProgressBar
                color={"#FFB11F"}
                progress={currentProgress?.rewardsTotal}
                total={quiz.rewardsTotal}
              />
            </View>
            <Text style={[styles.txt, { fontSize: 12 }]}>
              {currentProgress ? currentProgress.rewardsTotal : 0} /{" "}
              {quiz.rewardsTotal}
            </Text>
          </View>
        </View>

        {isUnlocked ? (
          <View
            style={[
              defaultStyles.containerRow,
              {
                width: "80%",
                flexWrap: "wrap",
                justifyContent: "space-around",
                gap: 15,
                marginBottom: 50,
              },
            ]}
          >
            {quiz.sections.map((lvl, index) => {
              const sectionSummary = currentProgress?.sections?.[index] || {
                questions: 0,
                rewards: 0,
              };
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={index}
                  style={[
                    defaultStyles.containerBackground,
                    {
                      paddingHorizontal: 10,
                      justifyContent: "flex-start",
                      backgroundColor: Colors.dark.bg,
                      width: "40%",
                      gap: WIDTH * (10 / myWidth),
                      height: HEIGHT * (180 / myHeight),
                    },
                    selectedLevelIndex === index && {
                      borderColor: Colors.dark.text,
                    },
                  ]}
                  onPress={() => {
                    setSelectedLevelIndex(index);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[
                      styles.txt,
                      {
                        fontSize: WIDTH * (16 / myWidth),
                        textAlign: "center",
                        marginBottom: 15,
                      },
                      languageMap[user.language] === "ru" &&
                        lvl.difficulty === "Extreme" && {
                          fontSize: WIDTH * (11 / myWidth),
                        },
                    ]}
                  >
                    {t(lvl.difficulty)}
                  </Text>
                  <View style={{ width: "100%", alignItems: "center", gap: 5 }}>
                    <Text style={[styles.txt_muted]}>{t("progress")}</Text>
                    <View
                      style={{
                        width: "80%",
                        backgroundColor: Colors.dark.border_muted,
                        borderRadius: 6,
                      }}
                    >
                      <ProgressBar
                        color={Colors.dark.text}
                        progress={sectionSummary.questions}
                        total={lvl.questions.length}
                        height={3}
                      />
                    </View>
                    <Text style={[styles.txt_muted, { fontSize: 10 }]}>
                      {sectionSummary.questions} / {lvl.questions.length}
                    </Text>
                  </View>
                  <View style={{ width: "100%", alignItems: "center", gap: 5 }}>
                    <Text style={[styles.txt_muted]}>{t("rewards")}</Text>
                    <View
                      style={{
                        width: "80%",
                        backgroundColor: Colors.dark.border_muted,
                        borderRadius: 6,
                      }}
                    >
                      <ProgressBar
                        color={"#FFB11F"}
                        progress={sectionSummary.rewards}
                        total={lvl.rewards}
                        height={3}
                      />
                    </View>
                    <Text style={[styles.txt_muted, { fontSize: 10 }]}>
                      {sectionSummary.rewards} / {lvl.rewards}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={{ alignItems: "center", gap: 15, marginTop: "auto" }}>
            {user.stars >= PRICES.quizzes.single.price.trophies && (
              <Text style={styles.txt}>{t("unlockNow")}</Text>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={loading}
              onPress={async () => {
                setLoading(true);
                if (!user) return;
                if (user?.stars >= PRICES.quizzes.single.price.trophies) {
                  try {
                    await updateUser({
                      stars: user.stars - PRICES.quizzes.single.price.trophies,
                    });
                    await updateUserProgress({ quizId: quiz._id });
                    await queryClient.invalidateQueries({
                      queryKey: ["userProgress"],
                    });
                    await queryClient.invalidateQueries({
                      queryKey: ["userProgressDetail", id],
                    });
                    await refreshUser();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  } catch (err) {
                    console.log(err);
                  }
                }
                setLoading(false);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#121212ff",
                gap: 20,
                paddingHorizontal: 20,
                paddingVertical: 15,
                borderRadius: 30,
                borderWidth: 1,
                borderColor: Colors.dark.border_muted,
                width: 200,
              }}
            >
              {!loading ? (
                <>
                  {user.stars >= PRICES.quizzes.single.price.trophies ? (
                    <LockOpen color={Colors.dark.secondary} />
                  ) : (
                    <Lock color={Colors.dark.text} />
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Trophy
                      color={Colors.dark.secondary}
                      width={20}
                      height={20}
                    />
                    <Text style={[styles.txt, { fontSize: 16 }]}>
                      {PRICES.quizzes.single.price.trophies}
                    </Text>
                  </View>
                </>
              ) : (
                <Loader />
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default Quiz;

const styles = StyleSheet.create({
  logoContainer: {
    width: HEIGHT * (170 / myHeight),
    height: HEIGHT * (170 / myHeight),
    borderRadius: 10,
    overflow: "hidden",
  },
  txt: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: REGULAR_FONT,
    fontWeight: 600,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 12,
    fontFamily: REGULAR_FONT,
  },
});
