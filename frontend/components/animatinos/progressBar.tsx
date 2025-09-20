import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";

const ProgressBar = ({
  progress,
  total,
  color,
  height = 4,
}: {
  progress: number;
  total: number;
  color: string;
  height?: number;
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  const percentage = total > 0 ? (progress / total) * 100 : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 1000, // animation speed (ms)
      useNativeDriver: false, // can't animate width with native driver
    }).start();
  }, [percentage]);

  return (
    <Animated.View
      style={{
        width: widthAnim.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", "100%"],
        }),
        height,
        backgroundColor: color,
        borderRadius: 6,
      }}
    />
  );
};

export default ProgressBar;
