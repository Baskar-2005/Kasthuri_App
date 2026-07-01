import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const { width: SW } = Dimensions.get("window");
const ND = Platform.OS !== "web";
const IS_IOS = Platform.OS === "ios";
const IS_WEB = Platform.OS === "web";

// ─── FONTS ─────────────────────────────────────────────────────────────────────
const PP = {
  light: "Poppins_300Light",
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
  extrabold: "Poppins_800ExtraBold",
  black: "Poppins_900Black",
} as const;

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ─── DATA ──────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  { id: "1", image: require("../../assets/images/banner1.png"), eyebrow: "New Collection 2025", title: "Festival\nSeason", subtitle: "Premium silk sarees up to 60% off", cta: "Explore Now" },
  { id: "2", image: require("../../assets/images/banner2.png"), eyebrow: "Luxury Bridal", title: "Brides of\nTomorrow", subtitle: "Exquisite lehengas & designer sarees", cta: "View Collection" },
  { id: "3", image: require("../../assets/images/banner3.png"), eyebrow: "Heritage Craft", title: "Handwoven\nMasters", subtitle: "Authentic Kanjivaram & Banarasi silk", cta: "Shop Now" },
];

const CATEGORIES = [
  { id: "women", name: "Women", emoji: "👗", gradient: ["#9B3D8C", "#5B1E6B"] as [string, string] },
  { id: "men", name: "Men", emoji: "🥻", gradient: ["#1A4D7C", "#0E2A44"] as [string, string] },
  { id: "kids", name: "Kids", emoji: "🌟", gradient: ["#E07B39", "#A84A1A"] as [string, string] },
  { id: "silver", name: "Silver", emoji: "💎", gradient: ["#5E6E6E", "#2E3E3E"] as [string, string] },
  { id: "festival", name: "Festival", emoji: "✨", gradient: ["#B8860B", "#7A5500"] as [string, string] },
  { id: "new", name: "New In", emoji: "🔥", gradient: ["#6B1A1A", "#2C1206"] as [string, string] },
  { id: "all", name: "View All", emoji: "🛍️", gradient: ["#444", "#222"] as [string, string] },
];

const TRENDING = [
  { id: "t1", name: "Kanjivaram Silks", count: "142 styles", gradient: ["#6B1A1A", "#2C1206"] as [string, string], badge: "Trending" },
  { id: "t2", name: "Bridal Lehengas", count: "89 styles", gradient: ["#4A1A6B", "#1E0A2C"] as [string, string], badge: "New" },
  { id: "t3", name: "Anarkali Sets", count: "67 styles", gradient: ["#1A4A6B", "#0A1E2C"] as [string, string], badge: "Hot" },
];

const NEW_ARRIVALS = [
  { id: "na1", name: "Zari Border Saree", price: 4299, original: 6999, discount: 39, rating: 4.8, gradient: ["#6B1A1A", "#3D0E0E"] as [string, string], badge: "New" },
  { id: "na2", name: "Raw Silk Lehenga", price: 12499, original: 18999, discount: 34, rating: 4.9, gradient: ["#C9A84C", "#7A5A00"] as [string, string], badge: "Bestseller" },
  { id: "na3", name: "Embroidered Anarkali", price: 5999, original: 8999, discount: 33, rating: 4.7, gradient: ["#4A1A6B", "#200D30"] as [string, string], badge: "Premium" },
  { id: "na4", name: "Patola Silk Dupatta", price: 2899, original: 4500, discount: 36, rating: 4.6, gradient: ["#1A5C4A", "#0A2E24"] as [string, string], badge: "Rare" },
  { id: "na5", name: "Banarasi Brocade", price: 7499, original: 11999, discount: 37, rating: 4.9, gradient: ["#8B2252", "#3D0E24"] as [string, string], badge: "Limited" },
];

const BEST_SELLERS = [
  { id: "bs1", name: "Pure Kanjivaram", price: 15999, original: 22999, rating: 5.0, reviews: 1240, gradient: ["#6B1A1A", "#2C1206"] as [string, string] },
  { id: "bs2", name: "Wedding Lehenga", price: 28999, original: 45000, rating: 4.9, reviews: 890, gradient: ["#C9A84C", "#6B4B00"] as [string, string] },
  { id: "bs3", name: "Designer Saree", price: 9499, original: 14999, rating: 4.8, reviews: 2100, gradient: ["#2C1A6B", "#110A30"] as [string, string] },
  { id: "bs4", name: "Embroidered Suit", price: 4999, original: 7499, rating: 4.7, reviews: 765, gradient: ["#1A5A6B", "#0A2830"] as [string, string] },
];

const LIMITED_OFFERS = [
  { id: "lo1", title: "Flash Sale", subtitle: "All sarees flat 50% off", gradient: ["#6B1A1A", "#2C1206"] as [string, string], discount: "50%" },
  { id: "lo2", title: "Weekend Special", subtitle: "Buy 2 get 1 free on kurtas", gradient: ["#C9A84C", "#7A5500"] as [string, string], discount: "Free" },
  { id: "lo3", title: "New User Offer", subtitle: "₹500 off your first purchase", gradient: ["#1A4A6B", "#0A2030"] as [string, string], discount: "₹500" },
];

const LOOKS = [
  { id: "l1", title: "The Wedding\nGuest", tag: "12 pieces", emoji: "💍", gradient: ["#6B1A1A", "#2C1206", "#C9A84C"] as [string, string, string] },
  { id: "l2", title: "Festive\nGlow", tag: "8 pieces", emoji: "🪔", gradient: ["#4A1A6B", "#1E0A2C", "#C9A84C"] as [string, string, string] },
  { id: "l3", title: "Office\nElegance", tag: "10 pieces", emoji: "💼", gradient: ["#1A4A6B", "#0A1E2C", "#5BA8C9"] as [string, string, string] },
];

