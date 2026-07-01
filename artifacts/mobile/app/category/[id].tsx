import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ui/ProductCard";
import { useColors } from "@/hooks/useColors";
import { PRODUCTS } from "@/constants/mockData";

const SORT_OPTIONS = ["Recommended", "Price: Low to High", "Price: High to Low", "Newest", "Top Rated"];
const FILTERS_BY_CAT: Record<string, string[]> = {
  Women: ["All", "Sarees", "Lehengas", "Suits", "Dupattas", "Blouses"],
  Men: ["All", "Sherwanis", "Kurtas", "Dhotis", "Jackets"],
  Kids: ["All", "Girls", "Boys", "Infants"],
  Silver: ["All", "Necklaces", "Bangles", "Earrings", "Rings"],
  Festival: ["All", "Diwali", "Pongal", "Wedding", "Navratri"],
  default: ["All", "New Arrivals", "Bestsellers", "On Sale"],
};

const BANNER_COLORS: Record<string, [string, string]> = {
  Women: ["#6B1A1A", "#2C1206"],
  Men: ["#1A2C6B", "#0D1A45"],
  Kids: ["#1A6B1A", "#0D450D"],
  Silver: ["#505060", "#303040"],
  Festival: ["#8B6914", "#C9A84C"],
  default: ["#6B1A1A", "#2C1206"],
};

export default function CategoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 80;

  const { name } = useLocalSearchParams<{ id: string; name?: string }>();
  const catName = name ?? "All";

  const filters = FILTERS_BY_CAT[catName] ?? FILTERS_BY_CAT.default;
  const gradColors = BANNER_COLORS[catName] ?? BANNER_COLORS.default;

  const [activeFilter, setActiveFilter] = useState("All");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState("Recommended");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const products = catName === "All" || catName === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === catName || (catName === "Festival" && p.badge !== undefined));

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Banner */}
      <LinearGradient
        colors={gradColors}
        style={[styles.banner, { paddingTop: topPad + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.bannerTop}>
          <Pressable
            style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
          <View style={styles.bannerActions}>
            <Pressable style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]} onPress={() => router.push("/search")}>
              <Ionicons name="search" size={20} color="#fff" />
            </Pressable>
            <Pressable
              style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLayout((l) => l === "grid" ? "list" : "grid"); }}
            >
              <Ionicons name={layout === "grid" ? "list" : "grid"} size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{catName === "all" ? "All Products" : catName}</Text>
          <Text style={styles.bannerSub}>{products.length} products available</Text>
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {filters.map((f) => (
            <Pressable
              key={f}
              style={[styles.filterChip, {
                backgroundColor: activeFilter === f ? colors.primary : colors.card,
                borderColor: activeFilter === f ? colors.primary : colors.border,
              }]}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
            >
              <Text style={[styles.filterText, { color: activeFilter === f ? "#fff" : colors.foreground }]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          style={[styles.sortChip, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowSort(true)}
        >
          <Ionicons name="funnel-outline" size={14} color={colors.foreground} />
          <Text style={[styles.filterText, { color: colors.foreground }]}>Sort</Text>
        </Pressable>
      </View>

      {layout === "grid" ? (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={[styles.grid, { paddingBottom: bottomPad }]}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                product={{ ...item, isWishlisted: wishlist.has(item.id) }}
                layout="grid"
                onWishlistToggle={toggleWishlist}
              />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
          renderItem={({ item }) => (
            <ProductCard
              product={{ ...item, isWishlisted: wishlist.has(item.id) }}
              layout="list"
              onWishlistToggle={toggleWishlist}
            />
          )}
        />
      )}

      {/* Sort Modal */}
      {showSort && (
        <Pressable style={styles.overlay} onPress={() => setShowSort(false)}>
          <View style={[styles.sortSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sortTitle, { color: colors.foreground }]}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.sortOption, { borderBottomColor: colors.border }]}
                onPress={() => { setActiveSort(opt); setShowSort(false); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.sortText, { color: colors.foreground }]}>{opt}</Text>
                {activeSort === opt && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: { paddingHorizontal: 16, paddingBottom: 20 },
  bannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  bannerActions: { flexDirection: "row", gap: 8 },
  bannerContent: { gap: 4 },
  bannerTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  bannerSub: { fontSize: 13, color: "rgba(255,255,255,0.75)" },
  filterRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth },
  filterContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "600" },
  sortChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 16, marginLeft: 4 },
  grid: { padding: 16 },
  row: { gap: 12, marginBottom: 12 },
  list: { padding: 16 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sortSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sortTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  sortOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  sortText: { fontSize: 15 },
});
