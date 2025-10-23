import { Tabs } from "expo-router";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
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
import { useState } from "react";
import { REGULAR_FONT } from "@/constants/Styles";

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [featureName, setFeatureName] = useState("");

  const handleComingSoon = (feature: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeatureName(feature);
    setModalVisible(true);
  };

  return (
    <>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: Colors.dark.bg,
              borderRadius: 20,
              paddingVertical: 25,
              paddingHorizontal: 20,
              alignItems: "center",
              borderWidth: 1,
              borderColor: Colors.dark.bg_light,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "600",
                color: Colors.dark.text,
                marginBottom: 10,
                fontFamily: REGULAR_FONT,
              }}
            >
              {featureName} Coming Soon!
            </Text>
            <Text
              style={{
                color: Colors.dark.text_muted,
                fontFamily: REGULAR_FONT,
                fontSize: 15,
                textAlign: "center",
                marginBottom: 25,
              }}
            >
              We’re working on this feature! Stay tuned for new tournaments,
              community challenges, in-game shop and more in future updates.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setModalVisible(false);
              }}
              style={{
                backgroundColor: Colors.dark.highlight,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 30,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  fontFamily: REGULAR_FONT,
                }}
              >
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
            tabBarButton: (props: any) => (
              <Pressable
                {...props}
                onPress={() => handleComingSoon("Shop")}
                style={{ alignItems: "center" }}
              >
                {props.children}
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name={"events"}
          options={{
            tabBarIcon({ focused }) {
              return focused ? <EventsFocused /> : <Events />;
            },
            tabBarButton: (props: any) => (
              <Pressable
                {...props}
                onPress={() => handleComingSoon("Events")}
                style={{ alignItems: "center" }}
              >
                {props.children}
              </Pressable>
            ),
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
    </>
  );
}
