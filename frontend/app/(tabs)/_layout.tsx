import { Tabs } from "expo-router";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
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
import * as Haptics from "expo-haptics";
import { JSX, useState } from "react";
import { REGULAR_FONT } from "@/constants/Styles";

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [featureName, setFeatureName] = useState("");
  const { width, height } = useWindowDimensions();
  const isSmallPhone = width < 380 || height < 700;

  const iconWidth = isSmallPhone ? "80%" : "100%";

  const handleComingSoon = (feature: string) => {
    Haptics.selectionAsync();
    setFeatureName(feature);
    setModalVisible(true);
  };

  const ComingSoonButton =
    (feature: string) =>
    (props: any): JSX.Element => (
      <Pressable
        {...props}
        hitSlop={10}
        onPress={() => handleComingSoon(feature)}
        style={({ pressed }) => ({
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        {props.children}
      </Pressable>
    );

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
          },
          tabBarStyle: {
            paddingBottom: 0,
            paddingTop: 10,
            height: 60,
            backgroundColor: Colors.dark.bg_dark,
            borderTopWidth: 1,
            borderColor: Colors.dark.bg_light,
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          animation: "fade",
          tabBarButton: (props: any) => (
            <Pressable
              {...props}
              hitSlop={10}
              onPress={() => {
                Haptics.selectionAsync();
                props.onPress?.();
              }}
              style={({ pressed }) => ({
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                opacity: pressed ? 0.6 : 1,
              })}
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
              return focused ? (
                <ShopFocused width={iconWidth} />
              ) : (
                <Shop width={iconWidth} />
              );
            },
            tabBarButton: ComingSoonButton("Shop"),
          }}
        />
        <Tabs.Screen
          name={"events"}
          options={{
            tabBarIcon({ focused }) {
              return focused ? (
                <EventsFocused width={iconWidth} />
              ) : (
                <Events width={iconWidth} />
              );
            },
            tabBarButton: ComingSoonButton("Events"),
          }}
        />
        <Tabs.Screen
          name={"index"}
          options={{
            tabBarIcon({ focused }) {
              return focused ? (
                <HomeFocused width={iconWidth} />
              ) : (
                <Home width={iconWidth} />
              );
            },
          }}
        />
        <Tabs.Screen
          name={"explore"}
          options={{
            title: "Search",
            tabBarIcon({ focused }) {
              return focused ? (
                <SearchFocused width={iconWidth} />
              ) : (
                <Search width={iconWidth} />
              );
            },
          }}
        />
        <Tabs.Screen
          name={"profile"}
          options={{
            tabBarIcon({ focused }) {
              return focused ? (
                <ProfileFocused width={iconWidth} />
              ) : (
                <Profile width={iconWidth} />
              );
            },
          }}
        />
      </Tabs>
    </>
  );
}
