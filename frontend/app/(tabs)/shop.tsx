import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { REGULAR_FONT } from "@/constants/Styles";
import { useUser } from "@/context/userContext";
import { buyShopItem, fetchShopItems } from "@/services/api";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import PurchaseModal from "@/components/ui/PurchaseModal";
import ShopItemCard from "@/components/ui/ShopItemCard";
import Toast from "@/components/ui/Toast";
import { MotiView } from "moti";

// SVGs
import Gem from "@/assets/svgs/gem.svg";
import Trophy from "@/assets/svgs/trophy.svg";

const Shop = () => {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useUser();
  const { t } = useTranslation();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("theme");

  // Purchase Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const categories = [
    { id: "theme", label: t("themes") || "Themes" },
    { id: "title", label: t("titles") || "Titles" },
    { id: "quiz", label: t("quizzes") || "Quizzes" },
  ];

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    try {
      const data = await fetchShopItems();
      const flatItems = [
        ...(data.themes || []),
        ...(data.titles || []),
        ...(data.quizzes || []),
      ];
      setItems(flatItems);
    } catch (err) {
      console.error("Failed to load shop", err);
    } finally {
      setLoading(false);
    }
  };

  const isOwned = (item: any) => {
    if (!user) return false;
    if (item.type === "theme") {
      return user.ownedThemes?.includes(item.value);
    }
    if (item.type === "title") {
      return user.ownedTitles?.includes(item.value);
    }
    if (item.type === "quiz") {
      return user.unlockedQuizzes?.some(
        (uq: any) => uq.quizId?.id === item.id || uq.quizId === item.id
      );
    }
    return false;
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleItemPress = (item: any) => {
    if (isOwned(item)) return;
    setSelectedItem(item);
    setModalVisible(true);
    Haptics.selectionAsync();
  };

  const executePurchase = async (currency: "gems" | "stars") => {
    if (!selectedItem) return;
    setBuyingId(selectedItem.id);
    try {
      await buyShopItem(selectedItem.id, selectedItem.type, currency);
      await refreshUser();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      showToast(
        t("itemPurchased") || "Item purchased successfully!",
        "success"
      );
      setSelectedItem(null);
    } catch (error) {
      console.error("Purchase failed", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(t("purchaseFailed") || "Purchase failed. Try again.", "error");
    } finally {
      setBuyingId(null);
    }
  };

  const filteredItems = items.filter((i) => i.type === selectedCategory);

  const renderHeader = () => (
    <View>
      {/* Header Balance */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("shop")}</Text>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceItem}>
            <Trophy width={24} height={24} color={Colors.dark.secondary} />
            <Text style={styles.balanceText}>{user?.stars || 0}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Gem width={24} height={24} color={Colors.dark.primary} />
            <Text style={styles.balanceText}>{user?.gems || 0}</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.tabs}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => {
              setSelectedCategory(cat.id);
              Haptics.selectionAsync();
            }}
            style={[
              styles.tab,
              selectedCategory === cat.id && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat.id && styles.activeTabText,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const SkeletonItem = () => (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 0.8 }}
      transition={{ type: "timing", duration: 1000, loop: true }}
      style={styles.skeletonCard}
    />
  );

  const userBalance = {
    gems: user?.gems || 0,
    stars: user?.stars || 0,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {toastVisible && (
        <Toast
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />
      )}

      {loading ? (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          <View style={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item, index }) => (
            <ShopItemCard
              item={item}
              index={index}
              isOwned={isOwned(item)}
              onPress={handleItemPress}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

      <PurchaseModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem}
        onBuy={executePurchase}
        isLoading={buyingId === selectedItem?.id}
        userBalance={userBalance}
      />
    </View>
  );
};

export default Shop;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg_dark,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    fontFamily: REGULAR_FONT,
  },
  balanceContainer: {
    flexDirection: "row",
    gap: 12,
  },
  balanceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  balanceText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeTab: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  tabText: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    fontFamily: REGULAR_FONT,
  },
  activeTabText: {
    color: "#000",
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 14,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  grid: {
    paddingHorizontal: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skeletonCard: {
    width: "47%",
    height: 140,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    marginBottom: 15,
  },
});
