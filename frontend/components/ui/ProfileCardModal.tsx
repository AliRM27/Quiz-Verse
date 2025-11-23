import {
  View,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import ProfileCard from "./ProfileCard";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import { REGULAR_FONT } from "@/constants/Styles";

const ProfileCardModal = ({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: any;
}) => {
  const { user } = useUser();
  const { t } = useTranslation();

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
      visible={isVisible}
      onRequestClose={() => {
        setIsVisible(false);
      }} // for Android back button
    >
      <View
        style={{
          height: "100%",

          backgroundColor: "rgba(0,0,0,0.7)",
        }}
      >
        <View
          style={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <ProfileCard
            user={user}
            usernameValue={user.name}
            isEditable={false}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              width: "50%",
              backgroundColor: "#D9D9D9",
              alignItems: "center",
              borderRadius: 25,
              padding: 10,
              paddingVertical: 15,
            }}
            onPress={() => {
              setIsVisible(false);
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: REGULAR_FONT,
              }}
            >
              {t("close")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileCardModal;

const styles = StyleSheet.create({});
