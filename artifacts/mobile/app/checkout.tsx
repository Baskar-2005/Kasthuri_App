import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

const DELIVERY_SLOTS = [
  { id: "1", label: "Today", time: "6 PM – 9 PM", extra: "Express" },
  { id: "2", label: "Tomorrow", time: "10 AM – 1 PM", extra: "Standard" },
  { id: "3", label: "Tomorrow", time: "2 PM – 6 PM", extra: "Standard" },
];

const PAYMENT_METHODS = [
  { id: "upi", icon: "phone-portrait-outline", label: "UPI", sub: "Pay via any UPI app" },
  { id: "card", icon: "card-outline", label: "Credit / Debit Card", sub: "All major cards accepted" },
  { id: "netbanking", icon: "business-outline", label: "Net Banking", sub: "All major banks" },
  { id: "cod", icon: "cash-outline", label: "Cash on Delivery", sub: "Pay when you receive" },
];

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 90;

  const [selectedSlot, setSelectedSlot] = useState("1");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [step, setStep] = useState(1); // 1: address, 2: delivery, 3: payment, 4: summary

  const STEPS = ["Address", "Delivery", "Payment", "Review"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Checkout</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Step Indicator */}
      <View style={[styles.stepBar, { backgroundColor: colors.background }]}>
        {STEPS.map((s, i) => {
          const done = i + 1 < step;
          const active = i + 1 === step;
          return (
            <React.Fragment key={s}>
              <Pressable style={styles.stepItem} onPress={() => i + 1 <= step && setStep(i + 1)}>
                <View style={[styles.stepDot, {
                  backgroundColor: done || active ? colors.primary : colors.border,
                  borderColor: active ? colors.gold : "transparent",
                  borderWidth: active ? 2 : 0,
                }]}>
                  {done
                    ? <Ionicons name="checkmark" size={12} color="#fff" />
                    : <Text style={[styles.stepNum, { color: active ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
                  }
                </View>
                <Text style={[styles.stepLabel, { color: active ? colors.primary : done ? colors.foreground : colors.mutedForeground, fontWeight: active ? "700" : "400" }]}>{s}</Text>
              </Pressable>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, { backgroundColor: i + 1 < step ? colors.primary : colors.border }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: bottomPad, gap: 16 }}>
        {/* Address Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Delivery Address</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={[styles.changeBtn, { color: colors.primary }]}>Change</Text>
            </Pressable>
          </View>
          <View style={[styles.addressBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={[styles.homeTag, { backgroundColor: colors.primary }]}>
              <Text style={styles.homeTagText}>HOME</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addrName, { color: colors.foreground }]}>Priya Krishnan</Text>
              <Text style={[styles.addrText, { color: colors.mutedForeground }]}>123 Anna Nagar, Chennai{"\n"}Tamil Nadu – 600 040</Text>
              <Text style={[styles.addrPhone, { color: colors.mutedForeground }]}>+91 98765 43210</Text>
            </View>
          </View>
        </View>

        {/* Delivery Slot */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Delivery Slot</Text>
          </View>
          <View style={styles.slotsRow}>
            {DELIVERY_SLOTS.map((slot) => (
              <Pressable
                key={slot.id}
                style={[styles.slotCard, {
                  backgroundColor: selectedSlot === slot.id ? colors.primary + "12" : colors.secondary,
                  borderColor: selectedSlot === slot.id ? colors.primary : colors.border,
                }]}
                onPress={() => { Haptics.selectionAsync(); setSelectedSlot(slot.id); }}
              >
                <Text style={[styles.slotDay, { color: colors.foreground }]}>{slot.label}</Text>
                <Text style={[styles.slotTime, { color: colors.mutedForeground }]}>{slot.time}</Text>
                <View style={[styles.slotTag, { backgroundColor: selectedSlot === slot.id ? colors.gold : colors.border }]}>
                  <Text style={[styles.slotTagText, { color: selectedSlot === slot.id ? "#fff" : colors.mutedForeground }]}>{slot.extra}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Payment Method</Text>
          </View>
          {PAYMENT_METHODS.map((pm, i) => (
            <Pressable
              key={pm.id}
              style={[styles.payRow, i < PAYMENT_METHODS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
              onPress={() => { Haptics.selectionAsync(); setSelectedPayment(pm.id); }}
            >
              <View style={[styles.payIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name={pm.icon as any} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.payLabel, { color: colors.foreground }]}>{pm.label}</Text>
                <Text style={[styles.paySub, { color: colors.mutedForeground }]}>{pm.sub}</Text>
              </View>
              <View style={[styles.radio, {
                borderColor: selectedPayment === pm.id ? colors.primary : colors.border,
                backgroundColor: selectedPayment === pm.id ? colors.primary : "transparent",
              }]}>
                {selectedPayment === pm.id && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Order Summary */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name="receipt-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Order Summary</Text>
          </View>
          {[
            { label: "Kanjivaram Silk Saree × 1", value: "₹4,299" },
            { label: "Men's Sherwani × 1", value: "₹6,599" },
          ].map((row, i) => (
            <View key={i} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
          {[
            { label: "Subtotal", value: "₹10,898" },
            { label: "Delivery", value: "FREE", green: true },
            { label: "Savings", value: "-₹2,500", green: true },
          ].map((row, i) => (
            <View key={i} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.summaryValue, { color: row.green ? "#16a34a" : colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Grand Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₹8,398</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.payBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }}
        >
          <LinearGradient
            colors={[colors.primary, colors.maroonDark]}
            style={styles.payBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="lock-closed" size={16} color="#fff" />
            <Text style={styles.payBtnText}>Pay ₹8,398 Securely</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  stepBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 12, fontWeight: "700" },
  stepLabel: { fontSize: 10, textAlign: "center" },
  stepLine: { flex: 1, height: 2, marginBottom: 16 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 14, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  changeBtn: { fontSize: 13, fontWeight: "700" },
  addressBox: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  homeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" },
  homeTagText: { fontSize: 9, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  addrName: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  addrText: { fontSize: 13, lineHeight: 19 },
  addrPhone: { fontSize: 12, marginTop: 4 },
  slotsRow: { flexDirection: "row", gap: 10 },
  slotCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1.5, gap: 4, alignItems: "center" },
  slotDay: { fontSize: 13, fontWeight: "700" },
  slotTime: { fontSize: 11, textAlign: "center" },
  slotTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  slotTagText: { fontSize: 10, fontWeight: "700" },
  payRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  payIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payLabel: { fontSize: 14, fontWeight: "600" },
  paySub: { fontSize: 12, marginTop: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: "800" },
  totalValue: { fontSize: 18, fontWeight: "800" },
  payBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  payBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
});
