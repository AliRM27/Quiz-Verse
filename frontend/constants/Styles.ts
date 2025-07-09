import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

const BR = 15;

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
    gap: 10,
  },
  containerBackground: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.bg,
    borderRadius: BR,
  },
  containerRowBackground: {
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.bg,
    borderRadius: BR,
  },
  containerRowBackgroundCenter: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.bg,
    borderRadius: BR,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 34,
    fontWeight: "bold",
  },
});
