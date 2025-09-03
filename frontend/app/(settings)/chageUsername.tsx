import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";
import { Auth, layout } from "@/constants/Dimensions";
import ArrBack from "@/assets/svgs/backArr.svg";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { updateUser } from "@/services/api";

const ChnageUsername = () => {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [loading, setloading] = useState(false);
  const { user } = useUser();

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
      newName.length > 20 ||
      !/^[a-zA-Z0-9_]+$/.test(newName)
    ) {
      setNewName("");
      setError(
        "Username must be 3-20 characters long and can only contain letters, numbers, and underscores."
      );
      return;
    }
    setloading(true);
    try {
      const res = await updateUser({ name: newName });
      user.name = newName;
      setError("Username changed successfully");
    } catch (err) {
      console.error("Failed to update username:", err);
      setError("Failed to update username. Please try again.");
    }
    setloading(false);
  };

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
        Change Username
      </Text>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text style={{ color: Colors.dark.text_muted, fontSize: 20 }}>
          Enter your new username
        </Text>
        <Text style={{ color: Colors.dark.border, fontSize: 15 }}>
          Make it better though
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder={"Enter your new username"}
        placeholderTextColor={Colors.dark.text_muted}
        value={newName}
        onChangeText={(c) => setNewName(c)}
        selectionColor={Colors.dark.text}
        autoFocus={true}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
      />
      <Text style={{ color: Colors.dark.danger, fontSize: 14 }}>{error}</Text>
      <TouchableOpacity
        onPress={() => handleUsernameChange()}
        activeOpacity={0.7}
        style={[styles.button]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.dark.bg_dark} />
        ) : (
          <Text style={{ color: Colors.dark.bg_dark, fontSize: 20 }}>
            Change
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChnageUsername;

const styles = StyleSheet.create({
  txt: { color: Colors.dark.text },
  input: {
    marginTop: 50,
    width: Auth.width.button,
    height: 55,
    borderWidth: 1,
    padding: 20,
    borderRadius: 20,
    borderColor: Colors.dark.text,
    color: Colors.dark.text,
  },
  button: {
    backgroundColor: Colors.dark.text,
    width: "100%",
    height: 55,
    paddingVertical: 15,
    marginTop: "auto",
    borderRadius: 20,
    alignItems: "center",
  },
});
