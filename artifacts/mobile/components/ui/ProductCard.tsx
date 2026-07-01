import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Product } from "@/constants/mockData";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list" | "large";
  onWishlistToggle?: (id: string) => void;
  onQuickView?: (product: Product) => void;
  index?: number;
}

export function ProductCard({ product, layout = "grid", onWishlistToggle, onQuickView, index = 0 }: ProductCardProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 2 }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60, bounciness: 2 }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/product/[id]", params: { id: product.id } });
  };

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 80 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 80 }),
    ]).start();
    onWishlistToggle?.(product.id);
  };

  const handleQuickView = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onQuickView?.(product);
  };

  const renderBadges = () => (
    <View style={styles.badgeRow}>
      {product.badge && (
        <View style={[styles.topBadge, { backgroundColor: product.badge === "Premium" ? colors.gold : product.badge === "New" || product.isNew ? "#16a34a" : colors.primary }]}>
          <Text style={styles.topBadgeText}>{product.badge}</Text>
        </View>
      )}
      {product.isLimitedStock && !product.badge && (
        <View style={[styles.topBadge, { backgroundColor: "#dc2626" }]}>
          <Text style={styles.topBadgeText}>Limited</Text>
        </View>
      )}
    </View>
  );

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= full ? "star" : i - 0.5 <= rating ? "star-half" : "star-outline"}
            size={9}
            color={colors.gold}
          />
        ))}
      </View>
    );
  };

  if (layout === "list") {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 12 }}>
        <Pressable
          style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleQuickView}
        >
          <LinearGradient
            colors={product.gradientColors}
            style={styles.listImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {renderBadges()}
          </LinearGradient>
          <View style={styles.listInfo}>
            <View style={styles.listTopRow}>
              <View style={{ flex: 1 }}>
                {(product.isNew || product.isTrending) && (
                  <Text style={[styles.listTag, { color: product.isNew ? "#16a34a" : "#d97706" }]}>
                    {product.isNew ? "NEW ARRIVAL" : "TRENDING"}
                  </Text>
                )}
                <Text style={[styles.listName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={2}>
                  {product.name}
                </Text>
                {product.subtitle && (
                  <Text style={[styles.listSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]} numberOfLines={1}>
                    {product.subtitle}
                  </Text>
                )}
              </View>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <TouchableOpacity style={styles.listHeart} onPress={handleWishlist} hitSlop={8}>
                  <Ionicons
                    name={product.isWishlisted ? "heart" : "heart-outline"}
                    size={19}
                    color={product.isWishlisted ? "#ef4444" : colors.mutedForeground}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
            <View style={styles.ratingRow}>
              {renderStars(product.rating)}
              <Text style={[styles.ratingNum, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{product.rating}</Text>
              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>({product.reviews})</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>₹{product.price.toLocaleString()}</Text>
              <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>₹{product.originalPrice.toLocaleString()}</Text>
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>{product.discount}% off</Text>
              </View>
            </View>
            <View style={styles.listFooter}>
              {product.deliveryDays && (
                <View style={styles.deliveryBadge}>
                  <Ionicons name="flash" size={9} color={colors.gold} />
                  <Text style={[styles.deliveryText, { color: colors.gold }]}>
                    {product.deliveryDays <= 2 ? "Fast Delivery" : `${product.deliveryDays}d Delivery`}
                  </Text>
                </View>
              )}
              {product.isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={9} color={colors.gold} />
                  <Text style={[styles.premiumText, { color: colors.gold }]}>Premium</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (layout === "large") {
    return (
      <Animated.View style={[styles.largeWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          style={[styles.largeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleQuickView}
        >
          <LinearGradient
            colors={product.gradientColors}
            style={styles.largeImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.imageBadgeRow}>
              {renderBadges()}
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <TouchableOpacity style={styles.heartBtn} onPress={handleWishlist} hitSlop={8}>
                  <Ionicons
                    name={product.isWishlisted ? "heart" : "heart-outline"}
                    size={20}
                    color={product.isWishlisted ? "#ef4444" : "#fff"}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.55)"]}
              style={styles.imageGradientOverlay}
            >
              {product.occasion && (
                <Text style={styles.occasionLabel}>{product.occasion}</Text>
              )}
            </LinearGradient>
            {onQuickView && (
              <TouchableOpacity style={styles.quickViewBtn} onPress={handleQuickView} hitSlop={4}>
                <Ionicons name="eye" size={14} color="#fff" />
                <Text style={styles.quickViewText}>Quick View</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
          <View style={styles.largeInfo}>
            {(product.isNew || product.isTrending || product.isLimitedStock) && (
              <View style={styles.tagRow}>
                {product.isNew && <Text style={[styles.newTag, { color: "#16a34a" }]}>NEW</Text>}
                {product.isTrending && <Text style={[styles.newTag, { color: "#d97706" }]}>🔥 TRENDING</Text>}
                {product.isLimitedStock && <Text style={[styles.newTag, { color: "#dc2626" }]}>LIMITED STOCK</Text>}
              </View>
            )}
            <Text style={[styles.largeName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={2}>
              {product.name}
            </Text>
            {product.subtitle && (
              <Text style={[styles.largeSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]} numberOfLines={1}>
                {product.subtitle}
              </Text>
            )}
            <View style={styles.ratingRow}>
              {renderStars(product.rating)}
              <Text style={[styles.ratingNum, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{product.rating}</Text>
              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>({product.reviews})</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.largePrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>₹{product.price.toLocaleString()}</Text>
              <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>₹{product.originalPrice.toLocaleString()}</Text>
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>{product.discount}% off</Text>
              </View>
            </View>
            {product.sizes && product.sizes.length > 0 && (
              <View style={styles.sizesRow}>
                {product.sizes.slice(0, 4).map((s) => (
                  <View key={s} style={[styles.sizeChip, { borderColor: colors.border }]}>
                    <Text style={[styles.sizeText, { color: colors.mutedForeground }]}>{s}</Text>
                  </View>
                ))}
                {product.sizes.length > 4 && (
                  <Text style={[styles.moreSizes, { color: colors.mutedForeground }]}>+{product.sizes.length - 4}</Text>
                )}
              </View>
            )}
            {product.colorHex && (
              <View style={styles.colorDots}>
                {product.colorHex.slice(0, 5).map((c, i) => (
                  <View key={i} style={[styles.colorDot, { backgroundColor: c, borderColor: colors.border }]} />
                ))}
              </View>
            )}
            <View style={styles.largeFooter}>
              {product.deliveryDays && (
                <View style={styles.deliveryBadge}>
                  <Ionicons name="flash" size={10} color={colors.gold} />
                  <Text style={[styles.deliveryText, { color: colors.gold }]}>
                    {product.deliveryDays <= 2 ? "Free Fast Delivery" : `Delivery in ${product.deliveryDays} days`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.gridWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleQuickView}
      >
        <LinearGradient
          colors={product.gradientColors}
          style={styles.gridImage}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.imageBadgeRow}>
            {renderBadges()}
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <TouchableOpacity style={styles.heartBtn} onPress={handleWishlist} hitSlop={8}>
                <Ionicons
                  name={product.isWishlisted ? "heart" : "heart-outline"}
                  size={18}
                  color={product.isWishlisted ? "#ef4444" : "#fff"}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)"]}
            style={styles.imageGradientOverlay}
          >
            {product.isTrending && (
              <Text style={styles.trendingLabel}>🔥 Trending</Text>
            )}
          </LinearGradient>
          {onQuickView && (
            <TouchableOpacity style={styles.quickViewBtnSmall} onPress={handleQuickView}>
              <Ionicons name="eye-outline" size={13} color="#fff" />
            </TouchableOpacity>
          )}
        </LinearGradient>
        <View style={styles.gridInfo}>
          <Text style={[styles.gridName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.ratingRow}>
            {renderStars(product.rating)}
            <Text style={[styles.ratingNum, { color: colors.mutedForeground }]}>{product.rating} ({product.reviews})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.gridPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>₹{product.price.toLocaleString()}</Text>
            <View style={styles.discountPill}>
              <Text style={styles.discountText}>{product.discount}% off</Text>
            </View>
          </View>
          {product.colorHex && (
            <View style={[styles.colorDots, { marginTop: 4 }]}>
              {product.colorHex.slice(0, 4).map((c, i) => (
                <View key={i} style={[styles.colorDotSmall, { backgroundColor: c, borderColor: colors.border }]} />
              ))}
            </View>
          )}
          {product.deliveryDays && product.deliveryDays <= 2 && (
            <View style={[styles.deliveryBadge, { marginTop: 4 }]}>
              <Ionicons name="flash" size={9} color={colors.gold} />
              <Text style={[styles.deliveryText, { color: colors.gold }]}>Fast Delivery</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gridWrapper: { flex: 1 },
  gridCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  gridImage: {
    height: 185,
    justifyContent: "space-between",
  },
  imageBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 10,
  },
  imageGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  trendingLabel: { fontSize: 10, color: "#fff", fontFamily: "Poppins_600SemiBold" },
  occasionLabel: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontFamily: "Poppins_500Medium" },
  badgeRow: { flexDirection: "column", gap: 4 },
  topBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  topBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },
  heartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickViewBtnSmall: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridInfo: { padding: 11, gap: 4 },
  gridName: { fontSize: 12.5, lineHeight: 18 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  stars: { flexDirection: "row", gap: 1 },
  ratingNum: { fontSize: 10.5 },
  reviewCount: { fontSize: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  gridPrice: { fontSize: 15 },
  discountPill: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: { fontSize: 9.5, fontWeight: "700", color: "#16a34a" },
  colorDots: { flexDirection: "row", gap: 5 },
  colorDot: { width: 13, height: 13, borderRadius: 7, borderWidth: 1.5 },
  colorDotSmall: { width: 11, height: 11, borderRadius: 6, borderWidth: 1 },
  deliveryBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  deliveryText: { fontSize: 9.5, fontFamily: "Poppins_500Medium" },

  largeWrapper: { marginBottom: 14 },
  largeCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  largeImage: { height: 260 },
  largeInfo: { padding: 16, gap: 5 },
  tagRow: { flexDirection: "row", gap: 8 },
  newTag: { fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },
  largeName: { fontSize: 17, lineHeight: 24 },
  largeSubtitle: { fontSize: 12, marginTop: -2 },
  largePrice: { fontSize: 18 },
  price: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  originalPrice: { fontSize: 12, textDecorationLine: "line-through" },
  sizesRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  sizeChip: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  sizeText: { fontSize: 10 },
  moreSizes: { fontSize: 10, alignSelf: "center" },
  largeFooter: { marginTop: 2 },
  premiumBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  premiumText: { fontSize: 9.5, fontFamily: "Poppins_600SemiBold" },
  quickViewBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  quickViewText: { fontSize: 11, color: "#fff", fontFamily: "Poppins_500Medium" },

  listCard: {
    flexDirection: "row",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listImage: { width: 110, minHeight: 145, justifyContent: "flex-start", padding: 8 },
  listInfo: { flex: 1, padding: 14, gap: 4 },
  listTopRow: { flexDirection: "row", alignItems: "flex-start" },
  listHeart: { padding: 4 },
  listTag: { fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },
  listName: { fontSize: 13.5, lineHeight: 19, flex: 1 },
  listSubtitle: { fontSize: 11, marginTop: -2 },
  listFooter: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 2 },
});
