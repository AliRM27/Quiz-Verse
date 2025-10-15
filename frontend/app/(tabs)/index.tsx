import { Text, StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import Gem from "@/assets/svgs/gem.svg";
import Trophy from "@/assets/svgs/trophy.svg";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import { layout } from "@/constants/Dimensions";
import HomePageCards from "@/components/HomePageCards";
import { WIDTH, HEIGHT, myHeight, myWidth } from "@/constants/Dimensions";
import Carousel from "@/components/animatinos/Carousel";
import { useUser } from "@/context/userContext";
import { useState } from "react";
import ProfileCardModal from "@/components/ui/ProfileCardModal";

export default function HomeScreen() {
  const { user, loading } = useUser();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: Colors.dark.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        {
          alignItems: "center",
          gap: 40,
          height: "100%",
        },
      ]}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          gap: 20,
          alignItems: "center",
          marginTop: 10,
          justifyContent: "space-around",
        }}
      >
        <View
          style={[
            defaultStyles.containerRow,
            { gap: HEIGHT * (20 / myHeight), justifyContent: "center" },
          ]}
        >
          <TouchableOpacity
            onPress={() => setIsVisible(true)}
            activeOpacity={0.7}
            style={{
              borderWidth: 2,
              borderColor: user.theme.cardColor,
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
          </TouchableOpacity>
          <Text style={[styles.txt, user.name.length > 10 && { fontSize: 16 }]}>
            {user.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 5 }}>
            <Trophy width={25} height={25} color={Colors.dark.secondary} />
            <Text style={styles.txt}>
              {user.stars}
              {/* String(user.stars).slice(0, 1)}.{String(user.stars).slice(1) -> Adding a point to for better visualization of numbers*/}
            </Text>
          </View>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 5 }}>
            <Gem width={25} height={25} color={Colors.dark.primary} />
            <Text style={styles.txt}>{2000}</Text>
          </View>
        </View>
      </View>
      <Carousel />
      <View
        style={{
          width: "100%",
        }}
      >
        <HomePageCards />
      </View>
      {isVisible && <ProfileCardModal isVisible setIsVisible={setIsVisible} />}
    </View>
  );
}

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: REGULAR_FONT,
    fontWeight: 600,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 15,
    fontFamily: REGULAR_FONT,
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
