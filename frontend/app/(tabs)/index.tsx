import { Text, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/Colors";
import ProfilePic from "@/assets/svgs/profilePic.svg";
import Trophy from "@/assets/svgs/currencyTropht.svg";
import Dimond from "@/assets/svgs/currencyDiamond.svg";
import { defaultStyles } from "@/constants/Styles";
import DbhLogo from "@/assets/svgs/dbhLogo3.svg";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import CircularProgress from "@/components/ui/CircularProgress";
import { layout } from "@/constants/Dimensions";
import { Line } from "react-native-svg";
import { LineDashed } from "@/components/ui/Line";
import AnimatedCarousel from "@/components/animatinos/CardsAnimation";

export default function HomeScreen() {
  const cards = [
    {
      svg: <DbhLogo width={"100%"} height={"100%"} />,
      title: "Detroit Become Human",
      company: "Quantic Dream",
      progress: 0.35,
      rewards: 100,
      total: 200,
    },
  ];

  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg_dark,
        alignItems: "center",
        paddingTop: layout.paddingTop,
        gap: 40,
        height: "100%",
        borderWidth: 0,
        borderColor: Colors.dark.border_muted,
      }}
    >
      <View
        style={[
          defaultStyles.containerRow,
          {
            width: "100%",
            borderWidth: 0,
            borderColor: Colors.dark.border_muted,
            paddingHorizontal: layout.paddingHorizontal,
          },
        ]}
      >
        <View style={[defaultStyles.containerRow, { gap: 10 }]}>
          <ProfilePic width={60} height={60} />
          <Text style={styles.txt}>AliEllie</Text>
        </View>
        <View
          style={[
            defaultStyles.containerRow,
            { gap: 10, borderWidth: 0, borderColor: Colors.dark.border },
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
        </View>
      </View>
      <View style={[{ width: "80%" }, defaultStyles.containerBackground]}>
        <Text style={styles.txt}>Weekly Event</Text>
        <Text style={styles.txt_muted}>17h 34m</Text>
      </View>
      <View style={{ width: "100%" }}>
        {cards.map((card, index) => {
          return (
            <View key={index} style={[defaultStyles.container, { gap: 40 }]}>
              <AnimatedCarousel />
              <View style={[defaultStyles.container, { width: "100%" }]}>
                <Text style={[styles.txt, { fontSize: 25 }]}>{card.title}</Text>
                <Text
                  style={[
                    styles.txt_muted,
                    { textAlign: "center", fontSize: 10, width: "70%" },
                  ]}
                >
                  This is a fan-made quiz, not officially connected to Rockstar
                  Games or the creators of “{card.title}”. The game title is a
                  trademark of {card.company}.
                </Text>
              </View>
              <View
                style={[
                  defaultStyles.containerRow,
                  {
                    width: "100%",
                    justifyContent: "space-evenly",
                    height: 110,
                  },
                ]}
              >
                <View
                  style={[
                    defaultStyles.containerBackground,
                    {
                      height: "100%",
                      paddingVertical: 10,
                      width: "35%",
                      justifyContent: "flex-start",
                      gap: 10,
                    },
                  ]}
                >
                  <Text style={[styles.txt, { fontSize: 16 }]}>Progress</Text>
                  <LineDashed />
                  <CircularProgress progress={32} size={50} strokeWidth={4} />
                </View>
                <View
                  style={[
                    defaultStyles.containerBackground,
                    {
                      width: "50%",
                      paddingVertical: 10,
                      height: "100%",
                      justifyContent: "flex-start",
                      gap: 10,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.txt,
                      {
                        width: "100%",
                        textAlign: "center",
                        fontSize: 16,
                      },
                    ]}
                  >
                    Rewards
                  </Text>
                  <LineDashed />
                  <View
                    style={{
                      width: "80%",
                      backgroundColor: Colors.dark.bg_light,
                      borderRadius: 6,
                      marginTop: 10,
                    }}
                  >
                    <View
                      style={{
                        width: `${(card.rewards / card.total) * 100}%`,
                        height: 4,
                        backgroundColor: Colors.dark.text,
                        borderRadius: 6,
                      }}
                    />
                  </View>
                  <Text style={[styles.txt_muted, { fontSize: 12 }]}>
                    {card.rewards} / {card.total}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
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
