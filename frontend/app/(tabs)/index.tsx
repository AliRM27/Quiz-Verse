import { Text, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/Colors";
import ProfilePic from "@/assets/svgs/profilePic.svg";
import Trophy from "@/assets/svgs/currencyTropht.svg";
import Dimond from "@/assets/svgs/currencyDiamond.svg";
import { defaultStyles } from "@/constants/Styles";
import DbhLogo from "@/assets/svgs/dbhLogo3.svg";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import CircularProgress from "react-native-circular-progress-indicator";
import { layout } from "@/constants/Dimensions";

export default function HomeScreen() {
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: Colors.dark.bg_dark,
        alignItems: "center",
        paddingTop: layout.paddingTop,
        paddingHorizontal: layout.paddingHorizontal,
        gap: 30,
        height: "100%",
        borderWidth: 0,
        borderColor: Colors.dark.border_muted,
      }}
    >
      <View style={[defaultStyles.containerRow, { width: "100%" }]}>
        <View style={defaultStyles.containerRow}>
          <ProfilePic width={60} height={60} />
          <Text style={styles.txt}>AliEllie</Text>
        </View>
        <View style={[defaultStyles.containerRow, { gap: 50 }]}>
          <View
            style={[
              {
                flexDirection: "row",
              },
            ]}
          >
            <Trophy width={25} height={25} />
            <Text style={[styles.txt_muted, styles.currency]}>657</Text>
          </View>
          <View
            style={[
              {
                flexDirection: "row",
                width: 50,
              },
            ]}
          >
            <Dimond width={25} height={25} />
            <Text
              style={[
                styles.txt_muted,
                styles.currency,
                { minWidth: 45, left: 18 },
              ]}
            >
              34
            </Text>
          </View>
        </View>
      </View>
      <View style={[{ width: "80%" }, defaultStyles.containerBackground]}>
        <Text style={styles.txt}>Weekly Event</Text>
        <Text style={styles.txt_muted}>17h 34m</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  txt: {
    color: Colors.dark.text,
    fontSize: 18,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 15,
  },
  currency: {
    position: "absolute",
    left: 24,
    top: 3,
    zIndex: -1,
    textAlign: "center",
    alignItems: "center",
    minWidth: 40,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 3,
    borderLeftWidth: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
});
