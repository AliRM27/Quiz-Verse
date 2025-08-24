import {
  View,
  Text,
  StyleSheet,
  Modal,
  Button,
  Animated,
  PanResponder,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Colors, GradientColors } from "@/constants/Colors";
import { HEIGHT, myHeight, myWidth, WIDTH } from "@/constants/Dimensions";
import { QuizModalProps } from "@/types";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import { LineDashed } from "../ui/Line";
import CircularProgress from "../ui/CircularProgress";
import RotatingGradient from "../ui/gradients/GlowingView";
import QuizLogo from "@/components/ui/QuizLogo";
import Info from "../ui/Info";
import { router } from "expo-router";

const QuizModal: React.FC<QuizModalProps> = ({
  isVisible,
  setIsVisible,
  quiz,
  currentProgress,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setIsVisible(false);
            setSelectedLevelIndex(0);
            translateY.setValue(0); // Reset position immediately
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [opacity]);

  return (
    <Modal
      animationType="slide" // or "fade", "none"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        setIsVisible(false);
      }} // for Android back button
    >
      <View style={styles.modalBackground}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY }] }]}
        >
          <View
            style={{ width: "100%", alignItems: "center" }}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity activeOpacity={1} style={styles.dragArea}>
              <View style={styles.dragIndicator} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal={false}
            style={{ width: "100%" }}
            contentContainerStyle={{ alignItems: "center", gap: 35 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity }}>
              <RotatingGradient>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.logoContainer}
                  onPress={() => {
                    setIsVisible(false);
                    router.push({
                      pathname: "/quizLevel/[id section]",
                      params: {
                        id: quiz._id,
                        section: String(selectedLevelIndex),
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
                  style={[styles.txt, { fontSize: WIDTH * (15 / myWidth) }]}
                >
                  Progress
                </Text>
                <LineDashed />
                <View>
                  <CircularProgress
                    progress={
                      (currentProgress?.questionsCompleted /
                        quiz.questionsTotal) *
                      100
                    }
                    size={HEIGHT * (50 / myHeight)}
                    strokeWidth={3}
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
                  Rewards
                </Text>
                <LineDashed />
                <View
                  style={{
                    width: "80%",
                    backgroundColor: Colors.dark.border,
                    borderRadius: 6,
                    marginTop: HEIGHT * (10 / myHeight),
                  }}
                >
                  <View
                    style={{
                      width: `${(currentProgress?.rewardsTotal / quiz.rewardsTotal) * 100}%`,
                      height: 4,
                      backgroundColor: "#FFB11F",
                      borderRadius: 6,
                    }}
                  />
                </View>
                <Text style={[styles.txt_muted, { fontSize: 12 }]}>
                  {currentProgress?.rewardsTotal} / {quiz.rewardsTotal}
                </Text>
              </View>
            </View>

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
              {quiz.sections.map((lvl, index) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={index}
                  style={[
                    defaultStyles.containerBackground,
                    {
                      paddingVertical: WIDTH * (12 / myWidth),
                      backgroundColor: Colors.dark.bg,
                      width: "40%",
                      gap: WIDTH * (10 / myWidth),
                      height: HEIGHT * (190 / myHeight),
                    },
                    selectedLevelIndex === index && {
                      borderColor: Colors.dark.text,
                    },
                  ]}
                  onPress={() => {
                    setSelectedLevelIndex(index);
                  }}
                >
                  <Text
                    style={[styles.txt, { fontSize: WIDTH * (19 / myWidth) }]}
                  >
                    {lvl.difficulty[0].toUpperCase() +
                      lvl.difficulty.slice(1).toLowerCase()}
                  </Text>
                  <View style={{ width: "100%", alignItems: "center", gap: 5 }}>
                    <Text style={[styles.txt_muted]}>Progress</Text>
                    <View
                      style={{
                        width: "80%",
                        backgroundColor: Colors.dark.border,
                        borderRadius: 6,
                      }}
                    >
                      <View
                        style={{
                          width: `${(currentProgress.sections[index].questions / lvl.questions.length) * 100}%`,
                          backgroundColor: Colors.dark.text,
                          height: 3,
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <Text style={[styles.txt_muted, { fontSize: 10 }]}>
                      {currentProgress.sections[index].questions} /{" "}
                      {lvl.questions.length}
                    </Text>
                  </View>
                  <View style={{ width: "100%", alignItems: "center", gap: 5 }}>
                    <Text style={[styles.txt_muted]}>Rewards</Text>
                    <View
                      style={{
                        width: "80%",
                        backgroundColor: Colors.dark.border,
                        borderRadius: 6,
                      }}
                    >
                      <View
                        style={{
                          width: `${(currentProgress.sections[index].rewards / lvl.rewards) * 100}%`,
                          backgroundColor: "#FFB11F",
                          height: 3,
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <Text style={[styles.txt_muted, { fontSize: 10 }]}>
                      {currentProgress.sections[index].rewards} / {lvl.rewards}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default QuizModal;

const styles = StyleSheet.create({
  modalBackground: {
    height: "100%",
    justifyContent: "flex-end",
  },
  modalContainer: {
    gap: HEIGHT * (20 / myHeight),
    backgroundColor: Colors.dark.bg,
    borderRadius: 50,
    alignItems: "center",
    elevation: 5,
    height: "90%",
  },
  dragArea: {
    width: "80%",
    height: HEIGHT * (60 / myHeight), // Much taller touch area
    alignItems: "center",
    justifyContent: "center",
  },

  dragIndicator: {
    width: "20%",
    height: 7,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 3,
  },
  logoContainer: {
    width: HEIGHT * (170 / myHeight),
    height: HEIGHT * (170 / myHeight),
    borderRadius: 10,
    overflow: "hidden",
  },
  txt: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: REGULAR_FONT + " ",
    fontWeight: 600,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 12,
    fontFamily: REGULAR_FONT,
  },
});
