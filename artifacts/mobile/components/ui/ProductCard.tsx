import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Product } from "@/constants/mockData";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
  onWishlistToggle?: (id: string) => void;
}

export function ProductCard({ product, layout = "grid", onWishlistToggle }: ProductCardProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/product/[id]", params: { id: product.id } });
  };

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onWishlistToggle?.(product.id);
  };

  if (layout === "list") {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <LinearGradient
            colors={product.gradientColors}
            style={styles.listImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.listInfo}>
            {product.badge && (
              <View style={[styles.badge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{product.badge}</Text>
              </View>
            )}
            <Text style={[styles.listName, { color: colors.foreground }]} numberOfLines={2}>{product.name}</Text>
            <Text style={[styles.listCategory, { color: colors.mutedForeground }]}>{product.category}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.gold} />
              <Text style={[styles.ratingText, { color: colors.foreground }]}>{product.rating}</Text>
              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>({product.reviews})</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>₹{product.price.toLocaleString()}</Text>
              <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>₹{product.originalPrice.toLocaleString()}</Text>
              <Text style={[styles.discount, { color: "#16a34a" }]}>{product.discount}% off</Text>
            </View>
          </View>
          <Pressable style={styles.wishlistBtn} onPress={handleWishlist} hitSlop={10}>
            <Ionicons
              name={product.isWishlisted ? "heart" : "heart-outline"}
              size={20}
              color={product.isWishlisted ? colors.primary : colors.mutedForeground}
            />
          </Pressable>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.gridCardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={product.gradientColors}
          style={styles.gridImage}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {product.badge && (
            <View style={[styles.imageBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.imageBadgeText}>{product.badge}</Text>
            </View>
          )}
          <Pressable style={styles.heartBtn} onPress={handleWishlist} hitSlop={10}>
            <Ionicons
              name={product.isWishlisted ? "heart" : "heart-outline"}
              size={20}
              color={product.isWishlisted ? "#ef4444" : "#fff"}
            />
          </Pressable>
        </LinearGradient>
        <View style={styles.gridInfo}>
          <Text style={[styles.gridName, { color: colors.foreground }]} numberOfLines={2}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={colors.gold} />
            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>{product.rating} ({product.reviews})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>₹{product.price.toLocaleString()}</Text>
            <Text style={[styles.discountSmall, { color: "#16a34a" }]}>{product.discount}% off</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gridCardWrapper: { flex: 1 },
  gridCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gridImage: {
    height: 180,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
  },
  imageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  heartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridInfo: { padding: 12, gap: 4 },
  gridName: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  ratingText: { fontSize: 11, fontWeight: "500" },
  reviewCount: { fontSize: 11 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  price: { fontSize: 15, fontWeight: "700" },
  originalPrice: { fontSize: 12, textDecorationLine: "line-through" },
  discount: { fontSize: 11, fontWeight: "600" },
  discountSmall: { fontSize: 11, fontWeight: "600" },
  listCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listImage: { width: 110, height: 130 },
  listInfo: { flex: 1, padding: 14, gap: 4 },
  listName: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  listCategory: { fontSize: 12 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 2 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  wishlistBtn: { padding: 14, justifyContent: "flex-start" },
});
