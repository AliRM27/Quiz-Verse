import React, { useRef } from "react";
import {
  Animated,
  FlatList,
  View,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";
import DbhLogo from "@/assets/svgs/dbhLogo3.svg";
import { Colors } from "@/constants/Colors";
import { WIDTH } from "@/constants/Dimensions";
import { BR } from "@/constants/Styles";

const ITEM_WIDTH = 150;
const ITEM_SPACING = (WIDTH - ITEM_WIDTH) / 2;

const cards = [
  {
    id: "1",
    svg: <DbhLogo width="100%" height="100%" />,
    title: "Detroit Become Human",
    company: "Quantic Dream",
    progress: 0.35,
    rewards: 100,
    total: 200,
  },
  {
    id: "2",
    svg: <DbhLogo width="100%" height="100%" />,
    title: "Red Dead Redemption II",
    company: "Rockstar Games",
    progress: 0.7,
    rewards: 200,
    total: 300,
  },
  {
    id: "3",
    svg: <DbhLogo width="100%" height="100%" />,
    title: "Horizon Zero Dawn",
    company: "Guerrilla Games",
    progress: 0.5,
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
    svg: <DbhLogo width="100%" height="100%" />,
    title: "Red Dead Redemption II",
    company: "Rockstar Games",
    progress: 0.7,
    rewards: 200,
    total: 300,
  },
  {
    id: "6",
    svg: <DbhLogo width="100%" height="100%" />,
    title: "Horizon Zero Dawn",
    company: "Guerrilla Games",
    progress: 0.5,
    rewards: 150,
    total: 250,
  },
];

export default function AnimatedCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
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
      renderItem={({ item, index }) => {
        const inputRange = [
          (index - 1) * ITEM_WIDTH,
          index * ITEM_WIDTH,
          (index + 1) * ITEM_WIDTH,
        ];

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.9, 1, 0.9],
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
            <View style={[styles.logoContainer]}>{item.svg}</View>
          </Animated.View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    alignItems: "center",
  },
  logoContainer: {
    borderWidth: 0.4,
    borderColor: Colors.dark.text,
    width: 150,
    height: 150,
    overflow: "hidden",
    borderRadius: BR,
  },
});
