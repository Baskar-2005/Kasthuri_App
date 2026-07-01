import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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

import { ProductCard } from "@/components/ui/ProductCard";
import { useColors } from "@/hooks/useColors";
import { PRODUCTS, REVIEWS } from "@/constants/mockData";
import type { Product } from "@/constants/mockData";

const { width: W, height: H } = Dimensions.get("window");
const IMG_H = Math.round(W * 1.1);

const COLOR_MAP: Record<string, string> = {
  Maroon: "#6B1A1A", Navy: "#1A1A6B", Green: "#1A5C1A",
  Gold: "#C9A84C", Red: "#CC0000", Blue: "#1A4080",
  Black: "#222", Ivory: "#F5F0E0", Silver: "#C0C0C0",
  Pink: "#E091B0", Teal: "#1A6B6B", Purple: "#5C1A6B",
  White: "#F5F5F5", Orange: "#E07020", "Rose Gold": "#B76E79",
  "Bottle Green": "#3A5C2C", "Pastel Pink": "#F5B8C0",
  "Sky Blue": "#87CEEB", Ochre: "#C9A84C", Indigo: "#1A2C6B",
  Natural: "#D4C5A9", Antique: "#8B7355", Mint: "#4A8B72",
  Peach: "#D4826A", Cream: "#F5EDD6", Saffron: "#D4826A",
  Emerald: "#1A6B4A", Burgundy: "#6B1A1A", Magenta: "#C8536B",
  "Rose": "#C8536B",
};

const FABRIC_ICONS: Record<string, string> = {
  Material: "layers-outline",
  Fabric: "shirt-outline",
  Pattern: "apps-outline",
  Occasion: "calendar-outline",
  "Wash Care": "water-outline",
  Origin: "location-outline",
  Weight: "barbell-outline",
  Fit: "body-outline",
  Style: "sparkles-outline",
};

const FEATURES = [
  { icon: "leaf-outline", label: "Soft Fabric", color: "#16a34a" },
  { icon: "ribbon-outline", label: "Premium Stitching", color: "#C9A84C" },
  { icon: "water-outline", label: "Machine Washable", color: "#1A6B9B" },
  { icon: "paper-plane-outline", label: "Lightweight", color: "#6B1A6B" },
  { icon: "happy-outline", label: "Comfort Fit", color: "#D4826A" },
  { icon: "star-outline", label: "Festival Ready", color: "#C9A84C" },
];

const OFFERS = [
  { icon: "pricetag", label: "KASTHU10", desc: "10% off on orders above ₹2,000", color: "#6B1A1A" },
  { icon: "card", label: "HDFC Bank", desc: "5% cashback on HDFC credit cards", color: "#1A2C6B" },
  { icon: "gift", label: "Festival50", desc: "Extra ₹50 off during Navratri", color: "#8B6914" },
];

