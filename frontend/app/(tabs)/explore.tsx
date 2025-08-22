import { Colors } from "@/constants/Colors";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Search from "@/assets/svgs/search.svg";
import { REGULAR_FONT } from "@/constants/Styles";

export default function Explore() {
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
            style={{
              width: "100%",
              backgroundColor: Colors.dark.bg_light,
              borderRadius: 50,
              padding: 15,
              paddingLeft: 50,
              color: Colors.dark.text,
              fontFamily: REGULAR_FONT,
            }}
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
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({});
