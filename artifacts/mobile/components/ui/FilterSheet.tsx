import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface FilterState {
  categories: string[];
  occasions: string[];
  sizes: string[];
  colors: string[];
  materials: string[];
  priceRange: string;
  minDiscount: string;
  rating: string;
  sortBy: string;
}

const EMPTY_FILTERS: FilterState = {
  categories: [],
  occasions: [],
  sizes: [],
  colors: [],
  materials: [],
  priceRange: "",
  minDiscount: "",
  rating: "",
  sortBy: "",
};

const PRICE_RANGES = ["Under ₹1,000", "₹1,000 - ₹3,000", "₹3,000 - ₹6,000", "₹6,000 - ₹12,000", "Above ₹12,000"];
const OCCASIONS = ["Wedding", "Festival", "Bridal", "Casual", "Office Wear", "Party Wear", "Daily Wear"];
const SIZES_WOMEN = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const COLORS = ["Red", "Maroon", "Gold", "Blue", "Green", "Pink", "White", "Black", "Purple", "Silver"];
const MATERIALS = ["Silk", "Cotton", "Georgette", "Brocade", "Pashmina", "Rayon", "Silver"];
const DISCOUNTS = ["10% & above", "20% & above", "25% & above", "30% & above"];
const RATINGS = ["4.5★ & above", "4.0★ & above", "3.5★ & above"];
const CATEGORIES = ["Women", "Men", "Kids", "Silver", "Festival"];

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export function FilterSheet({ visible, onClose, filters, onApply }: FilterSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [local, setLocal] = useState<FilterState>(filters);
  const [activeSection, setActiveSection] = useState<string | null>("Category");

  useEffect(() => {
    if (visible) {
      setLocal(filters);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: SCREEN_HEIGHT, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const toggleItem = (field: keyof FilterState, item: string) => {
    Haptics.selectionAsync();
    setLocal((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  const setSingle = (field: keyof FilterState, value: string) => {
    Haptics.selectionAsync();
    setLocal((prev) => ({ ...prev, [field]: prev[field] === value ? "" : value }));
  };

  const activeCount = Object.values(local).reduce((acc, v) => {
    if (Array.isArray(v)) return acc + v.length;
    if (v) return acc + 1;
    return acc;
  }, 0);

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : "transparent",
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      {selected && <Ionicons name="checkmark" size={11} color="#fff" style={{ marginRight: 2 }} />}
      <Text style={[styles.chipText, { color: selected ? "#fff" : colors.foreground }]}>{label}</Text>
    </TouchableOpacity>
  );

  const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: string;
    children: React.ReactNode;
  }) => {
    const open = activeSection === title;
    return (
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveSection(open ? null : title);
          }}
        >
          <View style={styles.sectionLeft}>
            <Ionicons name={icon as any} size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>{title}</Text>
          </View>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
        {open && <View style={styles.sectionBody}>{children}</View>}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom + 80,
            },
          ]}
        >
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                Filters {activeCount > 0 && <Text style={{ color: colors.primary }}>({activeCount})</Text>}
              </Text>
              <TouchableOpacity onPress={() => setLocal(EMPTY_FILTERS)}>
                <Text style={[styles.clearAll, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Section title="Category" icon="grid-outline">
              <View style={styles.chipWrap}>
                {CATEGORIES.map((c) => renderChip(c, local.categories.includes(c), () => toggleItem("categories", c)))}
              </View>
            </Section>

            <Section title="Price Range" icon="pricetag-outline">
              <View style={styles.chipWrap}>
                {PRICE_RANGES.map((p) => renderChip(p, local.priceRange === p, () => setSingle("priceRange", p)))}
              </View>
            </Section>

            <Section title="Occasion" icon="calendar-outline">
              <View style={styles.chipWrap}>
                {OCCASIONS.map((o) => renderChip(o, local.occasions.includes(o), () => toggleItem("occasions", o)))}
              </View>
            </Section>

            <Section title="Size" icon="resize-outline">
              <View style={styles.chipWrap}>
                {SIZES_WOMEN.map((s) => renderChip(s, local.sizes.includes(s), () => toggleItem("sizes", s)))}
              </View>
            </Section>

            <Section title="Color" icon="color-palette-outline">
              <View style={styles.chipWrap}>
                {COLORS.map((c) => renderChip(c, local.colors.includes(c), () => toggleItem("colors", c)))}
              </View>
            </Section>

            <Section title="Material / Fabric" icon="shirt-outline">
              <View style={styles.chipWrap}>
                {MATERIALS.map((m) => renderChip(m, local.materials.includes(m), () => toggleItem("materials", m)))}
              </View>
            </Section>

            <Section title="Min. Discount" icon="cut-outline">
              <View style={styles.chipWrap}>
                {DISCOUNTS.map((d) => renderChip(d, local.minDiscount === d, () => setSingle("minDiscount", d)))}
              </View>
            </Section>

            <Section title="Customer Rating" icon="star-outline">
              <View style={styles.chipWrap}>
                {RATINGS.map((r) => renderChip(r, local.rating === r, () => setSingle("rating", r)))}
              </View>
            </Section>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={[styles.clearBtn, { borderColor: colors.border }]}
              onPress={() => { setLocal(EMPTY_FILTERS); onClose(); }}
            >
              <Text style={[styles.clearBtnText, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onApply(local); onClose(); }}
            >
              <Text style={[styles.applyBtnText, { fontFamily: "Poppins_700Bold" }]}>
                Apply {activeCount > 0 ? `(${activeCount})` : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  sheetHeader: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 20 },
  clearAll: { fontSize: 14 },
  scrollContent: { paddingBottom: 16 },
  section: { borderBottomWidth: StyleSheet.hairlineWidth },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  sectionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 14 },
  sectionBody: { paddingHorizontal: 20, paddingBottom: 14 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: { fontSize: 12.5, fontFamily: "Poppins_500Medium" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
  },
  clearBtn: { flex: 1, borderWidth: 1.5, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  clearBtnText: { fontSize: 15 },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  applyBtnText: { fontSize: 15, color: "#fff" },
});
