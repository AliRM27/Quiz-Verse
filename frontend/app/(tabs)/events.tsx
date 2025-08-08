import { Colors } from "@/constants/Colors";
import { View, Text, ScrollView } from "react-native";
import { useRef, useEffect } from "react";
import SlideDownModal from "@/components/ui/Slider";

export default function Events() {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: Colors.dark.text }}>Events</Text>
    </View>
  );
}