const GALLERY_ITEMS = [
  { id: "g1", h: 200, g: ["#6B1A1A", "#2C1206"] as [string, string], likes: "2.4K" },
  { id: "g2", h: 150, g: ["#C9A84C", "#7A5500"] as [string, string], likes: "1.8K" },
  { id: "g3", h: 165, g: ["#4A1A6B", "#200D30"] as [string, string], likes: "3.1K" },
  { id: "g4", h: 210, g: ["#1A4A6B", "#0A1E2C"] as [string, string], likes: "987" },
  { id: "g5", h: 140, g: ["#5C1A4A", "#2A0D22"] as [string, string], likes: "1.2K" },
  { id: "g6", h: 185, g: ["#1A5C1A", "#0A2C0A"] as [string, string], likes: "2.7K" },
  { id: "g7", h: 155, g: ["#6B4B00", "#3A2900"] as [string, string], likes: "845" },
  { id: "g8", h: 195, g: ["#2C1A6B", "#110A30"] as [string, string], likes: "3.5K" },
];

const REVIEWS = [
  { id: "r1", name: "Priya S.", city: "Chennai", rating: 5, text: "Absolutely stunning quality! The Kanjivaram saree exceeded all my expectations. The silk is pure and the zari work is exquisite.", avatar: "P", date: "Dec 2024", orders: 8 },
  { id: "r2", name: "Meera R.", city: "Bangalore", rating: 5, text: "Best bridal lehenga shopping experience! The team helped me choose the perfect outfit and delivery was super fast. Highly recommend!", avatar: "M", date: "Jan 2025", orders: 3 },
  { id: "r3", name: "Kavitha A.", city: "Coimbatore", rating: 5, text: "Pure silk sarees at very reasonable prices. The craftsmanship is unmatched. Will definitely order again!", avatar: "K", date: "Nov 2024", orders: 12 },
  { id: "r4", name: "Deepa N.", city: "Mumbai", rating: 5, text: "Received so many compliments on my Banarasi saree! The packaging was premium. Kasthuribai is my go-to brand now.", avatar: "D", date: "Jan 2025", orders: 5 },
];

const CATEGORY_GRID = [
  { id: "cg1", name: "Women's", sub: "Sarees & Lehengas", gradient: ["#6B1A1A", "#2C1206"] as [string, string] },
  { id: "cg2", name: "Men's", sub: "Sherwanis & Kurtas", gradient: ["#1A3A6B", "#0A1A30"] as [string, string] },
  { id: "cg3", name: "Kids", sub: "Ethnic Wear", gradient: ["#E07B39", "#A84A1A"] as [string, string] },
  { id: "cg4", name: "Silver", sub: "Jewellery", gradient: ["#4A4A4A", "#1A1A1A"] as [string, string] },
  { id: "cg5", name: "Festival", sub: "Special Picks", gradient: ["#C9A84C", "#7A5500"] as [string, string] },
  { id: "cg6", name: "Heritage", sub: "Handlooms", gradient: ["#4A1A6B", "#200D30"] as [string, string] },
];

// ─── HOOKS ─────────────────────────────────────────────────────────────────────
function useCountdown(totalSecs = 11 * 3600 + 47 * 60 + 13) {
  const [secs, setSecs] = useState(totalSecs);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return { h: Math.floor(secs / 3600), m: Math.floor((secs % 3600) / 60), s: secs % 60 };
}

function useStagger(count: number, delay = 200, step = 70) {
  const anims = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(step, anims.map(a =>
      Animated.timing(a, { toValue: 1, duration: 480, delay, useNativeDriver: ND })
    )).start();
  }, []);
  return anims;
}

