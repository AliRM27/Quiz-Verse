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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import ArrBack from "@/components/ui/ArrBack";
import { REGULAR_FONT } from "@/constants/Styles";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { updateUser } from "@/services/api";
import ProfileCard from "@/components/ui/ProfileCard";
import * as Haptics from "expo-haptics";
import Loader from "@/components/ui/Loader";

const EditProfile = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [usernameValue, setUsernameValue] = useState<string>(user?.name || "");
  const { t } = useTranslation();
  const [error, setError] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    try {
      await updateUser({ name: usernameValue });
      user.name = usernameValue;
      setError("Username changed successfully");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Failed to update username:", err);
      setError("Failed to update username. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setIsFocused(false);
      }}
      accessible={false}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        enabled={Platform.OS === "ios"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: Colors.dark.bg_dark,
            paddingVertical: layout.paddingTop,
            paddingHorizontal: 15,
            paddingBottom: 50,
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <ArrBack />

          <Text style={[styles.text, { fontSize: 25, fontWeight: 700 }]}>
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
              onFocus={() => {
                setIsFocused(true);
                setScrollEnabled(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                setScrollEnabled(false);
              }}
              style={[
                styles.input,
                isFocused && { borderWidth: 1, borderColor: Colors.dark.text },
              ]}
              cursorColor={Colors.dark.text}
              selectionColor={Colors.dark.text}
              value={usernameValue}
              onChangeText={(c) => {
                setUsernameValue(c);
              }}
              autoCorrect={false}
              maxLength={12}
            />

            <Text style={[styles.text, { textAlign: "center" }]}>{error}</Text>
          </View>

          <TouchableOpacity
            disabled={user.name === usernameValue.trim()}
            onPress={handleUsernameChange}
            activeOpacity={0.7}
            style={[
              styles.button,
              user.name === usernameValue.trim() && { opacity: 0.5 },
            ]}
          >
            {loading ? (
              <Loader black={true} />
            ) : (
              <Text style={{ color: Colors.dark.bg_dark, fontSize: 20 }}>
                {t("change")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
