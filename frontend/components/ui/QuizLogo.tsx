// QuizLogo.tsx
import { memo, useEffect, useState } from "react";
import { SvgXml } from "react-native-svg";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";
import { svgCache } from "@/utils/svgCache";
import { API_URL } from "@/services/config";

// Optional: memoized loader to prevent re-renders
const Loader = () => (
  <View
    style={{
      backgroundColor: Colors.dark.bg_light,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.dark.border,
      borderRadius: 10,
    }}
  >
    {/* <ActivityIndicator color={Colors.dark.text} /> */}
  </View>
);

const QuizLogo = ({ name }: { name: string }) => {
  const [svgXmlData, setSvgXmlData] = useState<string | null>(
    svgCache[name] ?? null
  );

  useEffect(() => {
    let isMounted = true;

    const loadSvg = async () => {
      if (svgCache[name]) {
        setSvgXmlData(svgCache[name]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}logos/${name}`);
        const svgText = await res.text();

        if (isMounted) {
          svgCache[name] = svgText;
          setSvgXmlData(svgText);
        }
      } catch (err) {
        console.error(`Error fetching SVG (${name}):`, err);
      }
    };

    loadSvg();

    return () => {
      isMounted = false;
    };
  }, [name]);

  if (!svgXmlData) return <Loader />;

  return <SvgXml xml={svgXmlData} width="100%" height="100%" />;
};

export default memo(QuizLogo);
