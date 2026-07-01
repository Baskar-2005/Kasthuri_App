import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
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
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { SortSheet, SORT_OPTIONS } from "@/components/ui/SortSheet";
import { PRODUCTS } from "@/constants/mockData";
import type { Product } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

const { width: SW } = Dimensions.get("window");

const TABS = ["All", "Women", "Men", "Kids", "Silver", "Festival", "New", "Trending", "Bridal", "Offers"];

const EMPTY_FILTERS: FilterState = {
  categories: [], occasions: [], sizes: [], colors: [], materials: [],
  priceRange: "", minDiscount: "", rating: "", sortBy: "",
};

type ViewMode = "grid2" | "list" | "large";

const COLLECTION_BANNERS = [
  { category: "Women", label: "Sarees & Suits", count: "800+ styles", colors: ["#6B1A1A", "#2C1206"] as [string, string], icon: "woman" },
  { category: "Men", label: "Sherwanis & Kurtas", count: "300+ styles", colors: ["#1A2C6B", "#0D1A45"] as [string, string], icon: "man" },
  { category: "Kids", label: "Festive & Casual", count: "200+ styles", colors: ["#1A6B3A", "#0D4525"] as [string, string], icon: "happy" },
  { category: "Silver", label: "Jewellery & Anklets", count: "150+ pieces", colors: ["#505060", "#303040"] as [string, string], icon: "diamond" },
  { category: "Festival", label: "Navratri & Diwali", count: "Seasonal", colors: ["#8B6914", "#C9A84C"] as [string, string], icon: "star" },
  { category: "Bridal", label: "Lehengas & Shawls", count: "100+ looks", colors: ["#8B0000", "#3D0000"] as [string, string], icon: "heart" },
];

