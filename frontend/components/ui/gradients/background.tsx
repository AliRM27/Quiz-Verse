import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { GradientProps } from "@/types";

export const BackgroundGradient = ({
  children,
  style = {},
  color,
}: GradientProps) => (
  <LinearGradient
    colors={color ? color : Colors.dark.bg_gradient}
    style={[{ flex: 1 }, style]}
    start={{ x: 0.5, y: 0.0 }}
    end={{ x: 0.5, y: 1.0 }}
    locations={[0, 1]}
  >
    {children}
  </LinearGradient>
);
