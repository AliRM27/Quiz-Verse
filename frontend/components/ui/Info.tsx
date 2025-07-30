import { View, Text } from "react-native";
import React from "react";

const Info = ({ company, title }: { company: string; title: string }) => {
  return (
    <Text>
      This is a fan-made quiz, not officially connected to {company} or the
      creators of “{title}”. The game title is a trademark of {company}.
    </Text>
  );
};

export default Info;
