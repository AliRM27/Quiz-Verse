import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/Colors";
//import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  //const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
          sceneStyle: { backgroundColor: Colors.dark.bg_dark, alignItems: 'center', paddingTop: 60, paddingHorizontal: 20},
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {backgroundColor: Colors.dark.bg_light, borderTopColor: Colors.dark.border_muted, borderTopWidth: 1, },
      }}
    >
        <Tabs.Screen name={"index"} options={{title: "Home"}}/>
        <Tabs.Screen name={"explore"} options={{title: "Search"}}/>
        <Tabs.Screen name={"events"} options={{title: "Events"}} />
        <Tabs.Screen name={"shop"} options={{title: "Shop"}} />
        <Tabs.Screen name={"profile"} options={{title: "Profile"}} />
    </Tabs>
  );
}
