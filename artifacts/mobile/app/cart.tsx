import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import { PRODUCTS } from "@/constants/mockData";

const { width: W } = Dimensions.get("window");
const FREE_SHIPPING_THRESHOLD = 2000;

/* ─── Types ─── */
interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  gradientColors: [string, string];
  color: string;
  size: string;
  qty: number;
  badge?: string;
  deliveryDays?: number;
  isPremium?: boolean;
}

const AVAILABLE_COUPONS = [
  { code: "KASTHU10", desc: "10% off on orders above ₹999", savings: (sub: number) => Math.round(sub * 0.10), color: "#6B1A1A" },
  { code: "SILK20", desc: "₹200 off on silk sarees", savings: () => 200, color: "#8B6914" },
  { code: "FIRST50", desc: "₹50 off on first order", savings: () => 50, color: "#1A5C1A" },
];

const INITIAL_CART: CartItem[] = [
  { ...PRODUCTS[0], qty: 1, color: "Maroon", size: "Free Size" },
  { ...PRODUCTS[3], qty: 2, color: "Black", size: "L" },
  { ...PRODUCTS[6], qty: 1, color: "Gold", size: "M" },
];

const SAVED_FOR_LATER_INIT: CartItem[] = [
  { ...PRODUCTS[8], qty: 1, color: "Navy", size: "XL" },
  { ...PRODUCTS[10], qty: 1, color: "Pink", size: "M" },
];

