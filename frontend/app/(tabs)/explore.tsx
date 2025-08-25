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
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchQuizzes } from "@/services/api";
import { debounce } from "lodash";

export default function Explore() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState<string>("");

  const debouncedSetSearch = useMemo(
    () => debounce((text: string) => setQuery(text), 1000),
    []
  );

  const {
    data: quizzes,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["searchQuizzes", query],
    queryFn: () => searchQuizzes(query),
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.dark.text} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          alignItems: "center",
          height: "100%",
        }}
      >
        <View style={{ width: "80%" }}>
          <TextInput
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor={Colors.dark.text}
            onChangeText={debouncedSetSearch}
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
        {isLoading && <ActivityIndicator style={{ marginTop: 10 }} />}

        {!isLoading && quizzes?.length === 0 && (
          <Text style={styles.txt}>No quizzes found.</Text>
        )}

        <FlatList
          data={quizzes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View
              style={{
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={[{ fontSize: 16, fontWeight: "500" }, styles.txt]}>
                {item.title}
              </Text>
            </View>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  txt: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
  },
});
