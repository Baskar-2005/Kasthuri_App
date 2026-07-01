import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FilterSheet, FilterState } from "@/components/ui/FilterSheet";
import { ProductCard } from "@/components/ui/ProductCard";
import { PromoBanner } from "@/components/ui/PromoBanner";
import { QuickPreview } from "@/components/ui/QuickPreview";
import { SortSheet, SORT_OPTIONS } from "@/components/ui/SortSheet";
import { PRODUCTS } from "@/constants/mockData";
import type { Product } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

type ViewMode = "grid2" | "list" | "large";

const EMPTY_FILTERS: FilterState = {
  categories: [], occasions: [], sizes: [], colors: [], materials: [],
  priceRange: "", minDiscount: "", rating: "", sortBy: "",
};

const SUB_FILTERS: Record<string, string[]> = {
  Women: ["All", "Sarees", "Lehengas", "Suits", "Dupattas", "Blouses", "Kurtis"],
  Men: ["All", "Sherwanis", "Kurtas", "Dhotis", "Jackets", "Sets"],
  Kids: ["All", "Girls", "Boys", "Infants", "Sets"],
  Silver: ["All", "Necklaces", "Bangles", "Earrings", "Anklets", "Rings"],
  Festival: ["All", "Diwali", "Navratri", "Wedding", "Pongal", "Traditional"],
  Bridal: ["All", "Lehengas", "Sarees", "Jewellery", "Shawls"],
  default: ["All", "New", "Trending", "Bestsellers", "On Sale"],
};

const BANNER_GRADIENTS: Record<string, [string, string]> = {
  Women: ["#6B1A1A", "#2C1206"],
  Men: ["#1A2C6B", "#0D1A45"],
  Kids: ["#1A6B3A", "#0D4525"],
  Silver: ["#505060", "#303040"],
  Festival: ["#8B6914", "#C9A84C"],
  Bridal: ["#8B0000", "#3D0000"],
  default: ["#6B1A1A", "#2C1206"],
};

const BANNER_SUBTITLES: Record<string, string> = {
  Women: "Sarees, Lehengas & beyond",
  Men: "Sherwanis, Kurtas & more",
  Kids: "Festive & everyday styles",
  Silver: "Handcrafted 925 silver",
  Festival: "Celebrate every occasion",
  Bridal: "Your dream bridal look",
  default: "Curated collection for you",
};

