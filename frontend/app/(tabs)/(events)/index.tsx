import React from "react";
import { Colors, GradientColors } from "@/constants/Colors";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import DailyQuiz from "@/assets/svgs/dailyQuiz.svg";
import WeeklyChallange from "@/assets/svgs/weeklyEvent.svg";
import Championship from "@/assets/svgs/championship.svg";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface EventCardProps {
  event: {
    name: string;
    description: string;
    icon: React.FC<{ width: number; height: number }>;
    path: string;
    gradient: [string, string, ...string[]];
    iconBg: string;
    comingSoon?: boolean;
  };
  index: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, index }) => {
  const scale = useSharedValue(1);
  const EventIcon = event.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!event.comingSoon) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (!event.comingSoon) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(event.path as Href);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.cardContainer}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          disabled={event.comingSoon}
          style={{ flex: 1 }}
        >
          {/* Card Depth Shadow */}
          <View style={styles.cardShadow} />

          {/* Main Card */}
          <LinearGradient
            colors={event.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Decorative background circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Content */}
            <View style={styles.cardContent}>
              {/* Icon Container */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: event.iconBg },
                ]}
              >
                <EventIcon width={60} height={60} />
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
              </View>

              {/* Arrow or Coming Soon */}
              {event.comingSoon ? (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              ) : (
                <View style={styles.arrowContainer}>
                  <Feather
                    name="chevron-right"
                    size={24}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>
              )}
            </View>

            {/* Gloss effect */}
            <LinearGradient
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.glossEffect}
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default function Events() {
  const { t } = useTranslation();

  const events = [
    {
      name: t("dailyQuiz"),
      description:
        t("dailyQuizDescription") ||
        "Test your knowledge daily and earn rewards!",
      icon: DailyQuiz,
      path: "/(tabs)/(events)/dailyQuiz",
      gradient: ["#667eea", "#764ba2"] as [string, string],
      iconBg: "rgba(255,255,255,0.2)",
    },
    {
      name: t("weeklyChallenge") || "Weekly Challenge",
      description:
        t("weeklyEventDescription") ||
        "Complete weekly missions for exclusive prizes!",
      icon: WeeklyChallange,
      path: "/(tabs)/(events)/weeklyEvent",
      gradient: ["#f093fb", "#f5576c"] as [string, string],
      iconBg: "rgba(255,255,255,0.2)",
    },
    {
      name: t("championship") || "Championship",
      description:
        t("championshipDescription") ||
        "Compete against the best players worldwide!",
      icon: Championship,
      path: "/(tabs)/(events)/championship",
      gradient: ["#4facfe", "#00f2fe"] as [string, string],
      iconBg: "rgba(255,255,255,0.2)",
      comingSoon: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Animated.Text
          entering={FadeInDown.delay(0).springify()}
          style={styles.headerTitle}
        >
          {t("events")}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(50).springify()}
          style={styles.headerSubtitle}
        >
          {t("eventsSubtitle") || "Compete and win amazing rewards"}
        </Animated.Text>
      </View>

      {/* Decorative divider */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.divider}
      >
        <View style={styles.dividerLine} />
        <View style={styles.dividerDot} />
        <View style={styles.dividerLine} />
      </Animated.View>

      {/* Events List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {events.map((event, index) => (
          <EventCard key={event.name} event={event} index={index} />
        ))}

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: Colors.dark.text_muted,
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "60%",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border_muted,
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.primary,
    marginHorizontal: 10,
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 10,
    gap: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 130,
  },
  cardShadow: {
    position: "absolute",
    bottom: -4,
    left: 8,
    right: 8,
    height: 120,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  decorativeCircle1: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    right: 40,
    bottom: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  eventName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    lineHeight: 18,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonBadge: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  comingSoonText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  glossEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
