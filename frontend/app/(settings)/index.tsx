import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";
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
import Back from "@/assets/svgs/backArr.svg";
import { router } from "expo-router";

const Settings = () => {
  const { user, logout } = useUser();
  const [state, setState] = useState(false);

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

  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg_dark,
        height: "100%",
        paddingVertical: layout.paddingTop,
        paddingHorizontal: 15,
        gap: 20,
      }}
    >
      <Pressable onPress={() => router.back()}>
        <Back />
      </Pressable>
      <Text style={[styles.txt, { fontSize: 25, fontWeight: 700 }]}>
        Settings
      </Text>
      <View style={{ gap: 20 }}>
        <Text style={[styles.txt_muted, { fontSize: 10 }]}>ACCOUNT</Text>
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
              borderBottomWidth: 1,
              borderColor: Colors.dark.border_muted,
              padding: 15,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Person />
              <Text style={[styles.txt]}>Username</Text>
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
              <Global stroke={"#999999"} />
              <Text style={[styles.txt]}>Language</Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={styles.txt_muted}>English</Text>
              <RightInd />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => logout()}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 15,
            }}
          >
            <LogOut />
            <Text style={{ color: "#FF383C" }}>Log Out</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.txt_muted, { fontSize: 10, marginTop: 10 }]}>
          SOCIAL
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
              borderBottomWidth: 1,
              borderColor: Colors.dark.border_muted,
              padding: 15,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Share />
              <Text style={[styles.txt]}>Share QuizVerse</Text>
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
              <Text style={[styles.txt]}>Friends</Text>
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
          HELP & SUPPORT
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
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Info />
              <Text style={[styles.txt]}>Contact Us</Text>
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
        <Text style={[styles.txt_muted, { fontSize: 10, marginTop: 10 }]}>
          OTHER
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
              <Text style={[styles.txt]}>Notifications</Text>
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
        </View>
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
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Info />
              <Text style={[styles.txt]}>About QuizVerse</Text>
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
      </View>
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
