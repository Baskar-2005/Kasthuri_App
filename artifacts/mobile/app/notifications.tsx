import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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

interface NotifItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: NotifItem[] = [
  { id: "1", icon: "checkmark-circle", iconBg: "#16a34a18", iconColor: "#16a34a", title: "Order Delivered!", body: "Your Kanjivaram Silk Saree has been delivered. Rate your experience.", time: "2 mins ago", read: false },
  { id: "2", icon: "bicycle", iconBg: "#2563eb18", iconColor: "#2563eb", title: "Out for Delivery", body: "Your Bridal Lehenga Set is out for delivery. Expected by 6 PM.", time: "1 hour ago", read: false },
  { id: "3", icon: "pricetag", iconBg: "#C9A84C18", iconColor: "#C9A84C", title: "Festival Sale is LIVE!", body: "Up to 60% off on silk sarees and traditional wear. Shop now!", time: "3 hours ago", read: false },
  { id: "4", icon: "gift", iconBg: "#6B1A1A18", iconColor: "#6B1A1A", title: "You Earned 250 Points!", body: "Congratulations! You earned 250 reward points on your last purchase.", time: "Yesterday", read: true },
  { id: "5", icon: "star", iconBg: "#C9A84C18", iconColor: "#C9A84C", title: "Rate Your Purchase", body: "How did you like your Men's Sherwani? Share your experience.", time: "2 days ago", read: true },
  { id: "6", icon: "refresh-circle", iconBg: "#6B1A1A18", iconColor: "#6B1A1A", title: "Return Initiated", body: "Your return request for Order #KRM2024001 has been accepted.", time: "3 days ago", read: true },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const today = notifs.filter((n) => ["2 mins ago", "1 hour ago", "3 hours ago"].includes(n.time));
  const earlier = notifs.filter((n) => !["2 mins ago", "1 hour ago", "3 hours ago"].includes(n.time));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Notifications
          {unreadCount > 0 && <Text style={{ color: colors.primary }}> ({unreadCount})</Text>}
        </Text>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {today.length > 0 && (
          <>
            <Text style={[styles.group, { color: colors.mutedForeground }]}>Today</Text>
            {today.map((n) => (
              <NotifCard key={n.id} notif={n} colors={colors} onPress={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))} />
            ))}
          </>
        )}
        {earlier.length > 0 && (
          <>
            <Text style={[styles.group, { color: colors.mutedForeground }]}>Earlier</Text>
            {earlier.map((n) => (
              <NotifCard key={n.id} notif={n} colors={colors} onPress={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function NotifCard({ notif, colors, onPress }: { notif: NotifItem; colors: any; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.notifCard, {
        backgroundColor: notif.read ? colors.card : colors.primary + "08",
        borderColor: colors.border,
      }]}
      onPress={onPress}
    >
      {!notif.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      <View style={[styles.notifIcon, { backgroundColor: notif.iconBg }]}>
        <Ionicons name={notif.icon as any} size={22} color={notif.iconColor} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, { color: colors.foreground, fontWeight: notif.read ? "600" : "800" }]}>{notif.title}</Text>
          <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{notif.time}</Text>
        </View>
        <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>{notif.body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 18, fontWeight: "800" },
  markAll: { fontSize: 12, fontWeight: "700" },
  group: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, paddingHorizontal: 16, paddingVertical: 12 },
  notifCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, position: "relative" },
  unreadDot: { position: "absolute", top: 18, left: 6, width: 7, height: 7, borderRadius: 4 },
  notifIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  notifContent: { flex: 1, gap: 4 },
  notifHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  notifTitle: { flex: 1, fontSize: 14 },
  notifTime: { fontSize: 11, marginTop: 1 },
  notifBody: { fontSize: 13, lineHeight: 18 },
});
