import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { REGULAR_FONT } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { layout, myWidth, WIDTH } from "@/constants/Dimensions";
import { useUser } from "@/context/userContext";
import { router } from "expo-router";
import ArrBack from "@/assets/svgs/backArr.svg";
import QuizLogo from "@/components/ui/QuizLogo";
import { QuizType } from "@/types";
import QuizModal from "@/components/animatinos/QuizModal";
import { useState } from "react";

const Collection = () => {
  const { user, loading } = useUser();
  const [currQuiz, setCurrQuiz] = useState(user?.unlockedQuizzes[0]?.quizId);
  const [visible, setVisible] = useState(false);
  if (loading || !user) {
    return;
  }
  return (
    <View
      style={{
        backgroundColor: Colors.dark.bg_dark,
        height: "100%",
        paddingVertical: layout.paddingTop,
        paddingHorizontal: 15,
        alignItems: "center",
      }}
    >
      <Pressable
        style={{ alignSelf: "flex-start" }}
        onPress={() => router.back()}
      >
        <ArrBack />
      </Pressable>
      <Text style={[styles.txt, { fontSize: 25, marginBottom: 40 }]}>
        Your Quizzes
      </Text>
      <FlatList
        numColumns={2}
        horizontal={false}
        data={user.unlockedQuizzes}
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center" }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }: { item: QuizType }) => (
          <TouchableOpacity
            onPress={() => {
              setCurrQuiz(item.quizId);
              setVisible(true);
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
      {currQuiz && (
        <QuizModal
          quiz={currQuiz}
          isVisible={visible}
          setIsVisible={setVisible}
          currentProgress={user?.progress.find(
            (quizObj) => quizObj.quizId._id === currQuiz._id
          )}
        />
      )}
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
