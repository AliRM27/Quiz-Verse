import { Colors } from "@/constants/Colors";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import ProfileCard from "./ProfileCard";
import { useUser } from "@/context/userContext";
import Close from "@/assets/svgs/x.svg";

const ProfileCardModal = ({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: any;
}) => {
  const { user } = useUser();

  if (!user)
    return (
      <View>
        <ActivityIndicator />
      </View>
    );

  return (
    <Modal
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setIsVisible(false);
      }} // for Android back button
    >
      <View
        style={{
          height: "100%",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.7)",
        }}
      >
        <View
          style={{
            height: "60%",
            alignItems: "center",
            gap: 40,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsVisible(false)}
            style={{
              position: "absolute",
              top: -20,
              right: 20,
              backgroundColor: "white",
              padding: 5,
              borderRadius: 13,
            }}
          >
            <Close color={"black"} />
          </TouchableOpacity>
          <ProfileCard
            user={user}
            usernameValue={user.name}
            isEditable={false}
          />
          {/* <TouchableOpacity
            activeOpacity={0.7}
            style={{
              width: "50%",
              backgroundColor: Colors.dark.text,
              alignItems: "center",
              borderRadius: 20,
              padding: 10,
            }}
            onPress={() => {
              setIsVisible(false);
            }}
          >
            <Text style={{ fontSize: 18 }}>Close</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
};

export default ProfileCardModal;

const styles = StyleSheet.create({});