// ─── SECTION HEADER ────────────────────────────────────────────────────────────
function SecHead({ title, sub, cta, onCta }: { title: string; sub?: string; cta?: string; onCta?: () => void }) {
  return (
    <View style={sh.row}>
      <View style={{ flex: 1 }}>
        <Text style={sh.title}>{title}</Text>
        {sub ? <Text style={sh.sub}>{sub}</Text> : null}
      </View>
      {cta ? (
        <Pressable onPress={onCta} style={sh.ctaBtn}>
          <Text style={sh.ctaText}>{cta}</Text>
          <Ionicons name="arrow-forward" size={13} color="#C9A84C" />
        </Pressable>
      ) : null}
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", marginHorizontal: 20, marginBottom: 14, marginTop: 36 },
  title: { fontFamily: PP.bold, fontSize: 21, color: "#1A0800", letterSpacing: -0.4 },
  sub: { fontFamily: PP.regular, fontSize: 12, color: "#8B7355", marginTop: 1 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FAF7F0", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "#E8D5B7" },
  ctaText: { fontFamily: PP.semibold, fontSize: 12, color: "#C9A84C" },
});

// ─── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ name, price, original, rating, gradient, badge, reviews, anim }: {
  name: string; price: number; original: number; rating: number;
  gradient: [string, string]; badge?: string; reviews?: number; anim?: Animated.Value;
}) {
  const [wished, setWished] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const discount = Math.round(((original - price) / original) * 100);

  const onHeart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setWished(w => !w);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.45, duration: 110, useNativeDriver: ND }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: ND }),
    ]).start();
  };

  const outer = anim ? {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
  } : {};

  return (
    <Animated.View style={[pc.wrap, outer]}>
      <Pressable onPress={() => router.push("/product/1")}>
        <LinearGradient colors={gradient} style={pc.img} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {badge && <View style={pc.badge}><Text style={pc.badgeTxt}>{badge}</Text></View>}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View style={pc.disc}><Text style={pc.discTxt}>{discount}% OFF</Text></View>
            <Pressable onPress={onHeart} style={pc.heart} hitSlop={10}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons name={wished ? "heart" : "heart-outline"} size={18} color={wished ? "#FF4D6D" : "#fff"} />
              </Animated.View>
            </Pressable>
          </View>
        </LinearGradient>
        <View style={pc.info}>
          <Text style={pc.name} numberOfLines={1}>{name}</Text>
          <View style={pc.priceRow}>
            <Text style={pc.price}>{fmt(price)}</Text>
            <Text style={pc.orig}>{fmt(original)}</Text>
          </View>
          <View style={pc.ratingRow}>
            <Ionicons name="star" size={11} color="#C9A84C" />
            <Text style={pc.rating}>{rating.toFixed(1)}</Text>
            {reviews ? <Text style={pc.ratingCount}>({reviews.toLocaleString()})</Text> : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
const pc = StyleSheet.create({
  wrap: { width: 168, marginRight: 14, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", shadowColor: "#6B1A1A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 5 },
  img: { width: 168, height: 210, padding: 10, justifyContent: "space-between" },
  badge: { backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  badgeTxt: { fontFamily: PP.semibold, fontSize: 10, color: "#fff", letterSpacing: 0.5 },
  disc: { backgroundColor: "#C9A84C", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  discTxt: { fontFamily: PP.bold, fontSize: 10, color: "#1A0800" },
  heart: { backgroundColor: "rgba(0,0,0,0.28)", borderRadius: 20, padding: 6 },
  info: { padding: 12, gap: 4 },
  name: { fontFamily: PP.semibold, fontSize: 13, color: "#1A0800" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontFamily: PP.bold, fontSize: 15, color: "#6B1A1A" },
  orig: { fontFamily: PP.regular, fontSize: 12, color: "#8B7355", textDecorationLine: "line-through" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontFamily: PP.semibold, fontSize: 11, color: "#2C1206" },
  ratingCount: { fontFamily: PP.regular, fontSize: 11, color: "#8B7355" },
});

// ─── COUNTDOWN BOX ─────────────────────────────────────────────────────────────
function CdBox({ val, label }: { val: number; label: string }) {
  return (
    <View style={{ alignItems: "center", gap: 3 }}>
      <LinearGradient colors={["#6B1A1A", "#2C1206"]} style={cdb.box}>
        <Text style={cdb.num}>{String(val).padStart(2, "0")}</Text>
      </LinearGradient>
      <Text style={cdb.label}>{label}</Text>
    </View>
  );
}
const cdb = StyleSheet.create({
  box: { width: 46, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  num: { fontFamily: PP.black, fontSize: 18, color: "#C9A84C" },
  label: { fontFamily: PP.medium, fontSize: 9, color: "#8B7355", textTransform: "uppercase", letterSpacing: 1.2 },
});

// ─── APP BAR ───────────────────────────────────────────────────────────────────
function AppBar({ scrollY, topInset }: { scrollY: Animated.Value; topInset: number }) {
  const bgOp = scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: "clamp" });
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.3, duration: 700, useNativeDriver: ND }),
        Animated.timing(badgePulse, { toValue: 1, duration: 700, useNativeDriver: ND }),
      ])
    ).start();
  }, []);

  return (
    <View style={[abb.outer, { height: topInset + 64, paddingTop: topInset }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOp }]}>
        {IS_IOS ? (
          <BlurView intensity={85} tint="extraLight" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(250,247,240,0.96)" }]} />
        )}
        <View style={[StyleSheet.absoluteFill, { borderBottomWidth: 1, borderBottomColor: "#E8D5B7", top: undefined, bottom: 0 }]} />
      </Animated.View>

      <View style={abb.inner}>
        <View style={abb.left}>
          <LinearGradient colors={["#C9A84C", "#6B1A1A"]} style={abb.logo}>
            <Text style={abb.logoText}>K</Text>
          </LinearGradient>
          <View>
            <Text style={abb.greeting}>Good Morning ✨</Text>
            <Text style={abb.brand}>Kasthuribai</Text>
          </View>
        </View>

        <View style={abb.right}>
          <Pressable onPress={() => router.push("/search")} style={abb.iconBtn}>
            <Ionicons name="search-outline" size={22} color="#1A0800" />
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/wishlist")} style={abb.iconBtn}>
            <Ionicons name="heart-outline" size={22} color="#1A0800" />
          </Pressable>
          <Pressable onPress={() => router.push("/notifications")} style={abb.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#1A0800" />
            <Animated.View style={[abb.badge, { transform: [{ scale: badgePulse }] }]}>
              <Text style={abb.badgeNum}>3</Text>
            </Animated.View>
          </Pressable>
          <Pressable onPress={() => router.push("/cart")} style={abb.cartBtn}>
            <Ionicons name="bag-handle-outline" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
const abb = StyleSheet.create({
  outer: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 },
  inner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, flex: 1 },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  logoText: { fontFamily: PP.black, fontSize: 20, color: "#fff" },
  greeting: { fontFamily: PP.regular, fontSize: 11, color: "#8B7355", lineHeight: 16 },
  brand: { fontFamily: PP.extrabold, fontSize: 18, color: "#1A0800", letterSpacing: -0.5 },
  right: { flexDirection: "row", alignItems: "center", gap: 2 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  cartBtn: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#6B1A1A", justifyContent: "center", alignItems: "center", marginLeft: 4 },
  badge: { position: "absolute", top: 5, right: 5, width: 14, height: 14, borderRadius: 7, backgroundColor: "#C9A84C", justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#FAF7F0" },
  badgeNum: { fontFamily: PP.black, fontSize: 7, color: "#1A0800" },
});

// ─── HERO ──────────────────────────────────────────────────────────────────────
function Hero({ scrollY }: { scrollY: Animated.Value }) {
  const [idx, setIdx] = useState(0);
  const slideOp = useRef(new Animated.Value(1)).current;
  const textY = useRef(new Animated.Value(0)).current;
  const parallax = scrollY.interpolate({ inputRange: [0, 500], outputRange: [0, -100], extrapolate: "clamp" });
  const HERO_H = IS_WEB ? 520 : 580;

  useEffect(() => {
    const t = setInterval(() => {
      Animated.parallel([
        Animated.timing(slideOp, { toValue: 0, duration: 320, useNativeDriver: ND }),
        Animated.timing(textY, { toValue: -12, duration: 320, useNativeDriver: ND }),
      ]).start(() => {
        setIdx(i => (i + 1) % HERO_SLIDES.length);
        textY.setValue(14);
        Animated.parallel([
          Animated.timing(slideOp, { toValue: 1, duration: 420, useNativeDriver: ND }),
          Animated.timing(textY, { toValue: 0, duration: 420, useNativeDriver: ND }),
        ]).start();
      });
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[idx];

  return (
    <View style={{ height: HERO_H }}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: parallax }] }]}>
        <Image source={slide.image} style={{ width: "100%", height: HERO_H + 100 }} resizeMode="cover" />
        <LinearGradient colors={["transparent", "rgba(15,5,0,0.45)", "rgba(8,2,0,0.93)"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0.25 }} end={{ x: 0, y: 1 }} />
      </Animated.View>

      {/* Eyebrow pill */}
      <Animated.View style={[hro.eyebrowWrap, { opacity: slideOp }]}>
        <BlurView intensity={25} tint="dark" style={hro.eyebrow}>
          <View style={hro.dot} />
          <Text style={hro.eyebrowText}>{slide.eyebrow}</Text>
        </BlurView>
      </Animated.View>

      {/* Text block */}
      <Animated.View style={[hro.textBlock, { opacity: slideOp, transform: [{ translateY: textY }] }]}>
        <Text style={hro.title}>{slide.title}</Text>
        <Text style={hro.subtitle}>{slide.subtitle}</Text>
        <View style={hro.ctas}>
          <Pressable style={hro.mainCta} onPress={() => router.push("/(tabs)/collections")}>
            <Text style={hro.mainCtaText}>{slide.cta}</Text>
            <Ionicons name="arrow-forward" size={14} color="#1A0800" />
          </Pressable>
          <Pressable style={hro.ghostCta}>
            <Ionicons name="heart-outline" size={15} color="#fff" />
            <Text style={hro.ghostText}>Wishlist</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Dots */}
      <View style={hro.dots}>
        {HERO_SLIDES.map((_, i) => (
          <Pressable key={i} onPress={() => setIdx(i)}>
            <View style={[hro.dot2, i === idx && hro.dotActive]} />
          </Pressable>
        ))}
      </View>

      {/* Scroll indicator */}
      <View style={hro.scrollHint}>
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.6)" />
        <Text style={hro.scrollHintText}>Scroll to explore</Text>
      </View>
    </View>
  );
}
const hro = StyleSheet.create({
  eyebrowWrap: { position: "absolute", top: 80, left: 20 },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#C9A84C" },
  eyebrowText: { fontFamily: PP.medium, fontSize: 11, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" },
  textBlock: { position: "absolute", bottom: 88, left: 22, right: 22 },
  title: { fontFamily: PP.black, fontSize: IS_WEB ? 44 : 50, color: "#fff", lineHeight: IS_WEB ? 50 : 56, letterSpacing: -1.5, marginBottom: 10 },
  subtitle: { fontFamily: PP.regular, fontSize: 15, color: "rgba(255,255,255,0.78)", lineHeight: 22, marginBottom: 26 },
  ctas: { flexDirection: "row", gap: 12, alignItems: "center" },
  mainCta: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#C9A84C", paddingHorizontal: 22, paddingVertical: 13, borderRadius: 15 },
  mainCtaText: { fontFamily: PP.bold, fontSize: 14, color: "#1A0800" },
  ghostCta: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.38)", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 15 },
  ghostText: { fontFamily: PP.semibold, fontSize: 13, color: "#fff" },
  dots: { position: "absolute", bottom: 20, alignSelf: "center", flexDirection: "row", gap: 6, alignItems: "center" },
  dot2: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.38)" },
  dotActive: { width: 24, height: 6, borderRadius: 3, backgroundColor: "#C9A84C" },
  scrollHint: { position: "absolute", bottom: 60, right: 22, flexDirection: "row", alignItems: "center", gap: 4 },
  scrollHintText: { fontFamily: PP.light, fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 0.8 },
});

