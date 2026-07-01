import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { PRODUCTS } from "@/constants/mockData";
import type { Product } from "@/constants/mockData";

const { width: W } = Dimensions.get("window");
const CARD_W = (W - 48) / 2;

const COLLECTIONS = ["All", "Festival", "Wedding", "Casual", "Work", "Gifted"];

const INITIAL_ITEMS = PRODUCTS.slice(0, 8).map((p, i) => ({
  ...p,
  collection: COLLECTIONS[1 + (i % (COLLECTIONS.length - 1))],
  addedOn: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6]} ${10 + i}, 2025`,
}));

type WishlistItem = (typeof INITIAL_ITEMS)[number];

function WishlistCard({
  item,
  onRemove,
  isEditMode,
  isSelected,
  onSelect,
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
  isEditMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(1)).current;
  const [inCart, setInCart] = useState(false);

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => onRemove(item.id));
  };

  const savings = item.originalPrice - item.price;

  return (
    <Animated.View style={{ opacity: slideAnim, transform: [{ scale: slideAnim }] }}>
      <Pressable
        style={[
          styles.wishCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => {
          if (isEditMode) { onSelect(item.id); }
          else { router.push({ pathname: "/product/[id]", params: { id: item.id } }); }
        }}
        onLongPress={() => { Haptics.selectionAsync(); onSelect(item.id); }}
      >
        {/* Image area */}
        <LinearGradient
          colors={item.gradientColors}
          style={styles.wishImg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.4)"]} style={StyleSheet.absoluteFill} />

          {/* Selection check */}
          {isEditMode && (
            <View style={[styles.selectCheck, { backgroundColor: isSelected ? colors.primary : "rgba(255,255,255,0.3)", borderColor: isSelected ? colors.primary : "#fff" }]}>
              {isSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
            </View>
          )}

          {/* Badges */}
          {item.badge && (
            <View style={[styles.imgBadge, { backgroundColor: item.badge === "Premium" ? colors.gold : colors.primary }]}>
              <Text style={[styles.imgBadgeText, { fontFamily: "Poppins_700Bold" }]}>{item.badge}</Text>
            </View>
          )}

          {/* Remove button */}
          {!isEditMode && (
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
              <Ionicons name="heart" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}

          {/* Discount bubble */}
          <View style={styles.discountBubble}>
            <Text style={[styles.discountText, { fontFamily: "Poppins_700Bold" }]}>{item.discount}% OFF</Text>
          </View>
        </LinearGradient>

        {/* Info */}
        <View style={styles.wishInfo}>
          <Text style={[styles.wishName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.wishPriceRow}>
            <Text style={[styles.wishPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
              ₹{item.price.toLocaleString()}
            </Text>
            <Text style={[styles.wishOriginal, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              ₹{item.originalPrice.toLocaleString()}
            </Text>
          </View>
          <View style={styles.wishRatingRow}>
            <Ionicons name="star" size={11} color={colors.gold} />
            <Text style={[styles.wishRating, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{item.rating}</Text>
            <Text style={[styles.wishDate, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>· {item.addedOn}</Text>
          </View>
          <Text style={[styles.savingsLabel, { color: "#16a34a", fontFamily: "Poppins_500Medium" }]}>
            Save ₹{savings.toLocaleString()}
          </Text>

          <TouchableOpacity
            style={[styles.addCartChip, { backgroundColor: inCart ? "#16a34a" : colors.primary }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setInCart(true); }}
          >
            <Ionicons name={inCart ? "checkmark" : "bag-add-outline"} size={13} color="#fff" />
            <Text style={[styles.addCartChipText, { fontFamily: "Poppins_600SemiBold" }]}>
              {inCart ? "Added!" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function WishlistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 90;

  const [items, setItems] = useState<WishlistItem[]>(INITIAL_ITEMS);
  const [activeCollection, setActiveCollection] = useState("All");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<"recent" | "price_asc" | "price_desc">("recent");

  const filtered = items
    .filter((i) => activeCollection === "All" || i.collection === activeCollection)
    .sort((a, b) => {
      if (sortMode === "price_asc") return a.price - b.price;
      if (sortMode === "price_desc") return b.price - a.price;
      return 0;
    });

  const totalSavings = filtered.reduce((sum, i) => sum + (i.originalPrice - i.price), 0);

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleSelect = (id: string) => {
    if (!isEditMode) setIsEditMode(true);
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleDeleteSelected = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    setIsEditMode(false);
  };

  const exitEdit = () => { setIsEditMode(false); setSelectedIds(new Set()); };

  /* ── EMPTY STATE ── */
  if (items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 10 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Poppins_800ExtraBold" }]}>Wishlist</Text>
        </View>
        <View style={styles.emptyWrap}>
          <LinearGradient colors={[colors.primary, colors.gold]} style={styles.emptyCircle}>
            <Ionicons name="heart" size={44} color="#fff" />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Save items you love and shop them later
          </Text>
          <TouchableOpacity
            style={[styles.shopNowBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/collections")}
          >
            <Text style={[styles.shopNowText, { fontFamily: "Poppins_700Bold" }]}>Explore Collections</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
          <View style={styles.emptySuggestions}>
            <Text style={[styles.emptySugTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Trending Now</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
              {PRODUCTS.slice(0, 4).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.suggestionChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: "/product/[id]", params: { id: p.id } })}
                >
                  <LinearGradient colors={p.gradientColors} style={styles.suggestionImg} />
                  <Text style={[styles.suggestionName, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]} numberOfLines={1}>
                    {p.name.split(" ").slice(0, 2).join(" ")}
                  </Text>
                  <Text style={[styles.suggestionPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                    ₹{p.price.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ─── HEADER ─── */}
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border }]}>
        {isEditMode ? (
          <>
            <TouchableOpacity onPress={exitEdit} hitSlop={10}>
              <Text style={[styles.editAction, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", fontSize: 16 }]}>
              {selectedIds.size} selected
            </Text>
            <TouchableOpacity onPress={handleDeleteSelected} disabled={selectedIds.size === 0} hitSlop={10}>
              <Text style={[styles.editAction, { color: selectedIds.size > 0 ? "#dc2626" : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View>
              <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Poppins_800ExtraBold" }]}>Wishlist</Text>
              <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {items.length} saved · Save ₹{totalSavings.toLocaleString()} total
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: colors.secondary }]}
                onPress={() => { Haptics.selectionAsync(); setSortMode((s) => s === "recent" ? "price_asc" : s === "price_asc" ? "price_desc" : "recent"); }}
              >
                <Ionicons name="swap-vertical-outline" size={18} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: colors.secondary }]}
                onPress={() => { Haptics.selectionAsync(); setIsEditMode(true); }}
              >
                <Ionicons name="create-outline" size={18} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: colors.secondary }]}
                onPress={() => Haptics.selectionAsync()}
              >
                <Ionicons name="share-social-outline" size={18} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* ─── SORT INDICATOR ─── */}
      {sortMode !== "recent" && (
        <View style={[styles.sortBar, { backgroundColor: colors.primary + "15", borderBottomColor: colors.border }]}>
          <Ionicons name="swap-vertical" size={13} color={colors.primary} />
          <Text style={[styles.sortBarText, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
            Sorted by: {sortMode === "price_asc" ? "Price: Low to High" : "Price: High to Low"}
          </Text>
          <TouchableOpacity onPress={() => setSortMode("recent")} hitSlop={8}>
            <Ionicons name="close-circle" size={15} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ─── COLLECTION TABS ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsBar, { borderBottomColor: colors.border }]}
        contentContainerStyle={styles.tabsContent}
      >
        {COLLECTIONS.map((c) => {
          const count = c === "All" ? items.length : items.filter((i) => i.collection === c).length;
          const active = activeCollection === c;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.tab, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setActiveCollection(c); }}
            >
              <Text style={[styles.tabText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>
                {c}
              </Text>
              {count > 0 && (
                <View style={[styles.tabCount, { backgroundColor: active ? "rgba(255,255,255,0.25)" : colors.border }]}>
                  <Text style={[styles.tabCountText, { color: active ? "#fff" : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ─── SAVINGS BANNER ─── */}
      {filtered.length > 0 && (
        <LinearGradient
          colors={[colors.primary + "18", colors.gold + "10"]}
          style={[styles.savingsBanner, { borderBottomColor: colors.border }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="sparkles" size={14} color={colors.gold} />
          <Text style={[styles.savingsBannerText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
            You save <Text style={{ color: "#16a34a", fontFamily: "Poppins_700Bold" }}>₹{filtered.reduce((s, i) => s + (i.originalPrice - i.price), 0).toLocaleString()}</Text> on {filtered.length} items in this collection
          </Text>
        </LinearGradient>
      )}

      {/* ─── GRID ─── */}
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={[styles.grid, { paddingBottom: bottomPad }]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <WishlistCard
            item={item}
            onRemove={handleRemove}
            isEditMode={isEditMode}
            isSelected={selectedIds.has(item.id)}
            onSelect={handleSelect}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCollection}>
            <Ionicons name="folder-open-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyCollTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              No items in {activeCollection}
            </Text>
            <Text style={[styles.emptyCollSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Explore and add items to this collection
            </Text>
          </View>
        }
        ListFooterComponent={
          filtered.length > 0 ? (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              {isEditMode && selectedIds.size > 0 ? (
                <TouchableOpacity
                  style={[styles.addAllBtn, { backgroundColor: "#dc2626" }]}
                  onPress={handleDeleteSelected}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={[styles.addAllText, { fontFamily: "Poppins_700Bold" }]}>Remove {selectedIds.size} items</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.addAllBtn, { backgroundColor: colors.primary }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <Ionicons name="bag-add" size={18} color="#fff" />
                  <Text style={[styles.addAllText, { fontFamily: "Poppins_700Bold" }]}>
                    Add All to Cart ({filtered.length} items)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 26 },
  headerSub: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  editAction: { fontSize: 15, paddingHorizontal: 4 },
  sortBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  sortBarText: { flex: 1, fontSize: 12 },
  tabsBar: { maxHeight: 56, borderBottomWidth: StyleSheet.hairlineWidth },
  tabsContent: { gap: 8, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" },
  tab: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  tabText: { fontSize: 13 },
  tabCount: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  tabCountText: { fontSize: 10 },
  savingsBanner: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth },
  savingsBannerText: { fontSize: 12, flex: 1 },
  grid: { padding: 12 },
  row: { gap: 12, marginBottom: 12 },
  footer: { paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  addAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  addAllText: { fontSize: 15, color: "#fff" },

  // Wish Card
  wishCard: { borderRadius: 18, overflow: "hidden", flex: 1 },
  wishImg: { width: "100%", height: CARD_W * 1.05, justifyContent: "flex-end" },
  selectCheck: { position: "absolute", top: 10, left: 10, width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  imgBadge: { position: "absolute", top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  imgBadgeText: { fontSize: 9, color: "#fff" },
  removeBtn: { position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  discountBubble: { margin: 8, alignSelf: "flex-start", backgroundColor: "#16a34a", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  discountText: { fontSize: 10, color: "#fff" },
  wishInfo: { padding: 10, gap: 4 },
  wishName: { fontSize: 12, lineHeight: 17 },
  wishPriceRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  wishPrice: { fontSize: 14 },
  wishOriginal: { fontSize: 11, textDecorationLine: "line-through" },
  wishRatingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  wishRating: { fontSize: 11 },
  wishDate: { fontSize: 10 },
  savingsLabel: { fontSize: 11 },
  addCartChip: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10, marginTop: 4 },
  addCartChipText: { fontSize: 11, color: "#fff" },

  // Empty states
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 28 },
  emptyCircle: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 22, textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 21, color: "#888" },
  shopNowBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  shopNowText: { fontSize: 15, color: "#fff" },
  emptySuggestions: { width: "100%", gap: 10 },
  emptySugTitle: { fontSize: 15 },
  suggestionChip: { width: 120, borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  suggestionImg: { width: "100%", height: 90 },
  suggestionName: { fontSize: 11, paddingHorizontal: 8, paddingTop: 6 },
  suggestionPrice: { fontSize: 12, paddingHorizontal: 8, paddingBottom: 8 },
  emptyCollection: { alignItems: "center", gap: 10, paddingVertical: 48 },
  emptyCollTitle: { fontSize: 16 },
  emptyCollSub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
