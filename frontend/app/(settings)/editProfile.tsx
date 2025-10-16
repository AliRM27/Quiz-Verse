import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { router } from "expo-router";
import ArrBack from "@/assets/svgs/backArr.svg";
import { REGULAR_FONT } from "@/constants/Styles";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { updateUser } from "@/services/api";
import ProfileCard from "@/components/ui/ProfileCard";

const EditProfile = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [usernameValue, setUsernameValue] = useState<string>(user?.name || "");
  const { t } = useTranslation();
  const [error, setError] = useState<string>("");

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
  const handleUsernameChange = async () => {
    setError("");
    if (
      usernameValue.trim() === "" ||
      usernameValue.length < 3 ||
      usernameValue.length > 12 ||
      !/^[a-zA-Z0-9_]+$/.test(usernameValue)
    ) {
      setUsernameValue("");
      setError(
        "Username must be 3-12 characters long and can only contain letters, numbers, and underscores."
      );
      return;
    }
    setLoading(true);
    try {
      await updateUser({ name: usernameValue });
      user.name = usernameValue;
      setError("Username changed successfully");
    } catch (err) {
      console.error("Failed to update username:", err);
      setError("Failed to update username. Please try again.");
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          backgroundColor: Colors.dark.bg_dark,
          height: "100%",
          paddingVertical: layout.paddingTop,
          paddingHorizontal: 15,
          paddingBottom: 50,
          gap: 5,
          alignItems: "center",
        }}
      >
        <Pressable
          style={{ position: "absolute", top: 83, left: 20 }}
          onPress={() => router.back()}
        >
          <ArrBack />
        </Pressable>
        <Text style={[styles.text, { fontSize: 30, fontWeight: 700 }]}>
          {t("editProfile")}
        </Text>
        <ProfileCard
          usernameValue={usernameValue}
          user={user}
          isEditable={true}
        />
        <View style={{ width: "100%", gap: 10, marginTop: 20 }}>
          <Text style={[styles.text_muted, { marginLeft: 10 }]}>
            {t("username")}
          </Text>
          <TextInput
            style={styles.input}
            cursorColor={Colors.dark.text}
            selectionColor={Colors.dark.text}
            value={usernameValue}
            onChangeText={(c) => {
              if (c.length <= 12) {
                setUsernameValue(c);
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
          />

          <Text style={[styles.text, { textAlign: "center" }]}>{error}</Text>
        </View>
        <TouchableOpacity
          disabled={user.name === usernameValue}
          onPress={() => handleUsernameChange()}
          activeOpacity={0.7}
          style={[
            styles.button,
            user.name === usernameValue && { opacity: 0.5 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.dark.bg_dark} />
          ) : (
            <Text style={{ color: Colors.dark.bg_dark, fontSize: 20 }}>
              {t("change")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  text: {
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  text_muted: {
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
  },
  card: {
    marginTop: 30,
    padding: 17,
    gap: 20,
    width: "75%",
    height: 400,
    backgroundColor: "#D9D9D9",
    borderRadius: 15,
    alignItems: "center",
  },
  figure: {
    width: "100%",
    height: "55%",
    backgroundColor: "#E39595",
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 65,
    borderBottomRightRadius: 65,
  },
  input: {
    paddingHorizontal: 20,
    width: "100%",
    color: Colors.dark.text,
    fontSize: 18,
    height: 55,
    borderRadius: 35,
    borderWidth: 1,
    backgroundColor: Colors.dark.bg_light,
  },
  button: {
    backgroundColor: Colors.dark.text,
    width: "100%",
    height: 55,
    paddingVertical: 15,
    marginTop: "auto",
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});
