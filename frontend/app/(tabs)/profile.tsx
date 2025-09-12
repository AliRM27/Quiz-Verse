import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useUser } from "@/context/userContext";
import { Colors } from "@/constants/Colors";
import SettingsIcon from "@/assets/svgs/settings.svg";
import EditIcon from "@/assets/svgs/edit.svg";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import QuizLogo from "@/components/ui/QuizLogo";
import Info from "@/components/ui/Info";
import { myWidth, WIDTH } from "@/constants/Dimensions";
import QuizModal from "@/components/animatinos/QuizModal";
import { useMemo, useState } from "react";
import { router } from "expo-router";

export default function Profile() {
  const { user, loading } = useUser();
  const [currQuiz, setCurrQuiz] = useState(user?.lastPlayed[0]?.quizId);
  const [visible, setVisible] = useState<boolean>(false);
  const [categroyPressed, setCategoryPressed] = useState<string>("Uncompleted");
  const [currIndex, setCurrIndex] = useState<number>(0);
  const [currLogoFile, setCurrLogoFile] = useState<string>(
    user?.lastPlayed[0]?.quizId.logoFile
  );

  const progressMap = useMemo(() => {
    const map = new Map();
    user?.progress.forEach((p) => {
      map.set(p.quizId._id, p);
    });
    return map;
  }, [user?.progress]);

  if (!user || loading)
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  const filteredQuizzes = user.progress.filter((quiz) => {
    if (
      !quiz.completed &&
      !quiz.perfected &&
      categroyPressed === "Uncompleted"
    ) {
      return true;
    } else if (
      categroyPressed === "Completed" &&
      quiz.completed &&
      !quiz.perfected
    ) {
      return true;
    } else if (
      categroyPressed === "Perfect" &&
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
  );

  return (
    <ScrollView
      contentContainerStyle={{
        alignItems: "center",
        gap: 30,
        paddingTop: 10,
      }}
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
          <View
            style={{
              borderWidth: 2,
              borderColor: "#58d01cff",
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
          </View>
          <Text
            style={[
              styles.txt,
              {
                fontSize: 18,
                fontWeight: "600",
              },
            ]}
          >
            {user?.name}
          </Text>
          <Text
            style={{
              color: Colors.dark.text,
              borderWidth: 1,
              borderColor: Colors.dark.border,
              paddingHorizontal: 5,
              borderRadius: 15,
              backgroundColor: Colors.dark.bg,
              fontSize: 14,
              fontFamily: REGULAR_FONT,
              width: 30,
              textAlign: "center",
            }}
          >
            {user?.level}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity activeOpacity={0.6} style={styles.iconBackground}>
            <EditIcon width={24} height={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(settings)")}
            activeOpacity={0.6}
            style={styles.iconBackground}
          >
            <SettingsIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ width: "100%", gap: 20 }}>
        <Text style={[styles.txt, { fontSize: 18, marginLeft: 10 }]}>
          Last Played
        </Text>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            borderWidth: 1,
            borderColor: Colors.dark.border_muted,
            borderRadius: 10,
            height: 320,
          }}
        >
          {user.lastPlayed.length === 0 ? (
            <Text
              style={{
                color: Colors.dark.text,
                textAlign: "center",
                width: "100%",
                margin: "auto",
              }}
            >
              Play Quizzes
            </Text>
          ) : (
            user?.lastPlayed?.map((quiz, index) => {
              const quizId = quiz.quizId;
              const currentProgress = progressMap.get(quiz.quizId._id);
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
                        setCurrQuiz(quizId);
                        setVisible((p) => !p);
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
                    <View style={{ gap: 3 }}>
                      <Text style={[styles.txt, { fontSize: 12 }]}>
                        Progress
                      </Text>
                      <View
                        style={{
                          width: "100%",
                          backgroundColor: Colors.dark.border_muted,
                          borderRadius: 6,
                        }}
                      >
                        <View
                          style={{
                            width: `${(currentProgress?.questionsCompleted / quizId.questionsTotal) * 100}%`,
                            backgroundColor: Colors.dark.text,
                            borderRadius: 6,
                            height: 3,
                          }}
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
                    <View style={{ gap: 3 }}>
                      <Text style={[styles.txt, { fontSize: 12 }]}>
                        Rewards
                      </Text>
                      <View
                        style={{
                          width: "100%",
                          backgroundColor: Colors.dark.border_muted,
                          borderRadius: 6,
                        }}
                      >
                        <View
                          style={{
                            width: `${(currentProgress?.rewardsTotal / quizId.rewardsTotal) * 100}%`,
                            backgroundColor: Colors.dark.secondary,
                            borderRadius: 6,
                            height: 3,
                          }}
                        />
                      </View>
                      <Text style={[styles.txt, { fontSize: 10 }]}>
                        {currentProgress?.rewardsTotal} / {quizId.rewardsTotal}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
      <Text
        style={[
          styles.txt,
          { alignSelf: "flex-start", fontSize: 18, marginLeft: 10 },
        ]}
      >
        Your Quizzes
      </Text>
      <View
        style={{
          width: "100%",
          borderColor: Colors.dark.border,
          borderWidth: 1,
          borderRadius: 10,
          height: 300,
          padding: 20,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          {["Uncompleted", "Completed", "Perfect"].map((category, index) => (
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
                  category === categroyPressed && { color: Colors.dark.bg },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {filteredQuizzes.length > 0 &&
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
                  setCurrQuiz(filteredQuizzes[currIndex].quizId);
                  setVisible((p) => !p);
                }}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 10,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: Colors.dark.border,
                }}
              >
                <QuizLogo name={filteredQuizzes[currIndex].quizId.logoFile} />
              </TouchableOpacity>
              <View style={{ gap: 10 }}>
                <Text style={[styles.txt, { fontWeight: 700, fontSize: 20 }]}>
                  {filteredQuizzes[currIndex].quizId.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View style={{ width: WIDTH * (120 / myWidth) }}>
                    <Text style={[styles.txt]}>Progress</Text>
                    <View
                      style={{
                        backgroundColor: Colors.dark.border_muted,
                        borderRadius: 10,
                        marginVertical: 5,
                      }}
                    >
                      <View
                        style={[
                          {
                            width: `${Math.floor((currentProgressList.questionsCompleted / filteredQuizzes[currIndex].quizId.questionsTotal) * 100)}%`,
                            height: 4,
                            backgroundColor: Colors.dark.text,
                            borderRadius: 10,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.txt_muted, { fontSize: 10 }]}>
                      {Math.floor(
                        (currentProgressList.questionsCompleted /
                          filteredQuizzes[currIndex].quizId.questionsTotal) *
                          100
                      )}
                      %
                    </Text>

                    <Text style={[styles.txt, { marginTop: 10 }]}>Rewards</Text>
                    <View
                      style={{
                        backgroundColor: Colors.dark.border_muted,
                        borderRadius: 10,
                        marginVertical: 5,
                      }}
                    >
                      <View
                        style={[
                          {
                            backgroundColor: Colors.dark.secondary,
                            width: `${Math.floor((currentProgressList.rewardsTotal / filteredQuizzes[currIndex].quizId.rewardsTotal) * 100)}%`,
                            height: 4,
                            borderRadius: 10,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.txt_muted, { fontSize: 10 }]}>
                      {currentProgressList.rewardsTotal} /{" "}
                      {filteredQuizzes[currIndex].quizId.rewardsTotal}
                    </Text>
                  </View>

                  {categroyPressed === "Completed" && (
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
                  {categroyPressed === "Perfect" && (
                    <Text style={[styles.txt]}>S</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={goPrev}>
            <Text style={styles.txt}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goNext}>
            <Text style={styles.txt}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
      {currQuiz && (
        <QuizModal
          quiz={currQuiz}
          isVisible={visible}
          setIsVisible={setVisible}
          currentProgress={user?.progress.find(
            (quizObj) => quizObj.quizId._id === currQuiz._id
          )}
        />
      )}
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
    borderWidth: 0,
    borderColor: Colors.dark.border,
    backgroundColor: "#222222ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryButtonText: {
    color: Colors.dark.text,
  },
});
