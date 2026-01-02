import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import Gem from "@/assets/svgs/gem.svg";
import Trophy from "@/assets/svgs/trophy.svg";
import { defaultStyles, REGULAR_FONT } from "@/constants/Styles";
import HomePageCards from "@/components/HomePageCards";
import Carousel from "@/components/animatinos/Carousel";
import { useUser } from "@/context/userContext";
import { useCallback, useState } from "react";
import ProfileCardModal from "@/components/ui/ProfileCardModal";
import { moderateScale } from "react-native-size-matters";
import { isSmallPhone } from "@/constants/Dimensions";
import { useFocusEffect } from "expo-router";
import { useSafeAreaBg } from "@/context/safeAreaContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const { user, loading } = useUser();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const { setSafeEdges } = useSafeAreaBg();

  useFocusEffect(
    useCallback(() => {
      setSafeEdges(["bottom", "top"]);
    }, [])
  );

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.dark.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isSmallPhone && { gap: 16 }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(0).springify()}
        style={styles.header}
      >
        {/* Profile Section */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsVisible(true);
          }}
          activeOpacity={0.8}
          style={styles.profileSection}
        >
          <View
            style={[
              styles.profileImageWrapper,
              { borderColor: user.theme.cardColor },
            ]}
          >
            <View style={styles.profileImageContainer}>
              <Image src={user?.profileImage} style={styles.profileImage} />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text
              style={[
                styles.userName,
                user.name.length > 10 && { fontSize: moderateScale(14) },
              ]}
              numberOfLines={1}
            >
              {user.name}
            </Text>
            <Text style={styles.welcomeText}>Welcome back!</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statBadge}>
            <Trophy width={16} height={16} color={Colors.dark.secondary} />
            <Text style={styles.statValue}>{user.stars}</Text>
          </View>
          <View style={styles.statBadge}>
            <Gem width={16} height={16} color={Colors.dark.primary} />
            <Text style={styles.statValue}>{user.gems}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Events Carousel */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <Carousel />
      </Animated.View>

      {/* Quiz Cards */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.cardsContainer}
      >
        <HomePageCards />
      </Animated.View>

      {/* Profile Modal */}
      <ProfileCardModal isVisible={isVisible} setIsVisible={setIsVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 24,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.bg_dark,
  },
  // Header
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileImageWrapper: {
    borderWidth: 2,
    transform: [{ rotate: "45deg" }],
    padding: 3,
    borderRadius: 18,
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    transform: [{ rotate: "0deg" }],
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: Colors.dark.bg_light,
  },
  profileImage: {
    width: 58,
    height: 58,
    transform: [{ rotate: "-45deg" }],
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    color: Colors.dark.text,
    fontSize: moderateScale(16),
    fontFamily: REGULAR_FONT,
    fontWeight: "700",
  },
  welcomeText: {
    color: Colors.dark.text_muted,
    fontSize: 12,
    fontFamily: REGULAR_FONT,
  },
  // Stats
  statsSection: {
    flexDirection: "row",
    gap: 8,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.dark.bg_light,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: REGULAR_FONT,
    fontWeight: "600",
  },
  // Cards
  cardsContainer: {
    width: "100%",
    flex: 1,
  },
});
