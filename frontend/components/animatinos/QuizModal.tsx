import {
  View,
  Text,
  StyleSheet,
  Modal,
  Button,
  Animated,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import React, { useState, useRef } from "react";
// import Modal from "react-native-modal";
import { Colors } from "@/constants/Colors";
import Rdr from "@/assets/svgs/quizzes/rdr2Logo.svg";
import { HEIGHT, myHeight, myWidth, WIDTH } from "@/constants/Dimensions";
import { BR } from "@/constants/Styles";

const QuizModal = ({ isVisible, setIsVisible, card }: any) => {
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

  return (
    // <Modal
    //   style={{
    //     width: "100%",
    //     height: "100%",
    //     alignSelf: "center",
    //     justifyContent: "flex-end",
    //   }}
    //   isVisible={isVisible}
    //   swipeDirection={"down"}
    //   onSwipeComplete={() => {
    //     setIsVisible((p: boolean) => !p);
    //   }}
    // >
    //   <View style={styles.container}>
    //     <Text style={{ color: Colors.dark.text }}>Welcome</Text>
    //   </View>
    // </Modal>
    <Modal
      animationType="slide" // or "fade", "none"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)} // for Android back button
    >
      <View style={styles.modalBackground}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1} style={styles.dragArea}>
            <View style={styles.dragIndicator} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Rdr width={"100%"} height={"100%"} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default QuizModal;

const styles = StyleSheet.create({
  container: {
    height: "90%",
    backgroundColor: Colors.dark.bg_light,
    padding: 20,
    alignItems: "center",
    bottom: -20,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    margin: 10,
  },
  modalBackground: {
    height: "100%",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.dark.bg,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    height: "90%",
  },
  dragArea: {
    width: "80%",
    height: 50, // Much taller touch area
    alignItems: "center",
    justifyContent: "center",
  },

  dragIndicator: {
    width: "20%",
    height: 5,
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
});
