import { View, Text, Pressable } from "react-native";
import Arr from "@/assets/svgs/backArr.svg";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ArrBackProps = {
  onPress?: () => void;
};

const ArrBack = ({ onPress }: ArrBackProps) => {
  const insets = useSafeAreaInsets();
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.back();
  };

  return (
    <Pressable
      style={{
        position: "absolute",
        left: 20,
        top: insets.top + 10,
        padding: 5,
        zIndex: 1,
      }}
      onPress={handlePress}
    >
      <Arr width={25} height={25} />
    </Pressable>
  );
};

export default ArrBack;
