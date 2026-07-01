import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { PRODUCTS } from "@/constants/mockData";

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  qty: number;
  gradientColors: [string, string];
  color: string;
  size: string;
}

const INITIAL_CART: CartItem[] = [
  { ...PRODUCTS[0], qty: 1, color: "Maroon", size: "Free Size" },
  { ...PRODUCTS[3], qty: 1, color: "Black", size: "L" },
];

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 90;

  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const updateQty = (id: string, delta: number) => {
    Haptics.selectionAsync();
    setCartItems((prev) =>
      prev
        .map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const savings = cartItems.reduce((sum, i) => sum + (i.originalPrice - i.price) * i.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = subtotal > 2000 ? 0 : 99;
  const total = subtotal - discount + delivery;

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Shopping Cart</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="bag-outline" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Add items to get started</Text>
          <Pressable
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/collections")}
          >
            <Text style={styles.shopBtnText}>Continue Shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Cart ({cartItems.length})</Text>
        <Pressable hitSlop={10}>
          <Text style={[styles.clearCart, { color: "#ef4444" }]}>Clear</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad }}>
        {/* Delivery Banner */}
        <View style={[styles.deliveryBanner, { backgroundColor: delivery === 0 ? "#16a34a18" : colors.secondary }]}>
          <Ionicons name={delivery === 0 ? "checkmark-circle" : "bicycle"} size={18} color={delivery === 0 ? "#16a34a" : colors.primary} />
          <Text style={[styles.deliveryBannerText, { color: delivery === 0 ? "#16a34a" : colors.foreground }]}>
            {delivery === 0 ? "Free delivery on your order!" : `Add ₹${(2000 - subtotal).toLocaleString()} more for free delivery`}
          </Text>
        </View>

        {/* Cart Items */}
        <View style={{ gap: 12, padding: 16 }}>
          {cartItems.map((item) => (
            <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient colors={item.gradientColors} style={styles.itemImage} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>{item.color} • {item.size}</Text>
                <View style={styles.itemPriceRow}>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{item.price.toLocaleString()}</Text>
                  <Text style={[styles.itemOrig, { color: colors.mutedForeground }]}>₹{item.originalPrice.toLocaleString()}</Text>
                </View>
                <View style={styles.itemControls}>
                  <View style={[styles.qtyControl, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                      <Ionicons name={item.qty === 1 ? "trash-outline" : "remove"} size={16} color={item.qty === 1 ? "#ef4444" : colors.foreground} />
                    </Pressable>
                    <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.qty}</Text>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                      <Ionicons name="add" size={16} color={colors.foreground} />
                    </Pressable>
                  </View>
                  <Pressable hitSlop={10}>
                    <Ionicons name="heart-outline" size={20} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Deliver To</Text>
          </View>
          <View style={styles.addressCard}>
            <View style={[styles.addressTag, { backgroundColor: colors.primary }]}>
              <Text style={styles.addressTagText}>HOME</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressName, { color: colors.foreground }]}>Priya Krishnan</Text>
              <Text style={[styles.addressText, { color: colors.mutedForeground }]}>123 Anna Nagar, Chennai - 600040</Text>
            </View>
            <Pressable>
              <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
            </Pressable>
          </View>
        </View>

        {/* Coupon */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Coupon / Promo Code</Text>
          </View>
          {couponApplied ? (
            <View style={[styles.appliedCoupon, { backgroundColor: "#16a34a12", borderColor: "#16a34a" }]}>
              <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              <Text style={[styles.appliedText, { color: "#16a34a" }]}>KRM10 applied — 10% off!</Text>
              <Pressable onPress={() => { setCouponApplied(false); setCoupon(""); }} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#ef4444" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                style={[styles.couponInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Enter coupon code"
                placeholderTextColor={colors.mutedForeground}
                value={coupon}
                onChangeText={setCoupon}
                autoCapitalize="characters"
              />
              <Pressable
                style={[styles.applyBtn, { backgroundColor: coupon.length > 0 ? colors.primary : colors.border }]}
                onPress={() => { if (coupon.length > 0) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setCouponApplied(true); } }}
              >
                <Text style={[styles.applyText, { color: coupon.length > 0 ? "#fff" : colors.mutedForeground }]}>Apply</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Price Summary */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Price Summary</Text>
          </View>
          <View style={styles.priceRows}>
            {[
              { label: "Subtotal", value: `₹${subtotal.toLocaleString()}` },
              { label: `Savings`, value: `-₹${savings.toLocaleString()}`, color: "#16a34a" },
              couponApplied && { label: "Coupon Discount", value: `-₹${discount.toLocaleString()}`, color: "#16a34a" },
              { label: "Delivery", value: delivery === 0 ? "FREE" : `₹${delivery}`, color: delivery === 0 ? "#16a34a" : undefined },
            ].filter(Boolean).map((row: any, i) => (
              <View key={i} style={[styles.priceRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.priceValue, { color: row.color ?? colors.foreground }]}>{row.value}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>₹{total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Suggested */}
        <View style={{ padding: 16 }}>
          <Text style={[styles.suggestTitle, { color: colors.foreground }]}>You may also like</Text>
          <FlatList
            data={PRODUCTS.slice(4, 8)}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <View style={{ width: 150 }}>
                <LinearGradient colors={item.gradientColors} style={styles.suggestCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.suggestName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.suggestPrice}>₹{item.price.toLocaleString()}</Text>
                </LinearGradient>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={[styles.checkoutBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
        <View>
          <Text style={[styles.checkoutTotal, { color: colors.primary }]}>₹{total.toLocaleString()}</Text>
          <Text style={[styles.checkoutSave, { color: "#16a34a" }]}>Saving ₹{(savings + discount).toLocaleString()}</Text>
        </View>
        <Pressable
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.push("/checkout"); }}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  clearCart: { fontSize: 13, fontWeight: "600" },
  deliveryBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, margin: 16, borderRadius: 12 },
  deliveryBannerText: { fontSize: 13, fontWeight: "600" },
  cartItem: { flexDirection: "row", borderRadius: 16, overflow: "hidden", borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  itemImage: { width: 110, height: 140 },
  itemInfo: { flex: 1, padding: 14, gap: 5 },
  itemName: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  itemMeta: { fontSize: 12 },
  itemPriceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemPrice: { fontSize: 16, fontWeight: "700" },
  itemOrig: { fontSize: 12, textDecorationLine: "line-through" },
  itemControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  qtyControl: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1 },
  qtyBtn: { padding: 8 },
  qtyText: { fontSize: 15, fontWeight: "700", paddingHorizontal: 12 },
  section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  addressCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  addressTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  addressTagText: { fontSize: 9, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  addressName: { fontSize: 13, fontWeight: "700" },
  addressText: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  changeText: { fontSize: 13, fontWeight: "700" },
  appliedCoupon: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  appliedText: { flex: 1, fontSize: 13, fontWeight: "600" },
  couponRow: { flexDirection: "row", gap: 10 },
  couponInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, fontSize: 14 },
  applyBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  applyText: { fontSize: 14, fontWeight: "700" },
  priceRows: { gap: 0 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: "800" },
  totalValue: { fontSize: 18, fontWeight: "800" },
  suggestTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  suggestCard: { borderRadius: 14, padding: 14, height: 120, justifyContent: "flex-end" },
  suggestName: { fontSize: 12, fontWeight: "600", color: "#fff", marginBottom: 4 },
  suggestPrice: { fontSize: 14, fontWeight: "800", color: "#fff" },
  checkoutBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  checkoutTotal: { fontSize: 20, fontWeight: "800" },
  checkoutSave: { fontSize: 12, fontWeight: "600" },
  checkoutBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14 },
  checkoutBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyText: { fontSize: 14 },
  shopBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  shopBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
