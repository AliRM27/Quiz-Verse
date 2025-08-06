import { ButtonProps } from "@/types";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Auth } from "@/constants/Dimensions";

export default function NextButton({ onPress, loading }: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={{ fontSize: 17, color: Colors.dark.text }}>
          Next {"->"}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: Colors.dark.bg_light,
    width: Auth.width.button,
    height: 60,
    borderRadius: 20,
    gap: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