export default function CollectionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 80;

  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid2");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState("recommended");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [quickPreviewProduct, setQuickPreviewProduct] = useState<Product | null>(null);
  const [showSkeletons, setShowSkeletons] = useState(false);

  const toggleWishlist = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleQuickView = useCallback((p: Product) => {
    setQuickPreviewProduct(p);
  }, []);

  const getFiltered = () => {
    let result = PRODUCTS.map((p) => ({ ...p, isWishlisted: wishlist.has(p.id) }));

    if (activeTab === "Women") result = result.filter((p) => p.category === "Women");
    else if (activeTab === "Men") result = result.filter((p) => p.category === "Men");
    else if (activeTab === "Kids") result = result.filter((p) => p.category === "Kids");
    else if (activeTab === "Silver") result = result.filter((p) => p.category === "Silver");
    else if (activeTab === "Festival") result = result.filter((p) => p.category === "Festival" || p.occasion === "Festival");
    else if (activeTab === "New") result = result.filter((p) => p.isNew);
    else if (activeTab === "Trending") result = result.filter((p) => p.isTrending);
    else if (activeTab === "Bridal") result = result.filter((p) => p.occasion === "Bridal" || p.occasion === "Wedding");
    else if (activeTab === "Offers") result = result.filter((p) => p.discount >= 28);

    if (filters.categories.length > 0) result = result.filter((p) => filters.categories.includes(p.category));
    if (filters.occasions.length > 0) result = result.filter((p) => filters.occasions.includes(p.occasion ?? ""));
    if (filters.materials.length > 0) result = result.filter((p) => filters.materials.some((m) => p.material?.toLowerCase().includes(m.toLowerCase())));

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

  const headerElevation = scrollY.interpolate({ inputRange: [0, 60], outputRange: [0, 10], extrapolate: "clamp" });
  const headerShadow = scrollY.interpolate({ inputRange: [0, 60], outputRange: [0, 0.12], extrapolate: "clamp" });
  const floatingBtnOpacity = scrollY.interpolate({ inputRange: [200, 280], outputRange: [0, 1], extrapolate: "clamp" });
  const floatingBtnTranslate = scrollY.interpolate({ inputRange: [200, 280], outputRange: [40, 0], extrapolate: "clamp" });

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
            <ProductCard
              product={filtered[i]}
              layout="grid"
              onWishlistToggle={toggleWishlist}
              onQuickView={handleQuickView}
              index={i}
            />
            {filtered[i + 1] ? (
              <ProductCard
                product={filtered[i + 1]}
                layout="grid"
                onWishlistToggle={toggleWishlist}
                onQuickView={handleQuickView}
                index={i + 1}
              />
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
        rows.push(
          <ProductCard key={p.id} product={p} layout="list" onWishlistToggle={toggleWishlist} onQuickView={handleQuickView} index={i} />
        );
        if ((i + 1) % 5 === 0 && i + 1 < filtered.length) {
          rows.push(<PromoBanner key={`promo-${promoIdx}`} index={promoIdx++} />);
        }
      });
    } else {
      filtered.forEach((p, i) => {
        rows.push(
          <ProductCard key={p.id} product={p} layout="large" onWishlistToggle={toggleWishlist} onQuickView={handleQuickView} index={i} />
        );
        if ((i + 1) % 3 === 0 && i + 1 < filtered.length) {
          rows.push(<PromoBanner key={`promo-${promoIdx}`} index={promoIdx++} />);
        }
      });
    }

    return rows;
  };

  const renderSkeletons = () => {
    if (viewMode === "grid2") {
      return (
        <View>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.gridRow}>
              <SkeletonCard layout="grid" />
              <SkeletonCard layout="grid" />
            </View>
          ))}
        </View>
      );
    }
    if (viewMode === "list") return [0, 1, 2, 4].map((i) => <SkeletonCard key={i} layout="list" />);
    return [0, 1, 2].map((i) => <SkeletonCard key={i} layout="large" />);
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <LinearGradient colors={[colors.secondary, colors.cream]} style={styles.emptyIcon}>
        <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
        No Products Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
        Try adjusting your filters or exploring other categories
      </Text>
      <TouchableOpacity
        style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
        onPress={() => { setFilters(EMPTY_FILTERS); setActiveTab("All"); }}
      >
        <Text style={[styles.emptyBtnText, { fontFamily: "Poppins_600SemiBold" }]}>Clear Filters</Text>
      </TouchableOpacity>
      <Text style={[styles.emptySuggest, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
        Popular collections:
      </Text>
      <View style={styles.suggestChips}>
        {["Women", "Festival", "Silver"].map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.suggestChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={() => { setActiveTab(c); setFilters(EMPTY_FILTERS); }}
          >
            <Text style={[styles.suggestChipText, { color: colors.foreground }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.appBar,
          {
            paddingTop: topPad + 6,
            backgroundColor: colors.background,
            shadowOpacity: headerShadow,
            elevation: headerElevation as any,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.appBarInner}>
          <View>
            <Text style={[styles.appBarEyebrow, { color: colors.gold, fontFamily: "Poppins_500Medium" }]}>
              KASTHURIBAI
            </Text>
            <Text style={[styles.appBarTitle, { color: colors.foreground, fontFamily: "Poppins_800ExtraBold" }]}>
              Collections
            </Text>
          </View>
          <View style={styles.appBarActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
              onPress={() => router.push("/search")}
            >
              <Ionicons name="search" size={19} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
              onPress={() => router.push("/cart")}
            >
              <Ionicons name="bag-outline" size={19} color={colors.foreground} />
              <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.cartBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={["#6B1A1A", "#2C1206"]}
            style={styles.heroBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.4)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroTop}>
              <View style={styles.heroBadgePill}>
                <Text style={[styles.heroBadgeLabel, { fontFamily: "Poppins_600SemiBold" }]}>PREMIUM COLLECTION</Text>
              </View>
            </View>
            <View style={styles.heroBottom}>
              <Text style={[styles.heroTitle, { fontFamily: "Poppins_800ExtraBold" }]}>
                Explore Every{"\n"}Occasion
              </Text>
              <Text style={[styles.heroSubtitle, { fontFamily: "Poppins_400Regular" }]}>
                {PRODUCTS.length}+ handpicked ethnic styles
              </Text>
            </View>
          </LinearGradient>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryBannerList}
            style={styles.categoryBannerScroll}
          >
            {COLLECTION_BANNERS.map((b) => (
              <TouchableOpacity
                key={b.category}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(b.category);
                  router.push({ pathname: "/category/[id]", params: { id: b.category, name: b.category } });
                }}
                style={styles.catBannerBtn}
              >
                <LinearGradient
                  colors={b.colors}
                  style={styles.catBanner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.catBannerIconWrap}>
                    <Ionicons name={b.icon as any} size={22} color="rgba(255,255,255,0.9)" />
                  </View>
                  <Text style={[styles.catBannerName, { fontFamily: "Poppins_700Bold" }]}>{b.category}</Text>
                  <Text style={[styles.catBannerSub, { fontFamily: "Poppins_400Regular" }]}>{b.count}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.tabsRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsList}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: isActive ? colors.primary : colors.secondary,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
                >
                  {tab === "New" && <View style={styles.tabDot} />}
                  <Text style={[styles.tabText, { color: isActive ? "#fff" : colors.foreground, fontFamily: isActive ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.controlsBar, { borderBottomColor: colors.border }]}>
          <View style={styles.controlsLeft}>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: activeFilterCount > 0 ? colors.primary + "15" : colors.secondary, borderColor: activeFilterCount > 0 ? colors.primary : colors.border }]}
              onPress={() => setShowFilter(true)}
            >
              <Ionicons name="options-outline" size={15} color={activeFilterCount > 0 ? colors.primary : colors.foreground} />
              <Text style={[styles.filterBtnText, { color: activeFilterCount > 0 ? colors.primary : colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => setShowSort(true)}
            >
              <Ionicons name="swap-vertical-outline" size={15} color={colors.foreground} />
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
                  <Ionicons name={icons[mode] as any} size={16} color={viewMode === mode ? "#fff" : colors.mutedForeground} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.resultsBar}>
          <Text style={[styles.resultsText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            <Text style={[styles.resultCount, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>{filtered.length}</Text> products
          </Text>
          {activeFilterCount > 0 && (
            <TouchableOpacity onPress={() => setFilters(EMPTY_FILTERS)}>
              <Text style={[styles.clearFilters, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.productsContainer}>
          {showSkeletons
            ? renderSkeletons()
            : filtered.length === 0
            ? renderEmpty()
            : renderGrid()
          }
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={[
          styles.floatingFilterBtn,
          {
            opacity: floatingBtnOpacity,
            transform: [{ translateY: floatingBtnTranslate }],
            bottom: bottomPad - 30,
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
        pointerEvents={undefined}
      >
        <TouchableOpacity
          style={styles.floatingFilterInner}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowFilter(true);
          }}
        >
          <Ionicons name="options" size={16} color="#fff" />
          <Text style={[styles.floatingFilterText, { fontFamily: "Poppins_600SemiBold" }]}>
            Filter & Sort{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
          </Text>
        </TouchableOpacity>
      </Animated.View>

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
  appBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  appBarInner: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  appBarEyebrow: { fontSize: 10, letterSpacing: 2 },
  appBarTitle: { fontSize: 26, lineHeight: 32 },
  appBarActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  cartBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { fontSize: 9, color: "#fff", fontWeight: "800" },
  heroSection: {},
  heroBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 22,
    height: 160,
    padding: 20,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  heroTop: {},
  heroBadgePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  heroBadgeLabel: { fontSize: 10, color: "#fff", letterSpacing: 1 },
  heroBottom: {},
  heroTitle: { fontSize: 24, color: "#fff", lineHeight: 30 },
  heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  categoryBannerScroll: { flexGrow: 0, marginTop: 14 },
  categoryBannerList: { paddingHorizontal: 16, gap: 10 },
  catBannerBtn: { borderRadius: 16, overflow: "hidden" },
  catBanner: { width: 120, height: 90, padding: 12, justifyContent: "flex-end", borderRadius: 16 },
  catBannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  catBannerName: { fontSize: 13, color: "#fff" },
  catBannerSub: { fontSize: 10, color: "rgba(255,255,255,0.75)" },
  tabsRow: { marginTop: 14, paddingVertical: 2, borderBottomWidth: StyleSheet.hairlineWidth },
  tabsList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 22, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  tabDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16a34a" },
  tabText: { fontSize: 13 },
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  controlsLeft: { flexDirection: "row", gap: 8 },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterBtnText: { fontSize: 12.5 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, maxWidth: 140 },
  sortBtnText: { fontSize: 12.5 },
  viewModes: { flexDirection: "row", gap: 2 },
  viewModeBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  resultsBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  resultsText: { fontSize: 13 },
  resultCount: { fontSize: 13 },
  clearFilters: { fontSize: 13 },
  productsContainer: { paddingHorizontal: 16 },
  gridRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  emptyState: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20, gap: 10 },
  emptyIcon: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  emptyTitle: { fontSize: 20, textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  emptyBtnText: { fontSize: 14, color: "#fff" },
  emptySuggest: { fontSize: 13, marginTop: 12 },
  suggestChips: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  suggestChip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  suggestChipText: { fontSize: 13 },
  floatingFilterBtn: {
    position: "absolute",
    alignSelf: "center",
    left: "50%",
    marginLeft: -65,
    borderRadius: 30,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: "hidden",
  },
  floatingFilterInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  floatingFilterText: { fontSize: 13, color: "#fff" },
});