// ─── SEARCH ────────────────────────────────────────────────────────────────────
function SearchBar() {
  return (
    <Pressable onPress={() => router.push("/search")} style={srb.wrap}>
      <LinearGradient colors={["#6B1A1A", "#2C1206"]} style={srb.icon}>
        <Ionicons name="search-outline" size={15} color="#C9A84C" />
      </LinearGradient>
      <Text style={srb.ph}>Search sarees, lehengas, jewellery…</Text>
      <View style={srb.mic}>
        <Ionicons name="mic-outline" size={16} color="#6B1A1A" />
      </View>
    </Pressable>
  );
}
const srb = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, marginTop: 16, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 10, gap: 10, shadowColor: "#6B1A1A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 4, borderWidth: 1, borderColor: "#F0E9DC" },
  icon: { width: 34, height: 34, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  ph: { flex: 1, fontFamily: PP.regular, fontSize: 13, color: "#8B7355" },
  mic: { width: 34, height: 34, backgroundColor: "#FAF7F0", borderRadius: 11, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E8D5B7" },
});

// ─── CATEGORIES ────────────────────────────────────────────────────────────────
function CategoryRing() {
  const anims = useStagger(CATEGORIES.length, 150, 55);
  return (
    <>
      <SecHead title="Shop by Style" sub="Find your perfect look" />
      <FlatList
        data={CATEGORIES}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 18, paddingBottom: 4 }}
        renderItem={({ item, index }) => {
          const a = anims[index] ?? new Animated.Value(1);
          return (
            <Animated.View style={{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
              <Pressable onPress={() => router.push(`/category/${item.id}` as any)} style={{ alignItems: "center", gap: 7 }}>
                <LinearGradient colors={item.gradient} style={cr.circle}>
                  <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                </LinearGradient>
                <Text style={cr.label}>{item.name}</Text>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </>
  );
}
const cr = StyleSheet.create({
  circle: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  label: { fontFamily: PP.semibold, fontSize: 11, color: "#1A0800" },
});

// ─── FEATURE PILLS ─────────────────────────────────────────────────────────────
function FeaturePills() {
  const items = [
    { icon: "rocket-outline", label: "Fast Delivery", sub: "2-4 days" },
    { icon: "shield-checkmark-outline", label: "100% Genuine", sub: "Certified" },
    { icon: "refresh-outline", label: "Easy Returns", sub: "7 days" },
    { icon: "card-outline", label: "Secure Pay", sub: "256-bit" },
    { icon: "headset-outline", label: "24/7 Support", sub: "Always on" },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 28 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {items.map((b, i) => (
        <View key={i} style={fp.card}>
          <LinearGradient colors={["#6B1A1A", "#2C1206"]} style={fp.icon}>
            <Ionicons name={b.icon as any} size={17} color="#C9A84C" />
          </LinearGradient>
          <Text style={fp.label}>{b.label}</Text>
          <Text style={fp.sub}>{b.sub}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const fp = StyleSheet.create({
  card: { width: 118, backgroundColor: "#fff", borderRadius: 18, padding: 14, gap: 7, shadowColor: "#6B1A1A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: "#F0E9DC" },
  icon: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  label: { fontFamily: PP.semibold, fontSize: 12, color: "#1A0800" },
  sub: { fontFamily: PP.regular, fontSize: 10, color: "#8B7355" },
});

// ─── TRENDING ──────────────────────────────────────────────────────────────────
function TrendingSection() {
  return (
    <>
      <SecHead title="Trending Collections" sub="Most loved this season" cta="See All" />
      <FlatList
        data={TRENDING}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        renderItem={({ item }) => (
          <Pressable>
            <LinearGradient colors={item.gradient} style={tr.card}>
              <View style={tr.pill}><Text style={tr.pillText}>{item.badge}</Text></View>
              <View style={tr.bottom}>
                <Text style={tr.name}>{item.name}</Text>
                <Text style={tr.count}>{item.count}</Text>
                <View style={tr.btn}><Text style={tr.btnText}>View All</Text><Ionicons name="arrow-forward" size={12} color="#1A0800" /></View>
              </View>
            </LinearGradient>
          </Pressable>
        )}
      />
    </>
  );
}
const tr = StyleSheet.create({
  card: { width: SW * 0.74, height: 220, borderRadius: 26, padding: 22, justifyContent: "space-between" },
  pill: { backgroundColor: "rgba(255,255,255,0.18)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  pillText: { fontFamily: PP.bold, fontSize: 11, color: "#fff", textTransform: "uppercase", letterSpacing: 1 },
  bottom: { gap: 3 },
  name: { fontFamily: PP.extrabold, fontSize: 26, color: "#fff", letterSpacing: -0.5 },
  count: { fontFamily: PP.regular, fontSize: 13, color: "rgba(255,255,255,0.72)" },
  btn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#C9A84C", alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 7, borderRadius: 10, marginTop: 8 },
  btnText: { fontFamily: PP.bold, fontSize: 12, color: "#1A0800" },
});

// ─── NEW ARRIVALS ──────────────────────────────────────────────────────────────
function NewArrivalsSection() {
  const anims = useStagger(NEW_ARRIVALS.length, 250, 80);
  return (
    <>
      <SecHead title="New Arrivals" sub="Fresh off the loom" cta="View All" />
      <FlatList
        data={NEW_ARRIVALS}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item, index }) => (
          <ProductCard name={item.name} price={item.price} original={item.original} rating={item.rating} gradient={item.gradient} badge={item.badge} anim={anims[index]} />
        )}
      />
    </>
  );
}

// ─── FESTIVAL ──────────────────────────────────────────────────────────────────
function FestivalBanner() {
  const glow = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1.03, duration: 2200, useNativeDriver: ND }),
        Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: ND }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ marginHorizontal: 20, marginTop: 36, borderRadius: 30, overflow: "hidden" }}>
      <LinearGradient colors={["#6B1A1A", "#4A0E0E", "#C9A84C"]} style={fb.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={[fb.orb, { top: -35, right: -35, width: 130, height: 130 }]} />
        <View style={[fb.orb, { bottom: -50, left: -50, width: 170, height: 170 }]} />
        <View style={fb.content}>
          <View style={fb.eyebrow}><Text style={fb.eyebrowText}>✨ Limited Edition</Text></View>
          <Text style={fb.title}>Festival{"\n"}Collection{"\n"}2025</Text>
          <Text style={fb.sub}>Curated ethnic wear for every celebration</Text>
          <Animated.View style={{ transform: [{ scale: glow }] }}>
            <Pressable style={fb.cta} onPress={() => router.push("/category/festival" as any)}>
              <Text style={fb.ctaText}>Explore Festive Picks</Text>
              <Ionicons name="sparkles-outline" size={15} color="#1A0800" />
            </Pressable>
          </Animated.View>
        </View>
        <View style={fb.rightPanel}>
          <Text style={{ fontSize: 72 }}>🪔</Text>
          <Text style={fb.rightLabel}>Diwali{"\n"}Special</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
const fb = StyleSheet.create({
  card: { padding: 26, flexDirection: "row", alignItems: "center", overflow: "hidden", minHeight: 220 },
  orb: { position: "absolute", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  content: { flex: 1, gap: 10 },
  eyebrow: { backgroundColor: "rgba(201,168,76,0.22)", alignSelf: "flex-start", paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "rgba(201,168,76,0.4)" },
  eyebrowText: { fontFamily: PP.semibold, fontSize: 11, color: "#C9A84C", letterSpacing: 0.4 },
  title: { fontFamily: PP.black, fontSize: 26, color: "#fff", lineHeight: 30, letterSpacing: -0.4 },
  sub: { fontFamily: PP.regular, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 17 },
  cta: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#C9A84C", alignSelf: "flex-start", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 13 },
  ctaText: { fontFamily: PP.bold, fontSize: 13, color: "#1A0800" },
  rightPanel: { width: 100, alignItems: "center", gap: 4 },
  rightLabel: { fontFamily: PP.bold, fontSize: 12, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 16 },
});

// ─── CATEGORY GRID ─────────────────────────────────────────────────────────────
function CategoryGridSection() {
  const colW = (SW - 52) / 2;
  return (
    <>
      <SecHead title="Shop by Category" sub="Discover every style" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 12 }}>
        {CATEGORY_GRID.map(item => (
          <Pressable key={item.id} onPress={() => router.push(`/category/${item.id}` as any)}>
            <LinearGradient colors={item.gradient} style={[cg.card, { width: colW }]}>
              <View style={cg.shine} />
              <Text style={cg.name}>{item.name}</Text>
              <Text style={cg.sub}>{item.sub}</Text>
              <View style={cg.arrow}><Ionicons name="arrow-forward" size={13} color="#C9A84C" /></View>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
    </>
  );
}
const cg = StyleSheet.create({
  card: { height: 100, borderRadius: 22, padding: 16, justifyContent: "space-between", overflow: "hidden" },
  shine: { position: "absolute", top: -30, right: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.07)" },
  name: { fontFamily: PP.extrabold, fontSize: 16, color: "#fff", letterSpacing: -0.3 },
  sub: { fontFamily: PP.regular, fontSize: 11, color: "rgba(255,255,255,0.72)" },
  arrow: { backgroundColor: "rgba(255,255,255,0.15)", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", alignSelf: "flex-end" },
});

// ─── BEST SELLERS ──────────────────────────────────────────────────────────────
function BestSellersSection() {
  const anims = useStagger(BEST_SELLERS.length, 100, 80);
  return (
    <>
      <SecHead title="Best Sellers" sub="Our customers' favourites" cta="See All" />
      <FlatList
        data={BEST_SELLERS}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item, index }) => (
          <ProductCard name={item.name} price={item.price} original={item.original} rating={item.rating} reviews={item.reviews} gradient={item.gradient} anim={anims[index]} />
        )}
      />
    </>
  );
}

// ─── LIMITED OFFERS ────────────────────────────────────────────────────────────
function LimitedOffersSection() {
  const { h, m, s } = useCountdown();
  return (
    <>
      <SecHead title="Limited Offers" sub="Ends soon — don't miss out!" />
      <View style={lo.cdRow}>
        <View style={lo.cdLabel}>
          <Ionicons name="time-outline" size={15} color="#6B1A1A" />
          <Text style={lo.cdHead}>Sale ends in</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
          <CdBox val={h} label="hrs" />
          <Text style={lo.sep}>:</Text>
          <CdBox val={m} label="min" />
          <Text style={lo.sep}>:</Text>
          <CdBox val={s} label="sec" />
        </View>
      </View>
      <FlatList
        data={LIMITED_OFFERS}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14, marginTop: 16 }}
        renderItem={({ item }) => (
          <Pressable>
            <LinearGradient colors={item.gradient} style={lo.card}>
              <View style={lo.tag}><Text style={lo.tagText}>{item.discount}</Text></View>
              <Text style={lo.cardTitle}>{item.title}</Text>
              <Text style={lo.cardSub}>{item.subtitle}</Text>
              <Pressable style={lo.cardBtn}><Text style={lo.cardBtnText}>Grab Now</Text></Pressable>
            </LinearGradient>
          </Pressable>
        )}
      />
    </>
  );
}
const lo = StyleSheet.create({
  cdRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20, marginTop: -6 },
  cdLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  cdHead: { fontFamily: PP.semibold, fontSize: 13, color: "#6B1A1A" },
  sep: { fontFamily: PP.black, fontSize: 20, color: "#6B1A1A", marginTop: 5 },
  card: { width: 220, borderRadius: 24, padding: 22, gap: 9 },
  tag: { backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontFamily: PP.bold, fontSize: 13, color: "#C9A84C", letterSpacing: 0.5 },
  cardTitle: { fontFamily: PP.extrabold, fontSize: 20, color: "#fff" },
  cardSub: { fontFamily: PP.regular, fontSize: 12, color: "rgba(255,255,255,0.78)", lineHeight: 17 },
  cardBtn: { backgroundColor: "rgba(255,255,255,0.17)", alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  cardBtnText: { fontFamily: PP.bold, fontSize: 12, color: "#fff" },
});

// ─── SHOP THE LOOK ─────────────────────────────────────────────────────────────
function ShopTheLook() {
  return (
    <>
      <SecHead title="Shop the Look" sub="Curated outfits, ready to wear" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
        {LOOKS.map(look => (
          <Pressable key={look.id}>
            <LinearGradient colors={look.gradient} style={stl.card}>
              <View style={stl.orb} />
              <View style={stl.topRow}>
                <Text style={{ fontSize: 32 }}>{look.emoji}</Text>
                <View style={stl.tag}><Text style={stl.tagText}>{look.tag}</Text></View>
              </View>
              <View style={stl.bottom}>
                <Text style={stl.title}>{look.title}</Text>
                <Pressable style={stl.btn}><Text style={stl.btnText}>Style Now</Text></Pressable>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}
const stl = StyleSheet.create({
  card: { width: SW * 0.58, height: 265, borderRadius: 26, padding: 18, justifyContent: "space-between", overflow: "hidden" },
  orb: { position: "absolute", top: -55, right: -55, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.07)" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tag: { backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tagText: { fontFamily: PP.semibold, fontSize: 11, color: "#fff" },
  bottom: { gap: 10 },
  title: { fontFamily: PP.extrabold, fontSize: 21, color: "#fff", letterSpacing: -0.3 },
  btn: { backgroundColor: "rgba(201,168,76,0.88)", alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12 },
  btnText: { fontFamily: PP.bold, fontSize: 12, color: "#1A0800" },
});

// ─── RECENTLY VIEWED ───────────────────────────────────────────────────────────
function RecentlyViewedSection() {
  return (
    <>
      <SecHead title="Recently Viewed" cta="Clear" />
      <FlatList
        data={NEW_ARRIVALS.slice(0, 4)}
        keyExtractor={i => `rv${i.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable style={rvs.card} onPress={() => router.push("/product/1")}>
            <LinearGradient colors={item.gradient} style={rvs.img}>
              <View style={rvs.timePill}><Text style={rvs.timeText}>2h ago</Text></View>
            </LinearGradient>
            <View style={rvs.info}>
              <Text style={rvs.name} numberOfLines={1}>{item.name}</Text>
              <Text style={rvs.price}>{fmt(item.price)}</Text>
            </View>
          </Pressable>
        )}
      />
    </>
  );
}
const rvs = StyleSheet.create({
  card: { width: 118, backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", shadowColor: "#6B1A1A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  img: { width: 118, height: 130, justifyContent: "flex-end", padding: 8 },
  timePill: { backgroundColor: "rgba(0,0,0,0.32)", alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  timeText: { fontFamily: PP.regular, fontSize: 9, color: "rgba(255,255,255,0.9)" },
  info: { padding: 10, gap: 3 },
  name: { fontFamily: PP.semibold, fontSize: 11, color: "#1A0800" },
  price: { fontFamily: PP.bold, fontSize: 13, color: "#6B1A1A" },
});

// ─── REVIEWS ───────────────────────────────────────────────────────────────────
function ReviewsSection() {
  return (
    <>
      <SecHead title="What Customers Say" sub="Trusted by 50,000+ shoppers ⭐" />
      <FlatList
        data={REVIEWS}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 4 }}
        renderItem={({ item }) => (
          <View style={rv.card}>
            <View style={rv.top}>
              <LinearGradient colors={["#6B1A1A", "#2C1206"]} style={rv.avatar}>
                <Text style={rv.avatarText}>{item.avatar}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={rv.name}>{item.name}</Text>
                <Text style={rv.city}>{item.city} · {item.date}</Text>
              </View>
              <View style={rv.ordBox}>
                <Text style={rv.ordNum}>{item.orders}</Text>
                <Text style={rv.ordLbl}>orders</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => <Ionicons key={i} name="star" size={12} color="#C9A84C" />)}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: 6 }}>
                <Ionicons name="checkmark-circle" size={11} color="#16A34A" />
                <Text style={rv.verified}>Verified Purchase</Text>
              </View>
            </View>
            <Text style={rv.text}>{item.text}</Text>
          </View>
        )}
      />
    </>
  );
}
const rv = StyleSheet.create({
  card: { width: SW * 0.73, backgroundColor: "#fff", borderRadius: 24, padding: 18, gap: 12, shadowColor: "#6B1A1A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 4, borderWidth: 1, borderColor: "#F0E9DC" },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  avatarText: { fontFamily: PP.bold, fontSize: 18, color: "#C9A84C" },
  name: { fontFamily: PP.semibold, fontSize: 14, color: "#1A0800" },
  city: { fontFamily: PP.regular, fontSize: 11, color: "#8B7355" },
  ordBox: { alignItems: "center", backgroundColor: "#FAF7F0", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  ordNum: { fontFamily: PP.bold, fontSize: 14, color: "#6B1A1A" },
  ordLbl: { fontFamily: PP.regular, fontSize: 9, color: "#8B7355" },
  verified: { fontFamily: PP.medium, fontSize: 10, color: "#16A34A" },
  text: { fontFamily: PP.regular, fontSize: 13, color: "#2C1206", lineHeight: 20 },
});

// ─── INSTAGRAM GALLERY ─────────────────────────────────────────────────────────
function InstagramGallery() {
  const leftItems = GALLERY_ITEMS.filter((_, i) => i % 2 === 0);
  const rightItems = GALLERY_ITEMS.filter((_, i) => i % 2 !== 0);
  const colW = (SW - 52) / 2;

  const Col = ({ items }: { items: typeof GALLERY_ITEMS }) => (
    <View style={{ width: colW, gap: 12 }}>
      {items.map(item => (
        <Pressable key={item.id}>
          <LinearGradient colors={item.g} style={[ig.item, { height: item.h }]}>
            <View style={ig.likeRow}>
              <Ionicons name="heart" size={12} color="#FF4D6D" />
              <Text style={ig.likes}>{item.likes}</Text>
            </View>
            <Ionicons name="logo-instagram" size={13} color="rgba(255,255,255,0.7)" style={{ position: "absolute", top: 10, right: 10 }} />
          </LinearGradient>
        </Pressable>
      ))}
    </View>
  );

  return (
    <>
      <SecHead title="Follow Us on Instagram" sub="@kasthuribaireadymades ✨" />
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20 }}>
        <Col items={leftItems} />
        <Col items={rightItems} />
      </View>
      <Pressable style={ig.followBtn}>
        <Ionicons name="logo-instagram" size={18} color="#fff" />
        <Text style={ig.followText}>Follow on Instagram</Text>
      </Pressable>
    </>
  );
}
const ig = StyleSheet.create({
  item: { borderRadius: 18, justifyContent: "flex-end", padding: 10, overflow: "hidden" },
  likeRow: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.32)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  likes: { fontFamily: PP.semibold, fontSize: 11, color: "#fff" },
  followBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#6B1A1A", marginHorizontal: 20, marginTop: 16, paddingVertical: 14, borderRadius: 18 },
  followText: { fontFamily: PP.bold, fontSize: 14, color: "#fff" },
});

// ─── STORE BENEFITS ────────────────────────────────────────────────────────────
function StoreBenefits() {
  const items = [
    { icon: "ribbon-outline", title: "Premium Quality", desc: "Handpicked authentic fabrics from master weavers across India", color: "#6B1A1A" },
    { icon: "people-outline", title: "50,000+ Happy Customers", desc: "Trusted by families across India for over 25 years", color: "#C9A84C" },
    { icon: "leaf-outline", title: "Sustainable Fashion", desc: "Supporting traditional artisans & eco-friendly production", color: "#16A34A" },
    { icon: "medal-outline", title: "Award Winning Brand", desc: "Recognised for excellence in Indian ethnic fashion", color: "#6B1A1A" },
  ];
  return (
    <>
      <SecHead title="Why Kasthuribai?" sub="Our promise to you" />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {items.map((b, i) => (
          <View key={i} style={stb.card}>
            <View style={[stb.icon, { backgroundColor: `${b.color}18` }]}>
              <Ionicons name={b.icon as any} size={22} color={b.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={stb.title}>{b.title}</Text>
              <Text style={stb.desc}>{b.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#E8D5B7" />
          </View>
        ))}
      </View>
    </>
  );
}
const stb = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 20, padding: 16, shadowColor: "#6B1A1A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#F0E9DC" },
  icon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  title: { fontFamily: PP.semibold, fontSize: 14, color: "#1A0800", marginBottom: 3 },
  desc: { fontFamily: PP.regular, fontSize: 12, color: "#8B7355", lineHeight: 17 },
});

// ─── NEWSLETTER ────────────────────────────────────────────────────────────────
function NewsletterSection() {
  return (
    <LinearGradient colors={["#6B1A1A", "#2C1206"]} style={nl.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.85 }}>
      <View style={[nl.orb, { top: -45, right: -45, width: 160, height: 160 }]} />
      <View style={[nl.orb, { bottom: -65, left: -65, width: 200, height: 200 }]} />
      <Text style={{ fontSize: 38 }}>🎁</Text>
      <Text style={nl.title}>Get ₹200 Off{"\n"}Your First Order</Text>
      <Text style={nl.sub}>Join our exclusive list for style updates, festival offers & more.</Text>
      <View style={nl.row}>
        <TextInput placeholder="Your email address" placeholderTextColor="rgba(255,255,255,0.45)" style={nl.input} keyboardType="email-address" />
        <Pressable style={nl.btn}><Text style={nl.btnText}>Join</Text></Pressable>
      </View>
      <Text style={nl.fine}>No spam. Only the good stuff ✨</Text>
    </LinearGradient>
  );
}
const nl = StyleSheet.create({
  card: { marginHorizontal: 20, marginTop: 36, borderRadius: 30, padding: 28, gap: 12, overflow: "hidden" },
  orb: { position: "absolute", borderRadius: 999, backgroundColor: "rgba(201,168,76,0.11)" },
  title: { fontFamily: PP.extrabold, fontSize: 27, color: "#fff", lineHeight: 34, letterSpacing: -0.5 },
  sub: { fontFamily: PP.regular, fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 19 },
  row: { flexDirection: "row", gap: 8, marginTop: 4 },
  input: { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 15, paddingHorizontal: 16, paddingVertical: 13, fontFamily: PP.regular, fontSize: 14, color: "#fff", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  btn: { backgroundColor: "#C9A84C", paddingHorizontal: 20, justifyContent: "center", borderRadius: 15 },
  btnText: { fontFamily: PP.bold, fontSize: 14, color: "#1A0800" },
  fine: { fontFamily: PP.regular, fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center" },
});

// ─── ROOT SCREEN ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const topInset = IS_WEB ? 0 : insets.top;
  const APP_BAR_H = topInset + 64;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar scrollY={scrollY} topInset={topInset} />

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: ND })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: APP_BAR_H, paddingBottom: IS_WEB ? 100 : 120 + insets.bottom }}
      >
        <Hero scrollY={scrollY} />
        <SearchBar />
        <CategoryRing />
        <FeaturePills />
        <TrendingSection />
        <NewArrivalsSection />
        <FestivalBanner />
        <CategoryGridSection />
        <BestSellersSection />
        <LimitedOffersSection />
        <ShopTheLook />
        <RecentlyViewedSection />
        <ReviewsSection />
        <InstagramGallery />
        <StoreBenefits />
        <NewsletterSection />

        {/* Footer */}
        <View style={{ alignItems: "center", marginTop: 44, gap: 6, paddingBottom: 24 }}>
          <LinearGradient colors={["#6B1A1A", "#C9A84C"]} style={{ paddingHorizontal: 22, paddingVertical: 9, borderRadius: 20 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={{ fontFamily: PP.extrabold, fontSize: 17, color: "#fff", letterSpacing: -0.3 }}>Kasthuribai</Text>
          </LinearGradient>
          <Text style={{ fontFamily: PP.medium, fontSize: 12, color: "#8B7355" }}>Ready Mades · Since 1999 · Chennai</Text>
          <Text style={{ fontFamily: PP.regular, fontSize: 11, color: "#C8B99A" }}>© 2025 Kasthuribai Ready Mades. All rights reserved.</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
