import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { PRODUCTS, CATEGORIES, TRENDING_SEARCHES, RECENT_SEARCHES } from "@/constants/mockData";
import type { Product } from "@/constants/mockData";

const { width: W } = Dimensions.get("window");
const CARD_W = (W - 48) / 2;

/* ─── constants ─── */
const SORT_OPTIONS = [
  { key: "recommended", label: "Recommended", icon: "sparkles-outline" },
  { key: "newest", label: "Newest First", icon: "time-outline" },
  { key: "popular", label: "Most Popular", icon: "flame-outline" },
  { key: "price_asc", label: "Price: Low to High", icon: "trending-up-outline" },
  { key: "price_desc", label: "Price: High to Low", icon: "trending-down-outline" },
  { key: "rating", label: "Best Rating", icon: "star-outline" },
  { key: "discount", label: "Best Discount", icon: "pricetag-outline" },
];

const OCCASIONS = ["Festival", "Wedding", "Casual", "Office", "Party", "Traditional"];
const MATERIALS = ["Silk", "Cotton", "Chiffon", "Georgette", "Linen", "Velvet", "Net"];
const COLOR_SWATCHES = [
  { name: "Maroon", hex: "#6B1A1A" }, { name: "Gold", hex: "#C9A84C" },
  { name: "Navy", hex: "#1A1A6B" }, { name: "Green", hex: "#1A5C1A" },
  { name: "Black", hex: "#222" }, { name: "Pink", hex: "#E091B0" },
  { name: "Red", hex: "#CC0000" }, { name: "White", hex: "#F5F5F5" },
  { name: "Teal", hex: "#1A6B6B" }, { name: "Purple", hex: "#5C1A6B" },
];
const DISCOUNT_OPTIONS = ["10% & above", "20% & above", "30% & above", "50% & above"];

const EDITOR_PICKS = ["Kanjivaram Silk", "Banarasi Saree", "Anarkali Suit", "Lehenga Choli", "Kurta Set", "Silver Anklet"];
const FESTIVAL_COLLECTIONS = [
  { name: "Navratri", icon: "sparkles", colors: ["#E07020", "#C9A84C"] as [string, string] },
  { name: "Diwali", icon: "sunny", colors: ["#8B6914", "#C9A84C"] as [string, string] },
  { name: "Wedding", icon: "heart", colors: ["#6B1A1A", "#8B2222"] as [string, string] },
  { name: "Eid", icon: "moon", colors: ["#1A5C1A", "#2A8C2A"] as [string, string] },
];

interface FilterState {
  priceMin: number;
  priceMax: number;
  categories: string[];
  occasions: string[];
  colors: string[];
  materials: string[];
  discount: string;
  minRating: number;
  isNew: boolean;
  isTrending: boolean;
  isPremium: boolean;
  isLimitedStock: boolean;
}

const DEFAULT_FILTER: FilterState = {
  priceMin: 0, priceMax: 50000,
  categories: [], occasions: [], colors: [], materials: [],
  discount: "", minRating: 0,
  isNew: false, isTrending: false, isPremium: false, isLimitedStock: false,
};

/* ─── helpers ─── */
function applyFilters(products: Product[], f: FilterState): Product[] {
  return products.filter((p) => {
    if (p.price < f.priceMin || p.price > f.priceMax) return false;
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.occasions.length && !f.occasions.includes(p.occasion ?? "")) return false;
    if (f.colors.length && !f.colors.some((c) => p.colors?.includes(c))) return false;
    if (f.materials.length && !f.materials.includes(p.fabric ?? "")) return false;
    if (f.discount) {
      const pct = parseInt(f.discount);
      if (p.discount < pct) return false;
    }
    if (f.minRating > 0 && p.rating < f.minRating) return false;
    if (f.isNew && !p.isNew) return false;
    if (f.isTrending && !p.isTrending) return false;
    if (f.isPremium && !p.isPremium) return false;
    if (f.isLimitedStock && !p.isLimitedStock) return false;
    return true;
  });
}

