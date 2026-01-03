import { Colors } from "@/constants/Colors";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  FlatList,
  Pressable,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import Search from "@/assets/svgs/search.svg";
import { REGULAR_FONT, ITALIC_FONT } from "@/constants/Styles";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchQuizzes, fetchUserProgress } from "@/services/api";
import { debounce } from "lodash";
import QuizLogo from "@/components/ui/QuizLogo";
import { useUser } from "@/context/userContext";
import { isSmallPhone, myWidth, WIDTH } from "@/constants/Dimensions";
import Close from "@/assets/svgs/close.svg";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import Lock from "@/assets/svgs/lock.svg";
import SearchX from "@/assets/svgs/search-x.svg";
import { router } from "expo-router";
import Loader from "@/components/ui/Loader";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Trophy from "@/assets/svgs/trophy.svg";

export default function Explore() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const { user, loading } = useUser();
  const { t } = useTranslation();

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id,
  });

  const progressList = progressData?.progress || [];
  const unlockedQuizzes = progressData?.unlockedQuizzes || [];

  const debouncedSetSearch = useMemo(
    () => debounce((text: string) => setQuery(text), 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const handleChangeText = (text: string) => {
    setInput(text);
    debouncedSetSearch(text);
  };

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["searchQuizzes", query],
    queryFn: () => searchQuizzes(query),
  });

  if (!user || progressLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.dark.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <Animated.View
        entering={FadeInDown.delay(0).springify()}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t("explore") || "Explore"}</Text>
        <View style={styles.searchBarWrapper}>
          <TextInput
            value={input}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor={Colors.dark.primary}
            onChangeText={handleChangeText}
            style={[styles.input, focused && styles.inputFocused]}
            placeholder={t("search") + "..."}
            placeholderTextColor={Colors.dark.text_muted}
            autoCorrect={false}
            returnKeyType="search"
          />
          <View style={styles.searchIconWrapper}>
            <Search
              width={20}
              height={20}
              color={focused ? Colors.dark.primary : Colors.dark.text_muted}
            />
          </View>
          {input.length > 0 && (
            <Pressable
              onPress={() => {
                setInput("");
                setQuery("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.clearButton}
            >
              <Close width={20} height={20} color={Colors.dark.text_muted} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loaderWrapper}>
            <Loader width={50} height={50} />
          </View>
        ) : quizzes?.length === 0 ? (
          <Animated.View
            entering={FadeIn.delay(200).springify()}
            style={styles.emptyState}
          >
            <View style={styles.emptyIconWrapper}>
              <SearchX
                width={60}
                height={60}
                color={Colors.dark.text_muted}
                strokeWidth={1.3}
              />
            </View>
            <Text style={styles.emptyText}>
              {t("noQuizzesFound") || "No quizzes found"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setInput("");
                setQuery("");
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <FlatList
            data={quizzes}
            keyExtractor={(item) => item._id}
            scrollsToTop={true}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <QuizResultCard
                item={item}
                index={index}
                progressList={progressList}
                unlockedQuizzes={unlockedQuizzes}
                t={t}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

// Sub-component: Quiz Result Card
const QuizResultCard = ({
  item,
  index,
  progressList,
  unlockedQuizzes,
  t,
}: any) => {
  const progressEntry = progressList.find(
    (p: any) => p.quizId._id === item._id
  );
  const progressCount = progressEntry?.questionsCompleted || 0;
  const rewardsCount = progressEntry?.rewardsTotal || 0;

  const progressPercent =
    item.questionsTotal > 0
      ? Math.floor((progressCount / item.questionsTotal) * 100)
      : 0;

  const isUnlocked = unlockedQuizzes.some(
    (q: any) => q.quizId._id === item._id || q.quizId === item._id
  );

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).springify()}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({
              pathname: "/(quizzes)/quiz",
              params: { id: item._id },
            });
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[styles.card, !isUnlocked && styles.cardLocked]}
        >
          <LinearGradient
            colors={
              isUnlocked
                ? ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]
                : ["rgba(0,0,0,0.2)", "rgba(0,0,0,0.1)"]
            }
            style={styles.cardGradient}
          />

          {/* Logo Section */}
          <View style={styles.cardLeft}>
            <View style={styles.logoContainer}>
              <QuizLogo name={item.logoFile} />
              {!isUnlocked && (
                <View style={styles.lockOverlay}>
                  <Lock width={24} height={24} color={Colors.dark.text} />
                </View>
              )}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.cardRight}>
            <Text
              style={[styles.quizTitle, isSmallPhone && { fontSize: 15 }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>{t("progress")}</Text>
                  <Text style={styles.statPercent}>{progressPercent}%</Text>
                </View>
                <View style={styles.progressBarWrapper}>
                  <ProgressBar
                    color={Colors.dark.text}
                    progress={progressCount}
                    total={item.questionsTotal}
                    height={4}
                  />
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>{t("rewards")}</Text>
                  <Text style={styles.statPercent}>
                    {rewardsCount}/{item.rewardsTotal}
                  </Text>
                </View>
                <View style={styles.progressBarWrapper}>
                  <ProgressBar
                    color={Colors.dark.secondary}
                    progress={rewardsCount}
                    total={item.rewardsTotal}
                    height={4}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.disclaimer} numberOfLines={1}>
              Fans made quiz • {item.company}
            </Text>
          </View>

          {/* Chevron */}
          <View style={styles.chevronWrapper}>
            <Feather
              name="chevron-right"
              size={20}
              color={Colors.dark.border}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.bg_dark,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    letterSpacing: -0.5,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingLeft: 48,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  inputFocused: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(102, 126, 234, 0.05)",
  },
  searchIconWrapper: {
    position: "absolute",
    left: 16,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  // Card
  card: {
    flexDirection: "row",
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
    overflow: "hidden",
  },
  cardLocked: {
    opacity: 0.7,
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardLeft: {
    marginRight: 12,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.dark.bg,
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardRight: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  quizTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
  },
  statsRow: {
    gap: 6,
  },
  statItem: {
    gap: 4,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.dark.text_muted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statPercent: {
    fontSize: 11,
    color: Colors.dark.text,
    fontWeight: "700",
  },
  progressBarWrapper: {
    height: 4,
    backgroundColor: Colors.dark.border_muted,
    borderRadius: 2,
    overflow: "hidden",
  },
  disclaimer: {
    fontSize: 10,
    color: Colors.dark.text_muted,
    fontFamily: ITALIC_FONT,
    marginTop: 2,
  },
  chevronWrapper: {
    justifyContent: "center",
    paddingLeft: 4,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.bg_light,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border_muted,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.text_muted,
    textAlign: "center",
    fontFamily: REGULAR_FONT,
    lineHeight: 22,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
