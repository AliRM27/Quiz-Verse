import { Text, StyleSheet, View, Image } from "react-native";
import { Colors } from "@/constants/Colors";
import ProfilePic from "@/assets/svgs/profilePic.svg";
import Trophy from "@/assets/svgs/currencyTropht.svg";
import { defaultStyles } from "@/constants/Styles";
import { layout } from "@/constants/Dimensions";
import HomePageCards from "@/components/HomePageCards";
import { WIDTH, HEIGHT, myHeight, myWidth } from "@/constants/Dimensions";
import Carousel from "@/components/animatinos/Carousel";
import { useUser } from "@/context/userContext";

export default function HomeScreen() {
  const { user, loading } = useUser();

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: Colors.dark.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: "center",
        gap: 40,
        height: "100%",
      }}
    >
      <View
        style={[defaultStyles.containerRow, { gap: HEIGHT * (20 / myHeight) }]}
      >
        <View
          style={{
            borderWidth: 2,
            borderColor: Colors.dark.primary,
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
        <Text style={styles.txt}>{user?.name}</Text>
      </View>
      <Carousel />
      <View
        style={{
          width: "100%",
        }}
      >
        <HomePageCards />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: "Inter-Regular SemiBold",
    fontWeight: 600,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 15,
    fontFamily: "Inter-Regular",
  },
  currency: {
    textAlign: "right",
    minWidth: 45,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    padding: 3,
    borderLeftWidth: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    color: Colors.dark.text_muted,
    fontSize: 13,
    left: -10,
  },
});
