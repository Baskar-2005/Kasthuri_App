import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";

const MENU_ITEMS = [
  { icon: "location-outline", label: "My Addresses", badge: "2 saved" },
  { icon: "card-outline", label: "Saved Cards", badge: "1 card" },
  { icon: "gift-outline", label: "Rewards & Points", badge: "1,250 pts" },
  { icon: "pricetag-outline", label: "My Coupons", badge: "3 active" },
  { icon: "notifications-outline", label: "Notifications", badge: null },
  { icon: "help-circle-outline", label: "Help & Support", badge: null },
  { icon: "shield-checkmark-outline", label: "Privacy Policy", badge: null },
  { icon: "information-circle-outline", label: "About Us", badge: null },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 80;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingTop: topPad + 8 }}>
        <LinearGradient
          colors={[colors.primary, colors.maroonDark]}
          style={styles.profileGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileTop}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatar, { backgroundColor: colors.gold }]}>
                <Text style={styles.avatarText}>P</Text>
              </View>
              <View style={[styles.editBadge, { backgroundColor: "#fff" }]}>
                <Ionicons name="pencil" size={10} color={colors.primary} />
              </View>
            </View>
            <View>
              <Text style={styles.profileName}>Priya Krishnan</Text>
              <Text style={styles.profilePhone}>+91 98765 43210</Text>
              <Text style={styles.profileEmail}>priya@email.com</Text>
            </View>
          </View>

          {/* Reward Summary */}
          <View style={styles.rewardRow}>
            {[
              { label: "Orders", value: "12" },
              { label: "Wishlist", value: "8" },
              { label: "Points", value: "1,250" },
              { label: "Reviews", value: "4" },
            ].map((item, i) => (
              <View key={i} style={styles.rewardItem}>
                <Text style={styles.rewardValue}>{item.value}</Text>
                <Text style={styles.rewardLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* Membership Card */}
      <View style={{ padding: 16 }}>
        <LinearGradient
          colors={["#C9A84C", "#8B6914"]}
          style={styles.membershipCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View>
            <Text style={styles.membershipTag}>GOLD MEMBER</Text>
            <Text style={styles.membershipTitle}>Kasthuribai Royale</Text>
            <Text style={styles.membershipSub}>750 more points to Platinum</Text>
          </View>
          <Ionicons name="diamond" size={36} color="rgba(255,255,255,0.5)" />
        </LinearGradient>
      </View>

      {/* Menu Items */}
      <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MENU_ITEMS.map((item, i) => (
          <Pressable
            key={i}
            style={[styles.menuItem, i < MENU_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (item.label === "Notifications") router.push("/notifications");
              if (item.label.includes("Privacy") || item.label.includes("About")) router.push("/settings");
            }}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + "12" }]}>
              <Ionicons name={item.icon as any} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
            <View style={{ flex: 1 }} />
            {item.badge && (
              <Text style={[styles.menuBadge, { color: colors.mutedForeground }]}>{item.badge}</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      {/* Settings + Logout */}
      <View style={{ padding: 16, gap: 10 }}>
        <Pressable
          style={[styles.settingsBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings-outline" size={18} color={colors.foreground} />
          <Text style={[styles.settingsBtnText, { color: colors.foreground }]}>Settings</Text>
        </Pressable>
        <Pressable
          style={[styles.logoutBtn, { backgroundColor: "#ef444412", borderColor: "#ef4444" }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={[styles.logoutText]}>Log Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileGradient: { padding: 20, gap: 20 },
  profileTop: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#fff" },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 20, fontWeight: "800", color: "#fff" },
  profilePhone: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  profileEmail: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 1 },
  rewardRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 14 },
  rewardItem: { flex: 1, alignItems: "center", gap: 4 },
  rewardValue: { fontSize: 20, fontWeight: "800", color: "#fff" },
  rewardLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  membershipCard: { borderRadius: 18, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  membershipTag: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", letterSpacing: 2, marginBottom: 4 },
  membershipTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  membershipSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  menuCard: { marginHorizontal: 16, borderRadius: 18, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "500" },
  menuBadge: { fontSize: 12, marginRight: 4 },
  settingsBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  settingsBtnText: { fontSize: 15, fontWeight: "600" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#ef4444" },
});
