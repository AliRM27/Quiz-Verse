import { View, Text } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";

const Info = ({ company, title }: { company: string; title: string }) => {
  return (
    <Text style={{ fontFamily: REGULAR_FONT, color: Colors.dark.text_muted }}>
      This is a fan-made quiz, not officially connected to {company} or the
      creators of “{title}”. The game title is a trademark of {company}.
    </Text>
  );
};

export default Info;
