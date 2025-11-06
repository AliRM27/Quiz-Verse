import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

export default function ColorPicker({
  colors,
  selectedColor,
  setSelectedColor,
}: {
  colors: string[];
  selectedColor: string;
  setSelectedColor: any;
}) {
  return (
    <View style={styles.container}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorCircle,
            {
              backgroundColor: color,
              borderWidth: selectedColor === color ? 3 : 0,
            },
          ]}
          onPress={() => {
            setSelectedColor(color);
            Haptics.selectionAsync();
          }}
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
    flexWrap: "wrap",
    gap: 30,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 20,
    borderColor: "white",
  },
});
