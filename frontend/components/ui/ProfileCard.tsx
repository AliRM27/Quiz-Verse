import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";
import { User } from "@/context/userContext";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import ColorPicker from "./ColorPicker";
import Pencil from "@/assets/svgs/pencil.svg";

const ProfileCard = ({
  usernameValue,
  user,
  isEditable,
}: {
  usernameValue: string;
  user: User;
  isEditable: boolean;
}) => {
  const cardColor = user.theme.cardColor;

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
      <View
        style={[
          styles.figure,
          { backgroundColor: cardColor, alignItems: "flex-end", padding: 10 },
        ]}
      >
        {isEditable && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              borderWidth: 1,
              backgroundColor: Colors.dark.bg_dark,
              padding: 7,
              borderRadius: 15,
            }}
          >
            <Pencil color={Colors.dark.text} width={20} height={20} />
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
                color: cardColor,
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
              { color: cardColor, fontSize: 17, fontWeight: 600 },
            ]}
          >
            QUIZ MASTER
          </Text>
        </View>
        <View
          style={{
            borderWidth: 2,
            borderColor: cardColor,
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
            borderColor: cardColor,
            alignItems: "center",
            paddingHorizontal: 10,
            gap: 10,
            borderRadius: 10,
          }}
        >
          <Text style={[styles.text, { color: cardColor, fontWeight: 600 }]}>
            QV
          </Text>
          <View style={{ height: 22, width: 22, backgroundColor: cardColor }} />
          <Text style={[styles.text, { color: cardColor, fontWeight: 600 }]}>
            {date[2]} {month[date[1] as keyof typeof month]} {date[0]}
          </Text>
        </View>
        <Text
          style={[
            styles.text,
            {
              color: cardColor,
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
    height: 55,
    paddingVertical: 15,
    marginTop: "auto",
    borderRadius: 35,
    alignItems: "center",
  },
});
