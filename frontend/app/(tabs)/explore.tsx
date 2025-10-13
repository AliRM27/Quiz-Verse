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
import { ITALIC_FONT, REGULAR_FONT } from "@/constants/Styles";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchQuizzes } from "@/services/api";
import { debounce } from "lodash";
import QuizLogo from "@/components/ui/QuizLogo";
import { useUser } from "@/context/userContext";
import { myWidth, WIDTH } from "@/constants/Dimensions";
import Close from "@/assets/svgs/close.svg";
import Add from "@/assets/svgs/add.svg";
import { updateUserProgress } from "@/services/api";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/animatinos/progressBar";
import QuizModal from "@/components/animatinos/QuizModal";
import Lock from "@/assets/svgs/lock.svg";
import Binoculars from "@/assets/svgs/binoculars.svg";
import SearchX from "@/assets/svgs/search-x.svg";

export default function Explore() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const { user, loading, refreshUser } = useUser();
  const [loadingUpdate, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { t } = useTranslation();

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

  const [currQuiz, setCurrQuiz] = useState(quizzes ? quizzes[0] : null);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ width: "80%" }}>
        <TextInput
          value={input}
          onFocus={() => setFocused(true)}
          selectionColor={Colors.dark.text}
          onChangeText={handleChangeText}
          style={[styles.input, focused && { borderColor: Colors.dark.text }]}
          placeholder={" " + t("search")}
          placeholderTextColor={Colors.dark.text_muted}
          autoCorrect={false}
          returnKeyType="search"
        />
        <Search
          width={25}
          height={25}
          style={{ position: "absolute", top: 12, left: 15 }}
          color={Colors.dark.text_muted}
          stroke={"black"}
        />
        <Pressable
          onPress={() => {
            setInput("");
            setQuery("");
            setFocused(false);
            setTimeout(() => Keyboard.dismiss(), 50);
          }}
          style={[
            { position: "absolute", top: 13, right: 15 },
            !focused && { display: "none" },
          ]}
        >
          <Close width={25} height={25} color={Colors.dark.text_muted} />
        </Pressable>
      </View>

      {(isLoading || loading) && <></>}

      {!isLoading && !loading && quizzes?.length === 0 && (
        <View
          style={{
            alignItems: "center",
            gap: 20,
            justifyContent: "center",
            flex: 1,
          }}
        >
          <SearchX
            width={60}
            height={60}
            color={Colors.dark.text_muted}
            strokeWidth={1.3}
          />
          <Text
            style={[styles.txt_muted, { fontSize: 16, textAlign: "center" }]}
          >
            No quizzes found {"\n"} try again
          </Text>
        </View>
      )}

      <FlatList
        data={quizzes}
        keyExtractor={(item) => item._id}
        style={{ width: "100%", paddingHorizontal: 10 }}
        contentContainerStyle={{ gap: 20 }}
        renderItem={({ item }) => {
          const progress =
            user?.progress.find((p) => p.quizId._id === item._id)
              ?.questionsCompleted || 0;
          const rewards =
            user?.progress.find((p) => p.quizId._id === item._id)
              ?.rewardsTotal || 0;
          const progressPercent =
            progress !== 0
              ? Math.floor((progress / item.questionsTotal) * 100)
              : 0;
          const rewardPercent = item.rewardsTotal
            ? Math.floor((rewards / item.rewardsTotal) * 100)
            : 0;

          return (
            <View style={styles.card}>
              {!user.unlockedQuizzes.some(
                (q) => q.quizId._id === item._id || q.quizId === item._id
              ) && (
                <View style={{ position: "absolute", top: 10, right: 10 }}>
                  <Lock color={Colors.dark.text_muted} />
                </View>
              )}
              {/* Left: Logo */}
              <TouchableOpacity
                onPress={() => {
                  setCurrQuiz(item);
                  setModalVisible(true);
                }}
                activeOpacity={0.7}
                style={styles.logoWrapper}
              >
                <QuizLogo name={item.logoFile} />
              </TouchableOpacity>

              {/* Right: Info */}
              <View style={styles.infoWrapper}>
                <Text style={[styles.txt, styles.title]} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.bottomSection}>
                  <View style={styles.progressWrapper}>
                    <Text style={[styles.txt, styles.barLabel]}>
                      {t("progress")}
                    </Text>
                    <View style={styles.barBackground}>
                      <ProgressBar
                        color={Colors.dark.text}
                        progress={progress}
                        total={item.questionsTotal}
                        height={3}
                      />
                    </View>
                    <Text
                      style={[
                        styles.txt_muted,
                        styles.barText,
                        { fontSize: 10 },
                      ]}
                    >
                      {progressPercent}%
                    </Text>

                    <Text style={[styles.txt, styles.barLabel]}>
                      {t("rewards")}
                    </Text>
                    <View style={styles.barBackground}>
                      <ProgressBar
                        color={Colors.dark.secondary}
                        progress={rewards}
                        total={item.rewardsTotal}
                        height={3}
                      />
                    </View>
                    <Text
                      style={[
                        styles.txt_muted,
                        styles.barText,
                        { fontSize: 10 },
                      ]}
                    >
                      {rewards}/{item.rewardsTotal}
                    </Text>
                  </View>

                  <Text style={[styles.txt_muted, styles.disclaimer]}>
                    This is a fan-made quiz, not officially connected to{" "}
                    {item.company} or the creators of “{item.title}”.
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />
      {currQuiz && (
        <QuizModal
          quiz={currQuiz}
          isVisible={modalVisible}
          setIsVisible={setModalVisible}
          currentProgress={user.progress.find(
            (p) => p.quizId._id === currQuiz._id
          )}
          isUnlocked={user.unlockedQuizzes.some(
            (q) => q.quizId._id === currQuiz._id
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    height: "100%",
    width: "100%",
    gap: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.dark.bg_light,
    borderRadius: 50,
    padding: 15,
    paddingLeft: 50,
    color: Colors.dark.text,
    fontFamily: REGULAR_FONT,
    borderWidth: 1,
    borderColor: Colors.dark.bg_dark,
  },
  txt: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
  },
  txt_muted: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text_muted,
  },
  card: {
    flexDirection: "row",
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.dark.bg_light,
    borderRadius: 10,
    backgroundColor: Colors.dark.bg,
    width: "100%",
    height: 150,
    alignItems: "center",
  },
  logoWrapper: {
    width: WIDTH * (113 / myWidth),
    height: WIDTH * (113 / myWidth),
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 0.7,
    borderColor: Colors.dark.border,
  },
  infoWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressWrapper: {
    flex: 1,
    marginRight: 10,
  },
  barLabel: {
    fontSize: 13,
  },
  barBackground: {
    height: 3,
    backgroundColor: Colors.dark.border_muted,
    borderRadius: 10,
    marginVertical: 2,
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.dark.text,
    borderRadius: 10,
  },
  barText: {
    fontSize: 12,
    marginBottom: 6,
  },
  disclaimer: {
    fontSize: 9,
    flexShrink: 1,
    width: WIDTH * (90 / myWidth),
  },
});
