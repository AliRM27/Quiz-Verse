import { Colors } from "@/constants/Colors";
import { myWidth, WIDTH } from "@/constants/Dimensions";
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";
import ArrowRight from "@/assets/svgs/rightArrow.svg";
import { ITALIC_FONT } from "@/constants/Styles";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({
  size = 50,
  strokeWidth = 5,
  progress = 32,
  fontSize,
  percent = true,
  total = 100,
  arrow = false,
  select = false,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  fontSize?: number;
  percent?: boolean;
  total?: number;
  arrow?: boolean;
  select?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(new Animated.Value(0)).current;

  // Animate when progress changes
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 600, // animation speed
      useNativeDriver: true,
      easing: Easing.elastic(1.2),
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, total],
    outputRange: [circumference, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size + 1} height={size + 1}>
        {/* Background Circle */}
        <Circle
          stroke={Colors.dark.border}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <AnimatedCircle
          stroke="#ccc"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.textContainer}>
        {arrow && <ArrowRight width={size / 2.5} height={size / 2.5} />}
        {select && <View />}
        {!select && !arrow && (
          <Text
            style={[styles.text, { fontSize }]}
          >{`${progress}${percent ? "%" : "/" + total}`}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#ccc",
    fontSize: WIDTH < 700 ? WIDTH * (13 / myWidth) : 18,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: ITALIC_FONT,
  },
});

export default CircularProgress;
