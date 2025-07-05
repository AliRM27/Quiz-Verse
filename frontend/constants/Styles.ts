import { StyleSheet } from "react-native";
import {Colors} from "@/constants/Colors";

export const defaultStyles = StyleSheet.create({
  page: {
    alignItems: 'center',
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 34,
    fontWeight: "bold",
  }
});
