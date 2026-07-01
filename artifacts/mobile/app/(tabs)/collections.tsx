import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { PRODUCTS, CATEGORIES } from "@/constants/mockData";

const FILTERS = ["All", "Women", "Men", "Kids", "Silver", "Festival"];
const SORT_OPTIONS = ["Recommended", "Price: Low to High", "Price: High to Low", "Newest", "Rating"];

export default function CollectionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 80;

  const [activeFilter, setActiveFilter] = useState("All");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState("Recommended");

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = activeFilter === "All"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeFilter);

  const collectionBanners = [
    { name: "Women", colors: ["#6B1A1A", "#2C1206"] as [string, string] },
    { name: "Men", colors: ["#1A2C6B", "#0D1A45"] as [string, string] },
    { name: "Kids", colors: ["#1A6B1A", "#0D450D"] as [string, string] },
    { name: "Silver", colors: ["#505060", "#303040"] as [string, string] },
    { name: "Festival", colors: ["#8B6914", "#C9A84C"] as [string, string] },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Collections</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/search")}
          >
            <Ionicons name="search" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLayout(l => l === "grid" ? "list" : "grid"); }}
          >
            <Ionicons name={layout === "grid" ? "list" : "grid"} size={20} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* Category Banners */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerList}
        style={styles.bannerScroll}
      >
        {collectionBanners.map((b) => (
          <Pressable
            key={b.name}
            onPress={() => setActiveFilter(b.name)}
            style={{ borderRadius: 14, overflow: "hidden" }}
          >
            <LinearGradient
              colors={b.colors}
              style={[styles.collectionBanner, activeFilter === b.name && styles.selectedBanner]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {activeFilter === b.name && (
                <View style={styles.selectedCheck}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
              <Text style={styles.bannerName}>{b.name}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === f ? colors.primary : colors.card,
                  borderColor: activeFilter === f ? colors.primary : colors.border,
                },
              ]}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
            >
              <Text style={[styles.filterText, { color: activeFilter === f ? "#fff" : colors.foreground }]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          style={[styles.sortBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowSort(true)}
        >
          <Ionicons name="funnel-outline" size={15} color={colors.foreground} />
          <Text style={[styles.sortText, { color: colors.foreground }]}>Sort</Text>
        </Pressable>
      </View>

      {/* Results count */}
      <View style={[styles.resultsRow, { backgroundColor: colors.background }]}>
        <Text style={[styles.resultsText, { color: colors.mutedForeground }]}>
          {filtered.length} products
        </Text>
        <Text style={[styles.sortActive, { color: colors.primary }]}>{activeSort}</Text>
      </View>

      {/* Products */}
      {layout === "grid" ? (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={[styles.gridContent, { paddingBottom: bottomPad }]}
          columnWrapperStyle={styles.columnWrapper}
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
          data={filtered}
          keyExtractor={(p) => p.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
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
        <Pressable style={styles.sortOverlay} onPress={() => setShowSort(false)}>
          <View style={[styles.sortSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.sortHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sortTitle, { color: colors.foreground }]}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.sortOption, { borderBottomColor: colors.border }]}
                onPress={() => { setActiveSort(opt); setShowSort(false); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.sortOptionText, { color: colors.foreground }]}>{opt}</Text>
                {activeSort === opt && <Ionicons name="checkmark" size={18} color={colors.primary} />}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  bannerScroll: { flexGrow: 0 },
  bannerList: { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  collectionBanner: { width: 110, height: 70, borderRadius: 14, alignItems: "center", justifyContent: "center", position: "relative" },
  selectedBanner: { borderWidth: 2, borderColor: "#C9A84C" },
  selectedCheck: { position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: "#C9A84C", alignItems: "center", justifyContent: "center" },
  bannerName: { fontSize: 13, fontWeight: "700", color: "#fff" },
  filterBar: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  filterList: { paddingLeft: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "600" },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 16, marginLeft: 8 },
  sortText: { fontSize: 12, fontWeight: "600" },
  resultsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 },
  resultsText: { fontSize: 12 },
  sortActive: { fontSize: 12, fontWeight: "600" },
  gridContent: { padding: 16 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  listContent: { padding: 16 },
  sortOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sortSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  sortHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sortTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  sortOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  sortOptionText: { fontSize: 15 },
});
