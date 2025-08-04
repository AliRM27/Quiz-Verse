// QuizLogo.tsx
import { useEffect, useState } from "react";
import { SvgXml } from "react-native-svg";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";
import { svgCache } from "@/utils/svgCache";

export const QuizLogo = ({ name }: { name: string }) => {
  const [svgXmlData, setSvgXmlData] = useState<string | null>(
    svgCache[name] ?? null
  );

  useEffect(() => {
    if (svgCache[name]) return; // Already cached

    const fetchSvg = async () => {
      try {
        const response = await fetch(
          `http://192.168.68.104:5555/logos/${name}`
        );
        const svgText = await response.text();
        svgCache[name] = svgText;
        setSvgXmlData(svgText);
      } catch (err) {
        console.error("Failed to fetch SVG:", err);
      }
    };

    fetchSvg();
  }, [name]);

  if (!svgXmlData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={Colors.dark.text} />
      </View>
    );
  }

  return <SvgXml xml={svgXmlData} width="100%" height="100%" />;
};
