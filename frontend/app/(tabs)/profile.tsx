import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
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
  const [visible, setVisible] = useState(false);

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

  // const quizId = user.lastPlayed[0].quizId;
  // const currentProgress = progressMap.get(quizId._id);

  return (
    <View style={{ alignItems: "center", gap: 30 }}>
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            src={user?.profileImage}
            width={60}
            height={60}
            style={{ borderRadius: 50 }}
          />
          <Text
            style={[
              styles.txt,
              {
                fontSize: 18,
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
            height: 300,
          }}
        >
          {user?.lastPlayed.map((quiz, index) => {
            const quizId = quiz.quizId;
            const currentProgress = progressMap.get(quiz.quizId._id);
            return (
              <View
                key={index}
                style={[
                  {
                    width: "50%",
                    height: "100%",
                    paddingTop: 10,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    gap: 5,
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
                    height: "62%",
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderColor: Colors.dark.border,
                    gap: 5,
                  }}
                >
                  <TouchableOpacity
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
                    <QuizLogo name={quizId.logoFile} />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.txt_muted,
                      { fontSize: 5, textAlign: "center", width: "75%" },
                    ]}
                  >
                    <Info company={quizId.company} title={quizId.title} />
                  </Text>
                  <Text style={[styles.txt, { fontSize: 18 }]}>
                    {quizId.title}
                  </Text>
                </View>
                <View style={{ width: "80%", gap: 7 }}>
                  <View style={{ gap: 3 }}>
                    <Text style={[styles.txt, { fontSize: 12 }]}>Progress</Text>
                    <View
                      style={{
                        width: "100%",
                        backgroundColor: Colors.dark.border,
                        borderRadius: 6,
                      }}
                    >
                      <View
                        style={{
                          width: `${(currentProgress.questionsCompleted / quizId.questionsTotal) * 100}%`,
                          backgroundColor: Colors.dark.text,
                          borderRadius: 6,
                          height: 3,
                        }}
                      />
                    </View>
                    <Text style={[styles.txt, { fontSize: 10 }]}>
                      {(currentProgress.questionsCompleted /
                        quizId.questionsTotal) *
                        100}
                      %
                    </Text>
                  </View>
                  <View style={{ gap: 3 }}>
                    <Text style={[styles.txt, { fontSize: 12 }]}>Rewards</Text>
                    <View
                      style={{
                        width: "100%",
                        backgroundColor: Colors.dark.border,
                        borderRadius: 6,
                      }}
                    >
                      <View
                        style={{
                          width: `${(currentProgress.rewardsTotal / quizId.rewardsTotal) * 100}%`,
                          backgroundColor: Colors.dark.secondary,
                          borderRadius: 6,
                          height: 3,
                        }}
                      />
                    </View>
                    <Text style={[styles.txt, { fontSize: 10 }]}>
                      {(currentProgress.rewardsTotal / quizId.rewardsTotal) *
                        100}
                      %
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
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
        </View>
      </View>
    </View>
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
});
