import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended", icon: "sparkles-outline" },
  { id: "trending", label: "Trending", icon: "trending-up-outline" },
  { id: "newest", label: "Newest Arrivals", icon: "time-outline" },
  { id: "price_asc", label: "Price: Low to High", icon: "arrow-up-outline" },
  { id: "price_desc", label: "Price: High to Low", icon: "arrow-down-outline" },
  { id: "rating", label: "Highest Rated", icon: "star-outline" },
  { id: "bestselling", label: "Best Selling", icon: "flame-outline" },
  { id: "discount", label: "Biggest Discount", icon: "cut-outline" },
  { id: "featured", label: "Featured", icon: "ribbon-outline" },
];

interface SortSheetProps {
  visible: boolean;
  onClose: () => void;
  activeSort: string;
  onSelect: (sort: string) => void;
}

export function SortSheet({ visible, onClose, activeSort, onSelect }: SortSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Sort By</Text>

          {SORT_OPTIONS.map((opt, i) => {
            const isActive = activeSort === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.option,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: i < SORT_OPTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                    backgroundColor: isActive ? colors.primary + "0D" : "transparent",
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelect(opt.id);
                  onClose();
                }}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: isActive ? colors.primary + "20" : colors.secondary },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={16}
                      color={isActive ? colors.primary : colors.mutedForeground}
                    />
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isActive ? colors.primary : colors.foreground,
                        fontFamily: isActive ? "Poppins_600SemiBold" : "Poppins_400Regular",
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
                {isActive ? (
                  <View style={[styles.activeCheck, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                ) : (
                  <View style={[styles.radio, { borderColor: colors.border }]} />
                )}
              </TouchableOpacity>
            );
          })}
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 8 },
  title: { fontSize: 20, paddingHorizontal: 20, paddingBottom: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  optionText: { fontSize: 15 },
  activeCheck: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
});
