import { View, Text, StyleSheet } from "react-native";
import React, { ReactNode } from "react";

const TextR = ({ children, styles }: { children: ReactNode; styles: any }) => {
  return (
    <View>
      <Text style={[{ fontFamily: "Italic-Regular" }, styles]}>{children}</Text>
    </View>
  );
};

export default TextR;
