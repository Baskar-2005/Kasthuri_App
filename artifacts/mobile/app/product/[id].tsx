import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ui/ProductCard";
import { useColors } from "@/hooks/useColors";
import { PRODUCTS, REVIEWS } from "@/constants/mockData";
import { ReviewCard } from "@/components/ReviewCard";

const { width: W } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 5);

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const gradientSets: [string, string][] = [
    product.gradientColors,
    [product.gradientColors[1], product.gradientColors[0]],
    ["#3D1C02", "#6B1A1A"],
  ];

  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 100;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.gallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / W);
              setActiveImageIndex(idx);
            }}
          >
            {gradientSets.map((g, i) => (
              <LinearGradient
                key={i}
                colors={g}
                style={{ width: W, height: 400 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            ))}
          </ScrollView>

          {/* Header Controls */}
          <View style={[styles.galleryHeader, { paddingTop: topPad + 8 }]}>
            <Pressable
              style={[styles.galleryBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.galleryRight}>
              <Pressable
                style={[styles.galleryBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWishlisted((w) => !w); }}
              >
                <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={20} color={wishlisted ? "#ef4444" : "#fff"} />
              </Pressable>
              <Pressable style={[styles.galleryBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                <Ionicons name="share-social-outline" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Image Dots */}
          <View style={styles.imageDots}>
            {gradientSets.map((_, i) => (
              <View
                key={i}
                style={[styles.imageDot, {
                  backgroundColor: "#fff",
                  width: i === activeImageIndex ? 18 : 6,
                  opacity: i === activeImageIndex ? 1 : 0.5,
                }]}
              />
            ))}
          </View>

          {product.badge && (
            <View style={[styles.galleryBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.galleryBadgeText}>{product.badge}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
          {/* Category & Rating */}
          <View style={styles.metaRow}>
            <Text style={[styles.categoryTag, { color: colors.mutedForeground }]}>{product.category}</Text>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={13} color={colors.gold} />
              <Text style={[styles.ratingText, { color: colors.foreground }]}>{product.rating}</Text>
              <Text style={[styles.reviewsText, { color: colors.mutedForeground }]}>({product.reviews} reviews)</Text>
            </View>
          </View>

          <Text style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>₹{product.price.toLocaleString()}</Text>
            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>₹{product.originalPrice.toLocaleString()}</Text>
            <View style={[styles.discountBadge, { backgroundColor: "#16a34a18" }]}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          </View>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.selectorSection}>
              <Text style={[styles.selectorLabel, { color: colors.foreground }]}>
                Color: <Text style={{ color: colors.primary, fontWeight: "700" }}>{selectedColor}</Text>
              </Text>
              <View style={styles.colorRow}>
                {product.colors.map((c) => {
                  const colorMap: Record<string, string> = {
                    Maroon: "#6B1A1A", Navy: "#1A1A6B", Green: "#1A5C1A",
                    Gold: "#C9A84C", Red: "#CC0000", Blue: "#1A4080",
                    Black: "#1A1A1A", Ivory: "#F5F0E0", Silver: "#C0C0C0",
                    Pink: "#E091B0", Teal: "#1A6B6B", Purple: "#5C1A6B",
                    White: "#F5F5F5", Orange: "#E07020",
                  };
                  const hex = colorMap[c] ?? "#888";
                  return (
                    <Pressable
                      key={c}
                      style={[
                        styles.colorDot,
                        { backgroundColor: hex, borderColor: selectedColor === c ? colors.gold : "transparent", borderWidth: selectedColor === c ? 2 : 0 },
                      ]}
                      onPress={() => { Haptics.selectionAsync(); setSelectedColor(c); }}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.selectorSection}>
              <View style={styles.sizeLabelRow}>
                <Text style={[styles.selectorLabel, { color: colors.foreground }]}>
                  Size: <Text style={{ color: colors.primary, fontWeight: "700" }}>{selectedSize}</Text>
                </Text>
                <Pressable>
                  <Text style={[styles.sizeGuide, { color: colors.accent }]}>Size Guide</Text>
                </Pressable>
              </View>
              <View style={styles.sizeRow}>
                {product.sizes.map((s) => (
                  <Pressable
                    key={s}
                    style={[
                      styles.sizeChip,
                      {
                        backgroundColor: selectedSize === s ? colors.primary : colors.card,
                        borderColor: selectedSize === s ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => { Haptics.selectionAsync(); setSelectedSize(s); }}
                  >
                    <Text style={[styles.sizeText, { color: selectedSize === s ? "#fff" : colors.foreground }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.selectorSection}>
            <Text style={[styles.selectorLabel, { color: colors.foreground }]}>Quantity</Text>
            <View style={[styles.qtyRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Pressable
                style={[styles.qtyBtn, { opacity: quantity <= 1 ? 0.4 : 1 }]}
                onPress={() => { if (quantity > 1) { Haptics.selectionAsync(); setQuantity((q) => q - 1); } }}
              >
                <Ionicons name="remove" size={18} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.qtyValue, { color: colors.foreground }]}>{quantity}</Text>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => { Haptics.selectionAsync(); setQuantity((q) => q + 1); }}
              >
                <Ionicons name="add" size={18} color={colors.foreground} />
              </Pressable>
            </View>
          </View>

          {/* Description */}
          <View style={[styles.descSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>Description</Text>
            <Text style={[styles.descText, { color: colors.mutedForeground }]}>{product.description}</Text>
          </View>

          {/* Fabric Details */}
          <View style={[styles.fabricSection, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={styles.fabricRow}>
              <Ionicons name="layers-outline" size={16} color={colors.primary} />
              <Text style={[styles.fabricLabel, { color: colors.mutedForeground }]}>Material</Text>
              <Text style={[styles.fabricValue, { color: colors.foreground }]}>{product.fabric}</Text>
            </View>
            {[
              { label: "Care", value: "Dry clean recommended" },
              { label: "Origin", value: "Made in India" },
              { label: "Style", value: "Traditional / Ethnic" },
            ].map((f, i) => (
              <View key={i} style={[styles.fabricRow, { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.fabricLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                <Text style={[styles.fabricValue, { color: colors.foreground }]}>{f.value}</Text>
              </View>
            ))}
          </View>

          {/* Delivery Info */}
          <View style={styles.deliveryRow}>
            {[
              { icon: "flash", text: "Express Delivery" },
              { icon: "refresh-circle", text: "Easy Returns" },
              { icon: "shield-checkmark", text: "Authentic" },
            ].map((d, i) => (
              <View key={i} style={[styles.deliveryItem, { backgroundColor: colors.secondary }]}>
                <Ionicons name={d.icon as any} size={18} color={colors.primary} />
                <Text style={[styles.deliveryText, { color: colors.foreground }]}>{d.text}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>Reviews ({product.reviews})</Text>
              <View style={[styles.ratingLarge, { backgroundColor: colors.primary }]}>
                <Text style={styles.ratingLargeText}>{product.rating}</Text>
                <Ionicons name="star" size={14} color="#fff" />
              </View>
            </View>
            {REVIEWS.slice(0, 2).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </View>

          {/* Related Products */}
          <View>
            <Text style={[styles.descTitle, { color: colors.foreground, paddingBottom: 12 }]}>You May Also Like</Text>
            <FlatList
              data={related}
              keyExtractor={(p) => p.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <View style={{ width: 150 }}>
                  <ProductCard product={item} layout="grid" />
                </View>
              )}
            />
          </View>

          <View style={{ height: bottomPad }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomTotal}>
          <Text style={[styles.bottomPrice, { color: colors.primary }]}>₹{(product.price * quantity).toLocaleString()}</Text>
          <Text style={[styles.bottomSaving, { color: "#16a34a" }]}>
            Save ₹{((product.originalPrice - product.price) * quantity).toLocaleString()}
          </Text>
        </View>
        <View style={styles.bottomActions}>
          <Pressable
            style={[styles.addCartBtn, { borderColor: colors.primary }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/cart"); }}
          >
            <Ionicons name="bag-add-outline" size={18} color={colors.primary} />
            <Text style={[styles.addCartText, { color: colors.primary }]}>Add to Cart</Text>
          </Pressable>
          <Pressable
            style={[styles.buyNowBtn, { backgroundColor: colors.primary }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.push("/checkout"); }}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gallery: { height: 400 },
  galleryHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  galleryBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  galleryRight: { flexDirection: "row", gap: 8 },
  imageDots: { position: "absolute", bottom: 14, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 5 },
  imageDot: { height: 5, borderRadius: 3 },
  galleryBadge: { position: "absolute", top: 14, right: 14, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 80 },
  galleryBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  infoCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: 20, gap: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  categoryTag: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, fontWeight: "700" },
  reviewsText: { fontSize: 12 },
  productName: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  price: { fontSize: 26, fontWeight: "800" },
  originalPrice: { fontSize: 16, textDecorationLine: "line-through" },
  discountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { fontSize: 12, fontWeight: "700", color: "#16a34a" },
  selectorSection: { gap: 10 },
  selectorLabel: { fontSize: 14, fontWeight: "600" },
  colorRow: { flexDirection: "row", gap: 10 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  sizeLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sizeGuide: { fontSize: 12, fontWeight: "600" },
  sizeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  sizeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  sizeText: { fontSize: 13, fontWeight: "600" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 0, borderRadius: 12, borderWidth: 1, alignSelf: "flex-start" },
  qtyBtn: { padding: 12 },
  qtyValue: { fontSize: 16, fontWeight: "700", paddingHorizontal: 16 },
  descSection: { paddingTop: 16, borderTopWidth: 1, gap: 8 },
  descTitle: { fontSize: 17, fontWeight: "700" },
  descText: { fontSize: 14, lineHeight: 22 },
  fabricSection: { borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  fabricRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  fabricLabel: { flex: 1, fontSize: 13 },
  fabricValue: { fontSize: 13, fontWeight: "600" },
  deliveryRow: { flexDirection: "row", gap: 8 },
  deliveryItem: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center", gap: 6 },
  deliveryText: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  reviewsSection: { gap: 12 },
  reviewsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ratingLarge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  ratingLargeText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  bottomTotal: { gap: 2 },
  bottomPrice: { fontSize: 20, fontWeight: "800" },
  bottomSaving: { fontSize: 12, fontWeight: "600" },
  bottomActions: { flexDirection: "row", gap: 8 },
  addCartBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  addCartText: { fontSize: 14, fontWeight: "700" },
  buyNowBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14 },
  buyNowText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});
