// QuizLogo.tsx
import { useEffect, useState } from "react";
import { SvgXml } from "react-native-svg";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";

// In-memory cache (lives as long as app is running)
const svgCache: { [key: string]: string } = {};

export const QuizLogo = ({ name }: { name: string }) => {
  const [svgXmlData, setSvgXmlData] = useState<string | null>(null);

  useEffect(() => {
    const fetchSvg = async () => {
      if (svgCache[name]) {
        setSvgXmlData(svgCache[name]);
        return;
      }

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
