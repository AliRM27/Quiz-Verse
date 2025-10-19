import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";
import { User } from "@/context/userContext";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import ColorPicker from "./ColorPicker";
import Pencil from "@/assets/svgs/pencil.svg";
import { useState } from "react";
import { updateUser } from "@/services/api";
import { useTranslation } from "react-i18next";

const ProfileCard = ({
  usernameValue,
  user,
  isEditable,
}: {
  usernameValue: string;
  user: User;
  isEditable: boolean;
}) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD93D",
    "#1A535C",
    "#FF9F1A",
    "green",
  ];
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState(user.theme.cardColor);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const date: string[] = user.firstLogIn.split("T", 1)[0].split("-");

  const month = {
    "1": "Jan.",
    "2": "Febr.",
    "3": "Mar.",
    "4": "Apr.",
    "5": "May",
    "6": "June",
    "7": "Jule",
    "8": "Aug.",
    "9": "Sept.",
    "10": "Oct.",
    "11": "Nov.",
    "12": "Dec.",
  };

  return (
    <View style={styles.card}>
      {isEditable && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isVisible}
          onRequestClose={() => {
            setIsVisible(false);
          }}
        >
          <View
            style={{
              height: "100%",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: Colors.dark.bg_light,
                width: "100%",
                alignItems: "center",
                padding: 20,
                height: "50%",
                gap: 10,
                borderRadius: 50,
              }}
            >
              <Text
                style={[
                  styles.text,
                  { fontSize: 25, fontWeight: 600 },
                  Platform.OS === "android" && { fontWeight: "bold" },
                ]}
              >
                {t("chooseTheme")}
              </Text>
              <ColorPicker
                colors={colors}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              <View
                style={{
                  flexDirection: "row",
                  gap: 20,
                  marginTop: "auto",
                  paddingBottom: 20,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.button,
                    {
                      width: "45%",
                      backgroundColor: Colors.dark.bg_light,
                      borderWidth: 1,
                      borderColor: Colors.dark.border,
                    },
                  ]}
                  onPress={() => {
                    setIsVisible(false);
                    setSelectedColor(user.theme.cardColor);
                  }}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        color: Colors.dark.text,
                        fontSize: 18,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {t("close")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.button, { width: "45%" }]}
                  onPress={async () => {
                    setIsVisible(false);
                    if (user.theme.cardColor !== selectedColor) {
                      user.theme.cardColor = selectedColor;
                      try {
                        await updateUser(user);
                      } catch (err) {
                        console.log(err);
                      }
                    }
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text
                      style={[styles.text, { color: "black", fontSize: 18 }]}
                    >
                      {t("save")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <View
        style={[
          styles.figure,
          {
            backgroundColor: selectedColor,
            alignItems: "flex-end",
            padding: 10,
          },
        ]}
      >
        {isEditable && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setIsVisible(true);
            }}
            style={{
              backgroundColor: "#D9D9D9",
              padding: 7,
              borderRadius: 15,
            }}
          >
            <Pencil color={Colors.dark.bg_dark} width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          width: "100%",
        }}
      >
        <View style={{ gap: 5 }}>
          <Text
            style={[
              styles.text,
              {
                color: selectedColor,
                fontSize: 25,
                fontWeight: 700,
              },
              usernameValue.length > 10 && { fontSize: 18 },
            ]}
          >
            {usernameValue}
          </Text>

          <Text
            style={[
              styles.text,
              { color: selectedColor, fontSize: 17, fontWeight: 600 },
            ]}
          >
            QUIZ MASTER
          </Text>
        </View>
        <View
          style={{
            borderWidth: 2,
            borderColor: selectedColor,
            transform: [{ rotate: "45deg" }],
            padding: 3,
            borderRadius: 20,
            width: 60,
            height: 60,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              transform: [{ rotate: "0deg" }],
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 15,
            }}
          >
            <Image
              src={user?.profileImage}
              width={60}
              height={60}
              style={{
                transform: [{ rotate: "-45deg" }],
              }}
            />
          </View>
        </View>
        {isEditable && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setIsVisible(true);
            }}
            style={{
              padding: 7,
              borderRadius: 15,
              position: "absolute",
              zIndex: 1,
              bottom: -15,
              right: -13,
            }}
          >
            <Pencil color={Colors.dark.bg_dark} width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          marginTop: "auto",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderColor: selectedColor,
            alignItems: "center",
            paddingHorizontal: 10,
            gap: 10,
            borderRadius: 10,
          }}
        >
          <Text
            style={[styles.text, { color: selectedColor, fontWeight: 600 }]}
          >
            QV
          </Text>
          <View
            style={{ height: 22, width: 22, backgroundColor: selectedColor }}
          />
          <Text
            style={[styles.text, { color: selectedColor, fontWeight: 600 }]}
          >
            {date[2]} {month[date[1] as keyof typeof month]} {date[0]}
          </Text>
        </View>
        <Text
          style={[
            styles.text,
            {
              color: selectedColor,
              fontSize: 18,
              fontWeight: 700,
              textAlign: "center",
            },
          ]}
        >
          QUIZ{"\n"}VERSE
        </Text>
      </View>
    </View>
  );
};

export default ProfileCard;

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
    paddingVertical: 15,
    marginTop: "auto",
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});
