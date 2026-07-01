import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [notifications, setNotifications] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sections = [
    {
      title: "Preferences",
      items: [
        { icon: "notifications-outline", label: "Push Notifications", toggle: true, value: notifications, onChange: setNotifications },
        { icon: "mail-outline", label: "Promotional Emails", toggle: true, value: promotions, onChange: setPromotions },
        { icon: "moon-outline", label: "Dark Mode", toggle: true, value: darkMode, onChange: setDarkMode },
        { icon: "language-outline", label: "Language", value2: "English", toggle: false },
        { icon: "location-outline", label: "Default Location", value2: "Chennai", toggle: false },
      ],
    },
    {
      title: "Security",
      items: [
        { icon: "finger-print-outline", label: "Biometric Login", toggle: true, value: biometric, onChange: setBiometric },
        { icon: "key-outline", label: "Change Password", toggle: false, arrow: true },
        { icon: "shield-checkmark-outline", label: "Two-Factor Authentication", toggle: false, arrow: true },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        { icon: "document-text-outline", label: "Privacy Policy", toggle: false, arrow: true },
        { icon: "reader-outline", label: "Terms of Service", toggle: false, arrow: true },
        { icon: "trash-outline", label: "Delete Account", toggle: false, arrow: true, danger: true },
      ],
    },
    {
      title: "Help & Support",
      items: [
        { icon: "chatbubble-outline", label: "Live Chat", toggle: false, arrow: true },
        { icon: "call-outline", label: "Call Support", value2: "+91 44-1234-5678", toggle: false },
        { icon: "mail-outline", label: "Email Support", value2: "support@kasthuribai.in", toggle: false },
        { icon: "information-circle-outline", label: "App Version", value2: "v1.0.0", toggle: false },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {sections.map((section) => (
          <View key={section.title} style={{ marginBottom: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item: any, i) => (
                <Pressable
                  key={i}
                  style={[styles.settingRow, i < section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
                  onPress={() => {
                    if (!item.toggle) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={[styles.settingIcon, { backgroundColor: item.danger ? "#ef444418" : colors.primary + "12" }]}>
                    <Ionicons name={item.icon} size={18} color={item.danger ? "#ef4444" : colors.primary} />
                  </View>
                  <Text style={[styles.settingLabel, { color: item.danger ? "#ef4444" : colors.foreground }]}>{item.label}</Text>
                  <View style={{ flex: 1 }} />
                  {item.toggle && item.onChange ? (
                    <Switch
                      value={item.value}
                      onValueChange={(v) => { Haptics.selectionAsync(); item.onChange(v); }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  ) : item.value2 ? (
                    <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{item.value2}</Text>
                  ) : item.arrow ? (
                    <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* About */}
        <View style={[styles.aboutCard, { backgroundColor: colors.secondary }]}>
          <View style={[styles.aboutLogo, { backgroundColor: colors.primary }]}>
            <Text style={styles.aboutLogoText}>K</Text>
          </View>
          <Text style={[styles.aboutBrand, { color: colors.foreground }]}>Kasthuribai Ready Mades</Text>
          <Text style={[styles.aboutSub, { color: colors.mutedForeground }]}>Premium Indian Ethnic Wear</Text>
          <Text style={[styles.aboutVersion, { color: colors.mutedForeground }]}>Version 1.0.0 • Made with love in Chennai</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 18, fontWeight: "800" },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  sectionCard: { marginHorizontal: 16, borderRadius: 18, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 14, fontWeight: "500" },
  settingValue: { fontSize: 13 },
  aboutCard: { margin: 16, borderRadius: 18, padding: 24, alignItems: "center", gap: 6 },
  aboutLogo: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  aboutLogoText: { fontSize: 24, fontWeight: "800", color: "#fff" },
  aboutBrand: { fontSize: 17, fontWeight: "800" },
  aboutSub: { fontSize: 13 },
  aboutVersion: { fontSize: 12, marginTop: 4 },
});
