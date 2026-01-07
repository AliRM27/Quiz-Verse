import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onHide: () => void;
}

const Toast = ({ message, type = "success", onHide }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onHide();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(15)}
      exiting={FadeOutUp}
      style={[
        styles.container,
        type === "error" ? styles.errorBg : styles.successBg,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successBg: {
    backgroundColor: "#27ae60",
  },
  errorBg: {
    backgroundColor: "#e74c3c",
  },
  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: REGULAR_FONT,
  },
});
