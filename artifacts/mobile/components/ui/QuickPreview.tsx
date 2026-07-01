import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import type { Product } from "@/constants/mockData";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.78;

interface QuickPreviewProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onWishlistToggle?: (id: string) => void;
}

export function QuickPreview({ product, visible, onClose, onWishlistToggle }: QuickPreviewProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);

  useEffect(() => {
    if (visible && product) {
      setSelectedSize(product.sizes?.[0] ?? null);
      setSelectedColor(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: SHEET_HEIGHT,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, product]);

  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <LinearGradient
              colors={product.gradientColors}
              style={styles.heroImage}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)"]}
                style={styles.imageOverlay}
              >
                {product.badge && (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{product.badge}</Text>
                  </View>
                )}
              </LinearGradient>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={10}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.wishlistOverlay}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onWishlistToggle?.(product.id);
                }}
                hitSlop={8}
              >
                <Ionicons
                  name={product.isWishlisted ? "heart" : "heart-outline"}
                  size={22}
                  color={product.isWishlisted ? "#ef4444" : "#fff"}
                />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.content}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  {(product.isNew || product.isTrending) && (
                    <Text style={[styles.tag, { color: product.isNew ? "#16a34a" : "#d97706" }]}>
                      {product.isNew ? "NEW ARRIVAL" : "🔥 TRENDING"}
                    </Text>
                  )}
                  <Text style={[styles.name, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                    {product.name}
                  </Text>
                  {product.subtitle && (
                    <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                      {product.subtitle}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name={i <= Math.floor(product.rating) ? "star" : "star-outline"} size={14} color={colors.gold} />
                ))}
                <Text style={[styles.ratingNum, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {product.rating}
                </Text>
                <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>
                  ({product.reviews} reviews)
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.primary, fontFamily: "Poppins_800ExtraBold" }]}>
                  ₹{product.price.toLocaleString()}
                </Text>
                <Text style={[styles.mrp, { color: colors.mutedForeground }]}>
                  ₹{product.originalPrice.toLocaleString()}
                </Text>
                <View style={styles.discountPill}>
                  <Text style={styles.discountText}>{product.discount}% OFF</Text>
                </View>
              </View>

              {product.sizes && product.sizes.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    Size
                    {selectedSize && <Text style={[styles.sectionValue, { color: colors.mutedForeground }]}> · {selectedSize}</Text>}
                  </Text>
                  <View style={styles.sizeRow}>
                    {product.sizes.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.sizeChip,
                          {
                            borderColor: selectedSize === s ? colors.primary : colors.border,
                            backgroundColor: selectedSize === s ? colors.primary + "15" : "transparent",
                          },
                        ]}
                        onPress={() => { Haptics.selectionAsync(); setSelectedSize(s); }}
                      >
                        <Text style={[styles.sizeText, { color: selectedSize === s ? colors.primary : colors.foreground, fontFamily: selectedSize === s ? "Poppins_600SemiBold" : "Poppins_400Regular" }]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {product.colorHex && product.colors && product.colorHex.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    Color
                    {selectedColor !== null && product.colors[selectedColor] && (
                      <Text style={[styles.sectionValue, { color: colors.mutedForeground }]}> · {product.colors[selectedColor]}</Text>
                    )}
                  </Text>
                  <View style={styles.colorRow}>
                    {product.colorHex.map((hex, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: hex, borderColor: selectedColor === i ? colors.primary : "transparent" },
                        ]}
                        onPress={() => { Haptics.selectionAsync(); setSelectedColor(i); }}
                      >
                        {selectedColor === i && (
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {product.description && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>About</Text>
                  <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                    {product.description}
                  </Text>
                </View>
              )}

              <View style={styles.metaRow}>
                {product.fabric && (
                  <View style={[styles.metaChip, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="shirt-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{product.fabric}</Text>
                  </View>
                )}
                {product.deliveryDays && (
                  <View style={[styles.metaChip, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="flash-outline" size={12} color={colors.gold} />
                    <Text style={[styles.metaText, { color: colors.gold }]}>
                      {product.deliveryDays <= 2 ? "Fast Delivery" : `${product.deliveryDays}d Delivery`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cartBtn, { borderColor: colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClose();
              }}
            >
              <Ionicons name="bag-add-outline" size={18} color={colors.primary} />
              <Text style={[styles.cartBtnText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buyBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClose();
                router.push({ pathname: "/product/[id]", params: { id: product.id } });
              }}
            >
              <Text style={[styles.buyBtnText, { fontFamily: "Poppins_600SemiBold" }]}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SHEET_HEIGHT,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 },
    elevation: 20,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  heroImage: { height: 240, position: "relative" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
  },
  heroBadge: {
    backgroundColor: "#C9A84C",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistOverlay: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 20, gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "flex-start" },
  tag: { fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 0.5, marginBottom: 2 },
  name: { fontSize: 20, lineHeight: 28 },
  subtitle: { fontSize: 13, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  ratingNum: { fontSize: 14 },
  reviewCount: { fontSize: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" },
  price: { fontSize: 24 },
  mrp: { fontSize: 14, textDecorationLine: "line-through" },
  discountPill: { backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  discountText: { fontSize: 11, fontWeight: "700", color: "#16a34a" },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 14, marginBottom: 10 },
  sectionValue: { fontFamily: "Poppins_400Regular" },
  sizeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  sizeChip: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  sizeText: { fontSize: 13 },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  description: { fontSize: 13.5, lineHeight: 21 },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 12 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  metaText: { fontSize: 11 },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  cartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
  },
  cartBtnText: { fontSize: 14 },
  buyBtn: {
    flex: 1.3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buyBtnText: { fontSize: 14, color: "#fff" },
});
