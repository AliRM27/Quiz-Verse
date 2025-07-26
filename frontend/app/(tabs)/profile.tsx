import { TouchableOpacity, View, Text, Image } from "react-native";
import { useUser } from "@/context/userContext";
import { Colors } from "@/constants/Colors";

export default function Profile() {
  const { logout, user, deleteAccount } = useUser();
  return (
    <View style={{ alignItems: "center", gap: 30 }}>
      <Text
        style={{ fontSize: 24, fontWeight: "bold", color: Colors.dark.text }}
      >
        Profile
      </Text>
      <Image
        src={user?.profileImage}
        width={100}
        height={100}
        style={{ borderRadius: 15 }}
      />
      <View>
        <Text style={{ color: Colors.dark.text, marginVertical: 10 }}>
          Name: {user?.name}
        </Text>
        <Text style={{ color: Colors.dark.text, marginVertical: 10 }}>
          Email: {user?.email}
        </Text>
        <Text style={{ color: Colors.dark.text, marginVertical: 10 }}>
          CompletedQuizzes: {user?.completedQuizzes.length}
        </Text>
        <Text style={{ color: Colors.dark.text, marginVertical: 10 }}>
          Progress:{" "}
          {user?.progress.length
            ? user.progress.map((quiz, index) => <View></View>)
            : "No progress yet"}
        </Text>
      </View>
      <TouchableOpacity
        style={{ borderWidth: 1, borderColor: Colors.dark.border, padding: 10 }}
        onPress={logout}
      >
        <Text style={{ color: Colors.dark.text }}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ borderWidth: 1, borderColor: Colors.dark.border, padding: 10 }}
        onPress={deleteAccount}
      >
        <Text style={{ color: Colors.dark.text }}>Delte Account</Text>
      </TouchableOpacity>
    </View>
  );
}
