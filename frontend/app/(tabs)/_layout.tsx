import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/Colors";
import {
  Home,
  Profile,
  Search,
  Shop,
  Events,
  HomeFocused,
  ProfileFocused,
  SearchFocused,
  ShopFocused,
  EventsFocused,
} from "@/assets/svgs/tabBarIcons/index";
import { HEIGHT, myHeight } from "@/constants/Dimensions";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIconStyle: {
          height: HEIGHT * (60 / myHeight),
        },
        tabBarStyle: {
          height: HEIGHT * (80 / myHeight),
          backgroundColor: Colors.dark.bg_dark,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name={"index"}
        options={{
          tabBarIcon({ focused }) {
            return focused ? <HomeFocused /> : <Home />;
          },
        }}
      />
      <Tabs.Screen
        name={"explore"}
        options={{
          title: "Search",
          tabBarIcon({ focused }) {
            return focused ? <SearchFocused /> : <Search />;
          },
        }}
      />
      <Tabs.Screen
        name={"events"}
        options={{
          tabBarIcon({ focused }) {
            return focused ? <EventsFocused /> : <Events />;
          },
        }}
      />
      <Tabs.Screen
        name={"shop"}
        options={{
          tabBarIcon({ focused }) {
            return focused ? <ShopFocused /> : <Shop />;
          },
        }}
      />
      <Tabs.Screen
        name={"profile"}
        options={{
          tabBarIcon({ focused }) {
            return focused ? <ProfileFocused /> : <Profile />;
          },
        }}
      />
    </Tabs>
  );
}
