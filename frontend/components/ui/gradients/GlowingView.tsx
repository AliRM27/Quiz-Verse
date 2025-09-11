import React, { useEffect, useState, useRef } from "react";
import { View, AppState, AppStateStatus } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

const RotatingGradient = ({ children, isOn = true }: any) => {
  const [angle, setAngle] = useState(0); // in degrees
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const [appActive, setAppActive] = useState(appState.current === "active");

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appState.current = nextAppState;
      setAppActive(nextAppState === "active");
    };
    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (isOn && appActive) {
      intervalRef.current = setInterval(() => {
        setAngle((prev) => (prev + 1) % 360);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOn, appActive]);

  // Convert angle to radians
  const rad = (angle * Math.PI) / 180;

  // Compute start and end using circle rotation
  const start = {
    x: 0.5 + 0.35 * Math.cos(rad),
    y: 0.5 + 0.35 * Math.sin(rad),
  };
  const end = {
    x: 0.5 - 0.35 * Math.cos(rad),
    y: 0.5 - 0.35 * Math.sin(rad),
  };

  return (
    <LinearGradient
      colors={
        isOn
          ? ["#6e6e6eff", "#1c1c1cff"]
          : [Colors.dark.bg_dark, Colors.dark.bg_dark]
      }
      start={start}
      end={end}
      style={{
        padding: 2,
        borderRadius: 10,
      }}
    >
      {children}
    </LinearGradient>
  );
};

export default RotatingGradient;
