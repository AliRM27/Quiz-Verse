import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { isSmallPhone } from "@/constants/Dimensions";
import { useUser } from "@/context/userContext";
import { updateUser } from "@/services/api";
import { useTranslation } from "react-i18next";
import { REGULAR_FONT } from "@/constants/Styles";
import ArrBack from "@/components/ui/ArrBack";
import * as Haptics from "expo-haptics";
import Loader from "@/components/ui/Loader";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

const ChangeUsername = () => {
  const { user } = useUser();
  const [newName, setNewName] = useState(user?.name || "");
  const [error, setError] = useState("");
  const [loading, setloading] = useState(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const { t } = useTranslation();

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

  const handleUsernameChange = async () => {
    setError("");
    setSuccess(false);

    const trimmedName = newName.trim();

    if (
      trimmedName === "" ||
      trimmedName.length < 3 ||
      trimmedName.length > 12 ||
      !/^[a-zA-Z0-9_]+$/.test(trimmedName)
    ) {
      setError(
        "Username must be 3-12 characters long and can only contain letters, numbers, and underscores."
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setloading(true);
    try {
      await updateUser({ name: trimmedName });
      user.name = trimmedName;
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Keyboard.dismiss();
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
      <View style={styles.container}>
        <ArrBack />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <Animated.View entering={FadeInDown.duration(600).springify()}>
            <Text style={styles.title}>{t("changeUsername")}</Text>
            <Text style={styles.subtitle}>{t("enterYourNewUsername")}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.inputWrapper}
          >
            <View
              style={[
                styles.inputContainer,
                focused && styles.inputContainerFocused,
                error ? styles.inputContainerError : null,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={focused ? Colors.dark.text : Colors.dark.text_muted}
                style={styles.inputIcon}
              />
              <TextInput
                onFocus={() => {
                  setFocused(true);
                  setSuccess(false);
                  setError("");
                }}
                onBlur={() => setFocused(false)}
                style={styles.input}
                placeholder={t("username")}
                placeholderTextColor={Colors.dark.text_muted}
                value={newName}
                onChangeText={(c) => {
                  if (c.length <= 12) {
                    setNewName(c);
                  }
                }}
                selectionColor={Colors.dark.text}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {newName.length > 0 && (
                <TouchableOpacity onPress={() => setNewName("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.dark.text_muted}
                  />
                </TouchableOpacity>
              )}
            </View>

            {error ? (
              <Animated.Text entering={FadeIn} style={styles.errorText}>
                {error}
              </Animated.Text>
            ) : null}

            {success ? (
              <Animated.Text entering={FadeIn} style={styles.successText}>
                Username changed successfully!
              </Animated.Text>
            ) : null}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
            style={styles.footer}
          >
            <TouchableOpacity
              disabled={
                newName.trim() === user.name || loading || newName.trim() === ""
              }
              onPress={handleUsernameChange}
              activeOpacity={0.8}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={
                  newName.trim() === user.name || newName.trim() === ""
                    ? ["#333", "#222"]
                    : ["#fff", "#eee"]
                }
                style={[
                  styles.button,
                  (newName.trim() === user.name || newName.trim() === "") && {
                    opacity: 0.5,
                  },
                ]}
              >
                {loading ? (
                  <Loader black={true} />
                ) : (
                  <Text
                    style={[
                      styles.buttonText,
                      newName.trim() === user.name || newName.trim() === ""
                        ? { color: "#666" }
                        : { color: "#000" },
                    ]}
                  >
                    {t("change")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.hintText}>{t("makeItBetter")}</Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ChangeUsername;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    fontFamily: REGULAR_FONT,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    marginBottom: 40,
  },
  inputWrapper: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  inputContainerFocused: {
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  inputContainerError: {
    borderColor: "rgba(255,71,71,0.3)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontFamily: REGULAR_FONT,
  },
  errorText: {
    color: "#FF4747",
    fontSize: 14,
    marginTop: 12,
    fontFamily: REGULAR_FONT,
    paddingHorizontal: 4,
  },
  successText: {
    color: "#00C853",
    fontSize: 14,
    marginTop: 12,
    fontFamily: REGULAR_FONT,
    paddingHorizontal: 4,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    gap: 16,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 32,
    overflow: "hidden",
  },
  button: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: REGULAR_FONT,
  },
  hintText: {
    textAlign: "center",
    fontSize: 14,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    opacity: 0.6,
  },
});
