import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
import { router } from "expo-router";
import ArrBack from "@/assets/svgs/backArr.svg";
import { REGULAR_FONT } from "@/constants/Styles";
import { useUser } from "@/context/userContext";

const EditProfile = () => {
  const { user } = useUser();

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
      <Text style={[styles.text, { fontSize: 30, fontWeight: 700 }]}>
        Edit Profile
      </Text>
      <View style={styles.card}>
        <View style={styles.figure} />
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
                { color: "#E39595", fontSize: 25, fontWeight: 700 },
              ]}
            >
              {user.name}
            </Text>
            <Text
              style={[
                styles.text,
                { color: "#E39595", fontSize: 17, fontWeight: 600 },
              ]}
            >
              QUIZ MASTER
            </Text>
          </View>
          <View
            style={{
              borderWidth: 2,
              borderColor: "#E39595",
              transform: [{ rotate: "45deg" }],
              padding: 3,
              borderRadius: 20,
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
              borderColor: "#E39595",
              alignItems: "center",
              paddingHorizontal: 10,
              gap: 10,
              borderRadius: 10,
            }}
          >
            <Text style={[styles.text, { color: "#E39595", fontWeight: 600 }]}>
              QV
            </Text>
            <View
              style={{ height: 22, width: 22, backgroundColor: "#E39595" }}
            />
            <Text style={[styles.text, { color: "#E39595", fontWeight: 600 }]}>
              1. Sept 2025
            </Text>
          </View>
          <Text
            style={[
              styles.text,
              {
                color: "#E39595",
                fontSize: 18,
                fontWeight: 700,
                textAlign: "center",
              },
            ]}
          >
            QUIZ {"\n"} VERSE
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  text: {
    color: Colors.dark.text,
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
});
