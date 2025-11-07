import { ButtonProps } from "@/types";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import Loader from "./Loader";

export default function NextButton({ onPress, loading, title }: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={onPress}
    >
      {loading ? (
        <Loader black={true} />
      ) : (
        <Text style={{ fontSize: 17, color: Colors.dark.text }}>
          {title || "Next ->"}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: Colors.dark.bg,
    width: "100%",
    height: 60,
    borderRadius: 20,
    gap: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
