import { Colors } from "@/constants/Colors";
import { View, Text, ScrollView } from "react-native";
import { useRef, useEffect } from "react";
import Carousel from "@/components/animatinos/Carousel";

export default function Events() {
  return (
    <View style={{ alignItems: "center" }}>
      <Carousel />
    </View>
  );
}
