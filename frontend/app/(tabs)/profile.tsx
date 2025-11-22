import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useUser } from "@/context/userContext";
import { Colors } from "@/constants/Colors";
import SettingsIcon from "@/assets/svgs/settings.svg";
import EditIcon from "@/assets/svgs/edit.svg";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import QuizLogo from "@/components/ui/QuizLogo";
import Info from "@/components/ui/Info";
import {
  HEIGHT,
  isSmallPhone,
  myHeight,
  myWidth,
  WIDTH,
} from "@/constants/Dimensions";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import NextArr from "@/assets/svgs/nextArr.svg";
import PrevArr from "@/assets/svgs/prevArr.svg";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import BookDashed from "@/assets/svgs/book-dashed.svg";
import ProfileCardModal from "@/components/ui/ProfileCardModal";
import Loader from "@/components/ui/Loader";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProgress, fetchUserHistory } from "@/services/api";
import { QuizType } from "@/types";

export default function Profile() {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id,
  });
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["userHistory"],
    queryFn: fetchUserHistory,
    enabled: !!user?._id,
  });
  const progressList = progressData?.progress || [];
  const lastPlayed = historyData?.lastPlayed || [];
  const [categroyPressed, setCategoryPressed] = useState<string>("");
  const [currIndex, setCurrIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currLogoFile, setCurrLogoFile] = useState<string>("");

  useEffect(() => {
    if (lastPlayed[0]?.quizId?.logoFile) {
      setCurrLogoFile(lastPlayed[0].quizId.logoFile);
    }
  }, [lastPlayed]);

  const progressMap = useMemo(() => {
    const map = new Map();
    progressList.forEach((p: QuizType) => {
      map.set(p.quizId._id, p);
    });
    return map;
  }, [progressList]);

  useEffect(() => {
    if (user) {
      setCategoryPressed(t("uncompleted"));
    }
  }, [user]);

  if (!user || loading || progressLoading || historyLoading)
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Loader />
      </View>
    );

  let filteredQuizzes = progressList.filter((quiz: any) => {
    if (
      !quiz.completed &&
      !quiz.perfected &&
      categroyPressed === t("uncompleted")
    ) {
      return true;
    } else if (
      categroyPressed === t("completed") &&
      quiz.completed &&
      !quiz.perfected
    ) {
      return true;
    } else if (
      categroyPressed === t("perfect") &&
      quiz.completed &&
      quiz.perfected
    ) {
      return true;
    }
    return false;
  });

  const goNext = () => {
    if (currIndex < filteredQuizzes.length - 1) {
      setCurrIndex(currIndex + 1);
    }
  };

  const goPrev = () => {
    if (currIndex > 0) {
      setCurrIndex(currIndex - 1);
    }
  };

  const currentProgressList = progressMap.get(
    filteredQuizzes[currIndex]?.quizId._id
  ) || {
    questionsCompleted: 0,
    rewardsTotal: 0,
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        {
          alignItems: "center",
          paddingTop: 4,
        },
      ]}
    >
      <View
        style={[
          defaultStyles.containerRow,
          {
            width: "100%",
            justifyContent: "space-between",
            paddingHorizontal: 20,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <TouchableOpacity
            onPress={() => {
              setIsVisible(true);
            }}
            activeOpacity={0.7}
            style={{
              borderWidth: 2,
              borderColor: user.theme.cardColor,
              transform: [{ rotate: "45deg" }],
              padding: 3,
              borderRadius: 20,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                transform: [{ rotate: "0deg" }],
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 15,
              }}
            >
              <Image
                src={user?.profileImage}
                width={60}
                height={60}
                style={{
                  transform: [{ rotate: "-45deg" }],
                }}
              />
            </View>
          </TouchableOpacity>
          <Text
            style={[
              styles.txt,
              {
                fontSize: 18,
                fontWeight: "600",
              },
              user.name.length > 10 && { fontSize: 16 },
            ]}
          >
            {user.name}
          </Text>
          {/* <TouchableOpacity
            activeOpacity={0.7}
            style={{
              borderWidth: 1,
              borderColor: Colors.dark.border,
              paddingHorizontal: 7,
              paddingVertical: 6,
              borderRadius: 15,
              backgroundColor: Colors.dark.bg_light,
              minWidth: 50,
            }}
          >
            <Text
              style={{
                color: Colors.dark.text,

                fontSize: 16,
                fontFamily: REGULAR_FONT,
                fontWeight: "600",

                textAlign: "center",
              }}
            >
              {user.level}
            </Text>
          </TouchableOpacity> */}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={() => {
              router.push("/(settings)/editProfile");
            }}
            activeOpacity={0.7}
            style={[styles.iconBackground, isSmallPhone && { padding: 12 }]}
          >
            <EditIcon width={24} height={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(settings)")}
            activeOpacity={0.7}
            style={[styles.iconBackground, isSmallPhone && { padding: 12 }]}
          >
            <SettingsIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
      {lastPlayed.length > 0 && (
        <View style={{ width: "100%", gap: 20 }}>
          <Text
            style={[
              styles.txt,
              { fontSize: 18, marginLeft: 10, marginTop: 30 },
            ]}
          >
            {t("lastPlayed")}
          </Text>
          <View
            style={[
              {
                flexDirection: "row",
                width: "100%",
                borderWidth: 1,
                borderColor: Colors.dark.border_muted,
                borderRadius: 10,
                height: 320,
              },
              lastPlayed.length === 0 && { height: 100 },
            ]}
          >
            {lastPlayed.length === 0 ? (
              <Text
                style={{
                  color: Colors.dark.text,
                  textAlign: "center",
                  width: "100%",
                  margin: "auto",
                  fontSize: 20,
                  fontFamily: REGULAR_FONT,
                  fontWeight: "500",
                }}
              >
                Play Quizzes
              </Text>
            ) : (
              lastPlayed.map((quiz: QuizType, index: number) => {
                const quizId = quiz.quizId;
                const currentProgress = progressMap.get(quiz.quizId._id) || {
                  questionsCompleted: 0,
                  rewardsTotal: 0,
                };
                return (
                  <View
                    key={index}
                    style={[
                      {
                        width: "50%",
                        height: "100%",
                        paddingHorizontal: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                      },
                      index === 0 && {
                        borderRightWidth: 1,
                        borderColor: Colors.dark.border,
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "57%",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        borderColor: Colors.dark.border,
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          router.push({
                            pathname: "/(quizzes)/quiz",
                            params: {
                              id: quizId._id,
                            },
                          });
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: Colors.dark.border,
                          borderRadius: 10,
                          overflow: "hidden",
                          height: WIDTH * (100 / myWidth),
                          width: WIDTH * (100 / myWidth),
                        }}
                      >
                        {quizId.logoFile ? (
                          <QuizLogo name={quizId.logoFile} />
                        ) : (
                          <QuizLogo name={currLogoFile} />
                        )}
                      </TouchableOpacity>
                      <Text
                        style={[
                          styles.txt_muted,
                          { fontSize: 5, textAlign: "center", width: "75%" },
                        ]}
                      >
                        <Info company={quizId.company} title={quizId.title} />
                      </Text>
                      <Text
                        style={[
                          styles.txt,
                          {
                            fontSize: 14,
                            textAlign: "center",
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {quizId.title}
                      </Text>
                    </View>
                    <View style={{ width: "80%", gap: 15 }}>
                      <View style={{ gap: 5 }}>
                        <Text style={[styles.txt, { fontSize: 12 }]}>
                          {t("progress")}
                        </Text>
                        <View
                          style={{
                            width: "100%",
                            backgroundColor: Colors.dark.border_muted,
                            borderRadius: 6,
                          }}
                        >
                          <ProgressBar
                            color={Colors.dark.text}
                            height={3}
                            total={quizId.questionsTotal}
                            progress={currentProgress?.questionsCompleted}
                          />
                        </View>
                        <Text style={[styles.txt, { fontSize: 10 }]}>
                          {Math.floor(
                            (currentProgress?.questionsCompleted /
                              quizId.questionsTotal) *
                              100
                          )}
                          %
                        </Text>
                      </View>
                      <View style={{ gap: 5 }}>
                        <Text style={[styles.txt, { fontSize: 12 }]}>
                          {t("rewards")}
                        </Text>
                        <View
                          style={{
                            width: "100%",
                            backgroundColor: Colors.dark.border_muted,
                            borderRadius: 6,
                          }}
                        >
                          <ProgressBar
                            color={Colors.dark.secondary}
                            height={3}
                            total={quizId.rewardsTotal}
                            progress={currentProgress?.rewardsTotal}
                          />
                        </View>
                        <Text style={[styles.txt, { fontSize: 10 }]}>
                          {currentProgress?.rewardsTotal} /{" "}
                          {quizId.rewardsTotal}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      )}
      <View
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 30,
          gap: 20,
          marginLeft: 10,
          marginBottom: 20,
        }}
      >
        <Text style={[styles.txt, { fontSize: 18 }]}>{t("yourQuizzes")}</Text>
        <TouchableOpacity
          onPress={() => router.push("/(quizzes)/collection")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.txt_muted,
              { fontSize: 15, textDecorationLine: "underline" },
            ]}
          >
            {t("viewAll")} -{">"}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: "100%",
          borderColor: Colors.dark.border_muted,
          borderWidth: 1,
          borderRadius: 10,
          height: 350,
          padding: 20,
          justifyContent: "space-between",
        }}
      >
        <View
          style={[
            {
              flexDirection: "row",
              gap: 20,
              justifyContent: "center",
              alignItems: "center",
            },
            isSmallPhone && { gap: 10 },
          ]}
        >
          {[t("uncompleted"), t("completed"), t("perfect")].map(
            (category, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setCategoryPressed(category);
                  setCurrIndex(0);
                }}
                key={index}
                style={[
                  styles.categoryButton,
                  category === categroyPressed && {
                    backgroundColor: Colors.dark.text,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    styles.txt,
                    category === categroyPressed && {
                      color: Colors.dark.bg,
                      fontWeight: 600,
                    },
                    category === categroyPressed &&
                      Platform.OS === "android" && { fontWeight: 700 },
                    { fontSize: 13 },
                    isSmallPhone && { fontSize: 10 },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes[currIndex].quizId.logoFile && (
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: "/(quizzes)/quiz",
                    params: {
                      id: filteredQuizzes[currIndex].quizId._id,
                    },
                  });
                }}
                style={{
                  width: WIDTH * (150 / myWidth),
                  height: WIDTH * (150 / myWidth),
                  borderRadius: 10,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: Colors.dark.border,
                }}
              >
                <QuizLogo name={filteredQuizzes[currIndex].quizId.logoFile} />
              </TouchableOpacity>
              <View
                style={{
                  gap: 10,
                }}
              >
                <Text
                  numberOfLines={2}
                  style={[
                    styles.txt,
                    {
                      fontWeight: 700,
                      fontSize: 20,
                      width: WIDTH * (200 / myWidth),
                    },
                    isSmallPhone && { fontSize: 18 },
                  ]}
                >
                  {filteredQuizzes[currIndex].quizId.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 25,
                  }}
                >
                  <View
                    style={[
                      { width: WIDTH * (120 / myWidth) },
                      // categroyPressed === t("uncompleted") && {
                      //   width: WIDTH * (170 / myWidth),
                      // },
                    ]}
                  >
                    <Text style={[styles.txt]}>{t("progress")}</Text>
                    <View
                      style={{
                        backgroundColor: Colors.dark.border_muted,
                        borderRadius: 10,
                        marginVertical: 5,
                      }}
                    >
                      <ProgressBar
                        color={Colors.dark.text}
                        total={filteredQuizzes[currIndex].quizId.questionsTotal}
                        progress={currentProgressList.questionsCompleted}
                      />
                    </View>
                    <Text style={[styles.txt, { fontSize: 10 }]}>
                      {Math.floor(
                        (currentProgressList.questionsCompleted /
                          filteredQuizzes[currIndex].quizId.questionsTotal) *
                          100
                      )}
                      %
                    </Text>

                    <Text style={[styles.txt, { marginTop: 10 }]}>
                      {t("rewards")}
                    </Text>
                    <View
                      style={{
                        backgroundColor: Colors.dark.border_muted,
                        borderRadius: 10,
                        marginVertical: 5,
                      }}
                    >
                      <ProgressBar
                        color={Colors.dark.secondary}
                        total={filteredQuizzes[currIndex].quizId.rewardsTotal}
                        progress={currentProgressList.rewardsTotal}
                      />
                    </View>
                    <Text style={[styles.txt, { fontSize: 10 }]}>
                      {currentProgressList.rewardsTotal} /{" "}
                      {filteredQuizzes[currIndex].quizId.rewardsTotal}
                    </Text>
                  </View>

                  {categroyPressed === t("completed") && (
                    <View
                      style={{
                        borderWidth: 4,
                        borderColor: Colors.dark.success,
                        width: 50,
                        height: 50,
                        borderRadius: 50,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={[
                          styles.txt,
                          {
                            fontSize: 30,
                            fontWeight: 800,
                          },
                        ]}
                      >
                        A
                      </Text>
                    </View>
                  )}
                  {categroyPressed === t("perfect") && (
                    <View
                      style={{
                        borderWidth: 4,
                        borderColor: "#e31010ff",
                        width: 50,
                        height: 50,
                        borderRadius: 50,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={[
                          styles.txt,
                          {
                            fontSize: 30,
                            fontWeight: 800,
                          },
                        ]}
                      >
                        S
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )
        ) : (
          <View style={{ alignItems: "center", gap: 10 }}>
            <BookDashed
              width={40}
              height={40}
              color={Colors.dark.text_muted}
              fill={"transparent"}
            />
            {categroyPressed === t("uncompleted") && (
              <Text style={styles.txt_muted}>{t("noUncompletedQuizzes")}</Text>
            )}
            {categroyPressed === t("completed") && (
              <Text style={styles.txt_muted}>{t("noCompletedQuizzes")}</Text>
            )}
            {categroyPressed === t("perfect") && (
              <Text style={styles.txt_muted}>{t("noPerfectQuizzes")}</Text>
            )}
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: Colors.dark.border,
            padding: 10,
            borderRadius: 15,
            width: "80%",
            alignSelf: "center",
          }}
        >
          <TouchableOpacity onPress={goPrev}>
            <PrevArr width={20} height={20} />
          </TouchableOpacity>
          <Text style={styles.txt_muted}>
            {filteredQuizzes.length === 0
              ? 0
              : filteredQuizzes.length - 1 - currIndex}
            {filteredQuizzes.length !== 0 && "+"}
          </Text>
          <TouchableOpacity onPress={goNext}>
            <Text style={styles.txt}>
              <NextArr width={20} height={20} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ProfileCardModal isVisible={isVisible} setIsVisible={setIsVisible} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  iconBackground: {
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    borderRadius: 15,
  },
  txt: {
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.bg_dark,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 13,
  },
  categoryButtonText: {
    color: Colors.dark.text,
  },
});
