import { StyleSheet } from "react-native";
import {Colors} from "@/constants/Colors";

export const defaultStyles = StyleSheet.create({
  page: {
    alignItems: 'center',
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  containerRow:{
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  containerBackground: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.bg,
    borderRadius: 15
  },
  containerRowBackground:{
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.bg,
    borderRadius: 20,
  },
  containerRowBackgroundCenter:{
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.bg,
    borderRadius: 20
  },
  title: {
    color: Colors.dark.text,
    fontSize: 34,
    fontWeight: "bold",
  }
});
