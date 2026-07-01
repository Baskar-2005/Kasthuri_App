import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Order } from "@/constants/mockData";

const STATUS_CONFIG = {
  Delivered: { color: "#16a34a", icon: "checkmark-circle" as const, step: 3 },
  "In Transit": { color: "#2563eb", icon: "bicycle" as const, step: 2 },
  Processing: { color: "#d97706", icon: "time" as const, step: 1 },
  Cancelled: { color: "#ef4444", icon: "close-circle" as const, step: 0 },
};

export function OrderCard({ order }: { order: Order }) {
  const colors = useColors();
  const status = STATUS_CONFIG[order.status];

  const steps = ["Placed", "Processing", "Shipped", "Delivered"];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.orderId, { color: colors.foreground }]}>#{order.orderId}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{order.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + "18" }]}>
          <Ionicons name={status.icon} size={13} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{order.status}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {order.items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <View style={[styles.itemDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>x{item.qty}</Text>
          <Text style={[styles.itemPrice, { color: colors.foreground }]}>₹{item.price.toLocaleString()}</Text>
        </View>
      ))}

      {order.status !== "Cancelled" && (
        <View style={styles.timeline}>
          {steps.map((step, i) => {
            const done = i <= status.step;
            const active = i === status.step;
            return (
              <View key={step} style={styles.timelineStep}>
                <View style={[
                  styles.timelineDot,
                  { backgroundColor: done ? colors.primary : colors.border, borderColor: active ? colors.gold : "transparent" }
                ]}>
                  {done && <Ionicons name="checkmark" size={10} color="#fff" />}
                </View>
                {i < steps.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: i < status.step ? colors.primary : colors.border }]} />
                )}
                <Text style={[styles.timelineLabel, { color: done ? colors.foreground : colors.mutedForeground, fontWeight: active ? "700" : "400" }]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.total, { color: colors.foreground }]}>Total: <Text style={{ color: colors.primary, fontWeight: "800" }}>₹{order.total.toLocaleString()}</Text></Text>
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, { borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[styles.actionText, { color: colors.foreground }]}>Invoice</Text>
          </Pressable>
          {order.status === "Delivered" && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[styles.actionText, { color: "#fff" }]}>Buy Again</Text>
            </Pressable>
          )}
          {order.status === "In Transit" && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: "#2563eb", borderColor: "#2563eb" }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[styles.actionText, { color: "#fff" }]}>Track</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  orderId: { fontSize: 14, fontWeight: "700" },
  date: { fontSize: 12, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "700" },
  divider: { height: 1 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemDot: { width: 6, height: 6, borderRadius: 3 },
  itemName: { flex: 1, fontSize: 13 },
  itemQty: { fontSize: 13 },
  itemPrice: { fontSize: 13, fontWeight: "600" },
  timeline: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  timelineStep: { flex: 1, alignItems: "center", gap: 4 },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  timelineLine: { position: "absolute", top: 11, left: "50%", right: "-50%", height: 2 },
  timelineLabel: { fontSize: 10, textAlign: "center" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  total: { fontSize: 14 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: "600" },
});
