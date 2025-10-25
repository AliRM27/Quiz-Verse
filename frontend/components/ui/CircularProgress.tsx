import { Colors } from "@/constants/Colors";
import { myWidth, WIDTH } from "@/constants/Dimensions";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import ArrowRight from "@/assets/svgs/rightArrow.svg";
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({
  size = 50,
  strokeWidth = 5,
  progress = 0,
  fontSize,
  percent = true,
  total = 100,
  arrow = false,
  select = false,
  showNumbers = false,
  totalNum = 0,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  fontSize?: number;
  percent?: boolean;
  total?: number;
  arrow?: boolean;
  select?: boolean;
  showNumbers?: boolean;
  totalNum?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(new Animated.Value(0)).current;

  const [value, setValue] = useState<string>("");
  const [changed, setChanged] = useState(false);

  // Animate when progress changes
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1300, // animation speed
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
    setValue(`${progress}${percent ? "%" : "/" + total}`);
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, total],
    outputRange: [circumference, 0],
    extrapolate: "clamp",
  });

  return (
    <TouchableOpacity
      onPress={() => {
        if (!changed) {
          setValue(`${Math.floor((progress * totalNum) / 100)}/${totalNum}`);
          setChanged(true);
        } else {
          setValue(`${progress}${percent ? "%" : "/" + total}`);
          setChanged(false);
        }
      }}
      disabled={!showNumbers}
      style={[styles.container, { width: size, height: size }]}
    >
      <Svg width={size + 1} height={size + 1}>
        {/* Background Circle */}
        <Circle
          stroke={Colors.dark.border_muted}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <AnimatedCircle
          stroke={Colors.dark.text}
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
          <Text style={[styles.text, { fontSize }]}>
            {showNumbers ? value : `${progress}${percent ? "%" : "/" + total}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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
    color: Colors.dark.text,
    fontSize: WIDTH < 700 ? WIDTH * (13 / myWidth) : 18,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: REGULAR_FONT,
  },
});

export default CircularProgress;
