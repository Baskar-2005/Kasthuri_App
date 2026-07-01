import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface PromoItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  tag: string;
  colors: [string, string];
  icon: string;
}

const PROMOS: PromoItem[] = [
  {
    id: "1",
    title: "Wedding Season Sale",
    subtitle: "Up to 40% off on bridal collections",
    cta: "Shop Now",
    tag: "Limited Time",
    colors: ["#6B1A1A", "#2C1206"],
    icon: "heart",
  },
  {
    id: "2",
    title: "New Arrivals",
    subtitle: "Fresh ethnic styles just dropped",
    cta: "Explore",
    tag: "Just In",
    colors: ["#8B6914", "#C9A84C"],
    icon: "sparkles",
  },
  {
    id: "3",
    title: "Festival Exclusive",
    subtitle: "Celebrate with premium handwoven",
    cta: "Discover",
    tag: "Exclusive",
    colors: ["#3A5C2C", "#1A3A0D"],
    icon: "star",
  },
  {
    id: "4",
    title: "Silver Jewellery Week",
    subtitle: "Handcrafted 925 silver, up to 30% off",
    cta: "Browse",
    tag: "This Week",
    colors: ["#505060", "#303040"],
    icon: "diamond",
  },
];

export function PromoBanner({ index }: { index: number }) {
  const promo = PROMOS[index % PROMOS.length];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60 }).start()}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <LinearGradient
          colors={promo.colors}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.leftContent}>
            <View style={styles.tagRow}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{promo.tag}</Text>
              </View>
            </View>
            <Text style={[styles.title, { fontFamily: "Poppins_700Bold" }]}>{promo.title}</Text>
            <Text style={[styles.subtitle, { fontFamily: "Poppins_400Regular" }]}>{promo.subtitle}</Text>
            <View style={styles.ctaRow}>
              <Text style={[styles.ctaText, { fontFamily: "Poppins_600SemiBold" }]}>{promo.cta}</Text>
              <Ionicons name="arrow-forward" size={13} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={promo.icon as any} size={32} color="rgba(255,255,255,0.25)" />
            </View>
            <View style={styles.iconCircle2}>
              <Ionicons name={promo.icon as any} size={20} color="rgba(255,255,255,0.15)" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 8 },
  banner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 100,
  },
  leftContent: { flex: 1, gap: 4 },
  tagRow: { marginBottom: 2 },
  tagPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  tagText: { fontSize: 9.5, color: "#fff", fontFamily: "Poppins_600SemiBold", letterSpacing: 0.5 },
  title: { fontSize: 16, color: "#fff", lineHeight: 22 },
  subtitle: { fontSize: 11.5, color: "rgba(255,255,255,0.8)", lineHeight: 17 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  ctaText: { fontSize: 13, color: "rgba(255,255,255,0.95)" },
  iconContainer: { width: 80, alignItems: "center", justifyContent: "center", position: "relative" },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle2: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
