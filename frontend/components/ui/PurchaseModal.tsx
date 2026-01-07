import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { REGULAR_FONT } from "@/constants/Styles";
import { useTranslation } from "react-i18next";
// SVGs
import Gem from "@/assets/svgs/gem.svg";
import Trophy from "@/assets/svgs/trophy.svg";
import Close from "@/assets/svgs/close.svg";
import Loader from "./Loader";

interface PurchaseModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: {
    name: string;
    price: {
      gems: number;
      stars: number;
    };
  } | null;
  onBuy: (currency: "gems" | "stars") => void;
  isLoading: boolean;
  userBalance: {
    gems: number;
    stars: number;
  };
}

const PurchaseModal = ({
  isVisible,
  onClose,
  item,
  onBuy,
  isLoading,
  userBalance,
}: PurchaseModalProps) => {
  const { t } = useTranslation();

  if (!item) return null;

  const canAffordGems = userBalance.gems >= item.price.gems;
  const canAffordStars = userBalance.stars >= item.price.stars;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("confirmPurchase")}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={20}>
              <Close width={24} height={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemName}>{t(item.name) || item.name}</Text>
          <Text style={styles.subtitle}>{t("choosePaymentMethod")}</Text>

          {/* Payment Options */}
          <View style={styles.optionsContainer}>
            {/* Pay with Gems */}
            {item.price.gems > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.optionButton,
                  !canAffordGems && styles.disabledOption,
                ]}
                disabled={!canAffordGems || isLoading}
                onPress={() => onBuy("gems")}
              >
                <View style={styles.currencyIcon}>
                  <Gem width={24} height={24} color={Colors.dark.primary} />
                </View>
                <View>
                  <Text style={styles.priceText}>{item.price.gems}</Text>
                  <Text style={styles.currencyName}>{t("gems")}</Text>
                </View>
                {!canAffordGems && (
                  <View style={styles.missingBadge}>
                    <Text style={styles.missingText}>{t("lowBalance")}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Pay with Stars/Trophies */}
            {item.price.stars > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.optionButton,
                  !canAffordStars && styles.disabledOption,
                ]}
                disabled={!canAffordStars || isLoading}
                onPress={() => onBuy("stars")}
              >
                <View style={styles.currencyIcon}>
                  <Trophy
                    width={24}
                    height={24}
                    color={Colors.dark.secondary}
                  />
                </View>
                <View>
                  <Text style={styles.priceText}>{item.price.stars}</Text>
                  <Text style={styles.currencyName}>{t("trophies")}</Text>
                </View>
                {!canAffordStars && (
                  <View style={styles.missingBadge}>
                    <Text style={styles.missingText}>{t("lowBalance")}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {isLoading && (
            <View style={styles.loaderContainer}>
              <Loader black={false} />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  itemName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    fontFamily: REGULAR_FONT,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontFamily: REGULAR_FONT,
    textAlign: "center",
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 16,
  },
  disabledOption: {
    opacity: 0.5,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  currencyName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontFamily: REGULAR_FONT,
  },
  missingBadge: {
    marginLeft: "auto",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  missingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
    fontFamily: REGULAR_FONT,
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 24,
  },
});

export default PurchaseModal;