/* ─── Cart Item Card ─── */
function CartItemCard({
  item,
  onQtyChange,
  onRemove,
  onMoveToWishlist,
  onSaveForLater,
}: {
  item: CartItem;
  onQtyChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onSaveForLater: (id: string) => void;
}) {
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(1)).current;
  const qtyScale = useRef(new Animated.Value(1)).current;
  const [showActions, setShowActions] = useState(false);

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onRemove(item.id));
  };

  const handleQty = (delta: number) => {
    if (item.qty + delta < 1) { handleRemove(); return; }
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.spring(qtyScale, { toValue: 1.3, useNativeDriver: true, speed: 80 }),
      Animated.spring(qtyScale, { toValue: 1, useNativeDriver: true, speed: 60 }),
    ]).start();
    onQtyChange(item.id, delta);
  };

  const deliveryDate = new Date(Date.now() + (item.deliveryDays ?? 4) * 86400000)
    .toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  return (
    <Animated.View style={{ opacity: slideAnim, transform: [{ scale: slideAnim }] }}>
      <View style={[styles.cartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Image */}
        <LinearGradient
          colors={item.gradientColors}
          style={styles.cartImg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.4)"]} style={StyleSheet.absoluteFill} />
          {item.badge && (
            <View style={[styles.cartImgBadge, { backgroundColor: item.badge === "Premium" || item.isPremium ? colors.gold : colors.primary }]}>
              <Text style={[styles.cartImgBadgeText, { fontFamily: "Poppins_700Bold" }]}>{item.badge}</Text>
            </View>
          )}
          <View style={styles.cartImgDiscount}>
            <Text style={[styles.cartImgDiscountText, { fontFamily: "Poppins_700Bold" }]}>{item.discount}% OFF</Text>
          </View>
        </LinearGradient>

        {/* Info */}
        <View style={styles.cartInfo}>
          <View style={styles.cartInfoTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cartCategory, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{item.category}</Text>
              <Text style={[styles.cartName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemove} hitSlop={10} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Meta chips */}
          <View style={styles.metaChips}>
            <View style={[styles.metaChip, { backgroundColor: colors.secondary }]}>
              <Ionicons name="color-palette-outline" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaChipText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{item.color}</Text>
            </View>
            {item.size !== "Free Size" && (
              <View style={[styles.metaChip, { backgroundColor: colors.secondary }]}>
                <Ionicons name="resize-outline" size={11} color={colors.mutedForeground} />
                <Text style={[styles.metaChipText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>Size {item.size}</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.cartPriceRow}>
            <Text style={[styles.cartPrice, { color: colors.primary, fontFamily: "Poppins_800ExtraBold" }]}>
              ₹{(item.price * item.qty).toLocaleString()}
            </Text>
            <Text style={[styles.cartOriginal, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              ₹{(item.originalPrice * item.qty).toLocaleString()}
            </Text>
            <View style={[styles.savingsBubble, { backgroundColor: "#dcfce7" }]}>
              <Text style={[styles.savingsBubbleText, { fontFamily: "Poppins_600SemiBold" }]}>
                Save ₹{((item.originalPrice - item.price) * item.qty).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Delivery */}
          <View style={styles.deliveryLine}>
            <Ionicons name="flash" size={11} color="#16a34a" />
            <Text style={[styles.deliveryText, { color: "#16a34a", fontFamily: "Poppins_500Medium" }]}>
              Delivery by {deliveryDate} · Free Shipping
            </Text>
          </View>

          {/* Qty + actions row */}
          <View style={styles.cartBottomRow}>
            {/* Quantity stepper */}
            <View style={[styles.qtyStepper, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.qtyStepBtn} onPress={() => handleQty(-1)}>
                <Ionicons name={item.qty === 1 ? "trash-outline" : "remove"} size={15} color={item.qty === 1 ? "#ef4444" : colors.foreground} />
              </TouchableOpacity>
              <Animated.Text style={[styles.qtyValue, { color: colors.foreground, fontFamily: "Poppins_700Bold", transform: [{ scale: qtyScale }] }]}>
                {item.qty}
              </Animated.Text>
              <TouchableOpacity style={styles.qtyStepBtn} onPress={() => handleQty(1)}>
                <Ionicons name="add" size={15} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Secondary actions */}
            <View style={styles.cartSecondary}>
              <TouchableOpacity style={styles.cartSecondaryBtn} onPress={() => { Haptics.selectionAsync(); onMoveToWishlist(item.id); }}>
                <Ionicons name="heart-outline" size={14} color={colors.primary} />
                <Text style={[styles.cartSecondaryText, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>Wishlist</Text>
              </TouchableOpacity>
              <Text style={[styles.cartSecondaryDot, { color: colors.border }]}>|</Text>
              <TouchableOpacity style={styles.cartSecondaryBtn} onPress={() => { Haptics.selectionAsync(); onSaveForLater(item.id); }}>
                <Ionicons name="bookmark-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.cartSecondaryText, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>Save Later</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seller */}
          <View style={styles.sellerRow}>
            <Ionicons name="storefront-outline" size={11} color={colors.mutedForeground} />
            <Text style={[styles.sellerText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Sold by Kasthuribai Ready Mades
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/* ─── Coupon Sheet ─── */
function CouponSheet({
  visible,
  subtotal,
  appliedCode,
  onApply,
  onClose,
}: {
  visible: boolean;
  subtotal: number;
  appliedCode: string;
  onApply: (code: string) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const slideY = useRef(new Animated.Value(500)).current;
  const [manualCode, setManualCode] = useState("");

  React.useEffect(() => {
    Animated.spring(slideY, { toValue: visible ? 0 : 500, useNativeDriver: true, damping: 22, stiffness: 200 }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View style={[styles.couponSheet, { backgroundColor: colors.background, transform: [{ translateY: slideY }] }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Apply Coupon</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Manual input */}
        <View style={styles.couponInputRow}>
          <TextInput
            style={[styles.couponInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
            placeholder="Enter coupon code"
            placeholderTextColor={colors.mutedForeground}
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.applyInputBtn, { backgroundColor: manualCode.length > 2 ? colors.primary : colors.border }]}
            onPress={() => { if (manualCode.length > 2) { onApply(manualCode); onClose(); } }}
          >
            <Text style={[styles.applyInputBtnText, { fontFamily: "Poppins_700Bold", color: manualCode.length > 2 ? "#fff" : colors.mutedForeground }]}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.couponList}>
          <Text style={[styles.couponListTitle, { color: colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>AVAILABLE OFFERS</Text>
          {AVAILABLE_COUPONS.map((c) => {
            const isApplied = appliedCode === c.code;
            const saving = c.savings(subtotal);
            return (
              <TouchableOpacity
                key={c.code}
                style={[styles.couponCard, { backgroundColor: colors.card, borderColor: isApplied ? c.color : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); onApply(c.code); onClose(); }}
              >
                <View style={styles.couponCardLeft}>
                  <View style={[styles.couponCodeBadge, { backgroundColor: c.color + "18", borderColor: c.color + "40" }]}>
                    <Text style={[styles.couponCode, { color: c.color, fontFamily: "Poppins_700Bold" }]}>{c.code}</Text>
                  </View>
                  <Text style={[styles.couponDesc, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{c.desc}</Text>
                  <Text style={[styles.couponSaving, { color: "#16a34a", fontFamily: "Poppins_600SemiBold" }]}>
                    Save ₹{saving.toLocaleString()}
                  </Text>
                </View>
                {isApplied ? (
                  <View style={[styles.couponAppliedChip, { backgroundColor: "#16a34a" }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                    <Text style={[styles.couponAppliedText, { fontFamily: "Poppins_600SemiBold" }]}>Applied</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.couponApplyBtn, { borderColor: c.color }]}
                    onPress={() => { Haptics.selectionAsync(); onApply(c.code); onClose(); }}
                  >
                    <Text style={[styles.couponApplyBtnText, { color: c.color, fontFamily: "Poppins_600SemiBold" }]}>Apply</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

/* ─── MAIN SCREEN ─── */
export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 100;

  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [savedItems, setSavedItems] = useState<CartItem[]>(SAVED_FOR_LATER_INIT);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [showCouponSheet, setShowCouponSheet] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const checkoutScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  /* Calculations */
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const totalMRP = cartItems.reduce((s, i) => s + i.originalPrice * i.qty, 0);
  const productSavings = totalMRP - subtotal;
  const couponObj = AVAILABLE_COUPONS.find((c) => c.code === appliedCoupon);
  const couponDiscount = couponObj ? couponObj.savings(subtotal) : 0;
  const delivery = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal - couponDiscount + delivery + gst;
  const totalSavings = productSavings + couponDiscount + (delivery === 0 ? 99 : 0);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);

  /* animate progress bar */
  React.useEffect(() => {
    Animated.timing(progressAnim, { toValue: freeShippingProgress, duration: 600, useNativeDriver: false }).start();
  }, [freeShippingProgress]);

  const handleQtyChange = (id: string, delta: number) => {
    setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0));
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleMoveToWishlist = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveForLater = (id: string) => {
    Haptics.selectionAsync();
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      setSavedItems((prev) => [...prev, item]);
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleMoveToCart = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const item = savedItems.find((i) => i.id === id);
    if (item) {
      setCartItems((prev) => [...prev, item]);
      setSavedItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleApplyCoupon = (code: string) => {
    setAppliedCoupon(code);
    setCouponSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setCouponSuccess(false));
  };

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.spring(checkoutScale, { toValue: 0.94, useNativeDriver: true, speed: 80 }),
      Animated.spring(checkoutScale, { toValue: 1, useNativeDriver: true, speed: 60 }),
    ]).start(() => router.push("/checkout"));
  };

  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

  /* ─── EMPTY CART ─── */
  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Poppins_800ExtraBold" }]}>Shopping Bag</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.emptyState}>
          <LinearGradient colors={[colors.secondary, colors.background]} style={styles.emptyCircle}>
            <Ionicons name="bag-outline" size={52} color={colors.mutedForeground} />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Your bag is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Add items to your bag to proceed with shopping
          </Text>
          <TouchableOpacity
            style={[styles.emptyShopBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/collections")}
          >
            <Text style={[styles.emptyShopBtnText, { fontFamily: "Poppins_700Bold" }]}>Explore Collections</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
          <View style={styles.emptyRecommendations}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Trending Now</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {PRODUCTS.slice(0, 5).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.emptyProductCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: "/product/[id]", params: { id: p.id } })}
                >
                  <LinearGradient colors={p.gradientColors} style={styles.emptyProductImg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                  <View style={styles.emptyProductInfo}>
                    <Text style={[styles.emptyProductName, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]} numberOfLines={2}>{p.name}</Text>
                    <Text style={[styles.emptyProductPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>₹{p.price.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ─── HEADER ─── */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Poppins_800ExtraBold" }]}>Shopping Bag</Text>
          <View style={[styles.headerCount, { backgroundColor: colors.primary }]}>
            <Text style={[styles.headerCountText, { fontFamily: "Poppins_700Bold" }]}>{itemCount}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity hitSlop={10} onPress={() => router.push("/(tabs)/wishlist")}>
            <Ionicons name="heart-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={10} onPress={() => router.push("/search")}>
            <Ionicons name="search-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad }}>

        {/* ─── SHOPPING SUMMARY CARD ─── */}
        <LinearGradient
          colors={[colors.primary, "#4A0E0E"]}
          style={styles.summaryHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.summaryGrid}>
            {[
              { label: "Items", value: itemCount.toString(), icon: "bag-handle" },
              { label: "You Save", value: `₹${totalSavings.toLocaleString()}`, icon: "sparkles" },
              { label: "Total MRP", value: `₹${totalMRP.toLocaleString()}`, icon: "pricetag" },
              { label: "Points", value: `${Math.round(grandTotal / 10)} pts`, icon: "trophy" },
            ].map((s) => (
              <View key={s.label} style={styles.summaryStat}>
                <Ionicons name={s.icon as any} size={16} color="rgba(255,255,255,0.7)" />
                <Text style={[styles.summaryStatVal, { fontFamily: "Poppins_800ExtraBold" }]}>{s.value}</Text>
                <Text style={[styles.summaryStatLabel, { fontFamily: "Poppins_400Regular" }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ─── FREE SHIPPING PROGRESS ─── */}
        <View style={[styles.shippingProgress, { backgroundColor: delivery === 0 ? "#dcfce7" : colors.secondary, borderColor: delivery === 0 ? "#16a34a40" : colors.border }]}>
          <View style={styles.shippingProgressTop}>
            <Ionicons name={delivery === 0 ? "checkmark-circle" : "bicycle-outline"} size={18} color={delivery === 0 ? "#16a34a" : colors.primary} />
            <Text style={[styles.shippingProgressText, { color: delivery === 0 ? "#16a34a" : colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              {delivery === 0
                ? "🎉 You've unlocked FREE Shipping!"
                : `Add ₹${freeShippingRemaining.toLocaleString()} more for FREE Shipping`}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: delivery === 0 ? "#16a34a" : colors.primary }]} />
          </View>
        </View>

        {/* ─── CART ITEMS ─── */}
        <View style={styles.cartSection}>
          {cartItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onQtyChange={handleQtyChange}
              onRemove={handleRemove}
              onMoveToWishlist={handleMoveToWishlist}
              onSaveForLater={handleSaveForLater}
            />
          ))}
        </View>

        {/* ─── DELIVERY ADDRESS ─── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={17} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Deliver To</Text>
          </View>
          <View style={[styles.addressRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={[styles.addressTagBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.addressTagText, { fontFamily: "Poppins_700Bold" }]}>HOME</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>Priya Krishnan</Text>
              <Text style={[styles.addressDetail, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                123 Anna Nagar, Chennai - 600040, Tamil Nadu
              </Text>
            </View>
            <TouchableOpacity hitSlop={8}>
              <Text style={[styles.changeLink, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.deliveryTimeline}>
            {[
              { icon: "cube-outline", label: "Packaging", done: true },
              { icon: "car-outline", label: "In Transit", done: false },
              { icon: "home-outline", label: "Delivered", done: false },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <View style={styles.timelineStep}>
                  <View style={[styles.timelineDot, { backgroundColor: step.done ? "#16a34a" : colors.secondary, borderColor: step.done ? "#16a34a" : colors.border }]}>
                    <Ionicons name={step.icon as any} size={11} color={step.done ? "#fff" : colors.mutedForeground} />
                  </View>
                  <Text style={[styles.timelineLabel, { color: step.done ? "#16a34a" : colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{step.label}</Text>
                </View>
                {i < 2 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ─── COUPON ─── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="pricetag" size={17} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Coupons & Offers</Text>
          </View>

          {appliedCoupon ? (
            <View style={[styles.appliedCouponCard, { backgroundColor: "#dcfce7", borderColor: "#16a34a40" }]}>
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.appliedCouponCode, { color: "#16a34a", fontFamily: "Poppins_700Bold" }]}>{appliedCoupon}</Text>
                <Text style={[styles.appliedCouponSaving, { color: "#16a34a", fontFamily: "Poppins_500Medium" }]}>
                  Saving ₹{couponDiscount.toLocaleString()} 🎉
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAppliedCoupon("")} hitSlop={10}>
                <Ionicons name="close-circle" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.couponCTA, { borderColor: colors.primary, backgroundColor: colors.primary + "08" }]}
              onPress={() => setShowCouponSheet(true)}
            >
              <Ionicons name="gift-outline" size={18} color={colors.primary} />
              <Text style={[styles.couponCTAText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                {AVAILABLE_COUPONS.length} offers available — Tap to apply
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ─── PRICE BREAKDOWN ─── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt" size={17} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Order Summary</Text>
          </View>

          <View style={styles.priceBreakdown}>
            {[
              { label: `Total MRP (${itemCount} items)`, value: `₹${totalMRP.toLocaleString()}`, color: colors.foreground },
              { label: "Product Discount", value: `-₹${productSavings.toLocaleString()}`, color: "#16a34a" },
              ...(couponDiscount > 0 ? [{ label: `Coupon (${appliedCoupon})`, value: `-₹${couponDiscount.toLocaleString()}`, color: "#16a34a" }] : []),
              { label: "Delivery Charges", value: delivery === 0 ? "FREE" : `₹${delivery}`, color: delivery === 0 ? "#16a34a" : colors.foreground },
              { label: "GST (5%)", value: `₹${gst.toLocaleString()}`, color: colors.foreground },
            ].map((row, i) => (
              <View key={i} style={[styles.priceRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.priceRowLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{row.label}</Text>
                <Text style={[styles.priceRowValue, { color: row.color, fontFamily: "Poppins_600SemiBold" }]}>{row.value}</Text>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Grand Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary, fontFamily: "Poppins_800ExtraBold" }]}>₹{grandTotal.toLocaleString()}</Text>
            </View>
            <View style={[styles.savingsSummary, { backgroundColor: "#dcfce7", borderColor: "#16a34a40" }]}>
              <Ionicons name="sparkles" size={14} color="#16a34a" />
              <Text style={[styles.savingsSummaryText, { color: "#16a34a", fontFamily: "Poppins_600SemiBold" }]}>
                You're saving ₹{totalSavings.toLocaleString()} on this order!
              </Text>
            </View>
          </View>
        </View>

        {/* ─── SAVE FOR LATER ─── */}
        {savedItems.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Saved for Later ({savedItems.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {savedItems.map((item) => (
                <View key={item.id} style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <LinearGradient colors={item.gradientColors} style={styles.savedImg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                  <View style={styles.savedInfo}>
                    <Text style={[styles.savedName, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[styles.savedPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>₹{item.price.toLocaleString()}</Text>
                    <View style={styles.savedActions}>
                      <TouchableOpacity
                        style={[styles.savedMoveBtn, { backgroundColor: colors.primary }]}
                        onPress={() => handleMoveToCart(item.id)}
                      >
                        <Text style={[styles.savedMoveBtnText, { fontFamily: "Poppins_600SemiBold" }]}>Move to Cart</Text>
                      </TouchableOpacity>
                      <TouchableOpacity hitSlop={10} onPress={() => setSavedItems((prev) => prev.filter((i) => i.id !== item.id))}>
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── SHOPPING BENEFITS ─── */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 12 }]}>Why Shop With Us</Text>
          <View style={styles.benefitsGrid}>
            {[
              { icon: "refresh-circle", label: "Free Returns", sub: "7-day policy", color: "#1A6B9B" },
              { icon: "lock-closed", label: "Secure Payment", sub: "256-bit SSL", color: "#6B1A1A" },
              { icon: "gift", label: "Premium Box", sub: "Gift packaging", color: "#C9A84C" },
              { icon: "ribbon", label: "Quality Assured", sub: "100% genuine", color: "#1A5C1A" },
              { icon: "flash", label: "Fast Delivery", sub: "2-5 business days", color: "#d97706" },
            ].map((b) => (
              <View key={b.label} style={[styles.benefitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.benefitIcon, { backgroundColor: b.color + "18" }]}>
                  <Ionicons name={b.icon as any} size={20} color={b.color} />
                </View>
                <Text style={[styles.benefitLabel, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>{b.label}</Text>
                <Text style={[styles.benefitSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{b.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── YOU MAY ALSO LIKE ─── */}
        <View style={styles.recommendSection}>
          <View style={styles.recommendHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>You May Also Like</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/collections")} hitSlop={8}>
              <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {PRODUCTS.filter((p) => !cartItems.find((c) => c.id === p.id)).slice(0, 6).map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.recommendCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: "/product/[id]", params: { id: p.id } })}
              >
                <LinearGradient colors={p.gradientColors} style={styles.recommendImg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  {p.discount > 20 && (
                    <View style={styles.recommendDiscount}>
                      <Text style={[styles.recommendDiscountText, { fontFamily: "Poppins_700Bold" }]}>{p.discount}% OFF</Text>
                    </View>
                  )}
                </LinearGradient>
                <View style={styles.recommendInfo}>
                  <Text style={[styles.recommendName, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]} numberOfLines={2}>{p.name}</Text>
                  <View style={styles.recommendPriceRow}>
                    <Text style={[styles.recommendPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>₹{p.price.toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.quickAddBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCartItems((prev) => [...prev, { ...p, qty: 1, color: p.colors?.[0] ?? "Default", size: p.sizes?.[0] ?? "Free Size" }]);
                    }}
                  >
                    <Ionicons name="add" size={14} color={colors.primary} />
                    <Text style={[styles.quickAddText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Add to Bag</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* ─── COUPON SUCCESS TOAST ─── */}
      <Animated.View style={[styles.successToast, { opacity: successOpacity, backgroundColor: "#16a34a" }]}>
        <Ionicons name="checkmark-circle" size={18} color="#fff" />
        <Text style={[styles.successToastText, { fontFamily: "Poppins_600SemiBold" }]}>
          {appliedCoupon} applied! Saving ₹{couponDiscount.toLocaleString()}
        </Text>
      </Animated.View>

      {/* ─── STICKY CHECKOUT BAR ─── */}
      <Animated.View
        style={[
          styles.checkoutBar,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 10, transform: [{ scale: checkoutScale }] },
        ]}
      >
        <View style={styles.checkoutLeft}>
          <Text style={[styles.checkoutTotal, { color: colors.primary, fontFamily: "Poppins_800ExtraBold" }]}>
            ₹{grandTotal.toLocaleString()}
          </Text>
          <Text style={[styles.checkoutSaving, { color: "#16a34a", fontFamily: "Poppins_500Medium" }]}>
            Save ₹{totalSavings.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCheckout} style={styles.checkoutBtnWrap}>
          <LinearGradient
            colors={[colors.primary, "#4A0E0E"]}
            style={styles.checkoutBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.checkoutBtnText, { fontFamily: "Poppins_800ExtraBold" }]}>Checkout</Text>
            <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Coupon Sheet */}
      <CouponSheet
        visible={showCouponSheet}
        subtotal={subtotal}
        appliedCode={appliedCoupon}
        onApply={handleApplyCoupon}
        onClose={() => setShowCouponSheet(false)}
      />
    </View>
  );
}

const CARD_W = Math.round(W * 0.52);

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18 },
  headerCount: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  headerCountText: { fontSize: 11, color: "#fff" },
  headerRight: { flexDirection: "row", gap: 14 },

  // Summary Hero
  summaryHero: { margin: 16, borderRadius: 20, padding: 18 },
  summaryGrid: { flexDirection: "row", justifyContent: "space-around" },
  summaryStat: { alignItems: "center", gap: 4 },
  summaryStatVal: { fontSize: 16, color: "#fff" },
  summaryStatLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)" },

  // Shipping Progress
  shippingProgress: { marginHorizontal: 16, marginBottom: 16, borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  shippingProgressTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  shippingProgressText: { flex: 1, fontSize: 13 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  // Cart Section
  cartSection: { paddingHorizontal: 16, gap: 14, marginBottom: 8 },

  // Cart Card
  cartCard: { flexDirection: "row", borderRadius: 18, overflow: "hidden", borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cartImg: { width: 116, minHeight: 160, justifyContent: "flex-end" },
  cartImgBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cartImgBadgeText: { fontSize: 9, color: "#fff" },
  cartImgDiscount: { margin: 8, backgroundColor: "#16a34a", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start" },
  cartImgDiscountText: { fontSize: 9, color: "#fff" },
  cartInfo: { flex: 1, padding: 12, gap: 6 },
  cartInfoTop: { flexDirection: "row", alignItems: "flex-start" },
  deleteBtn: { padding: 4 },
  cartCategory: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  cartName: { fontSize: 13, lineHeight: 18 },
  metaChips: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  metaChipText: { fontSize: 11 },
  cartPriceRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cartPrice: { fontSize: 16 },
  cartOriginal: { fontSize: 11, textDecorationLine: "line-through" },
  savingsBubble: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  savingsBubbleText: { fontSize: 10, color: "#16a34a" },
  deliveryLine: { flexDirection: "row", alignItems: "center", gap: 4 },
  deliveryText: { fontSize: 11 },
  cartBottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  qtyStepper: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1 },
  qtyStepBtn: { padding: 8 },
  qtyValue: { fontSize: 14, paddingHorizontal: 10 },
  cartSecondary: { flexDirection: "row", alignItems: "center", gap: 8 },
  cartSecondaryBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  cartSecondaryText: { fontSize: 11 },
  cartSecondaryDot: { fontSize: 14 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sellerText: { fontSize: 10 },

  // Card sections
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15 },

  // Address
  addressRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  addressTagBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  addressTagText: { fontSize: 9, color: "#fff", letterSpacing: 1 },
  addressName: { fontSize: 13 },
  addressDetail: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  changeLink: { fontSize: 13 },
  deliveryTimeline: { flexDirection: "row", alignItems: "center" },
  timelineStep: { alignItems: "center", gap: 4, flex: 1 },
  timelineDot: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  timelineLabel: { fontSize: 10, textAlign: "center" },
  timelineLine: { height: 1.5, flex: 1, marginBottom: 16 },

  // Coupon
  couponCTA: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 14, padding: 14 },
  couponCTAText: { flex: 1, fontSize: 14 },
  appliedCouponCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  appliedCouponCode: { fontSize: 15, letterSpacing: 0.5 },
  appliedCouponSaving: { fontSize: 13, marginTop: 2 },

  // Coupon Sheet
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  couponSheet: { position: "absolute", bottom: 0, left: 0, right: 0, maxHeight: "80%", borderTopLeftRadius: 28, borderTopRightRadius: 28, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle: { fontSize: 18 },
  couponInputRow: { flexDirection: "row", gap: 10, padding: 16 },
  couponInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, fontSize: 14, height: 48 },
  applyInputBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, justifyContent: "center" },
  applyInputBtnText: { fontSize: 14 },
  couponList: { paddingHorizontal: 16, paddingBottom: 30, gap: 12 },
  couponListTitle: { fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  couponCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 16 },
  couponCardLeft: { flex: 1, gap: 6 },
  couponCodeBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  couponCode: { fontSize: 15, letterSpacing: 1 },
  couponDesc: { fontSize: 13 },
  couponSaving: { fontSize: 13 },
  couponAppliedChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  couponAppliedText: { fontSize: 11, color: "#fff" },
  couponApplyBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  couponApplyBtnText: { fontSize: 13 },

  // Price breakdown
  priceBreakdown: { gap: 0 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  priceRowLabel: { fontSize: 14 },
  priceRowValue: { fontSize: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTopWidth: 1.5, marginTop: 2 },
  totalLabel: { fontSize: 16 },
  totalValue: { fontSize: 20 },
  savingsSummary: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  savingsSummaryText: { fontSize: 13, flex: 1 },

  // Saved for later
  savedSection: { paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  savedCard: { width: CARD_W, borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  savedImg: { height: CARD_W * 0.75 },
  savedInfo: { padding: 10, gap: 6 },
  savedName: { fontSize: 12, lineHeight: 17 },
  savedPrice: { fontSize: 14 },
  savedActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  savedMoveBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  savedMoveBtnText: { fontSize: 11, color: "#fff" },

  // Benefits
  benefitsSection: { paddingHorizontal: 16, paddingBottom: 8 },
  benefitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  benefitCard: { width: (W - 52) / 3, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  benefitIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  benefitLabel: { fontSize: 11, textAlign: "center" },
  benefitSub: { fontSize: 9, textAlign: "center" },

  // Recommendations
  recommendSection: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  recommendHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  seeAll: { fontSize: 13 },
  recommendCard: { width: 150, borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  recommendImg: { height: 120 },
  recommendDiscount: { position: "absolute", bottom: 8, left: 8, backgroundColor: "#16a34a", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  recommendDiscountText: { fontSize: 9, color: "#fff" },
  recommendInfo: { padding: 10, gap: 5 },
  recommendName: { fontSize: 12, lineHeight: 17 },
  recommendPriceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  recommendPrice: { fontSize: 14 },
  quickAddBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  quickAddText: { fontSize: 11 },

  sectionTitle: { fontSize: 17 },

  // Success toast
  successToast: { position: "absolute", top: 90, left: 24, right: 24, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, elevation: 10 },
  successToastText: { fontSize: 13, color: "#fff", flex: 1 },

  // Checkout bar
  checkoutBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  checkoutLeft: { gap: 2 },
  checkoutTotal: { fontSize: 22 },
  checkoutSaving: { fontSize: 12 },
  checkoutBtnWrap: { overflow: "hidden", borderRadius: 16 },
  checkoutBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 15 },
  checkoutBtnText: { fontSize: 16, color: "#fff" },

  // Empty
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 28 },
  emptyCircle: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 22, textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  emptyShopBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  emptyShopBtnText: { fontSize: 15, color: "#fff" },
  emptyRecommendations: { width: "100%", gap: 12 },
  emptyProductCard: { width: 140, borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  emptyProductImg: { height: 110 },
  emptyProductInfo: { padding: 8, gap: 4 },
  emptyProductName: { fontSize: 12, lineHeight: 17 },
  emptyProductPrice: { fontSize: 13 },
});
