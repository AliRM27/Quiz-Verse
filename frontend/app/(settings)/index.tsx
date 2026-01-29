import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  Pressable,
  Alert,
  ScrollView,
  Linking,
  Share as RNShare,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { useUser } from "@/context/userContext";
import Person from "@/assets/svgs/Person_User_Fill.svg";
import RightInd from "@/assets/svgs/rightIndicator.svg";
import Global from "@/assets/svgs/globalLanguage.svg";
import LogOut from "@/assets/svgs/logOut.svg";
import Info from "@/assets/svgs/info.svg";
import Friends from "@/assets/svgs/friends.svg";
import Gift from "@/assets/svgs/gift.svg";
import Share from "@/assets/svgs/share.svg";
import Bell from "@/assets/svgs/bell.svg";
import ArrBack from "@/components/ui/ArrBack";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { API_URL } from "@/services/config";
import { claimShareReward } from "@/services/api";

const Settings = () => {
  const { user, logout, deleteAccount } = useUser();
  const [state, setState] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  if (!user) {
    return (
      <View
        style={{
          backgroundColor: Colors.dark.bg_dark,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  const handleLogOut = () => {
    Alert.alert(
      t("logOut"),
      t("logOutConfirmation"),
      [
        {
          text: t("no"),
          style: "cancel",
        },
        {
          text: t("yes"),
          onPress: logout,
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("deleteAccount"),
      t("deleteAccountConfirmation"),
      [
        {
          text: t("no"),
          style: "cancel",
        },
        {
          text: t("yes"),
          onPress: deleteAccount,
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
  };

  // ... inside Settings component

  const handleShare = async () => {
    Alert.alert(
      t("authTitle"),
      t("featureComingSoon") || "This opportunity will be made available soon",
    );
  };

  return (
    <View
      style={{
        gap: 20,
        backgroundColor: Colors.dark.bg_dark,
        flex: 1,
        paddingTop: insets.top + 10,
      }}
    >
      <ArrBack />
      <View
        style={{ height: 45, justifyContent: "center", alignItems: "center" }}
      >
        <Text
          style={[
            styles.txt,
            {
              fontSize: 25,
              fontWeight: "700",
              textAlign: "center",
            },
          ]}
        >
          {t("settings")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 70,
          paddingHorizontal: 15,
          gap: 20,
        }}
      >
        <Text style={[styles.txt_muted, { fontSize: 10 }]}>{t("account")}</Text>
        <View
          style={{
            backgroundColor: Colors.dark.bg_light,
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(settings)/changeUsername")}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderColor: Colors.dark.border_muted,
              padding: 15,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Person />
              <Text style={[styles.txt]}>{t("username")}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text style={[styles.txt_muted]}>{user.name}</Text>
              <RightInd />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(settings)/changeLanguage")}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
              borderBottomWidth: 1,
              borderColor: Colors.dark.border_muted,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Global stroke={"#999999"} color={"transparent"} />
              <Text style={[styles.txt]}>{t("language")}</Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={styles.txt_muted}>{user.language}</Text>
              <RightInd />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLogOut()}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 15,
            }}
          >
            <LogOut />
            <Text style={{ color: "#FF383C" }}>{t("logOut")}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.txt_muted, { fontSize: 10, marginTop: 10 }]}>
          {t("social")}
        </Text>
        <View
          style={{
            backgroundColor: Colors.dark.bg_light,
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderColor: Colors.dark.border_muted,
              padding: 15,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Share />
              <Text style={[styles.txt]}>{t("shareQuizverse")}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Gift />
              <RightInd />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Friends />
              <Text style={[styles.txt]}>{t("friends")}</Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={styles.txt_muted}>Coming Soon !</Text>
              <RightInd />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={[styles.txt_muted, { fontSize: 10, marginTop: 10 }]}>
          {t("helpSupport")}
        </Text>
        <View
          style={{
            backgroundColor: Colors.dark.bg_light,
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => Linking.openURL("mailto:lotustudio.app@gmail.com")}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Info />
              <Text style={[styles.txt]}>{t("contactUs")}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <RightInd />
            </View>
          </TouchableOpacity>
        </View>
        {/* <Text style={[styles.txt_muted, { fontSize: 10, marginTop: 10 }]}>
          {t("other")}
        </Text>
        <View
          style={{
            backgroundColor: Colors.dark.bg_light,
            borderRadius: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Bell />
              <Text style={[styles.txt]}>{t("notifications")}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Switch value={state} onChange={() => setState((p) => !p)} />
            </View>
          </View>
        </View> */}
        <Text style={[styles.txt_muted, { fontSize: 10, marginTop: 10 }]}>
          QUIZVERSE
        </Text>
        <View
          style={{
            backgroundColor: Colors.dark.bg_light,
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
              borderBottomWidth: 1,
              borderColor: Colors.dark.border_muted,
            }}
            onPress={() => Linking.openURL("https://quizverseplay.netlify.app")}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Info />
              <Text style={[styles.txt]}>{t("aboutQuizverse")}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <RightInd />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`https://quizverseplay.netlify.app/privacy`)
            }
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
              borderBottomWidth: 1,
              borderColor: Colors.dark.border_muted,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Info />
              <Text style={[styles.txt]}>{"Privacy Policy"}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <RightInd />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`https://quizverseplay.netlify.app/terms`)
            }
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Info />
              <Text style={[styles.txt]}>{"Terms of Service"}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <RightInd />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteAccount()}
          activeOpacity={0.7}
          style={{ paddingTop: 25 }}
        >
          <Text
            style={[styles.txt, { color: "#ae0003ff", alignSelf: "center" }]}
          >
            {t("deleteAccount")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  txt: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
  },
  txt_muted: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text_muted,
  },
});
