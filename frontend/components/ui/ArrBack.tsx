import { View, Text, Pressable } from "react-native";
import Arr from "@/assets/svgs/backArr.svg";
import { router } from "expo-router";

const ArrBack = () => {
  return (
    <Pressable
      style={{
        position: "absolute",
        left: 20,
        padding: 5,
      }}
      onPress={() => router.back()}
    >
      <Arr width={25} height={25} />
    </Pressable>
  );
};

export default ArrBack;
