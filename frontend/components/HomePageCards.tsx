import { useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DbhLogo from "@/assets/svgs/quizzes/dbhLogo.svg";
import Rdr2Logo from "@/assets/svgs/quizzes/rdr2Logo.svg";
import TlouLogo from "@/assets/svgs/quizzes/tlouLogo.svg";
import { Colors } from "@/constants/Colors";
import { WIDTH, HEIGHT, myHeight, myWidth } from "@/constants/Dimensions";
import { BR } from "@/constants/Styles";
import { defaultStyles } from "@/constants/Styles";
import CircularProgress from "@/components/ui/CircularProgress";
import { LineDashed } from "@/components/ui/Line";
import * as Haptics from "expo-haptics";

const ITEM_WIDTH = HEIGHT * (150 / myHeight);
const ITEM_SPACING = (WIDTH - ITEM_WIDTH) / 2;

const cards = [
  {
    id: "1",
    svg: <DbhLogo width="100%" height="100%" />,
    title: "Detroit Become Human",
    company: "Quantic Dream",
    progress: 0.95,
    rewards: 190,
    total: 200,
  },
  {
    id: "2",
    svg: <Rdr2Logo width="100%" height="100%" />,
    title: "Red Dead Redemption II",
    company: "Rockstar Games",
    progress: 0.7,
    rewards: 200,
    total: 300,
  },
  {
    id: "3",
    svg: <TlouLogo width="100%" height="100%" />,
    title: "The Last Of Us",
    company: "Naughty Dog",
    progress: 0.87,
    rewards: 150,
    total: 250,
  },
  {
    id: "4",
    svg: <DbhLogo width="100%" height="100%" />,
    title: "Detroit Become Human",
    company: "Quantic Dream",
    progress: 0.35,
    rewards: 100,
    total: 200,
  },
  {
    id: "5",
    svg: <Rdr2Logo width="100%" height="100%" />,
    title: "Red Dead Redemption II",
    company: "Rockstar Games",
    progress: 0.7,
    rewards: 200,
    total: 300,
  },
  {
    id: "6",
    svg: <TlouLogo width="100%" height="100%" />,
    title: "The Last Of Us",
    company: "Naughty Dog",
    progress: 0.87,
    rewards: 150,
    total: 250,
  },
];

export default function HomePageCards() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={[defaultStyles.container]}>
      <Animated.FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        horizontal
        style={{}}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: ITEM_SPACING,
        }}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const index = Math.round(
            event.nativeEvent.contentOffset.x / ITEM_WIDTH
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.logoContainer,
                  index === currentIndex
                    ? { borderWidth: 0.6 }
                    : { borderWidth: 0 },
                ]}
              >
                {item.svg}
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
      <Text
        style={[
          styles.txt,
          {
            fontSize: 25,
            marginVertical: 10,
            letterSpacing: -1,
            textShadowColor: "white",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 4,
          },
        ]}
      >
        {cards[currentIndex].title}
      </Text>
      <Text
        style={[
          styles.txt_muted,
          {
            textAlign: "center",
            fontSize: 10,
            width: "70%",
            height: `${HEIGHT * (25 / myHeight)}%`,
          },
        ]}
      >
        This is a fan-made quiz, not officially connected to{" "}
        {cards[currentIndex].company} or the creators of “
        {cards[currentIndex].title}”. The game title is a trademark of{" "}
        {cards[currentIndex].company}.
      </Text>
      <View
        style={[
          defaultStyles.containerRow,
          {
            width: "100%",
            justifyContent: "space-evenly",
            height: HEIGHT * (115 / myHeight),
          },
        ]}
      >
        <View
          style={[
            defaultStyles.containerBackground,
            {
              height: "100%",
              paddingVertical: HEIGHT * (10 / myHeight),
              width: "30%",
              justifyContent: "flex-start",
              gap: HEIGHT * (10 / myHeight),
              borderRadius: 25,
            },
          ]}
        >
          <Text style={[styles.txt, { fontSize: 16 }]}>Progress</Text>
          <LineDashed />
          <View>
            <CircularProgress
              progress={cards[currentIndex].progress * 100}
              size={HEIGHT * (50 / myHeight)}
              strokeWidth={3}
            />
          </View>
        </View>
        <Animated.View
          style={[
            defaultStyles.containerBackground,
            {
              width: "50%",
              paddingVertical: 10,
              height: "100%",
              justifyContent: "flex-start",
              gap: HEIGHT * (10 / myHeight),
              borderRadius: 25,
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
              backgroundColor: Colors.dark.border,
              borderRadius: 6,
              marginTop: HEIGHT * (10 / myHeight),
            }}
          >
            <View
              style={{
                width: `${(cards[currentIndex].rewards / cards[currentIndex].total) * 100}%`,
                height: 4,
                backgroundColor: "#FFB11F",
                borderRadius: 6,
              }}
            />
          </View>
          <Text style={[styles.txt_muted, { fontSize: 12 }]}>
            {cards[currentIndex].rewards} / {cards[currentIndex].total}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    alignItems: "center",
  },
  logoContainer: {
    borderColor: Colors.dark.text,
    width: HEIGHT * (150 / myHeight),
    height: HEIGHT * (150 / myHeight),
    overflow: "hidden",
    borderRadius: 10,
  },
  txt: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: "Inter-Regular ",
    fontWeight: 600,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 15,
    fontFamily: "Inter-Regular",
  },
});
