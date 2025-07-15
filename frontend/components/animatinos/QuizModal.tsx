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
} from "react-native";
import React, { useState, useRef } from "react";
import { Colors } from "@/constants/Colors";
import { HEIGHT, myHeight, myWidth, WIDTH } from "@/constants/Dimensions";
import { QuizModalProps } from "@/types";
import { defaultStyles } from "@/constants/Styles";
import { LineDashed } from "../ui/Line";
import CircularProgress from "../ui/CircularProgress";

const QuizModal: React.FC<QuizModalProps> = ({
  isVisible,
  setIsVisible,
  card,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
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
            setTimeout(() => {
              translateY.setValue(0); // reset AFTER modal is closed
            }, 300); // slight delay to avoid visible snap
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

  return (
    <Modal
      animationType="slide" // or "fade", "none"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)} // for Android back button
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
            contentContainerStyle={{ alignItems: "center", gap: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>{card.svg}</View>
            <View style={{ width: "100%", alignItems: "center", gap: 5 }}>
              <Text style={[styles.txt, { fontSize: 24 }]}>{card.title}</Text>
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
                This is a fan-made quiz, not officially connected to{" "}
                {card.company} or the creators of “{card.title}”. The game title
                is a trademark of {card.company}.
              </Text>
            </View>
            <View
              style={[
                defaultStyles.containerRow,
                {
                  width: "100%",
                  justifyContent: "space-evenly",
                  height: HEIGHT * (115 / myHeight),
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
                <Text style={[styles.txt, { fontSize: 16 }]}>Progress</Text>
                <LineDashed />
                <View>
                  <CircularProgress
                    progress={card.progress * 100}
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
                      fontSize: 16,
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
                      width: `${(card.rewards / card.total) * 100}%`,
                      height: 4,
                      backgroundColor: "#FFB11F",
                      borderRadius: 6,
                    }}
                  />
                </View>
                <Text style={[styles.txt_muted, { fontSize: 12 }]}>
                  {card.rewards} / {card.total}
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
                },
              ]}
            >
              {card.levels.map((lvl, index) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={index}
                  style={[
                    defaultStyles.containerBackground,
                    {
                      paddingVertical: 12,
                      backgroundColor: Colors.dark.bg,
                      width: "40%",
                      gap: 10,
                    },
                    selectedLevelIndex === index && {
                      borderColor: Colors.dark.text,
                    },
                  ]}
                  onPress={() => {
                    setSelectedLevelIndex(index);
                  }}
                >
                  <Text style={[styles.txt, { fontSize: 20 }]}>
                    {lvl.name[0].toUpperCase() +
                      lvl.name.slice(1).toLowerCase()}
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
                          width: `${(lvl.completedQuestions / lvl.questions) * 100}%`,
                          backgroundColor: Colors.dark.text,
                          height: 3,
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <Text style={[styles.txt_muted, { fontSize: 10 }]}>
                      {lvl.completedQuestions} / {lvl.questions}
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
                          width: `${(lvl.rewards / lvl.total) * 100}%`,
                          backgroundColor: "#FFB11F",
                          height: 3,
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <Text style={[styles.txt_muted, { fontSize: 10 }]}>
                      {lvl.rewards} / {lvl.total}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                width: "50%",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: Colors.dark.border_muted,
                marginBottom: 50,
                height: 50,
                borderRadius: 50,
              }}
            >
              <Text style={styles.txt}>Start</Text>
            </TouchableOpacity>
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
    gap: 20,
    backgroundColor: Colors.dark.bg,
    borderRadius: 50,
    alignItems: "center",
    elevation: 5,
    height: "90%",
  },
  dragArea: {
    width: "80%",
    height: 60, // Much taller touch area
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
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    overflow: "hidden",
  },
  txt: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: "Inter-Regular ",
    fontWeight: 600,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
});