function applySort(products: Product[], sort: string): Product[] {
  const arr = [...products];
  switch (sort) {
    case "price_asc": return arr.sort((a, b) => a.price - b.price);
    case "price_desc": return arr.sort((a, b) => b.price - a.price);
    case "rating": return arr.sort((a, b) => b.rating - a.rating);
    case "discount": return arr.sort((a, b) => b.discount - a.discount);
    case "newest": return arr.sort((a, b) => (a.isNew ? -1 : 1));
    case "popular": return arr.sort((a, b) => b.reviews - a.reviews);
    default: return arr;
  }
}

/* ─── sub components ─── */
function ResultCard({ product }: { product: Product }) {
  const colors = useColors();
  const [wishlisted, setWishlisted] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWishlisted((w) => !w);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 80 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 60 }),
    ]).start();
  };

  return (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
      activeOpacity={0.93}
    >
      <LinearGradient
        colors={product.gradientColors}
        style={styles.resultImg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.38)"]} style={StyleSheet.absoluteFill} />
        {product.badge && (
          <View style={[styles.resBadge, { backgroundColor: product.badge === "Premium" ? colors.gold : colors.primary }]}>
            <Text style={[styles.resBadgeText, { fontFamily: "Poppins_700Bold" }]}>{product.badge}</Text>
          </View>
        )}
        <View style={styles.resDiscountWrap}>
          <Text style={[styles.resDiscount, { fontFamily: "Poppins_700Bold" }]}>{product.discount}% OFF</Text>
        </View>
        <Animated.View style={[styles.resWishBtn, { transform: [{ scale: heartScale }] }]}>
          <TouchableOpacity onPress={handleWishlist} hitSlop={8}>
            <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={17} color={wishlisted ? "#ef4444" : "#fff"} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
      <View style={styles.resInfo}>
        <Text style={[styles.resName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.resPriceRow}>
          <Text style={[styles.resPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            ₹{product.price.toLocaleString()}
          </Text>
          <Text style={[styles.resOriginal, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            ₹{product.originalPrice.toLocaleString()}
          </Text>
        </View>
        <View style={styles.resRatingRow}>
          <Ionicons name="star" size={10} color={colors.gold} />
          <Text style={[styles.resRating, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{product.rating}</Text>
          <Text style={[styles.resReviews, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>({product.reviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── FILTER BOTTOM SHEET ─── */
function FilterSheet({
  visible,
  filters,
  onApply,
  onClose,
}: {
  visible: boolean;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const [local, setLocal] = useState<FilterState>(filters);
  const slideY = useRef(new Animated.Value(600)).current;

  React.useEffect(() => {
    if (visible) {
      setLocal(filters);
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 200 }).start();
    } else {
      Animated.timing(slideY, { toValue: 600, duration: 240, useNativeDriver: true }).start();
    }
  }, [visible]);

  const toggle = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    setLocal((f) => ({ ...f, [key]: f[key] === val ? (Array.isArray(val) ? [] : "") : val } as FilterState));

  const toggleArr = (key: "categories" | "occasions" | "colors" | "materials", val: string) =>
    setLocal((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });

  const activeCount = [
    local.categories.length, local.occasions.length, local.colors.length,
    local.materials.length, local.discount ? 1 : 0, local.minRating > 0 ? 1 : 0,
    local.isNew, local.isTrending, local.isPremium, local.isLimitedStock,
  ].reduce((s, v) => s + (v ? 1 : 0), 0);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <Animated.View
        style={[styles.filterSheet, { backgroundColor: colors.background, transform: [{ translateY: slideY }] }]}
      >
        {/* Handle */}
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Filters</Text>
          <TouchableOpacity onPress={() => setLocal(DEFAULT_FILTER)}>
            <Text style={[styles.sheetReset, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
          {/* Price Range */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              Price Range
            </Text>
            <View style={styles.priceRow}>
              {[[0, 500], [500, 2000], [2000, 5000], [5000, 15000], [15000, 50000]].map(([min, max]) => {
                const active = local.priceMin === min && local.priceMax === max;
                return (
                  <TouchableOpacity
                    key={`${min}-${max}`}
                    style={[styles.priceChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setLocal((f) => ({ ...f, priceMin: min, priceMax: max })); }}
                  >
                    <Text style={[styles.priceChipText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>
                      {min === 0 ? `Under ₹${max}` : max === 50000 ? `₹${min}+` : `₹${min}–₹${max}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Category</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((c) => {
                const active = local.categories.includes(c.name);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); toggleArr("categories", c.name); }}
                  >
                    <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Occasion */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Occasion</Text>
            <View style={styles.chipWrap}>
              {OCCASIONS.map((o) => {
                const active = local.occasions.includes(o);
                return (
                  <TouchableOpacity
                    key={o}
                    style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); toggleArr("occasions", o); }}
                  >
                    <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>{o}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Color */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
              {COLOR_SWATCHES.map((c) => {
                const active = local.colors.includes(c.name);
                return (
                  <TouchableOpacity
                    key={c.name}
                    style={[styles.colorSwatch, { borderColor: active ? colors.primary : "transparent", borderWidth: active ? 2.5 : 0 }]}
                    onPress={() => { Haptics.selectionAsync(); toggleArr("colors", c.name); }}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: c.hex }]}>
                      {active && <Ionicons name="checkmark" size={13} color="#fff" />}
                    </View>
                    <Text style={[styles.colorLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Material */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Material</Text>
            <View style={styles.chipWrap}>
              {MATERIALS.map((m) => {
                const active = local.materials.includes(m);
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); toggleArr("materials", m); }}
                  >
                    <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Discount */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Discount</Text>
            <View style={styles.chipWrap}>
              {DISCOUNT_OPTIONS.map((d) => {
                const active = local.discount === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setLocal((f) => ({ ...f, discount: active ? "" : d })); }}
                  >
                    <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Minimum Rating</Text>
            <View style={styles.ratingRow}>
              {[4, 3, 2, 0].map((r) => {
                const active = local.minRating === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.ratingChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setLocal((f) => ({ ...f, minRating: r })); }}
                  >
                    <Ionicons name="star" size={13} color={active ? "#fff" : colors.gold} />
                    <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>
                      {r === 0 ? "All" : `${r}+`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Toggles */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Special</Text>
            <View style={styles.chipWrap}>
              {[
                { key: "isNew" as const, label: "New Arrival" },
                { key: "isTrending" as const, label: "Trending" },
                { key: "isPremium" as const, label: "Premium" },
                { key: "isLimitedStock" as const, label: "Limited Edition" },
              ].map((t) => {
                const active = local[t.key];
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setLocal((f) => ({ ...f, [t.key]: !f[t.key] })); }}
                  >
                    {active && <Ionicons name="checkmark" size={13} color="#fff" />}
                    <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Apply button */}
        <View style={[styles.sheetActions, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onApply(local); }}>
            <Text style={[styles.applyBtnText, { fontFamily: "Poppins_700Bold" }]}>
              Apply {activeCount > 0 ? `(${activeCount})` : ""} Filters
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

/* ─── SORT BOTTOM SHEET ─── */
function SortSheet({ visible, activeSort, onSelect, onClose }: { visible: boolean; activeSort: string; onSelect: (s: string) => void; onClose: () => void }) {
  const colors = useColors();
  const slideY = useRef(new Animated.Value(400)).current;

  React.useEffect(() => {
    Animated.spring(slideY, { toValue: visible ? 0 : 400, useNativeDriver: true, damping: 22, stiffness: 200 }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <Animated.View style={[styles.sortSheet, { backgroundColor: colors.background, transform: [{ translateY: slideY }] }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Sort By</Text>
        </View>
        {SORT_OPTIONS.map((opt) => {
          const active = activeSort === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortRow, { borderBottomColor: colors.border, backgroundColor: active ? colors.primary + "10" : "transparent" }]}
              onPress={() => { Haptics.selectionAsync(); onSelect(opt.key); onClose(); }}
            >
              <View style={[styles.sortIcon, { backgroundColor: active ? colors.primary : colors.secondary }]}>
                <Ionicons name={opt.icon as any} size={16} color={active ? "#fff" : colors.mutedForeground} />
              </View>
              <Text style={[styles.sortLabel, { color: active ? colors.primary : colors.foreground, fontFamily: active ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>
                {opt.label}
              </Text>
              {active && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 24 }} />
      </Animated.View>
    </Modal>
  );
}

/* ─── VOICE MODAL ─── */
function VoiceModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [visible]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.voiceOverlay} onPress={onClose}>
        <View style={[styles.voiceCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.voiceTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Listening…</Text>
          <Text style={[styles.voiceSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Say something like "Show me silk sarees under ₹3000"
          </Text>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <LinearGradient colors={[colors.primary, colors.gold]} style={styles.voiceCircle}>
              <Ionicons name="mic" size={38} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <TouchableOpacity style={[styles.voiceCancel, { borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.voiceCancelText, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.voiceWaves}>
            {[0.5, 0.8, 0.6, 1, 0.7, 0.9, 0.55].map((h, i) => (
              <View key={i} style={[styles.voiceBar, { backgroundColor: colors.primary, height: 30 * h, opacity: 0.6 + h * 0.3 }]} />
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

/* ─── MAIN SCREEN ─── */
export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 80;

  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES ?? ["Silk Saree", "Kurta Set", "Silver Anklet"]);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
  const [sortKey, setSortKey] = useState("recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  const inputAnim = useRef(new Animated.Value(0)).current;
  const resultsAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => Animated.timing(inputAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onBlur = () => Animated.timing(inputAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = inputAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] });

  /* live results */
  const rawResults = useMemo(() => {
    if (!query.trim()) return [];
    return PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      (p.fabric ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (p.occasion ?? "").toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const filteredResults = useMemo(() => applySort(applyFilters(rawResults, filters), sortKey), [rawResults, filters, sortKey]);

  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return [
      ...PRODUCTS.filter((p) => p.name.toLowerCase().startsWith(q)).slice(0, 3).map((p) => ({ type: "product", label: p.name, id: p.id })),
      ...CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 2).map((c) => ({ type: "category", label: c.name, id: c.id })),
      ...(["Silk", "Cotton", "Chiffon", "Georgette"].filter((m) => m.toLowerCase().includes(q)).slice(0, 2).map((m) => ({ type: "material", label: m + " Collection", id: m }))),
    ].slice(0, 6);
  }, [query]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim() && !recentSearches.includes(text)) {
      setRecentSearches((prev) => [text, ...prev].slice(0, 8));
    }
  };

  const handleSelectSuggestion = (label: string) => {
    setQuery(label);
    handleSearch(label);
    inputRef.current?.blur();
  };

  const removeRecent = (s: string) => setRecentSearches((prev) => prev.filter((r) => r !== s));

  const activeFilterCount = Object.entries(filters).reduce((count, [k, v]) => {
    if (k === "priceMin" || k === "priceMax") return count;
    if (Array.isArray(v) && v.length > 0) return count + 1;
    if (typeof v === "boolean" && v) return count + 1;
    if (typeof v === "string" && v) return count + 1;
    if (typeof v === "number" && v > 0) return count + 1;
    return count;
  }, 0);

  const hasQuery = query.trim().length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ─── SEARCH BAR ─── */}
      <View style={[styles.searchHeader, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Animated.View style={[styles.inputWrap, { backgroundColor: colors.secondary, borderColor }]}>
          <Ionicons name="search" size={19} color={colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
            placeholder="Search sarees, lehengas, jewellery…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleSearch}
            onFocus={onFocus}
            onBlur={onBlur}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
          />
          {hasQuery ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
              <Ionicons name="close-circle" size={19} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity hitSlop={10} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowVoice(true); }}>
            <Ionicons name="mic-outline" size={19} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={[styles.cancelText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* ─── SUGGESTIONS DROPDOWN ─── */}
      {hasQuery && suggestions.length > 0 && (
        <View style={[styles.suggestionsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={`${s.id}-${i}`}
              style={[styles.suggestionRow, { borderBottomColor: colors.border, borderBottomWidth: i < suggestions.length - 1 ? StyleSheet.hairlineWidth : 0 }]}
              onPress={() => handleSelectSuggestion(s.label)}
            >
              <Ionicons
                name={s.type === "product" ? "shirt-outline" : s.type === "category" ? "grid-outline" : "layers-outline"}
                size={15}
                color={colors.primary}
              />
              <Text style={[styles.suggestionLabel, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}>
                {s.label}
              </Text>
              <Text style={[styles.suggestionType, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {s.type}
              </Text>
              <Ionicons name="return-up-back-outline" size={13} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ─── RESULTS TOOLBAR ─── */}
      {hasQuery && filteredResults.length > 0 && (
        <View style={[styles.toolbar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Text style={[styles.resultCount, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
            {filteredResults.length} results
          </Text>
          <View style={styles.toolbarRight}>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: activeFilterCount > 0 ? colors.primary : colors.secondary, borderColor: activeFilterCount > 0 ? colors.primary : colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setShowFilter(true); }}
            >
              <Ionicons name="options-outline" size={15} color={activeFilterCount > 0 ? "#fff" : colors.foreground} />
              <Text style={[styles.toolbarBtnText, { color: activeFilterCount > 0 ? "#fff" : colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setShowSort(true); }}
            >
              <Ionicons name="swap-vertical-outline" size={15} color={colors.foreground} />
              <Text style={[styles.toolbarBtnText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>Sort</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolbarIconBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setViewMode((v) => v === "grid" ? "list" : "grid"); }}
            >
              <Ionicons name={viewMode === "grid" ? "list-outline" : "grid-outline"} size={16} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad }} keyboardShouldPersistTaps="handled">
        {/* ─── EMPTY QUERY: Discovery UI ─── */}
        {!hasQuery && (
          <View style={styles.discoveryWrap}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Recent Searches</Text>
                  <TouchableOpacity onPress={() => setRecentSearches([])} hitSlop={8}>
                    <Text style={[styles.clearAll, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((s, i) => (
                  <View key={i} style={[styles.recentRow, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity style={styles.recentLeft} onPress={() => handleSelectSuggestion(s)}>
                      <View style={[styles.recentIcon, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="time-outline" size={15} color={colors.mutedForeground} />
                      </View>
                      <Text style={[styles.recentText, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}>{s}</Text>
                    </TouchableOpacity>
                    <View style={styles.recentRight}>
                      <TouchableOpacity hitSlop={8} onPress={() => handleSelectSuggestion(s)}>
                        <Ionicons name="return-up-back-outline" size={14} color={colors.mutedForeground} />
                      </TouchableOpacity>
                      <TouchableOpacity hitSlop={8} onPress={() => removeRecent(s)}>
                        <Ionicons name="close" size={14} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Trending Searches */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Trending Searches</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
                {(TRENDING_SEARCHES ?? ["Silk Saree", "Lehenga", "Kurti", "Anarkali", "Silver Set", "Bridal Wear"]).map((t, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.trendChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); handleSelectSuggestion(t); }}
                  >
                    <Ionicons name="trending-up" size={12} color={colors.gold} />
                    <Text style={[styles.trendText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Festival Collections */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Festival Collections</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
                {FESTIVAL_COLLECTIONS.map((f) => (
                  <TouchableOpacity
                    key={f.name}
                    onPress={() => handleSelectSuggestion(f.name)}
                  >
                    <LinearGradient colors={f.colors} style={styles.festCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name={f.icon as any} size={22} color="rgba(255,255,255,0.9)" />
                      <Text style={[styles.festName, { fontFamily: "Poppins_600SemiBold" }]}>{f.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Popular Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Popular Categories</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catItem, { backgroundColor: c.bgColor, borderColor: c.bgColor }]}
                    onPress={() => router.push({ pathname: "/category/[id]", params: { id: c.id, name: c.name } })}
                  >
                    <View style={[styles.catIcon, { backgroundColor: c.accentColor + "30" }]}>
                      <Ionicons name={c.icon as any} size={22} color={c.accentColor} />
                    </View>
                    <Text style={[styles.catName, { color: c.accentColor, fontFamily: "Poppins_600SemiBold" }]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Editor's Picks */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Editor's Picks</Text>
              <View style={styles.editorGrid}>
                {EDITOR_PICKS.map((e, i) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.editorChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleSelectSuggestion(e)}
                  >
                    <Text style={[styles.editorNum, { color: colors.gold, fontFamily: "Poppins_700Bold" }]}>#{i + 1}</Text>
                    <Text style={[styles.editorName, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* New Arrivals preview */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>New Arrivals</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/collections")} hitSlop={8}>
                  <Text style={[styles.clearAll, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {PRODUCTS.filter((p) => p.isNew).slice(0, 5).map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.newArrivalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => router.push({ pathname: "/product/[id]", params: { id: p.id } })}
                  >
                    <LinearGradient colors={p.gradientColors} style={styles.newArrivalImg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <View style={[styles.newBadge, { backgroundColor: "#16a34a" }]}>
                        <Text style={[styles.newBadgeText, { fontFamily: "Poppins_700Bold" }]}>NEW</Text>
                      </View>
                    </LinearGradient>
                    <View style={styles.newArrivalInfo}>
                      <Text style={[styles.newArrivalName, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]} numberOfLines={2}>{p.name}</Text>
                      <Text style={[styles.newArrivalPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>₹{p.price.toLocaleString()}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* ─── SEARCH RESULTS ─── */}
        {hasQuery && (
          <View style={styles.resultsWrap}>
            {filteredResults.length === 0 ? (
              /* No Results */
              <View style={styles.noResults}>
                <LinearGradient colors={[colors.secondary, colors.background]} style={styles.noResultsCircle}>
                  <Ionicons name="search-outline" size={44} color={colors.mutedForeground} />
                </LinearGradient>
                <Text style={[styles.noResultsTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                  No results for "{query}"
                </Text>
                <Text style={[styles.noResultsSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Try different keywords or browse categories
                </Text>
                <View style={styles.noResultsChips}>
                  {(TRENDING_SEARCHES ?? ["Silk Saree", "Lehenga", "Kurti"]).slice(0, 4).map((t, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.trendChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                      onPress={() => handleSelectSuggestion(t)}
                    >
                      <Text style={[styles.trendText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Recommended anyway */}
                <View style={{ width: "100%" }}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 12 }]}>You Might Like</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {PRODUCTS.slice(0, 5).map((p) => (
                      <View key={p.id} style={{ width: CARD_W }}>
                        <ResultCard product={p} />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : (
              /* Results Grid */
              <>
                {viewMode === "grid" ? (
                  <View style={styles.resultsGrid}>
                    {filteredResults.map((p) => (
                      <View key={p.id} style={{ width: CARD_W }}>
                        <ResultCard product={p} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.resultsList}>
                    {filteredResults.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => router.push({ pathname: "/product/[id]", params: { id: p.id } })}
                      >
                        <LinearGradient colors={p.gradientColors} style={styles.listImg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                        <View style={styles.listInfo}>
                          <Text style={[styles.listName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={2}>{p.name}</Text>
                          <Text style={[styles.listCat, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{p.category}</Text>
                          <View style={styles.listPriceRow}>
                            <Text style={[styles.listPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>₹{p.price.toLocaleString()}</Text>
                            <View style={[styles.listDiscount, { backgroundColor: "#dcfce7" }]}>
                              <Text style={[styles.listDiscountText, { fontFamily: "Poppins_600SemiBold" }]}>{p.discount}% OFF</Text>
                            </View>
                          </View>
                          <View style={styles.listRating}>
                            <Ionicons name="star" size={11} color={colors.gold} />
                            <Text style={[styles.listRatingText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{p.rating} · {p.reviews} reviews</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Smart Recommendations */}
                <View style={[styles.section, { paddingTop: 24 }]}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 12 }]}>
                    Customers Also Searched
                  </Text>
                  <View style={styles.trendingRow}>
                    {["Wedding Saree", "Festival Suit", "Bridal Lehenga", "Silk Dupatta", "Silver Set"].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.trendChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                        onPress={() => handleSelectSuggestion(t)}
                      >
                        <Ionicons name="search-outline" size={11} color={colors.primary} />
                        <Text style={[styles.trendText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 12 }]}>
                    Trending Today
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {PRODUCTS.filter((p) => p.isTrending).slice(0, 5).map((p) => (
                      <View key={p.id} style={{ width: CARD_W }}>
                        <ResultCard product={p} />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <FilterSheet visible={showFilter} filters={filters} onApply={(f) => { setFilters(f); setShowFilter(false); }} onClose={() => setShowFilter(false)} />
      <SortSheet visible={showSort} activeSort={sortKey} onSelect={setSortKey} onClose={() => setShowSort(false)} />
      <VoiceModal visible={showVoice} onClose={() => setShowVoice(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  input: { flex: 1, fontSize: 15, height: 22 },
  cancelText: { fontSize: 15 },

  suggestionsBox: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  suggestionRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  suggestionLabel: { flex: 1, fontSize: 14 },
  suggestionType: { fontSize: 11, textTransform: "capitalize" },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultCount: { fontSize: 13 },
  toolbarRight: { flexDirection: "row", gap: 8 },
  toolbarBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  toolbarBtnText: { fontSize: 13 },
  toolbarIconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  discoveryWrap: { paddingTop: 4 },
  section: { paddingHorizontal: 16, paddingVertical: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 17 },
  clearAll: { fontSize: 13 },

  recentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  recentLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  recentIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  recentText: { fontSize: 14 },
  recentRight: { flexDirection: "row", gap: 14, paddingLeft: 12 },

  trendingRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  trendChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, borderWidth: 1 },
  trendText: { fontSize: 13 },

  festCard: { width: 110, height: 80, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 6 },
  festName: { fontSize: 13, color: "#fff" },

  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catItem: { width: (W - 52) / 3, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  catIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  catName: { fontSize: 11, textAlign: "center" },

  editorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  editorChip: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  editorNum: { fontSize: 12 },
  editorName: { fontSize: 13 },

  newArrivalCard: { width: 140, borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  newArrivalImg: { height: 110 },
  newBadge: { margin: 8, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  newBadgeText: { fontSize: 9, color: "#fff" },
  newArrivalInfo: { padding: 8, gap: 3 },
  newArrivalName: { fontSize: 12, lineHeight: 17 },
  newArrivalPrice: { fontSize: 13 },

  resultsWrap: { padding: 12 },
  resultsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  resultsList: { gap: 12 },
  resultCard: { borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  resultImg: { height: CARD_W * 1.05 },
  resBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  resBadgeText: { fontSize: 9, color: "#fff" },
  resDiscountWrap: { position: "absolute", bottom: 8, left: 8, backgroundColor: "#16a34a", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  resDiscount: { fontSize: 9, color: "#fff" },
  resWishBtn: { position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  resInfo: { padding: 10, gap: 3 },
  resName: { fontSize: 12, lineHeight: 17 },
  resPriceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  resPrice: { fontSize: 14 },
  resOriginal: { fontSize: 11, textDecorationLine: "line-through" },
  resRatingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  resRating: { fontSize: 11 },
  resReviews: { fontSize: 10 },

  listCard: { flexDirection: "row", borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  listImg: { width: 100, height: 120 },
  listInfo: { flex: 1, padding: 12, gap: 4, justifyContent: "center" },
  listName: { fontSize: 13, lineHeight: 18 },
  listCat: { fontSize: 11 },
  listPriceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  listPrice: { fontSize: 16 },
  listDiscount: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  listDiscountText: { fontSize: 10, color: "#16a34a" },
  listRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  listRatingText: { fontSize: 11 },

  noResults: { alignItems: "center", gap: 16, paddingTop: 40, paddingHorizontal: 16 },
  noResultsCircle: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  noResultsTitle: { fontSize: 20, textAlign: "center" },
  noResultsSub: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  noResultsChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },

  // Filter Sheet
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  filterSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  sortSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle: { fontSize: 18 },
  sheetReset: { fontSize: 14 },
  sheetContent: { paddingHorizontal: 20, paddingTop: 8 },
  sheetActions: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1 },
  applyBtn: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  applyBtnText: { fontSize: 15, color: "#fff" },

  filterGroup: { marginBottom: 24 },
  filterGroupTitle: { fontSize: 15, marginBottom: 12 },
  priceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  priceChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  priceChipText: { fontSize: 12 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 13 },
  colorSwatch: { alignItems: "center", gap: 5, padding: 3, borderRadius: 22 },
  colorCircle: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  colorLabel: { fontSize: 9 },
  ratingRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  ratingChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },

  sortRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  sortIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  sortLabel: { flex: 1, fontSize: 15 },

  voiceOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "flex-end" },
  voiceCard: { width: "100%", borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 50, alignItems: "center", gap: 18 },
  voiceTitle: { fontSize: 22 },
  voiceSub: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  voiceCircle: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  voiceCancel: { borderWidth: 1, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25 },
  voiceCancelText: { fontSize: 15 },
  voiceWaves: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  voiceBar: { width: 5, borderRadius: 3 },
});
