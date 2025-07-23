import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from "react-native";
import DailyQuiz from "@/assets/svgs/dailyQuiz.svg";
import WeeklyEvent from "@/assets/svgs/weeklyEvent.svg";
import Championship from "@/assets/svgs/championship.svg";
import { defaultStyles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { HEIGHT, myHeight, WIDTH, myWidth } from "@/constants/Dimensions";

const width = WIDTH * (230 / myWidth);
const height = HEIGHT * (100 / myHeight);
const MODES = [
  {
    svg: (
      <DailyQuiz
        height={HEIGHT * (50 / myHeight)}
        width={WIDTH * (160 / myWidth)}
      />
    ),
    time: "17h 30m",
  },
  {
    svg: (
      <WeeklyEvent
        height={HEIGHT * (50 / myHeight)}
        width={WIDTH * (200 / myWidth)}
      />
    ),
    time: "2h 56m",
  },
  {
    svg: <Championship height={HEIGHT * (50 / myHeight)} />,
    time: "12h 13m",
  },
];

export default function Carousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Function to scroll to the next card
  const scrollToNext = () => {
    const nextIndex = (currentIndex + 1) % MODES.length;
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setCurrentIndex(nextIndex);
  };

  // Set up auto-scroll
  const startAutoScroll = () => {
    stopAutoScroll(); // clear any existing interval
    autoScrollTimer.current = setInterval(scrollToNext, 3000);
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  };

  // Start auto-scroll on mount
  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [currentIndex]);

  // Detect manual swipe
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
    startAutoScroll(); // reset timer
  };

  return (
    <View
      style={[
        defaultStyles.containerBackground,
        { height, width, padding: WIDTH * (10 / myWidth) },
      ]}
    >
      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={{ width }}
      >
        {MODES.map((card, index) => (
          <TouchableOpacity activeOpacity={0.7} key={index} style={styles.card}>
            {card.svg}
            <Text style={{ color: Colors.dark.text_muted }}>{card.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {MODES.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    borderWidth: 1,
    borderColor: "red",
  },
  card: {
    width,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: WIDTH * (10 / myWidth),
    position: "absolute",
    bottom: WIDTH * (10 / myWidth),
  },
  dot: {
    width: WIDTH * (4 / myWidth),
    height: WIDTH * (4 / myWidth),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginHorizontal: WIDTH * (5 / myWidth),
  },
  activeDot: {
    backgroundColor: Colors.dark.border,
  },
});
