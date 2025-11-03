import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { REGULAR_FONT } from "@/constants/Styles";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import { updateUser } from "@/services/api";
import { useState } from "react";
import ArrBack from "@/components/ui/ArrBack";
import Loader from "@/components/ui/Loader";
import * as Haptics from "expo-haptics";

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
      <ArrBack />
      <Text style={[styles.txt, { fontSize: 25, fontWeight: 700 }]}>
        {t("changeLanguage")}
      </Text>
      <View
        style={{
          width: "100%",
          height: "100%",
          gap: 15,
          justifyContent: "center",
        }}
      >
        {languages.map((language, index) => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.btn,
              user.language === language && {
                backgroundColor: Colors.dark.text,
              },
            ]}
            disabled={language === user.language}
            onPress={async () => {
              setIsLoading(true);
              try {
                user.language = language;
                await updateUser(user);
                await refreshUser();
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                router.back();
              } catch (err) {
                console.log(err);
              }
              setIsLoading(false);
            }}
            key={index}
          >
            {isLoading && user.language === language ? (
              <Loader black={true} width={30} height={30} />
            ) : (
              <Text
                style={[
                  styles.txt,
                  { fontSize: 20 },
                  user.language === language && { color: "black" },
                ]}
              >
                {language}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
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
  btn: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 50,
  },
});
