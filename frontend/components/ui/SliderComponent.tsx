import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";
import * as Haptics from "expo-haptics";
import { isSmallPhone } from "@/constants/Dimensions";

const SliderComponent = ({
  value,
  setValue,
  min,
  max,
  step,
}: {
  value: number;
  setValue: any;
  min: number;
  max: number;
  step: number;
}) => {
  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    Haptics.selectionAsync();
  };

  return (
    <View style={{ width: "100%", alignItems: "center", gap: 50 }}>
      <Slider
        style={{ width: "80%", height: 40 }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value === -1 ? min : value}
        minimumTrackTintColor={Colors.dark.text}
        maximumTrackTintColor={Colors.dark.border}
        thumbTintColor={Colors.dark.text}
        onValueChange={handleValueChange}
      />
      <Text style={[styles.text, isSmallPhone && { fontSize: 35 }]}>
        {value === -1 ? min : value}
      </Text>
    </View>
  );
};

export default SliderComponent;

const styles = StyleSheet.create({
  text: {
    fontFamily: REGULAR_FONT,
    color: Colors.dark.text,
    fontSize: 40,
  },
});
