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
import { REGULAR_FONT } from "@/constants/Styles";
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

export default function Explore() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const { user, loading, refreshUser } = useUser();
  const [loadingUpdate, setLoading] = useState(false);

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

  const handleAddQuiz = async (quizId: string) => {
    setLoading(true);
    try {
      await updateUserProgress({
        quizId,
        difficulty: "Easy",
        updates: { questions: 0, rewards: 0, answered: [] },
      });
      await refreshUser();
    } catch (error) {
      console.error("Error adding quiz:", error);
    }
    setLoading(false);
  };

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
          onBlur={() => setFocused(false)}
          selectionColor={Colors.dark.text}
          onChangeText={handleChangeText}
          style={[styles.input, focused && { borderColor: Colors.dark.text }]}
          placeholder="Write something"
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
            setFocused(false);
            setInput("");
            setQuery("");
            Keyboard.dismiss();
          }}
          style={[
            { position: "absolute", top: 12, right: 15 },
            !focused && { display: "none" },
          ]}
        >
          <Close width={25} height={25} color={Colors.dark.text_muted} />
        </Pressable>
      </View>

      {(isLoading || loading) && <></>}

      {!isLoading && !loading && quizzes?.length === 0 && (
        <Text style={styles.txt}>No quizzes found.</Text>
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
          const progressPercent = item.questionsTotal
            ? ((progress / item.questionsTotal) * 100).toFixed(0)
            : 0;
          const rewardPercent = item.rewardsTotal
            ? ((rewards / item.rewardsTotal) * 100).toFixed(0)
            : 0;

          return (
            <View style={styles.card}>
              {!user.unlockedQuizzes.some(
                (q) => q.quizId._id === item._id || q.quizId === item._id
              ) && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAddQuiz(item._id)}
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    backgroundColor: Colors.dark.bg_light,
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: Colors.dark.border,
                    zIndex: 2,
                  }}
                >
                  {loadingUpdate ? (
                    <ActivityIndicator color={Colors.dark.text_muted} />
                  ) : (
                    <Add
                      stroke={Colors.dark.text_muted}
                      width={20}
                      height={20}
                    />
                  )}
                </TouchableOpacity>
              )}
              {/* Left: Logo */}
              <View style={styles.logoWrapper}>
                <QuizLogo name={item.logoFile} />
              </View>

              {/* Right: Info */}
              <View style={styles.infoWrapper}>
                <Text style={[styles.txt, styles.title]} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.bottomSection}>
                  <View style={styles.progressWrapper}>
                    <Text style={[styles.txt, styles.barLabel]}>Progress</Text>
                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Number(progressPercent)}%` },
                        ]}
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

                    <Text style={[styles.txt, styles.barLabel]}>Rewards</Text>
                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: Colors.dark.secondary,
                            width: `${Number(rewardPercent)}%`,
                          },
                        ]}
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
