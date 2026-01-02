import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import DailyQuiz from "@/assets/svgs/dailyQuiz.svg";
import WeeklyEvent from "@/assets/svgs/weeklyEvent.svg";
import Championship from "@/assets/svgs/championship.svg";
import { REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { HEIGHT, myHeight, WIDTH, myWidth } from "@/constants/Dimensions";
import { Href, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const CARD_WIDTH = WIDTH * (280 / myWidth);
const CARD_HEIGHT = HEIGHT * (100 / myHeight);

const MODES = [
  {
    svg: (
      <DailyQuiz
        height={HEIGHT * (45 / myHeight)}
        width={WIDTH * (140 / myWidth)}
      />
    ),
    gradient: ["#667eea", "#764ba2"] as [string, string],
    icon: "calendar",
    path: "/(events)/dailyQuiz",
    label: "Daily Quiz",
  },
  {
    svg: (
      <WeeklyEvent
        height={HEIGHT * (45 / myHeight)}
        width={WIDTH * (170 / myWidth)}
      />
    ),
    gradient: ["#f093fb", "#f5576c"] as [string, string],
    icon: "award",
    path: "/(events)/weeklyEvent",
    label: "Weekly Event",
  },
  {
    svg: <Championship height={HEIGHT * (45 / myHeight)} />,
    gradient: ["#4facfe", "#00f2fe"] as [string, string],
    icon: "trophy",
    path: "/(events)/championship",
    label: "Championship",
  },
];

export default function Carousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [featureName, setFeatureName] = useState("");

  const scrollToNext = () => {
    const nextIndex = (currentIndex + 1) % MODES.length;
    scrollRef.current?.scrollTo({ x: nextIndex * CARD_WIDTH, animated: true });
    setCurrentIndex(nextIndex);
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollTimer.current = setInterval(scrollToNext, 4000);
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [currentIndex]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    setCurrentIndex(index);
    startAutoScroll();
  };

  const handleComingSoon = (feature: string) => {
    setFeatureName(feature);
    setModalVisible(true);
  };

  return (
    <>
      {/* Coming Soon Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.springify()}
            style={styles.modalContent}
          >
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalIconContainer}
            >
              <Feather name="clock" size={32} color="#fff" />
            </LinearGradient>
            <Text style={styles.modalTitle}>{featureName} Coming Soon!</Text>
            <Text style={styles.modalDescription}>
              We're working on this feature! Stay tuned for tournaments,
              community challenges, and more in future updates.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Carousel Container */}
      <View style={styles.container}>
        <ScrollView
          horizontal
          pagingEnabled
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH}
        >
          {MODES.map((card, index) => (
            <CarouselCard
              key={index}
              card={card}
              index={index}
              currentIndex={currentIndex}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (index !== 2) {
                  router.push(card.path as Href);
                  return;
                }
                handleComingSoon("Championship");
              }}
            />
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {MODES.map((card, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && [
                  styles.activeDot,
                  { backgroundColor: card.gradient[0] },
                ],
              ]}
            />
          ))}
        </View>
      </View>
    </>
  );
}

// Card Component
const CarouselCard = ({
  card,
  index,
  currentIndex,
  onPress,
}: {
  card: (typeof MODES)[0];
  index: number;
  currentIndex: number;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const isActive = index === currentIndex;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        onPress={onPress}
      >
        <LinearGradient
          colors={card.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, !isActive && styles.cardInactive]}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          {/* Gloss */}
          <LinearGradient
            colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.glossOverlay}
          />

          {/* Content */}
          <View style={styles.cardContent}>{card.svg}</View>

          {/* Coming Soon badge for Championship */}
          {index === 2 && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>SOON</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    alignItems: "center",
  },
  scrollContent: {
    alignItems: "center",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    paddingHorizontal: 8,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardInactive: {
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  decorativeCircle1: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    left: -15,
    bottom: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  glossOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  comingSoonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border_muted,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    borderRadius: 4,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 12,
    fontFamily: REGULAR_FONT,
    textAlign: "center",
  },
  modalDescription: {
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: REGULAR_FONT,
  },
});
