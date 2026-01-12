import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { REGULAR_FONT } from "@/constants/Styles";
import { useTranslation } from "react-i18next";
import { getThemeHex } from "@/constants/ThemeColors";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Tag } from "lucide-react-native";

// SVGs
import Gem from "@/assets/svgs/gem.svg";
import Trophy from "@/assets/svgs/trophy.svg";
import HeartQuiz from "@/assets/svgs/heartQuiz.svg";
import { Colors } from "@/constants/Colors";
import { API_URL } from "@/services/config";

interface ShopItemCardProps {
  item: any;
  isOwned: boolean;
  onPress: (item: any) => void;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ShopItemCard = ({ item, isOwned, onPress, index }: ShopItemCardProps) => {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .springify()
        .damping(12)}
      style={styles.cardContainer}
    >
      <AnimatedPressable
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isOwned}
        style={[
          styles.pressableArea,
          isOwned && styles.cardOwned,
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={["#2A2A2A", "#1A1A1A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Icon / Preview Area */}
          <View style={styles.cardPreview}>
            {item.type === "theme" && (
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: getThemeHex(item.value) },
                ]}
              />
            )}
            {item.type === "avatar" && (
              <Image
                source={{
                  uri: `${API_URL}${
                    item.value.startsWith("/")
                      ? item.value.slice(1)
                      : item.value
                  }`,
                }}
                style={styles.avatarPreview}
              />
            )}
            {item.type === "title" && (
              <Tag size={50} color={Colors.dark.primary} strokeWidth={1.5} />
            )}
            {item.type === "quiz" && <HeartQuiz width={50} height={50} />}
          </View>

          {/* Info Area */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {t(item.name) || item.name}
            </Text>

            {isOwned ? (
              <View style={styles.ownedBadge}>
                <Text style={styles.ownedText}>{t("owned")}</Text>
              </View>
            ) : (
              <View style={styles.priceRow}>
                {item.price.gems > 0 && (
                  <View style={styles.priceTag}>
                    <Gem width={14} height={14} color={Colors.dark.primary} />
                    <Text style={styles.priceText}>{item.price.gems}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
};

export default ShopItemCard;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  pressableArea: {
    flex: 1,
    borderRadius: 20,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardOwned: {
    opacity: 0.6,
  },
  cardPreview: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginBottom: 4,
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarPreview: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardInfo: {
    padding: 10,
    paddingTop: 4,
    gap: 6,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: REGULAR_FONT,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceDivider: {
    width: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  priceText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: REGULAR_FONT,
  },
  ownedBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  ownedText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    fontFamily: REGULAR_FONT,
  },
});
