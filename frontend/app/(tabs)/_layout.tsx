import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/Colors";
import { layout } from "@/constants/Dimensions";
//import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  //const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {},
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: Colors.dark.bg_dark,
          borderTopColor: Colors.dark.border_muted,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen name={"index"} options={{ title: "Home" }} />
      <Tabs.Screen name={"explore"} options={{ title: "Search" }} />
      <Tabs.Screen name={"events"} options={{ title: "Events" }} />
      <Tabs.Screen name={"shop"} options={{ title: "Shop" }} />
      <Tabs.Screen name={"profile"} options={{ title: "Profile" }} />
    </Tabs>
  );
}