const QA = [
  { q: "Is this product machine washable?", a: "Dry clean is recommended for best results.", asked: "12 buyers asked this" },
  { q: "Is the color exactly as shown?", a: "Colors may slightly vary due to screen settings. Actual product is very close.", asked: "8 buyers asked this" },
  { q: "What is the return policy?", a: "Easy 7-day returns. Product must be unworn with tags intact.", asked: "5 buyers asked this" },
];

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 6);
  const recommended = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 6);

  const scrollY = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const cartBounce = useRef(new Animated.Value(1)).current;

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [expandedQA, setExpandedQA] = useState<number | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const gradientSets: [string, string][] = [
    product.gradientColors,
    [product.gradientColors[1], product.gradientColors[0]],
    ["#3D1C02", "#6B1A1A"],
    ["#2C1206", product.gradientColors[0]],
  ];

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 90;

  const headerBg = scrollY.interpolate({ inputRange: [IMG_H * 0.5, IMG_H * 0.8], outputRange: [0, 1], extrapolate: "clamp" });
  const headerBgColor = scrollY.interpolate({ inputRange: [IMG_H * 0.5, IMG_H * 0.8], outputRange: ["rgba(0,0,0,0)", colors.background], extrapolate: "clamp" });
  const iconColor = scrollY.interpolate({ inputRange: [IMG_H * 0.5, IMG_H * 0.8], outputRange: ["#fff", colors.foreground], extrapolate: "clamp" });
  const headerTitleOpacity = scrollY.interpolate({ inputRange: [IMG_H * 0.7, IMG_H * 0.9], outputRange: [0, 1], extrapolate: "clamp" });

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWishlisted((w) => !w);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.45, useNativeDriver: true, speed: 80 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 60 }),
    ]).start();
  };

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.spring(cartBounce, { toValue: 0.88, useNativeDriver: true, speed: 80 }),
      Animated.spring(cartBounce, { toValue: 1.08, useNativeDriver: true, speed: 60 }),
      Animated.spring(cartBounce, { toValue: 1, useNativeDriver: true, speed: 60 }),
    ]).start();
    router.push("/cart");
  };

  const savings = product.originalPrice - product.price;
  const emiMonthly = Math.round(product.price / 12);

  const ratingDist = [
    { stars: 5, pct: 68 },
    { stars: 4, pct: 18 },
    { stars: 3, pct: 8 },
    { stars: 2, pct: 4 },
    { stars: 1, pct: 2 },
  ];

  const fabricDetails = [
    { label: "Material", value: product.fabric ?? "Premium Fabric" },
    { label: "Pattern", value: product.pattern ?? "Traditional" },
    { label: "Occasion", value: product.occasion ?? "Festive" },
    { label: "Fit", value: "Regular Fit" },
    { label: "Wash Care", value: "Dry clean recommended" },
    { label: "Origin", value: "Made in India" },
    { label: "Weight", value: "450 grams" },
    { label: "Style", value: "Ethnic / Traditional" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* STICKY TRANSPARENT → SOLID HEADER */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { paddingTop: topPad + 2, backgroundColor: headerBgColor as any },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: "rgba(0,0,0,0.28)" }]}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Animated.Text
            style={[styles.headerTitle, { color: colors.foreground, opacity: headerTitleOpacity, fontFamily: "Poppins_600SemiBold" }]}
            numberOfLines={1}
          >
            {product.name}
          </Animated.Text>

          <View style={styles.headerRight}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <TouchableOpacity
                style={[styles.headerBtn, { backgroundColor: "rgba(0,0,0,0.28)" }]}
                onPress={handleWishlist}
                hitSlop={8}
              >
                <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={19} color={wishlisted ? "#ef4444" : "#fff"} />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: "rgba(0,0,0,0.28)" }]}
              hitSlop={8}
            >
              <Ionicons name="share-social-outline" size={19} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: "rgba(0,0,0,0.28)" }]}
              onPress={() => router.push("/cart")}
              hitSlop={8}
            >
              <Ionicons name="bag-outline" size={19} color="#fff" />
              <View style={[styles.cartDot, { backgroundColor: colors.primary }]}>
                <Text style={styles.cartDotText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* ─── IMAGE GALLERY ─── */}
        <View style={[styles.gallery, { height: IMG_H }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / W))}
          >
            {gradientSets.map((g, i) => (
              <Pressable key={i} onPress={() => setShowGallery(true)}>
                <LinearGradient
                  colors={g}
                  style={{ width: W, height: IMG_H }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.5)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[styles.imgLabel, { top: IMG_H * 0.35 }]}>
                    <Ionicons name="expand-outline" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.imgLabelText}>{["Model View", "Fabric Detail", "Flat Lay", "Lifestyle"][i]}</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>

          {/* Badges */}
          {product.badge && (
            <View style={[styles.galleryBadge, { backgroundColor: product.badge === "Premium" ? colors.gold : colors.primary, top: topPad + 52 }]}>
              <Text style={[styles.galleryBadgeText, { fontFamily: "Poppins_700Bold" }]}>{product.badge}</Text>
            </View>
          )}
          {product.isTrending && (
            <View style={[styles.trendingBadge, { top: topPad + 52, backgroundColor: "#d97706" }]}>
              <Ionicons name="trending-up" size={10} color="#fff" />
              <Text style={[styles.galleryBadgeText, { fontFamily: "Poppins_700Bold" }]}>Trending</Text>
            </View>
          )}

          {/* Premium dot indicators */}
          <View style={styles.dotContainer}>
            {gradientSets.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: "#fff",
                    width: i === activeImg ? 22 : 6,
                    opacity: i === activeImg ? 1 : 0.45,
                  },
                ]}
              />
            ))}
          </View>

          {/* Image count */}
          <View style={styles.imgCountBadge}>
            <Ionicons name="images-outline" size={11} color="#fff" />
            <Text style={styles.imgCountText}>{activeImg + 1}/{gradientSets.length}</Text>
          </View>
        </View>

        {/* ─── PRODUCT INFO CARD ─── */}
        <View style={[styles.infoCard, { backgroundColor: colors.background }]}>

          {/* Category & Badges row */}
          <View style={styles.badgeRow}>
            <Text style={[styles.categoryTag, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
              {product.category}
            </Text>
            <View style={styles.badgesRight}>
              {product.isPremium && (
                <View style={[styles.miniBadge, { backgroundColor: colors.gold + "25" }]}>
                  <Ionicons name="diamond" size={9} color={colors.gold} />
                  <Text style={[styles.miniBadgeText, { color: colors.gold, fontFamily: "Poppins_600SemiBold" }]}>Premium</Text>
                </View>
              )}
              {product.isNew && (
                <View style={[styles.miniBadge, { backgroundColor: "#dcfce7" }]}>
                  <Text style={[styles.miniBadgeText, { color: "#16a34a", fontFamily: "Poppins_600SemiBold" }]}>New</Text>
                </View>
              )}
              {product.isLimitedStock && (
                <View style={[styles.miniBadge, { backgroundColor: "#fee2e2" }]}>
                  <Ionicons name="time" size={9} color="#dc2626" />
                  <Text style={[styles.miniBadgeText, { color: "#dc2626", fontFamily: "Poppins_600SemiBold" }]}>Limited</Text>
                </View>
              )}
            </View>
          </View>

          {/* Product Name */}
          <Text style={[styles.productName, { color: colors.foreground, fontFamily: "Poppins_800ExtraBold" }]}>
            {product.name}
          </Text>
          {product.subtitle && (
            <Text style={[styles.productSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {product.subtitle}
            </Text>
          )}

          {/* Brand + Verified */}
          <View style={styles.brandRow}>
            <Ionicons name="storefront-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.brandText, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
              Kasthuribai Ready Mades
            </Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              <Text style={[styles.verifiedText, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>Verified</Text>
            </View>
          </View>

          {/* Rating Row */}
          <Pressable style={[styles.ratingCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={styles.ratingLeft}>
              <View style={[styles.ratingPill, { backgroundColor: "#16a34a" }]}>
                <Text style={[styles.ratingPillText, { fontFamily: "Poppins_700Bold" }]}>{product.rating} ★</Text>
              </View>
              <View>
                <Text style={[styles.ratingCount, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {product.reviews.toLocaleString()} Reviews
                </Text>
                <Text style={[styles.ratingSubtext, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  {Math.round(product.reviews * 2.4).toLocaleString()} sold
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>

          {/* ─── PRICE ─── */}
          <View style={[styles.priceCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {product.isLimitedStock && (
              <View style={styles.offerTimer}>
                <Ionicons name="time-outline" size={12} color="#dc2626" />
                <Text style={[styles.offerTimerText, { fontFamily: "Poppins_600SemiBold" }]}>Limited Time Offer</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={[styles.priceMain, { color: colors.primary, fontFamily: "Poppins_800ExtraBold" }]}>
                ₹{product.price.toLocaleString()}
              </Text>
              <Text style={[styles.priceMRP, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                MRP ₹{product.originalPrice.toLocaleString()}
              </Text>
              <View style={styles.discountBubble}>
                <Text style={[styles.discountBubbleText, { fontFamily: "Poppins_700Bold" }]}>{product.discount}% OFF</Text>
              </View>
            </View>
            <Text style={[styles.savingsText, { color: "#16a34a", fontFamily: "Poppins_600SemiBold" }]}>
              You save ₹{savings.toLocaleString()}!
            </Text>
            <View style={styles.priceFooter}>
              <Text style={[styles.gstText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                Inclusive of all taxes · GST included
              </Text>
              <View style={[styles.emiPill, { backgroundColor: colors.primary + "18" }]}>
                <Text style={[styles.emiText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                  EMI from ₹{emiMonthly}/mo
                </Text>
              </View>
            </View>
          </View>

          {/* ─── STOCK STATUS ─── */}
          <View style={styles.stockRow}>
            {product.isLimitedStock ? (
              <View style={styles.stockChip}>
                <View style={[styles.stockDot, { backgroundColor: "#dc2626" }]} />
                <Text style={[styles.stockText, { color: "#dc2626", fontFamily: "Poppins_600SemiBold" }]}>Only 4 left!</Text>
              </View>
            ) : (
              <View style={styles.stockChip}>
                <View style={[styles.stockDot, { backgroundColor: "#16a34a" }]} />
                <Text style={[styles.stockText, { color: "#16a34a", fontFamily: "Poppins_600SemiBold" }]}>In Stock</Text>
              </View>
            )}
            {product.isTrending && (
              <View style={[styles.stockChip, { marginLeft: 8 }]}>
                <Ionicons name="flame" size={13} color="#d97706" />
                <Text style={[styles.stockText, { color: "#d97706", fontFamily: "Poppins_600SemiBold" }]}>Fast Selling</Text>
              </View>
            )}
          </View>

          {/* ─── COLOR SELECTOR ─── */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  Color
                </Text>
                <Text style={[styles.sectionValue, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                  {product.colors[selectedColor]}
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                {product.colors.map((c, i) => {
                  const hex = (product.colorHex?.[i]) ?? COLOR_MAP[c] ?? "#888";
                  const isSelected = selectedColor === i;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorSwatch,
                        {
                          borderColor: isSelected ? colors.primary : "transparent",
                          borderWidth: isSelected ? 2.5 : 0,
                        },
                      ]}
                      onPress={() => { Haptics.selectionAsync(); setSelectedColor(i); }}
                    >
                      <View style={[styles.colorInner, { backgroundColor: hex }]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>
                      <Text style={[styles.colorLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ─── SIZE SELECTOR ─── */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  Size
                </Text>
                <View style={styles.sizeGuideRow}>
                  <TouchableOpacity>
                    <Text style={[styles.sizeGuideLink, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
                      Size Guide
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.sizeGuideSep, { color: colors.border }]}>·</Text>
                  <TouchableOpacity>
                    <Text style={[styles.sizeGuideLink, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
                      Find My Size
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.sizeRow}>
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.sizeChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          shadowColor: isSelected ? colors.primary : "transparent",
                          shadowOpacity: isSelected ? 0.35 : 0,
                          shadowRadius: 8,
                          elevation: isSelected ? 4 : 0,
                        },
                      ]}
                      onPress={() => { Haptics.selectionAsync(); setSelectedSize(s); }}
                    >
                      <Text style={[styles.sizeText, { color: isSelected ? "#fff" : colors.foreground, fontFamily: isSelected ? "Poppins_700Bold" : "Poppins_400Regular" }]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[styles.sizeTip, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                💡 Model is wearing size M · Height 5'7"
              </Text>
            </View>
          )}

          {/* ─── KEY FEATURES ─── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 12 }]}>
              Key Features
            </Text>
            <View style={styles.featuresGrid}>
              {FEATURES.map((f) => (
                <View key={f.label} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.featureIcon, { backgroundColor: f.color + "20" }]}>
                    <Ionicons name={f.icon as any} size={18} color={f.color} />
                  </View>
                  <Text style={[styles.featureLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ─── DESCRIPTION ─── */}
          <View style={[styles.section, styles.descSection, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              Description
            </Text>
            <Text
              style={[styles.descText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}
              numberOfLines={descExpanded ? undefined : 3}
            >
              {product.description ?? "An exquisite piece crafted with utmost care and premium materials. Each item is handpicked for quality and authenticity, making it the perfect choice for your special occasions."}
              {"\n\nThis timeless creation brings together tradition and elegance. The intricate craftsmanship reflects the rich heritage of Indian textile artistry, ensuring you stand out at every event."}
            </Text>
            <TouchableOpacity onPress={() => setDescExpanded((e) => !e)}>
              <Text style={[styles.readMore, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                {descExpanded ? "Read Less ▲" : "Read More ▼"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── FABRIC DETAILS ─── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 12 }]}>
              Fabric & Details
            </Text>
            <View style={[styles.fabricCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              {fabricDetails.map((f, i) => (
                <View
                  key={f.label}
                  style={[
                    styles.fabricRow,
                    { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth },
                  ]}
                >
                  <Ionicons name={(FABRIC_ICONS[f.label] ?? "ellipse-outline") as any} size={15} color={colors.primary} />
                  <Text style={[styles.fabricLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{f.label}</Text>
                  <Text style={[styles.fabricValue, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>{f.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ─── DELIVERY ─── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 12 }]}>
              Delivery & Returns
            </Text>
            <View style={[styles.deliveryCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <View style={styles.pincodeRow}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <TextInput
                  style={[styles.pincodeInput, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
                  placeholder="Enter PIN code"
                  placeholderTextColor={colors.mutedForeground}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[styles.pincodeBtn, { backgroundColor: colors.primary }]}
                  onPress={() => { if (pincode.length === 6) { setPincodeChecked(true); Haptics.selectionAsync(); } }}
                >
                  <Text style={[styles.pincodeBtnText, { fontFamily: "Poppins_600SemiBold" }]}>Check</Text>
                </TouchableOpacity>
              </View>
              {pincodeChecked && (
                <View style={styles.deliveryResult}>
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text style={[styles.deliveryResultText, { color: "#16a34a", fontFamily: "Poppins_500Medium" }]}>
                    Delivery by {new Date(Date.now() + (product.deliveryDays ?? 3) * 86400000).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                  </Text>
                </View>
              )}
              <View style={[styles.deliveryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.deliveryBadges}>
                {[
                  { icon: "flash", text: "Express Delivery", sub: "2-5 days" },
                  { icon: "cube-outline", text: "Free Shipping", sub: "On orders ₹999+" },
                  { icon: "refresh-circle", text: "Easy Returns", sub: "7 day policy" },
                  { icon: "swap-horizontal", text: "Exchange", sub: "Available" },
                ].map((d) => (
                  <View key={d.text} style={styles.deliveryBadgeItem}>
                    <View style={[styles.deliveryIconWrap, { backgroundColor: colors.primary + "18" }]}>
                      <Ionicons name={d.icon as any} size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.deliveryBadgeLabel, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>{d.text}</Text>
                    <Text style={[styles.deliveryBadgeSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{d.sub}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ─── OFFERS ─── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 12 }]}>
              Best Offers
            </Text>
            <View style={styles.offersCol}>
              {OFFERS.map((o) => (
                <View key={o.label} style={[styles.offerCard, { borderColor: o.color + "40", backgroundColor: o.color + "0A" }]}>
                  <View style={[styles.offerIconWrap, { backgroundColor: o.color + "20" }]}>
                    <Ionicons name={o.icon as any} size={18} color={o.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.offerCode, { color: o.color, fontFamily: "Poppins_700Bold" }]}>{o.label}</Text>
                    <Text style={[styles.offerDesc, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}>{o.desc}</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={[styles.offerCopy, { color: o.color, fontFamily: "Poppins_600SemiBold" }]}>COPY</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* ─── SHOP THE LOOK ─── */}
          {related.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  Shop the Look
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselList}>
                {related.map((p) => (
                  <View key={p.id} style={styles.carouselCard}>
                    <ProductCard product={p} layout="grid" />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ─── SIMILAR PRODUCTS ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                Similar Products
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselList}>
              {recommended.slice(0, 5).map((p) => (
                <View key={p.id} style={styles.carouselCard}>
                  <ProductCard product={p} layout="grid" />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ─── REVIEWS ─── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 14 }]}>
              Customer Reviews
            </Text>
            <View style={[styles.reviewSummary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <View style={styles.reviewSummaryLeft}>
                <Text style={[styles.reviewBigRating, { color: colors.foreground, fontFamily: "Poppins_800ExtraBold" }]}>
                  {product.rating}
                </Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name={i <= Math.floor(product.rating) ? "star" : "star-outline"} size={13} color={colors.gold} />
                  ))}
                </View>
                <Text style={[styles.reviewCount, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  {product.reviews} reviews
                </Text>
              </View>
              <View style={styles.reviewBars}>
                {ratingDist.map((r) => (
                  <View key={r.stars} style={styles.reviewBarRow}>
                    <Text style={[styles.reviewBarStar, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{r.stars}★</Text>
                    <View style={[styles.reviewBarTrack, { backgroundColor: colors.border }]}>
                      <View style={[styles.reviewBarFill, { width: `${r.pct}%`, backgroundColor: r.stars >= 4 ? "#16a34a" : r.stars === 3 ? colors.gold : "#dc2626" }]} />
                    </View>
                    <Text style={[styles.reviewBarPct, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{r.pct}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {REVIEWS.map((r) => (
              <View key={r.id} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewTop}>
                  <View style={[styles.reviewAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.reviewAvatarText, { fontFamily: "Poppins_700Bold" }]}>{r.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.reviewNameRow}>
                      <Text style={[styles.reviewName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>{r.name}</Text>
                      {r.verified && (
                        <View style={styles.verifiedChip}>
                          <Ionicons name="checkmark-circle" size={11} color="#16a34a" />
                          <Text style={[styles.verifiedChipText, { fontFamily: "Poppins_500Medium" }]}>Verified</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Ionicons key={i} name={i <= r.rating ? "star" : "star-outline"} size={11} color={colors.gold} />
                      ))}
                      <Text style={[styles.reviewDate, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{r.date}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.reviewText, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}>{r.text}</Text>
                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.helpfulBtn}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setHelpfulReviews((prev) => {
                        const n = new Set(prev);
                        n.has(r.id) ? n.delete(r.id) : n.add(r.id);
                        return n;
                      });
                    }}
                  >
                    <Ionicons name={helpfulReviews.has(r.id) ? "thumbs-up" : "thumbs-up-outline"} size={14} color={helpfulReviews.has(r.id) ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.helpfulText, { color: helpfulReviews.has(r.id) ? colors.primary : colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                      Helpful {helpfulReviews.has(r.id) ? "(1)" : ""}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.helpfulBtn}>
                    <Ionicons name="flag-outline" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.helpfulText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* ─── Q&A ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                Q & A
              </Text>
              <TouchableOpacity style={[styles.askBtn, { borderColor: colors.primary }]}>
                <Ionicons name="add-circle-outline" size={14} color={colors.primary} />
                <Text style={[styles.askBtnText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Ask</Text>
              </TouchableOpacity>
            </View>
            {QA.map((qa, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.qaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setExpandedQA(expandedQA === i ? null : i); }}
              >
                <View style={styles.qaTop}>
                  <View style={[styles.qaIcon, { backgroundColor: colors.primary + "18" }]}>
                    <Text style={[styles.qaIconText, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>Q</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.qaQuestion, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{qa.q}</Text>
                    <Text style={[styles.qaAsked, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{qa.asked}</Text>
                  </View>
                  <Ionicons name={expandedQA === i ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                </View>
                {expandedQA === i && (
                  <View style={[styles.qaAnswer, { borderTopColor: colors.border }]}>
                    <View style={[styles.qaIcon, { backgroundColor: "#16a34a20" }]}>
                      <Text style={[styles.qaIconText, { color: "#16a34a", fontFamily: "Poppins_700Bold" }]}>A</Text>
                    </View>
                    <Text style={[styles.qaAnswerText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{qa.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ─── STORE INFO ─── */}
          <View style={[styles.section, styles.storeCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={styles.storeRow}>
              <View style={[styles.storeIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="storefront" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.storeName, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                  Kasthuribai Ready Mades
                </Text>
                <Text style={[styles.storeTagline, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Premium Ethnic Wear · Est. 1985
                </Text>
              </View>
              <TouchableOpacity style={[styles.visitBtn, { borderColor: colors.primary }]}>
                <Text style={[styles.visitBtnText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Visit Store</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.storeStats}>
              {[
                { icon: "star", val: "4.8", label: "Store Rating" },
                { icon: "people", val: "50K+", label: "Customers" },
                { icon: "ribbon", val: "38yr", label: "Experience" },
              ].map((s) => (
                <View key={s.label} style={styles.storeStat}>
                  <Ionicons name={s.icon as any} size={14} color={colors.gold} />
                  <Text style={[styles.storeStatVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>{s.val}</Text>
                  <Text style={[styles.storeStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ─── TRUST BADGES ─── */}
          <View style={styles.section}>
            <View style={styles.trustGrid}>
              {[
                { icon: "shield-checkmark", text: "100% Genuine", color: "#16a34a" },
                { icon: "lock-closed", text: "Secure Payment", color: "#1A2C6B" },
                { icon: "refresh-circle", text: "Easy Returns", color: "#d97706" },
                { icon: "thumbs-up", text: "Quality Checked", color: "#6B1A1A" },
                { icon: "gift", text: "Premium Packaging", color: "#C9A84C" },
              ].map((t) => (
                <View key={t.text} style={[styles.trustItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name={t.icon as any} size={20} color={t.color} />
                  <Text style={[styles.trustText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>{t.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ─── YOU MAY ALSO LIKE ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                You May Also Like
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselList}>
              {recommended.slice(0, 6).map((p) => (
                <View key={p.id} style={styles.carouselCard}>
                  <ProductCard product={p} layout="grid" />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ─── STICKY ACTION BAR ─── */}
      <Animated.View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
            transform: [{ scale: cartBounce }],
          },
        ]}
      >
        <View style={styles.actionBarPriceCol}>
          <Text style={[styles.actionBarPrice, { color: colors.primary, fontFamily: "Poppins_800ExtraBold" }]}>
            ₹{product.price.toLocaleString()}
          </Text>
          <Text style={[styles.actionBarSavings, { color: "#16a34a", fontFamily: "Poppins_500Medium" }]}>
            Save ₹{savings.toLocaleString()}
          </Text>
        </View>
        <View style={styles.actionBarBtns}>
          <TouchableOpacity
            style={[styles.cartBtn, { borderColor: colors.primary }]}
            onPress={handleAddToCart}
          >
            <Ionicons name="bag-add-outline" size={18} color={colors.primary} />
            <Text style={[styles.cartBtnText, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buyBtn, { backgroundColor: colors.primary }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.push("/checkout"); }}
          >
            <Text style={[styles.buyBtnText, { fontFamily: "Poppins_800ExtraBold" }]}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ─── FULL SCREEN GALLERY MODAL ─── */}
      <Modal visible={showGallery} transparent animationType="fade" onRequestClose={() => setShowGallery(false)}>
        <View style={styles.galleryModal}>
          <TouchableOpacity style={[styles.galleryCloseBtn, { top: topPad + 10 }]} onPress={() => setShowGallery(false)}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {gradientSets.map((g, i) => (
              <LinearGradient key={i} colors={g} style={{ width: W, height: H }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            ))}
          </ScrollView>
          <View style={styles.galleryModalDots}>
            {gradientSets.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: "#fff", width: i === activeImg ? 22 : 6, opacity: i === activeImg ? 1 : 0.4 }]} />
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CARD_W = Math.round(W * 0.42);

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 4 },
  headerBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 15 },
  headerRight: { flexDirection: "row", gap: 8 },
  cartDot: { position: "absolute", top: 2, right: 2, width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  cartDotText: { fontSize: 8, color: "#fff", fontWeight: "900" },

  gallery: { position: "relative", overflow: "hidden" },
  imgLabel: { position: "absolute", bottom: 0, left: 14, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 8 },
  imgLabelText: { fontSize: 10, color: "rgba(255,255,255,0.85)" },
  galleryBadge: { position: "absolute", left: 14, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  trendingBadge: { position: "absolute", right: 14, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  galleryBadgeText: { fontSize: 10, color: "#fff" },
  dotContainer: { position: "absolute", bottom: 16, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 5, alignItems: "center" },
  dot: { height: 5, borderRadius: 3 },
  imgCountBadge: { position: "absolute", bottom: 14, right: 14, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  imgCountText: { fontSize: 11, color: "#fff" },

  infoCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -26, paddingHorizontal: 18, paddingTop: 22, paddingBottom: 8, gap: 20 },

  badgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  categoryTag: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 },
  badgesRight: { flexDirection: "row", gap: 6 },
  miniBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  miniBadgeText: { fontSize: 10 },

  productName: { fontSize: Math.round(W * 0.057), lineHeight: Math.round(W * 0.072) },
  productSubtitle: { fontSize: 13, marginTop: -12 },

  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandText: { fontSize: 12 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3, marginLeft: 4 },
  verifiedText: { fontSize: 12 },

  ratingCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 14, borderWidth: 1, padding: 14 },
  ratingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  ratingPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  ratingPillText: { fontSize: 13, color: "#fff" },
  ratingCount: { fontSize: 14 },
  ratingSubtext: { fontSize: 11 },

  priceCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 6 },
  offerTimer: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 },
  offerTimerText: { fontSize: 11, color: "#dc2626" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  priceMain: { fontSize: Math.round(W * 0.075) },
  priceMRP: { fontSize: 14, textDecorationLine: "line-through" },
  discountBubble: { backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  discountBubbleText: { fontSize: 13, color: "#16a34a" },
  savingsText: { fontSize: 13 },
  priceFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 },
  gstText: { fontSize: 11 },
  emiPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  emiText: { fontSize: 11 },

  stockRow: { flexDirection: "row", alignItems: "center", marginTop: -8 },
  stockChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13 },

  section: { gap: 0 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16 },
  sectionValue: { fontSize: 14 },
  seeAll: { fontSize: 13 },
  sizeGuideRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sizeGuideLink: { fontSize: 12 },
  sizeGuideSep: { fontSize: 12 },

  colorRow: { gap: 14, paddingBottom: 4 },
  colorSwatch: { alignItems: "center", gap: 6, padding: 3, borderRadius: 22 },
  colorInner: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  colorLabel: { fontSize: 10 },

  sizeRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  sizeChip: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5 },
  sizeText: { fontSize: 13 },
  sizeTip: { fontSize: 12, marginTop: 8 },

  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureCard: { borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 6, width: (W - 36 - 20) / 3 },
  featureIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 10, textAlign: "center" },

  descSection: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 0, gap: 10 },
  descText: { fontSize: 14, lineHeight: 23 },
  readMore: { fontSize: 13, marginTop: 4 },

  fabricCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  fabricRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  fabricLabel: { flex: 1, fontSize: 13 },
  fabricValue: { fontSize: 13 },

  deliveryCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", padding: 14, gap: 12 },
  pincodeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pincodeInput: { flex: 1, fontSize: 14, height: 40 },
  pincodeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  pincodeBtnText: { fontSize: 13, color: "#fff" },
  deliveryResult: { flexDirection: "row", alignItems: "center", gap: 5 },
  deliveryResultText: { fontSize: 13 },
  deliveryDivider: { height: 1 },
  deliveryBadges: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  deliveryBadgeItem: { width: (W - 56) / 2, alignItems: "center", gap: 4 },
  deliveryIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  deliveryBadgeLabel: { fontSize: 12, textAlign: "center" },
  deliveryBadgeSub: { fontSize: 10, textAlign: "center" },

  offersCol: { gap: 10 },
  offerCard: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  offerIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  offerCode: { fontSize: 13, letterSpacing: 0.5 },
  offerDesc: { fontSize: 12, marginTop: 2 },
  offerCopy: { fontSize: 11, letterSpacing: 0.5 },

  carouselList: { gap: 12, paddingRight: 4 },
  carouselCard: { width: CARD_W },

  reviewSummary: { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: "row", gap: 16, marginBottom: 14 },
  reviewSummaryLeft: { alignItems: "center", gap: 4 },
  reviewBigRating: { fontSize: 40 },
  reviewStars: { flexDirection: "row", gap: 2, alignItems: "center" },
  reviewCount: { fontSize: 11, textAlign: "center" },
  reviewBars: { flex: 1, gap: 6 },
  reviewBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewBarStar: { fontSize: 11, width: 20, textAlign: "right" },
  reviewBarTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  reviewBarFill: { height: "100%", borderRadius: 3 },
  reviewBarPct: { fontSize: 10, width: 28 },
  reviewCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12, gap: 10 },
  reviewTop: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  reviewAvatarText: { fontSize: 16, color: "#fff" },
  reviewNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  reviewName: { fontSize: 14 },
  verifiedChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedChipText: { fontSize: 10, color: "#16a34a" },
  reviewDate: { fontSize: 10, marginLeft: 6 },
  reviewText: { fontSize: 13.5, lineHeight: 21 },
  reviewActions: { flexDirection: "row", gap: 16 },
  helpfulBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  helpfulText: { fontSize: 12 },

  qaCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  qaTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  qaIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  qaIconText: { fontSize: 13 },
  qaQuestion: { fontSize: 13.5, flex: 1 },
  qaAsked: { fontSize: 11, marginTop: 2 },
  qaAnswer: { flexDirection: "row", gap: 10, borderTopWidth: 1, marginTop: 12, paddingTop: 12, alignItems: "flex-start" },
  qaAnswerText: { fontSize: 13, flex: 1, lineHeight: 20 },
  askBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  askBtnText: { fontSize: 12 },

  storeCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 16 },
  storeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  storeIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  storeName: { fontSize: 14 },
  storeTagline: { fontSize: 12, marginTop: 2 },
  visitBtn: { borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  visitBtnText: { fontSize: 12 },
  storeStats: { flexDirection: "row", justifyContent: "space-around" },
  storeStat: { alignItems: "center", gap: 3 },
  storeStatVal: { fontSize: 15 },
  storeStatLabel: { fontSize: 10 },

  trustGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  trustItem: { borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 5, width: (W - 36 - 20) / 3 },
  trustText: { fontSize: 10, textAlign: "center" },

  actionBar: {
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
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  actionBarPriceCol: { gap: 2 },
  actionBarPrice: { fontSize: Math.round(W * 0.055) },
  actionBarSavings: { fontSize: 11 },
  actionBarBtns: { flexDirection: "row", gap: 10 },
  cartBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14 },
  cartBtnText: { fontSize: 13 },
  buyBtn: { paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14 },
  buyBtnText: { fontSize: 14, color: "#fff" },

  galleryModal: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  galleryCloseBtn: { position: "absolute", right: 16, zIndex: 10, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  galleryModalDots: { position: "absolute", bottom: 40, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 5 },
});
