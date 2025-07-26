import { useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { WIDTH, HEIGHT, myHeight, myWidth } from "@/constants/Dimensions";
import { defaultStyles } from "@/constants/Styles";
import CircularProgress from "@/components/ui/CircularProgress";
import { LineDashed } from "@/components/ui/Line";
import * as Haptics from "expo-haptics";
import QuizModal from "./animatinos/QuizModal";
import RotatingGradient from "./ui/gradients/GlowingView";
import { useQuery } from "@tanstack/react-query";
import { fetchUnlockedQuizzes } from "@/services/api";
import { QuizLogo } from "./ui/QuizLogo";
import { useUser } from "@/context/userContext";

const ITEM_WIDTH = HEIGHT * (150 / myHeight);
const ITEM_SPACING = (WIDTH - ITEM_WIDTH) / 2;

export default function HomePageCards() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useUser();

  const { data, error, isLoading } = useQuery({
    queryKey: ["quizzes", user?._id],
    queryFn: ({ queryKey }) => fetchUnlockedQuizzes(queryKey[1]),
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator />
      </View>
    );
  }

  // console.log(data[0]);
  const quiz = data[currentIndex]?.quizId;

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ color: Colors.dark.text }}>Error</Text>
      </View>
    );
  }
  return (
    <View style={[defaultStyles.container, {}]}>
      <Animated.FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item._id}
        horizontal
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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                  index === currentIndex
                    ? setIsModalVisible((p) => !p)
                    : flatListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                      });
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
            fontSize: 25,
            marginVertical: 10,
            letterSpacing: -1,
          },
        ]}
      >
        {data[currentIndex].title}
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
        This is a fan-made quiz, not officially connected to {quiz.company} or
        the creators of “{quiz.title}”. The game title is a trademark of{" "}
        {quiz.company}.
      </Text>
      <View
        style={[
          defaultStyles.containerRow,
          {
            width: "100%",
            justifyContent: "space-evenly",
            height: HEIGHT * (115 / myHeight),
          },
        ]}
      >
        <View
          style={[
            defaultStyles.containerBackground,
            {
              height: "100%",
              paddingVertical: HEIGHT * (10 / myHeight),
              width: "30%",
              justifyContent: "flex-start",
              gap: HEIGHT * (10 / myHeight),
              borderRadius: 25,
            },
          ]}
        >
          <Text style={[styles.txt, { fontSize: WIDTH * (14 / myWidth) }]}>
            Progress
          </Text>
          <LineDashed />
          <CircularProgress
            progress={0.4 * 100}
            size={HEIGHT * (50 / myHeight)}
            strokeWidth={3}
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
            Rewards
          </Text>
          <LineDashed />
          <View
            style={{
              width: "80%",
              backgroundColor: Colors.dark.border,
              borderRadius: 6,
              marginTop: HEIGHT * (10 / myHeight),
            }}
          >
            <View
              style={{
                width: `${(quiz.rewardsTotal / quiz.total) * 100}%`,
                height: 4,
                backgroundColor: "#FFB11F",
                borderRadius: 6,
              }}
            />
          </View>
          <Text style={[styles.txt_muted, { fontSize: 12 }]}>
            {20} / {quiz.rewardsTotal}
          </Text>
        </View>
      </View>
      <QuizModal
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
        quiz={quiz}
      />
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
    fontFamily: "Inter-Regular ",
    fontWeight: 600,
  },
  txt_muted: {
    color: Colors.dark.text_muted,
    fontSize: 15,
    fontFamily: "Inter-Regular",
  },
});
