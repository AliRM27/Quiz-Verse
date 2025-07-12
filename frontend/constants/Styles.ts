import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const BR = 10;

export const defaultStyles = StyleSheet.create({
  page: {
    alignItems: "center",
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  containerRow: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  containerBackground: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    backgroundColor: Colors.dark.bg_dark,
    borderRadius: BR,
  },
  containerRowBackground: {
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    backgroundColor: Colors.dark.bg_dark,
    borderRadius: BR,
  },
  containerRowBackgroundCenter: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    backgroundColor: Colors.dark.bg_dark,
    borderRadius: BR,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 34,
    fontWeight: "bold",
  },
});
