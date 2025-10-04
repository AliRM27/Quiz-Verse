import { Text, View, TextInput, StyleSheet } from "react-native";
import { defaultStyles } from "@/constants/Styles";
import { BackgroundGradient } from "@/components/ui/gradients/background";
import NextButton from "@/components/ui/NextButton";
import { Colors } from "@/constants/Colors";
import { Auth } from "@/constants/Dimensions";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { useState } from "react";
import { updateUser } from "@/services/api";

export default function createUsername() {
  const { user } = useUser();
  const [val, setVal] = useState("");
  const [error, setError] = useState("");
  const [loading, setloading] = useState(false);

  if (!user) {
    return (
      <View
        style={[
          defaultStyles.page,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: Colors.dark.text }}>User not found</Text>
      </View>
    );
  }

  const handleUsernameChange = async () => {
    setError("");
    if (
      val.trim() === "" ||
      val.length < 3 ||
      val.length > 20 ||
      !/^[a-zA-Z0-9_]+$/.test(val)
    ) {
      setVal("");
      setError(
        "Username must be 3-20 characters long and can only contain letters, numbers, and underscores."
      );
      return;
    }
    setloading(true);
    try {
      await updateUser({ name: val });
      user.name = val;
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Failed to update username:", err);
      setError("Failed to update username. Please try again.");
    }
    setloading(false);
  };

  return (
    <BackgroundGradient
      style={[defaultStyles.page, { justifyContent: "space-between" }]}
    >
      <Text style={[defaultStyles.title, { textAlign: "center" }]}>
        Now let’s create your Username
      </Text>
      <TextInput
        cursorColor={Colors.dark.text}
        style={styles.input}
        placeholder={"Type your username"}
        placeholderTextColor={Colors.dark.text_muted}
        value={val}
        onChangeText={(v) => setVal(v)}
      />
      <Text style={{ color: Colors.dark.danger, fontSize: 14 }}>{error}</Text>
      <NextButton onPress={() => handleUsernameChange()} loading={loading} />
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  input: {
    width: Auth.width.button,
    borderWidth: 1,
    padding: 20,
    borderRadius: 20,
    color: Colors.dark.text,
  },
});
