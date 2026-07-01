import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Banner } from "@/constants/mockData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 32;

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (activeIndex + 1) % banners.length;
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      scrollRef.current?.scrollTo({ x: next * BANNER_WIDTH + next * 12, animated: true });
      setActiveIndex(next);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeIndex, banners.length, fadeAnim]);

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (BANNER_WIDTH + 12));
    if (index !== activeIndex) setActiveIndex(index);
  };

  const bannerImages = [
    require("../assets/images/banner1.png"),
    require("../assets/images/banner2.png"),
    require("../assets/images/banner3.png"),
  ];

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={BANNER_WIDTH + 12}
          decelerationRate="fast"
          contentContainerStyle={styles.scroll}
          onMomentumScrollEnd={handleScroll}
        >
          {banners.map((banner, i) => (
            <Pressable key={banner.id} style={styles.bannerCard} android_ripple={{ color: "rgba(255,255,255,0.1)" }}>
              <Image
                source={bannerImages[i % bannerImages.length]}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={styles.overlay} />
              <View style={styles.tagRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{banner.tag}</Text>
                </View>
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{banner.title}</Text>
                <Text style={styles.subtitle}>{banner.subtitle}</Text>
                <View style={styles.ctaBtn}>
                  <Text style={styles.ctaText}>{banner.cta}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <View style={styles.dots}>
        {banners.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                width: i === activeIndex ? 20 : 6,
                opacity: i === activeIndex ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16 },
  scroll: { gap: 12, paddingRight: 32 },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  tagRow: { padding: 14, flexDirection: "row" },
  tag: {
    backgroundColor: "rgba(201,168,76,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  content: { padding: 18, gap: 4 },
  title: { fontSize: 24, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 8 },
  ctaBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ctaText: { fontSize: 12, fontWeight: "700", color: "#6B1A1A" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 12 },
  dot: { height: 6, borderRadius: 3 },
});
