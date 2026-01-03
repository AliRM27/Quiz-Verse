import { Image, View } from "react-native";
import { memo, useState } from "react";
import { Colors } from "@/constants/Colors";
import { API_URL } from "@/services/config";

const QuizLogo = memo(({ name, style }: { name: string; style?: any }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[{ flex: 1, borderRadius: 10, overflow: "hidden" }, style]}>
      {!loaded && (
        <View
          style={[
            {
              backgroundColor: Colors.dark.bg_light,
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: Colors.dark.border,
              borderRadius: 10,
            },
            style && { borderRadius: style.borderRadius },
          ]}
        ></View>
      )}
      <Image
        source={{ uri: `${API_URL}logos/${name}.jpg` }}
        style={{ width: "100%", height: "100%" }}
        onLoad={() => setLoaded(true)}
        resizeMode="cover"
      />
    </View>
  );
});

export default QuizLogo;
