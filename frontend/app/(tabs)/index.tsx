import { Text, StyleSheet, View, Image } from "react-native";
import { Colors } from "@/constants/Colors";
import ProfilePic from "@/assets/svgs/profilePic.svg";
import Trophy from "@/assets/svgs/currencyTropht.svg";
import Dimond from "@/assets/svgs/currencyDiamond.svg";
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
        gap: HEIGHT * (40 / myHeight),
      }}
    >
      <View
        style={[
          defaultStyles.containerRow,
          {
            width: "90%",
          },
        ]}
      >
        <View
          style={[
            defaultStyles.containerRow,
            { gap: HEIGHT * (10 / myHeight) },
          ]}
        >
          <Image
            src={user?.profileImage}
            width={50}
            height={50}
            style={{ borderRadius: 50 }}
          />
          <Text style={styles.txt}>{user?.name}</Text>
        </View>
        {/* <View
          style={[
            defaultStyles.containerRow,
            {
              gap: HEIGHT * (10 / myHeight),
              borderWidth: 0,
              borderColor: Colors.dark.border,
            },
          ]}
        >
          <View
            style={[
              defaultStyles.containerRow,
              {
                borderWidth: 0,
                borderColor: Colors.dark.border,
              },
            ]}
          >
            <Trophy width={25} height={25} style={{ zIndex: 1 }} />
            <Text style={[styles.currency]}>657</Text>
          </View>
          <View
            style={[
              defaultStyles.containerRow,
              {
                borderWidth: 0,
                borderColor: Colors.dark.border,
              },
            ]}
          >
            <Dimond width={25} height={25} style={{ zIndex: 1 }} />
            <Text style={[styles.currency]}>37</Text>
          </View>
        </View> */}
      </View>
      <Carousel />
      <View
        style={{
          width: "100%",
          borderWidth: 0,
          borderColor: Colors.dark.border_muted,
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
