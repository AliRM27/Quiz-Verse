import { Colors } from "@/constants/Colors";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  FlatList,
} from "react-native";
import Search from "@/assets/svgs/search.svg";
import { REGULAR_FONT } from "@/constants/Styles";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchQuizzes } from "@/services/api";
import { debounce } from "lodash";
import QuizLogo from "@/components/ui/QuizLogo";
import { useUser } from "@/context/userContext";
import Info from "@/components/ui/Info";

export default function Explore() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const { user, loading } = useUser();

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
    setInput(text); // immediate UI update
    debouncedSetSearch(text); // debounce for search
  };

  const {
    data: quizzes,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["searchQuizzes", query],
    queryFn: () => searchQuizzes(query),
  });
  // --- IGNORE ---
  return (
    <View
      style={{
        alignItems: "center",
        height: "100%",
        width: "100%",
        gap: 20,
      }}
    >
      <View style={{ width: "80%" }}>
        <TextInput
          value={input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={Colors.dark.text}
          onChangeText={handleChangeText}
          style={[
            {
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
            focused && {
              borderColor: Colors.dark.text,
            },
          ]}
          placeholder="Write something"
          placeholderTextColor={Colors.dark.text_muted}
        />
        <Search
          width={25}
          height={25}
          style={{ position: "absolute", top: 12, left: 13 }}
          color={"white"}
          stroke={"black"}
        />
      </View>
      {(isLoading || loading) && (
        <ActivityIndicator style={{ marginTop: 10 }} />
      )}

      {!isLoading && !loading && quizzes?.length === 0 && (
        <Text style={styles.txt}>No quizzes found.</Text>
      )}

      <FlatList
        data={quizzes}
        keyExtractor={(item) => item._id}
        style={{
          width: "100%",
          paddingHorizontal: 10,
        }}
        contentContainerStyle={{ gap: 20 }}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: Colors.dark.border_muted,
                borderRadius: 10,
                flexDirection: "row",
                height: 150,
                width: "100%",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  width: 125,
                  height: 125,
                  marginRight: 10,
                }}
              >
                <QuizLogo name={item.logoFile} />
              </View>
              <View style={{ gap: 10 }}>
                <Text
                  style={[{ fontSize: 18, fontWeight: "bold" }, styles.txt]}
                >
                  {item.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View style={{ width: 120 }}>
                    <View>
                      <Text style={[styles.txt, { fontSize: 13 }]}>
                        Progress
                      </Text>
                      <View
                        style={{
                          width: "100%",
                          backgroundColor: Colors.dark.border_muted,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            width: `${user?.progress.find((p) => p.quizId._id === item._id)?.questionsCompleted ? (user?.progress.find((p) => p.quizId._id === item._id).questionsCompleted / item.questionsTotal) * 100 : 0}%`,
                            backgroundColor: Colors.dark.text,
                            borderRadius: 10,
                            height: 4,
                          }}
                        />
                      </View>
                      <Text style={[styles.txt_muted, { fontSize: 12 }]}>
                        {user?.progress.find((p) => p.quizId._id === item._id)
                          ?.questionsCompleted
                          ? `${(user?.progress.find((p) => p.quizId._id === item._id).questionsCompleted / item.questionsTotal) * 100}`
                          : `0`}
                        %
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.txt, { fontSize: 13 }]}>
                        Rewards
                      </Text>
                      <View
                        style={{
                          width: "100%",
                          backgroundColor: Colors.dark.border_muted,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            width: `${user?.progress.find((p) => p.quizId._id === item._id)?.rewardsTotal ? (user?.progress.find((p) => p.quizId._id === item._id).rewardsTotal / item.rewardsTotal) * 100 : 0}%`,
                            backgroundColor: Colors.dark.secondary,
                            borderRadius: 10,
                            height: 4,
                          }}
                        />
                      </View>
                      <Text style={[styles.txt_muted, { fontSize: 12 }]}>
                        {user?.progress.find((p) => p.quizId._id === item._id)
                          ?.rewardsTotal
                          ? `${(user?.progress.find((p) => p.quizId._id === item._id).rewardsTotal / item.rewardsTotal) * 100}`
                          : `0`}
                        %
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.txt_muted, { fontSize: 8, width: 120 }]}>
                    This is a fan-made quiz, not officially connected to{" "}
                    {item.company} or the creators of “{item.title}”. The game
                    title is a trademark of {item.company}.
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
  txt: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
  },
  txt_muted: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text_muted,
  },
});
