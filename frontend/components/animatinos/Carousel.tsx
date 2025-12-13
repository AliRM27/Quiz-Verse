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
  Modal,
} from "react-native";
import DailyQuiz from "@/assets/svgs/dailyQuiz.svg";
import WeeklyEvent from "@/assets/svgs/weeklyEvent.svg";
import Championship from "@/assets/svgs/championship.svg";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { HEIGHT, myHeight, WIDTH, myWidth } from "@/constants/Dimensions";
import { Href, router } from "expo-router";

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
    path: "/(events)/dailyQuiz",
  },
  {
    svg: (
      <WeeklyEvent
        height={HEIGHT * (50 / myHeight)}
        width={WIDTH * (200 / myWidth)}
      />
    ),
    time: "2h 56m",
    path: "/(events)/weeklyEvent",
  },
  {
    svg: <Championship height={HEIGHT * (50 / myHeight)} />,
    time: "12h 13m",
    path: "/(events)/championship",
  },
];

export default function Carousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [featureName, setFeatureName] = useState("");

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

  const handleComingSoon = (feature: string) => {
    setFeatureName(feature);
    setModalVisible(true);
  };

  return (
    <>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: Colors.dark.bg,
              borderRadius: 20,
              paddingVertical: 25,
              paddingHorizontal: 20,
              alignItems: "center",
              borderWidth: 1,
              borderColor: Colors.dark.bg_light,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "600",
                color: Colors.dark.text,
                marginBottom: 10,
                fontFamily: REGULAR_FONT,
              }}
            >
              {featureName} Coming Soon!
            </Text>
            <Text
              style={{
                color: Colors.dark.text_muted,
                fontFamily: REGULAR_FONT,
                fontSize: 15,
                textAlign: "center",
                marginBottom: 25,
              }}
            >
              We’re working on this feature! Stay tuned for new tournaments,
              community challenges, in-game shop and more in future updates.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setModalVisible(false);
              }}
              style={{
                backgroundColor: Colors.dark.highlight,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 30,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  fontFamily: REGULAR_FONT,
                }}
              >
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (index != 2) {
                  router.push(card.path as Href);
                  return;
                }
                handleComingSoon("Events");
              }}
              key={index}
              style={styles.card}
            >
              {card.svg}
              {/* <Text style={{ color: Colors.dark.text_muted }}>{card.time}</Text> */}
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
    </>
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
    justifyContent: "center",
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
