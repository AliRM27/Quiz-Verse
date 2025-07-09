import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
import { GradientProps } from "@/types";
import { Colors } from "@/constants/Colors";

export const ButtonGradient = ({
  children,
  style = {},
  color,
}: GradientProps) => (
  <TouchableOpacity activeOpacity={0.8}>
    <LinearGradient
      colors={color ? color : Colors.dark.bg_gradient}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1.0, y: 0.5 }}
      style={[
        {
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  </TouchableOpacity>
);