export default function CategoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 80;

  const { name } = useLocalSearchParams<{ id: string; name?: string }>();
  const catName = name ?? "All";

  const scrollY = useRef(new Animated.Value(0)).current;
  const [subFilter, setSubFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid2");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState("recommended");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [quickPreviewProduct, setQuickPreviewProduct] = useState<Product | null>(null);

  const gradColors = BANNER_GRADIENTS[catName] ?? BANNER_GRADIENTS.default;
  const subFilters = SUB_FILTERS[catName] ?? SUB_FILTERS.default;
  const subtitle = BANNER_SUBTITLES[catName] ?? BANNER_SUBTITLES.default;

  const toggleWishlist = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleQuickView = useCallback((p: Product) => setQuickPreviewProduct(p), []);

  const getFiltered = () => {
    let result = PRODUCTS.map((p) => ({ ...p, isWishlisted: wishlist.has(p.id) }));

    if (catName !== "All") {
      result = result.filter((p) => p.category === catName || p.occasion === catName);
    }

    if (activeSort === "price_asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (activeSort === "price_desc") result = [...result].sort((a, b) => b.price - a.price);
    else if (activeSort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    else if (activeSort === "newest") result = [...result].filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));
    else if (activeSort === "trending") result = [...result].filter((p) => p.isTrending).concat(result.filter((p) => !p.isTrending));
    else if (activeSort === "discount") result = [...result].sort((a, b) => b.discount - a.discount);

    return result;
  };

  const filtered = getFiltered();
  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === activeSort)?.label ?? "Recommended";

  const heroHeight = 220;
  const heroParallax = scrollY.interpolate({
    inputRange: [0, heroHeight],
    outputRange: [0, -heroHeight * 0.35],
    extrapolate: "clamp",
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, heroHeight * 0.7],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [heroHeight * 0.5, heroHeight],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const headerTextColor = scrollY.interpolate({
    inputRange: [heroHeight * 0.5, heroHeight],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const activeFilterCount = Object.values(filters).reduce((acc, v) => {
    if (Array.isArray(v)) return acc + v.length;
    if (v) return acc + 1;
    return acc;
  }, 0);

  const renderGrid = () => {
    const rows: React.ReactNode[] = [];
    let promoIdx = 0;

    if (viewMode === "grid2") {
      for (let i = 0; i < filtered.length; i += 2) {
        rows.push(
          <View key={`row-${i}`} style={styles.gridRow}>
            <ProductCard product={filtered[i]} layout="grid" onWishlistToggle={toggleWishlist} onQuickView={handleQuickView} index={i} />
            {filtered[i + 1] ? (
              <ProductCard product={filtered[i + 1]} layout="grid" onWishlistToggle={toggleWishlist} onQuickView={handleQuickView} index={i + 1} />
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </View>
        );
        if ((i + 2) % 8 === 0 && i + 2 < filtered.length) {
          rows.push(<PromoBanner key={`promo-${promoIdx}`} index={promoIdx++} />);
        }
      }
    } else if (viewMode === "list") {
      filtered.forEach((p, i) => {
        rows.push(<ProductCard key={p.id} product={p} layout="list" onWishlistToggle={toggleWishlist} onQuickView={handleQuickView} index={i} />);
        if ((i + 1) % 5 === 0 && i + 1 < filtered.length) {
          rows.push(<PromoBanner key={`promo-${promoIdx}`} index={promoIdx++} />);
        }
      });
    } else {
      filtered.forEach((p, i) => {
        rows.push(<ProductCard key={p.id} product={p} layout="large" onWishlistToggle={toggleWishlist} onQuickView={handleQuickView} index={i} />);
        if ((i + 1) % 3 === 0 && i + 1 < filtered.length) {
          rows.push(<PromoBanner key={`promo-${promoIdx}`} index={promoIdx++} />);
        }
      });
    }

    return rows;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.stickyHeader, { paddingTop: topPad }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, opacity: headerBgOpacity }]} />
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Animated.Text style={[styles.headerTitle, { color: colors.foreground, opacity: headerTextColor, fontFamily: "Poppins_700Bold" }]}>
            {catName}
          </Animated.Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push("/search")}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push("/cart")}>
              <Ionicons name="bag-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        <Animated.View
          style={[
            styles.heroContainer,
            { height: heroHeight, transform: [{ translateY: heroParallax }] },
          ]}
        >
          <LinearGradient
            colors={gradColors}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.45)"]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={[styles.heroContent, { opacity: heroOpacity, paddingTop: topPad + 50 }]}>
            <View style={styles.heroCrumb}>
              <Text style={[styles.heroCrumbText, { fontFamily: "Poppins_500Medium" }]}>Collections</Text>
              <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.heroCrumbText, { fontFamily: "Poppins_600SemiBold", color: "#fff" }]}>{catName}</Text>
            </View>
            <Text style={[styles.heroTitle, { fontFamily: "Poppins_800ExtraBold" }]}>{catName}</Text>
            <Text style={[styles.heroSubtitle, { fontFamily: "Poppins_400Regular" }]}>{subtitle}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaChip}>
                <Ionicons name="grid" size={11} color="rgba(255,255,255,0.8)" />
                <Text style={[styles.heroMetaText, { fontFamily: "Poppins_500Medium" }]}>{filtered.length} products</Text>
              </View>
              {filtered.some((p) => p.isPremium) && (
                <View style={styles.heroMetaChip}>
                  <Ionicons name="diamond" size={11} color="#C9A84C" />
                  <Text style={[styles.heroMetaText, { color: "#C9A84C", fontFamily: "Poppins_500Medium" }]}>Premium</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </Animated.View>

        <View style={[styles.subFiltersRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFiltersList}>
            {subFilters.map((f) => {
              const isActive = subFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.subFilterChip,
                    { backgroundColor: isActive ? colors.primary : colors.secondary, borderColor: isActive ? colors.primary : colors.border },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setSubFilter(f); }}
                >
                  <Text style={[styles.subFilterText, { color: isActive ? "#fff" : colors.foreground, fontFamily: isActive ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.ScrollView>
        </View>

        <View style={[styles.controlsBar, { borderBottomColor: colors.border }]}>
          <View style={styles.controlsLeft}>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: activeFilterCount > 0 ? colors.primary + "15" : colors.secondary, borderColor: activeFilterCount > 0 ? colors.primary : colors.border }]}
              onPress={() => setShowFilter(true)}
            >
              <Ionicons name="options-outline" size={14} color={activeFilterCount > 0 ? colors.primary : colors.foreground} />
              <Text style={[styles.filterBtnText, { color: activeFilterCount > 0 ? colors.primary : colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => setShowSort(true)}
            >
              <Ionicons name="swap-vertical-outline" size={14} color={colors.foreground} />
              <Text style={[styles.sortBtnText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]} numberOfLines={1}>
                {activeSortLabel.length > 14 ? activeSortLabel.slice(0, 14) + "…" : activeSortLabel}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.viewModes}>
            {(["grid2", "list", "large"] as ViewMode[]).map((mode) => {
              const icons: Record<ViewMode, string> = { grid2: "grid-outline", list: "list-outline", large: "albums-outline" };
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.viewModeBtn, { backgroundColor: viewMode === mode ? colors.primary : "transparent" }]}
                  onPress={() => { Haptics.selectionAsync(); setViewMode(mode); }}
                >
                  <Ionicons name={icons[mode] as any} size={15} color={viewMode === mode ? "#fff" : colors.mutedForeground} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.resultsBar}>
          <Text style={[styles.resultsText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            <Text style={[styles.resultCount, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              {filtered.length}
            </Text>{" "}
            products
          </Text>
          <Text style={[styles.sortLabel, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
            {activeSortLabel}
          </Text>
        </View>

        <View style={styles.productsContainer}>{renderGrid()}</View>
      </Animated.ScrollView>

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApply={setFilters}
      />
      <SortSheet
        visible={showSort}
        onClose={() => setShowSort(false)}
        activeSort={activeSort}
        onSelect={setActiveSort}
      />
      <QuickPreview
        product={quickPreviewProduct}
        visible={!!quickPreviewProduct}
        onClose={() => setQuickPreviewProduct(null)}
        onWishlistToggle={toggleWishlist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 10,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, flex: 1, textAlign: "center" },
  headerRight: { flexDirection: "row", gap: 8 },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContainer: { overflow: "hidden" },
  heroContent: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 20, paddingBottom: 20 },
  heroCrumb: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  heroCrumbText: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  heroTitle: { fontSize: 30, color: "#fff", lineHeight: 36 },
  heroSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  heroMeta: { flexDirection: "row", gap: 10, marginTop: 10 },
  heroMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroMetaText: { fontSize: 11, color: "rgba(255,255,255,0.9)" },
  subFiltersRow: { borderBottomWidth: StyleSheet.hairlineWidth },
  subFiltersList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  subFilterChip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22 },
  subFilterText: { fontSize: 12.5 },
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  controlsLeft: { flexDirection: "row", gap: 8 },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterBtnText: { fontSize: 12 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, maxWidth: 140 },
  sortBtnText: { fontSize: 12 },
  viewModes: { flexDirection: "row", gap: 2 },
  viewModeBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  resultsBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  resultsText: { fontSize: 13 },
  resultCount: { fontSize: 13 },
  sortLabel: { fontSize: 12 },
  productsContainer: { paddingHorizontal: 16 },
  gridRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
});
