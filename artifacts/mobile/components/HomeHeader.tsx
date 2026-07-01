import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface HomeHeaderProps {
  cartCount?: number;
  notificationCount?: number;
}

export function HomeHeader({ cartCount = 0, notificationCount = 3 }: HomeHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background }]}>
      <View style={styles.row}>
        <View style={styles.brandBlock}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoLetter, { color: colors.cream }]}>K</Text>
          </View>
          <View>
            <Text style={[styles.brandName, { color: colors.primary }]}>Kasthuribai</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={11} color={colors.gold} />
              <Text style={[styles.locationText, { color: colors.mutedForeground }]}>Chennai, Tamil Nadu</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/search")}
            hitSlop={6}
          >
            <Ionicons name="search" size={20} color={colors.foreground} />
          </Pressable>

          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/notifications")}
            hitSlop={6}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
            {notificationCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}
        onPress={() => router.push("/search")}
      >
        <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
        <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
          Search sarees, lehengas, jewellery...
        </Text>
        <View style={[styles.micBtn, { backgroundColor: colors.primary + "18" }]}>
          <Ionicons name="mic-outline" size={15} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  brandBlock: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  brandName: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 },
  locationText: { fontSize: 11 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchPlaceholder: { flex: 1, fontSize: 13 },
  micBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
