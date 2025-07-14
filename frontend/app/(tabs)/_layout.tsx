import { Tabs } from "expo-router";
import { Pressable, Text } from "react-native";
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
import { HEIGHT, layout, myHeight } from "@/constants/Dimensions";
import * as Haptics from "expo-haptics";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: Colors.dark.bg_dark,
          paddingTop: layout.paddingTop,
        },
        tabBarIconStyle: {
          height: HEIGHT * (60 / myHeight),
        },
        tabBarStyle: {
          height: HEIGHT * (80 / myHeight),
          backgroundColor: Colors.dark.bg_dark,
          borderTopWidth: 0,
        },
        headerShown: false,
        tabBarShowLabel: false,
        animation: "fade",
        tabBarButton: (props: any) => (
          <Pressable
            {...props}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              props.onPress?.();
            }}
            style={{
              alignItems: "center",
            }}
          >
            {props.children}
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name={"shop"}
        options={{
          tabBarIcon({ focused }) {
            return focused ? <ShopFocused /> : <Shop />;
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
