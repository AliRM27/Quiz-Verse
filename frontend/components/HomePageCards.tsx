import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { WIDTH, HEIGHT, myHeight, myWidth } from "@/constants/Dimensions";
import { defaultStyles } from "@/constants/Styles";
import CircularProgress from "@/components/ui/CircularProgress";
import { LineDashed } from "@/components/ui/Line";
import * as Haptics from "expo-haptics";
import RotatingGradient from "./ui/gradients/GlowingView";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProgress } from "@/services/api";
import QuizLogo from "@/components/ui/QuizLogo";
import { useUser } from "@/context/userContext";
import { REGULAR_FONT } from "@/constants/Styles";
import Info from "./ui/Info";
import { useTranslation } from "react-i18next";
import ProgressBar from "./animatinos/progressBar";
import { router } from "expo-router";
import Loader from "./ui/Loader";
import { moderateScale } from "react-native-size-matters";
import { isSmallPhone } from "@/constants/Dimensions";

const ITEM_WIDTH = HEIGHT * (150 / myHeight);
const ITEM_SPACING = (WIDTH - ITEM_WIDTH) / 2;

export default function HomePageCards() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const { user, loading, lastIndexCard, setLastIndexRef } = useUser();
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollToCard = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }, []);

  const { t } = useTranslation();

  const {
    data: progressData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id && !loading,
  });

  const { width, height } = useWindowDimensions();

  const unlockedQuizzes = progressData?.unlockedQuizzes || [];
  const progressList = progressData?.progress || [];
  const quiz = unlockedQuizzes[currentIndex]?.quizId;

  const currentProgress = useMemo(() => {
    if (!quiz?._id) return undefined;
    return progressList.find((quizObj: any) => quizObj.quizId._id === quiz._id);
  }, [progressList, quiz]);

  useEffect(() => {
    // Scroll back to where user left off (if > 0)
    if (flatListRef.current && lastIndexCard > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: lastIndexCard,
          animated: false,
        });
      }, 0);
      setCurrentIndex(lastIndexCard); // sync local state
    }
  }, []);
  if (loading || isLoading) {
    return (
      <View
        style={{
          height: "82%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ color: Colors.dark.text }}>Error</Text>
      </View>
    );
  }

  if (!unlockedQuizzes || unlockedQuizzes.length === 0) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: Colors.dark.text_muted }}>
          No quizzes unlocked yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={defaultStyles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={unlockedQuizzes}
        keyExtractor={(item) => item._id || item.quizId._id}
        horizontal
        maxToRenderPerBatch={5}
        windowSize={5}
        ListEmptyComponent={() => (
          <Text style={{ color: Colors.dark.text_muted, marginTop: 20 }}>
            No quizzes unlocked yet.
          </Text>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: ITEM_SPACING,
        }}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        bounces={true}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event: any) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / ITEM_WIDTH
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }: any) => {
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
                style={{ borderRadius: 10, overflow: "hidden" }}
                onPress={() => {
                  if (index === currentIndex) {
                    setLastIndexRef(index);
                    router.push({
                      pathname: "/(quizzes)/quiz",
                      params: {
                        id: quiz._id,
                      },
                    });
                    return;
                  }
                  Haptics.selectionAsync();
                  setLastIndexRef(index);
                  scrollToCard(index);
                }}
              >
                <RotatingGradient isOn={index === currentIndex}>
                  <View style={[styles.logoContainer]}>
                    <QuizLogo name={item.quizId.logoFile} />
                  </View>
                </RotatingGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
      <Text
        style={[
          styles.txt,
          {
            fontSize: 25, // scales but caps at 26
            marginVertical: Math.max(height * 0.01, 6),
            letterSpacing: -1,
            textAlign: "center",
            paddingHorizontal: 8,
          },
          isSmallPhone && { fontSize: 22 },
        ]}
      >
        {quiz.title}
      </Text>
      <Text
        style={[
          styles.txt_muted,
          {
            textAlign: "center",
            fontSize: 10,
            width: "70%",
            height: "20%",
          },
        ]}
      >
        <Info company={quiz.company} title={quiz.title} />
      </Text>
      <View
        style={[
          defaultStyles.containerRow,
          {
            width: "100%",
            justifyContent: "space-evenly",
            minHeight: 120,
          },
          isSmallPhone && { minHeight: 110 },
        ]}
      >
        <View
          style={[
            defaultStyles.containerBackground,
            {
              height: "100%",
              paddingVertical: 10,
              minWidth: "40%",
              justifyContent: "flex-start",
              gap: HEIGHT * (10 / myHeight),
              borderRadius: 25,
            },
          ]}
        >
          <Text
            style={[
              styles.txt,
              isSmallPhone ? { fontSize: 13 } : { fontSize: 15 },
            ]}
          >
            {t("progress")}
          </Text>
          <LineDashed />
          <CircularProgress
            progress={
              quiz.questionsTotal > 0
                ? Math.floor(
                    (currentProgress?.questionsCompleted /
                      quiz.questionsTotal) *
                      100
                  )
                : 0
            }
            size={50}
            strokeWidth={3}
            fontSize={12}
          />
        </View>
        <View
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
            {t("rewards")}
          </Text>
          <LineDashed />
          <View
            style={{
              width: "80%",
              backgroundColor: Colors.dark.border_muted,
              borderRadius: 6,
              marginTop: HEIGHT * (10 / myHeight),
            }}
          >
            <ProgressBar
              color="#FFB11F"
              total={quiz.rewardsTotal}
              progress={currentProgress?.rewardsTotal}
              height={3}
            />
          </View>
          <Text style={[styles.txt, { fontSize: 12 }]}>
            {currentProgress?.rewardsTotal} / {quiz.rewardsTotal}
          </Text>
        </View>
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
    width: HEIGHT * (150 / myHeight),
    height: HEIGHT * (150 / myHeight),
    overflow: "hidden",
    borderRadius: 10,
  },
  txt: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: REGULAR_FONT + " ",
    fontWeight: 600,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 15,
    fontFamily: REGULAR_FONT,
  },
});
