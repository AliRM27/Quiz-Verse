import { Colors } from "@/constants/Colors";
import { isSmallPhone } from "@/constants/Dimensions";
import { REGULAR_FONT } from "@/constants/Styles";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { updateUser } from "@/services/api";
import { useState } from "react";
import ArrBack from "@/components/ui/ArrBack";
import Loader from "@/components/ui/Loader";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

const ChangeLanguage = () => {
  const languages = [
    { name: "English", code: "en", icon: "🇬🇧" },
    { name: "Deutsch", code: "de", icon: "🇩🇪" },
    { name: "Español", code: "es", icon: "🇪🇸" },
    { name: "Français", code: "fr", icon: "🇫🇷" },
    { name: "Русский", code: "ru", icon: "🇷🇺" },
  ];

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user, refreshUser } = useUser();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  if (!user) return null;

  const handleLanguageChange = async (language: string) => {
    setIsLoading(language);
    try {
      user.language = language;
      await updateUser(user);
      await refreshUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Small delay for better UX feel
      setTimeout(() => router.back(), 300);
    } catch (err) {
      console.log(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setIsLoading(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <ArrBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={{ height: 45, justifyContent: "center", marginBottom: 40 }}
        >
          <Text style={styles.title}>{t("changeLanguage")}</Text>
        </Animated.View>

        <View style={styles.listContainer}>
          {languages.map((lang, index) => {
            const isSelected = user.language === lang.name;
            const loading = isLoading === lang.name;

            return (
              <Animated.View
                key={lang.code}
                entering={FadeInRight.delay(index * 100)
                  .duration(500)
                  .springify()}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.cardWrapper}
                  disabled={isSelected || !!isLoading}
                  onPress={() => handleLanguageChange(lang.name)}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
                        : ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]
                    }
                    style={[styles.card, isSelected && styles.cardSelected]}
                  >
                    <View style={styles.cardLeft}>
                      <Text style={styles.flag}>{lang.icon}</Text>
                      <View>
                        <Text
                          style={[
                            styles.langName,
                            isSelected && styles.langNameSelected,
                          ]}
                        >
                          {lang.name}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardRight}>
                      {loading ? (
                        <Loader width={24} height={24} />
                      ) : isSelected ? (
                        <View style={styles.checkCircle}>
                          <Ionicons name="checkmark" size={16} color="#000" />
                        </View>
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="rgba(255,255,255,0.2)"
                        />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangeLanguage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    fontFamily: REGULAR_FONT,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.text_muted,
    fontFamily: REGULAR_FONT,
    marginBottom: 48,
    opacity: 0.8,
  },
  listContainer: {
    gap: 16,
  },
  cardWrapper: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
  },
  cardSelected: {
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  flag: {
    fontSize: 28,
  },
  langName: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    fontFamily: REGULAR_FONT,
  },
  langNameSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  cardRight: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
