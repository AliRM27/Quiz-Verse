import { ButtonProps } from "@/types";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import Loader from "./Loader";

export default function NextButton({
  onPress,
  loading,
  title,
  disabled,
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || Boolean(loading);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <Loader black={true} />
      ) : (
        <Text
          style={[
            styles.label,
            isDisabled && { color: Colors.dark.text_muted },
          ]}
        >
          {title || "Next"}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.dark.bg,
    width: "100%",
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: Colors.dark.bg_dark,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  label: {
    fontSize: 17,
    color: Colors.dark.text,
  },
});
