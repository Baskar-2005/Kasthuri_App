import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ui/ProductCard";
import { useColors } from "@/hooks/useColors";
import { PRODUCTS } from "@/constants/mockData";

export default function WishlistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 80;

  const [wishlistItems, setWishlistItems] = useState(
    PRODUCTS.slice(0, 5).map((p) => ({ ...p, isWishlisted: true }))
  );

  const removeFromWishlist = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWishlistItems((prev) => prev.filter((p) => p.id !== id));
  };

  if (wishlistItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Wishlist</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="heart-outline" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Save your favourite items and come back to them later
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Wishlist</Text>
          <Text style={[styles.headerCount, { color: colors.mutedForeground }]}>{wishlistItems.length} saved items</Text>
        </View>
        <Pressable
          style={[styles.shareBtn, { backgroundColor: colors.secondary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="share-social-outline" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <FlatList
        data={wishlistItems}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={[styles.grid, { paddingBottom: bottomPad }]}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              product={item}
              layout="grid"
              onWishlistToggle={removeFromWishlist}
            />
          </View>
        )}
        ListFooterComponent={
          wishlistItems.length > 0 ? (
            <View style={[styles.addAllRow, { borderColor: colors.border }]}>
              <Pressable
                style={[styles.addAllBtn, { backgroundColor: colors.primary }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <Ionicons name="bag-add" size={18} color="#fff" />
                <Text style={styles.addAllText}>Add All to Cart</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerCount: { fontSize: 13, marginTop: 2 },
  shareBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  grid: { padding: 16 },
  row: { gap: 12, marginBottom: 12 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  addAllRow: { paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  addAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  addAllText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
