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
import { useEffect, useState } from "react";
import { updateUser } from "@/services/api";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Loader from "./Loader";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome6,
} from "@expo/vector-icons";
import { HEIGHT, isSmallPhone } from "@/constants/Dimensions";

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
    "#4A00E0",
    "#FF9F1A",
    "#00C853",
  ];

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState(user.theme.cardColor);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const dateParts = user.firstLogIn.split("T")[0].split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedDate = `${dateParts[2]} ${monthNames[parseInt(dateParts[1]) - 1]} ${dateParts[0]}`;

  // UI-thread color state
  const fromColor = useSharedValue(selectedColor);
  const toColor = useSharedValue(selectedColor);
  const progress = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(progress);
    fromColor.value = toColor.value;
    toColor.value = selectedColor;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 300 });
  }, [selectedColor]);

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

  const StatItem = ({ icon, value, label, iconType = "Ionicons" }: any) => (
    <View style={styles.statItem}>
      <View style={styles.statIconContainer}>
        {iconType === "Ionicons" && (
          <Ionicons name={icon} size={18} color={selectedColor} />
        )}
        {iconType === "Material" && (
          <MaterialCommunityIcons name={icon} size={18} color={selectedColor} />
        )}
        {iconType === "FontAwesome" && (
          <FontAwesome6 name={icon} size={16} color={selectedColor} />
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{t(label)}</Text>
    </View>
  );
  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[selectedColor + "20", selectedColor + "05"]}
        style={styles.card}
      >
        {isEditable && (
          <Modal
            transparent
            animationType="slide"
            visible={isVisible}
            onRequestClose={() => setIsVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t("chooseTheme")}</Text>
                <ColorPicker
                  colors={colors}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.modalCancel}
                    onPress={() => {
                      setIsVisible(false);
                      setSelectedColor(user.theme.cardColor);
                    }}
                  >
                    <Text style={styles.modalCancelText}>{t("close")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.modalSave, isLoading && { opacity: 0.5 }]}
                    disabled={
                      user.theme.cardColor === selectedColor || isLoading
                    }
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
                      <Text style={styles.modalSaveText}>{t("save")}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Top Section: Avatar & Info */}
        <View style={styles.header}>
          <Animated.View style={[styles.avatarContainer, animatedBorder]}>
            <Image source={{ uri: user?.profileImage }} style={styles.avatar} />
          </Animated.View>
          <View style={styles.userInfo}>
            <Animated.Text
              style={[styles.username, animatedText]}
              numberOfLines={1}
            >
              {usernameValue}
            </Animated.Text>
            <Animated.Text style={[styles.userTitle, animatedText]}>
              {t(user.title).toUpperCase()}
            </Animated.Text>
          </View>
          {isEditable && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsVisible(true)}
              style={styles.editButton}
            >
              <Pencil color="#fff" width={16} height={16} />
            </TouchableOpacity>
          )}
        </View>

        {/* Middle Section: Stats Bar */}
        <View style={styles.statsBar}>
          <StatItem
            icon="book-outline"
            value={user.unlockedQuizzesCount || 0}
            label="unlocked"
          />
          <StatItem
            icon="checkmark-circle-outline"
            value={user.completedQuizzesCount || 0}
            label="completed"
          />
          <StatItem icon="star-outline" value={user.level} label="level" />
          <StatItem
            icon="flame-outline"
            value={user.dailyQuizStreak}
            label="streak"
          />
        </View>

        {/* Bottom Section: Membership Badge */}
        <View style={styles.footer}>
          <LinearGradient
            colors={[selectedColor + "30", selectedColor + "10"]}
            style={styles.membershipBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.badgeText}>QV MEMBER</Text>
            <View style={styles.badgeDivider} />
            <Text style={styles.badgeDate}>
              SINCE {formattedDate.toUpperCase()}
            </Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  cardWrapper: {
    width: "90%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  card: {
    padding: 24,
    height: HEIGHT * 0.45,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    padding: 2,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: REGULAR_FONT,
    color: "#fff",
  },
  userTitle: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: REGULAR_FONT,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    letterSpacing: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    fontFamily: REGULAR_FONT,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: "center",
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    fontFamily: REGULAR_FONT,
    letterSpacing: 1,
  },
  badgeDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  badgeDate: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontFamily: REGULAR_FONT,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    gap: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 16,
  },
  modalCancel: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  modalSave: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    fontFamily: REGULAR_FONT,
  },
});
