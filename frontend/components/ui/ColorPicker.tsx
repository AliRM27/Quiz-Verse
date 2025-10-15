import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", "#FF9F1C"];

export default function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  return (
    <View style={styles.container}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorCircle,
            {
              backgroundColor: color,
              borderWidth: selectedColor === color ? 3 : 1,
            },
          ]}
          onPress={() => setSelectedColor(color)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    borderColor: "#333",
  },
});
