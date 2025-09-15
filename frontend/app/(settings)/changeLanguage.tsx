import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { REGULAR_FONT } from "@/constants/Styles";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import ArrBack from "@/assets/svgs/backArr.svg";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";

const ChangeLanguage = () => {
  const languages = ["English", "Deutsch", "Русский"];
  const { user } = useUser();

  if (!user) {
    return;
  }

  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg_dark,
        height: "100%",
        paddingVertical: layout.paddingTop,
        paddingHorizontal: 15,
        gap: 20,
        alignItems: "center",
      }}
    >
      <Pressable
        style={{ alignSelf: "flex-start" }}
        onPress={() => router.back()}
      >
        <ArrBack />
      </Pressable>
      <Text style={[styles.txt, { fontSize: 30, fontWeight: 700 }]}>
        Change language
      </Text>
      {languages.map((language, index) => (
        <TouchableOpacity key={index}>
          <Text
            style={[styles.txt, user.language === language && { color: "red" }]}
          >
            {language}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ChangeLanguage;

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
  },
});
