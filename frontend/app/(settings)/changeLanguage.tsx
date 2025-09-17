import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { REGULAR_FONT } from "@/constants/Styles";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ArrBack from "@/assets/svgs/backArr.svg";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import { updateUser } from "@/services/api";
import { useState } from "react";

const ChangeLanguage = () => {
  const languages = ["English", "Deutsch", "Русский"];
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, refreshUser } = useUser();
  const { t } = useTranslation();

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
        {t("play")}
      </Text>
      {languages.map((language, index) => (
        <TouchableOpacity
          disabled={language === user.language}
          onPress={async () => {
            setIsLoading(true);
            try {
              user.language = language;
              await updateUser(user);
              await refreshUser();
              router.back();
            } catch (err) {
              console.log(err);
            }
            setIsLoading(false);
          }}
          key={index}
        >
          {isLoading && user.language === language ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={[
                styles.txt,
                user.language === language && { color: "red" },
              ]}
            >
              {language}
            </Text>
          )}
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
