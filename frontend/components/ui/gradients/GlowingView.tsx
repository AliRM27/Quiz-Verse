import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const RotatingGradient = ({ children }: any) => {
  const [angle, setAngle] = useState(0); // in degrees

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 1) % 360); // 1° step for smoothness
    }, 10); // update every 30ms (~33 FPS)

    return () => clearInterval(interval);
  }, []);

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
      colors={["#6e6e6eff", "#1c1c1cff"]}
      start={start}
      end={end}
      style={{
        padding: 1,
        borderRadius: 10,
      }}
    >
      {children}
    </LinearGradient>
  );
};

export default RotatingGradient;
