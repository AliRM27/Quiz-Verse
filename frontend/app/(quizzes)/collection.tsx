import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { myWidth, WIDTH } from "@/constants/Dimensions";
import { useUser } from "@/context/userContext";
import { router } from "expo-router";
import QuizLogo from "@/components/ui/QuizLogo";
import { QuizType } from "@/types";
import { useTranslation } from "react-i18next";
import ArrBack from "@/components/ui/ArrBack";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProgress } from "@/services/api";

const Collection = () => {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: fetchUserProgress,
    enabled: !!user?._id,
  });

  if (loading || !user || isLoading) {
    return null;
  }

  const unlockedQuizzes = data?.unlockedQuizzes || [];

  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg_dark,
        height: "100%",
        paddingHorizontal: 15,
        alignItems: "center",
      }}
    >
      <ArrBack />
      <Text
        style={[
          styles.txt,
          { fontSize: 25, marginBottom: 40, fontWeight: 600 },
        ]}
      >
        {t("yourQuizzes")}
      </Text>
      <FlatList
        numColumns={2}
        horizontal={false}
        data={unlockedQuizzes}
        contentContainerStyle={{ alignItems: "center" }}
        keyExtractor={(item) => item._id || item.quizId._id}
        renderItem={({ item }: { item: QuizType }) => (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/(quizzes)/quiz",
                params: {
                  id: item.quizId._id,
                },
              });
            }}
            activeOpacity={0.7}
            style={{
              width: WIDTH * (132 / myWidth), // 150
              height: WIDTH * (132 / myWidth), // 150
              borderRadius: 10,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: Colors.dark.border,
              margin: 10,
            }}
          >
            <QuizLogo name={item.quizId.logoFile} />
          </TouchableOpacity>
        )}

        // ListEmptyComponent={() => (
        //   <Text style={styles.txt}>Unlock Quizzes</Text>
        // )}
      />
    </View>
  );
};

export default Collection;

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
