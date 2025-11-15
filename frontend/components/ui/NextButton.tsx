import { ButtonProps } from "@/types";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import Loader from "./Loader";
import { REGULAR_FONT } from "@/constants/Styles";
import { useTranslation } from "react-i18next";

export default function NextButton({
  onPress,
  loading,
  title,
  disabled,
}: ButtonProps) {
  const { t } = useTranslation();
  const isDisabled = Boolean(disabled) || Boolean(loading);
  const label = title || t("nextButtonDefault");
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, isDisabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? <Loader black={true} /> : <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.dark.text,
    width: "100%",
    height: 56,
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 17,
    fontFamily: REGULAR_FONT,
    fontWeight: 500,
    color: "black",
  },
});
