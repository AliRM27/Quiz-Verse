import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { Auth, layout } from "@/constants/Dimensions";
import { useUser } from "@/context/userContext";
import { updateUser } from "@/services/api";
import { useTranslation } from "react-i18next";
import { REGULAR_FONT } from "@/constants/Styles";
import ArrBack from "@/components/ui/ArrBack";
import * as Haptics from "expo-haptics";
import Loader from "@/components/ui/Loader";

const ChnageUsername = () => {
  const { user } = useUser();
  const [newName, setNewName] = useState(user?.name || "");
  const [error, setError] = useState("");
  const [loading, setloading] = useState(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const { t } = useTranslation();

  if (!user) {
    return (
      <View>
        <ActivityIndicator color={"white"} />
      </View>
    );
  }

  const handleUsernameChange = async () => {
    setError("");
    if (
      newName.trim() === "" ||
      newName.length < 3 ||
      newName.length > 12 ||
      !/^[a-zA-Z0-9_]+$/.test(newName)
    ) {
      setNewName("");
      setError(
        "Username must be 3-20 characters long and can only contain letters, numbers, and underscores."
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setloading(true);
    try {
      await updateUser({ name: newName });
      user.name = newName;
      setError("");
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Failed to update username:", err);
      setError("Failed to update username. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setloading(false);
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setFocused(false);
      }}
      accessible={false}
    >
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
        <Text
          style={[
            styles.txt,
            {
              fontSize: 25,
              fontWeight: 700,
              textAlign: "center",
              width: "80%",
            },
          ]}
        >
          {t("changeUsername")}
        </Text>
        <View style={{ alignItems: "center", gap: 5 }}>
          <Text
            style={{
              color: Colors.dark.text_muted,
              fontSize: 20,
              fontFamily: REGULAR_FONT,
            }}
          >
            {t("enterYourNewUsername")}
          </Text>
          <Text
            style={{
              color: Colors.dark.border,
              fontSize: 15,
              fontFamily: REGULAR_FONT,
            }}
          >
            {t("makeItBetter")}
          </Text>
        </View>
        <TextInput
          onFocus={() => setFocused(true)}
          style={[styles.input, focused && { borderColor: Colors.dark.text }]}
          placeholder={" " + t("enterYourNewUsername")}
          placeholderTextColor={Colors.dark.text_muted}
          value={newName}
          onChangeText={(c) => {
            if (c.length <= 12) {
              setNewName(c);
            }
          }}
          selectionColor={Colors.dark.text}
          autoCorrect={false}
        />
        <Text style={{ color: Colors.dark.danger, fontSize: 14 }}>{error}</Text>
        {success && (
          <Text style={[styles.txt, { fontSize: 20 }]}>
            Username chnaged successfully
          </Text>
        )}
        <TouchableOpacity
          disabled={newName.trim() === user.name}
          onPress={() => handleUsernameChange()}
          activeOpacity={0.7}
          style={[
            styles.button,
            newName.trim() === user.name && { opacity: 0.5 },
          ]}
        >
          {loading ? (
            <Loader black={true} />
          ) : (
            <Text
              style={{
                color: Colors.dark.bg_dark,
                fontSize: 20,
                fontFamily: REGULAR_FONT,
              }}
            >
              {t("change")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ChnageUsername;

const styles = StyleSheet.create({
  txt: { color: Colors.dark.text, fontFamily: REGULAR_FONT },
  input: {
    width: "100%",
    height: 60,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 50,
    padding: 15,
    paddingLeft: 20,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    borderWidth: 1,
    borderColor: Colors.dark.bg_dark,
    fontSize: 15,
  },
  button: {
    backgroundColor: Colors.dark.text,
    width: "100%",
    height: 55,
    paddingVertical: 15,
    marginTop: "auto",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
