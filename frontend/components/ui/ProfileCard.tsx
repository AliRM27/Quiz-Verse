import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";
import { User } from "@/context/userContext";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import ColorPicker from "./ColorPicker";
import Pencil from "@/assets/svgs/pencil.svg";
import { useEffect, useRef, useState } from "react";
import { updateUser } from "@/services/api";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Loader from "./Loader";
import {
  HEIGHT,
  isSmallPhone,
  myHeight,
  myWidth,
  WIDTH,
} from "@/constants/Dimensions";

// ✅ Reanimated imports
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  cancelAnimation,
} from "react-native-reanimated";

const ProfileCard = ({
  usernameValue,
  user,
  isEditable,
}: {
  usernameValue: string;
  user: User;
  isEditable: boolean;
}) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD93D",
    "#1A535C",
    "#FF9F1A",
    "green",
  ];

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState(user.theme.cardColor);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const date: string[] = user.firstLogIn.split("T", 1)[0].split("-");

  const month = {
    "1": "Jan.",
    "2": "Febr.",
    "3": "Mar.",
    "4": "Apr.",
    "5": "May",
    "6": "June",
    "7": "Jule",
    "8": "Aug.",
    "9": "Sept.",
    "10": "Oct.",
    "11": "Nov.",
    "12": "Dec.",
  };
  // UI-thread color state
  const fromColor = useSharedValue(selectedColor);
  const toColor = useSharedValue(selectedColor);
  const progress = useSharedValue(1);

  useEffect(() => {
    // stop any running transition
    cancelAnimation(progress);

    // move current target to "from", new pick to "to"
    fromColor.value = toColor.value;
    toColor.value = selectedColor;

    progress.value = 0;
    progress.value = withTiming(1, { duration: 300 });
  }, [selectedColor]);

  // ✅ Animated theme color computed from progress
  const animatedTheme = useAnimatedStyle(() => {
    const c = interpolateColor(
      progress.value,
      [0, 1],
      [fromColor.value, toColor.value]
    );
    return { backgroundColor: c };
  });

  const animatedBorder = useAnimatedStyle(() => {
    const c = interpolateColor(
      progress.value,
      [0, 1],
      [fromColor.value, toColor.value]
    );
    return { borderColor: c };
  });

  const animatedText = useAnimatedStyle(() => {
    const c = interpolateColor(
      progress.value,
      [0, 1],
      [fromColor.value, toColor.value]
    );
    return { color: c };
  });

  return (
    <View style={styles.card}>
      {isEditable && (
        <Modal
          transparent
          animationType="slide"
          visible={isVisible}
          onRequestClose={() => setIsVisible(false)}
        >
          <View
            style={{
              height: "100%",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: Colors.dark.bg_light,
                width: "100%",
                alignItems: "center",
                padding: 20,
                height: "50%",
                gap: 10,
                borderRadius: 50,
              }}
            >
              <Text
                style={[
                  styles.text,
                  { fontSize: 25, fontWeight: 600 },
                  isSmallPhone && { fontSize: 22 },
                  Platform.OS === "android" && { fontWeight: "bold" },
                ]}
              >
                {t("chooseTheme")}
              </Text>

              <ColorPicker
                colors={colors}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor} // animation triggers automatically
              />

              <View
                style={{
                  flexDirection: "row",
                  gap: 20,
                  marginTop: "auto",
                  paddingBottom: 20,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.button,
                    {
                      width: "45%",
                      backgroundColor: Colors.dark.bg_light,
                      borderWidth: 1,
                      borderColor: Colors.dark.border,
                    },
                  ]}
                  onPress={() => {
                    setIsVisible(false);
                    setSelectedColor(user.theme.cardColor);
                  }}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        color: Colors.dark.text,
                        fontSize: 18,
                        textAlign: "center",
                      },
                      isSmallPhone && { fontSize: 16 },
                    ]}
                  >
                    {t("close")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.button,
                    { width: "45%" },
                    isLoading && { paddingVertical: 5 },
                    user.theme.cardColor === selectedColor && { opacity: 0.5 },
                  ]}
                  disabled={user.theme.cardColor === selectedColor || isLoading}
                  onPress={async () => {
                    setIsLoading(true);
                    try {
                      user.theme.cardColor = selectedColor;
                      await updateUser(user);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                      );
                    } catch (err) {
                      console.log(err);
                    } finally {
                      setIsVisible(false);
                    }
                    setIsLoading(false);
                  }}
                >
                  {isLoading ? (
                    <Loader black />
                  ) : (
                    <Text
                      style={[
                        styles.text,
                        { color: "black", fontSize: 18 },
                        isSmallPhone && { fontSize: 16 },
                      ]}
                    >
                      {t("save")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ✅ Animate the top figure background */}
      <Animated.View
        style={[
          styles.figure,
          animatedTheme,
          { alignItems: "flex-end", padding: 10 },
        ]}
      >
        {isEditable && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsVisible(true)}
            style={{ backgroundColor: "#D9D9D9", padding: 7, borderRadius: 15 }}
          >
            <Pencil color={Colors.dark.bg_dark} width={20} height={20} />
          </TouchableOpacity>
        )}
      </Animated.View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <View style={{ gap: 10 }}>
          {/* ✅ Animate username color */}
          <Animated.Text
            style={[
              styles.text,
              animatedText,
              {
                fontSize: 25,
                fontWeight: 600,
              },
              isSmallPhone && { fontSize: 22 },
              usernameValue.length > 10 && { fontSize: 18 },
            ]}
          >
            {usernameValue}
          </Animated.Text>

          {/* ✅ Animate subtitle color */}
          <Animated.Text
            style={[
              styles.text,
              animatedText,
              { fontSize: 17 },
              isSmallPhone && { fontSize: 15 },
            ]}
          >
            QUIZ MASTER
          </Animated.Text>
        </View>

        {/* ✅ Animate diamond border */}
        <Animated.View
          style={[
            {
              borderWidth: 2,
              transform: [{ rotate: "45deg" }],
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              width: 54,
              height: 54,
            },
            animatedBorder,
          ]}
        >
          <View
            style={{
              width: 43,
              height: 43,
              transform: [{ rotate: "0deg" }],
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 15,
            }}
          >
            <Image
              src={user?.profileImage}
              width={50}
              height={50}
              style={{ transform: [{ rotate: "-45deg" }], aspectRatio: 1 / 1 }}
            />
          </View>
        </Animated.View>
      </View>

      {/* ✅ Animate bottom badge border + text + square */}
      <Animated.View
        style={[
          {
            flexDirection: "row",
            borderWidth: 1,
            alignItems: "center",
            paddingHorizontal: 10,
            gap: 10,
            borderRadius: 10,
            marginTop: "auto",
          },
          animatedBorder,
        ]}
      >
        <Animated.Text style={[styles.text, animatedText, { fontWeight: 600 }]}>
          QV
        </Animated.Text>

        <Animated.View style={[{ height: 22, width: 22 }, animatedTheme]} />

        <Animated.Text style={[styles.text, animatedText, { fontWeight: 600 }]}>
          {date[2]} {month[date[1] as keyof typeof month]} {date[0]}
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  text: { color: Colors.dark.text, fontFamily: REGULAR_FONT },
  text_muted: { color: Colors.dark.text_muted, fontFamily: REGULAR_FONT },
  card: {
    padding: 17,
    gap: 20,
    width: "78%",
    height: HEIGHT * 0.5,
    backgroundColor: "#D9D9D9",
    borderRadius: 15,
    alignItems: "center",
  },
  figure: {
    width: "100%",
    height: "55%",
    backgroundColor: "#E39595",
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 65,
    borderBottomRightRadius: 65,
  },
  input: {
    paddingHorizontal: 20,
    width: "100%",
    color: Colors.dark.text,
    fontSize: 18,
    height: 55,
    borderRadius: 35,
    borderWidth: 1,
    backgroundColor: Colors.dark.bg_light,
  },
  button: {
    backgroundColor: Colors.dark.text,
    width: "100%",
    paddingVertical: 15,
    marginTop: "auto",
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});
