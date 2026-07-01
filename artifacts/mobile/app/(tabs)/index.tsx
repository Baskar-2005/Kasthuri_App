import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

import { HomeHeader } from "@/components/HomeHeader";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { ReviewCard } from "@/components/ReviewCard";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { useColors } from "@/hooks/useColors";
import {
  BANNERS,
  CATEGORIES,
  PRODUCTS,
  REVIEWS,
} from "@/constants/mockData";

const { width: W } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const trending = PRODUCTS.slice(0, 5);
  const newArrivals = PRODUCTS.slice(3, 7);
  const pairs: typeof PRODUCTS[] = [];
  for (let i = 0; i < newArrivals.length; i += 2) {
    pairs.push(newArrivals.slice(i, i + 2));
  }

  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 80;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <HomeHeader cartCount={2} notificationCount={3} />

      {/* Hero Carousel */}
      <View style={styles.section}>
        <HeroBanner banners={BANNERS} />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <SectionHeader title="Shop by Category" onSeeAll={() => router.push("/category/all" as any)} />
        <FlatList
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => <CategoryCard category={item} />}
        />
      </View>

      {/* Trending Now */}
      <View style={styles.section}>
        <SectionHeader
          title="Trending Now"
          subtitle="Most loved this week"
          onSeeAll={() => router.push("/collections")}
        />
        <FlatList
          data={trending}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <View style={{ width: 160, marginRight: 12 }}>
              <ProductCard
                product={{ ...item, isWishlisted: wishlist.has(item.id) }}
                layout="grid"
                onWishlistToggle={toggleWishlist}
              />
            </View>
          )}
        />
      </View>

      {/* New Arrivals Grid */}
      <View style={styles.section}>
        <SectionHeader
          title="New Arrivals"
          subtitle="Just landed in our store"
          onSeeAll={() => router.push("/collections")}
        />
        <View style={styles.gridContainer}>
          {pairs.map((pair, pi) => (
            <View key={pi} style={styles.gridRow}>
              {pair.map((product) => (
                <View key={product.id} style={styles.gridCell}>
                  <ProductCard
                    product={{ ...product, isWishlisted: wishlist.has(product.id) }}
                    layout="grid"
                    onWishlistToggle={toggleWishlist}
                  />
                </View>
              ))}
              {pair.length === 1 && <View style={styles.gridCell} />}
            </View>
          ))}
        </View>
      </View>

      {/* Festival Banner */}
      <Pressable
        style={styles.festivalBanner}
        onPress={() => router.push({ pathname: "/category/[id]", params: { id: "5", name: "Festival" } })}
      >
        <LinearGradient
          colors={["#C9A84C", "#6B1A1A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.festivalGradient}
        >
          <View>
            <Text style={styles.festivalTag}>Festive Season 2025</Text>
            <Text style={styles.festivalTitle}>Grand Festival{"\n"}Sale is Live!</Text>
            <Text style={styles.festivalSub}>Up to 60% off on select styles</Text>
          </View>
          <View style={styles.festivalCta}>
            <Text style={styles.festivalCtaText}>Shop</Text>
            <Ionicons name="arrow-forward" size={14} color="#6B1A1A" />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Today's Deals */}
      <View style={styles.section}>
        <SectionHeader
          title="Today's Deals"
          subtitle="Limited time offers"
          onSeeAll={() => router.push("/collections")}
        />
        <FlatList
          data={PRODUCTS.slice(1, 6)}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <View style={{ width: 160, marginRight: 12 }}>
              <ProductCard
                product={{ ...item, isWishlisted: wishlist.has(item.id) }}
                layout="grid"
                onWishlistToggle={toggleWishlist}
              />
            </View>
          )}
        />
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <SectionHeader title="Customer Stories" subtitle="Real experiences from our community" />
        <FlatList
          data={REVIEWS}
          keyExtractor={(r) => r.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <View style={{ width: W - 64, marginRight: 12 }}>
              <ReviewCard review={item} />
            </View>
          )}
        />
      </View>

      {/* Store Highlights */}
      <View style={[styles.section, { paddingHorizontal: 16 }]}>
        <View style={[styles.highlightsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.highlightsTitle, { color: colors.foreground }]}>Why Kasthuribai?</Text>
          {[
            { icon: "ribbon", text: "30+ Years of Trust & Heritage" },
            { icon: "shield-checkmark", text: "100% Authentic Handcrafted Products" },
            { icon: "flash", text: "Express Delivery Across India" },
            { icon: "refresh-circle", text: "Easy 30-day Returns & Exchanges" },
          ].map((item, i) => (
            <View key={i} style={styles.highlightRow}>
              <View style={[styles.highlightIcon, { backgroundColor: colors.primary + "18" }]}>
                <Ionicons name={item.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.highlightText, { color: colors.foreground }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Newsletter */}
      <Pressable style={[styles.newsletter, { backgroundColor: colors.primary }]}>
        <Ionicons name="mail" size={24} color={colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.newsletterTitle}>Get Exclusive Offers</Text>
          <Text style={styles.newsletterSub}>Subscribe to our newsletter for early access to sales & new collections</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 24 },
  catList: { paddingHorizontal: 16, gap: 10 },
  productList: { paddingHorizontal: 16 },
  gridContainer: { paddingHorizontal: 16 },
  gridRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  gridCell: { flex: 1 },
  festivalBanner: { marginHorizontal: 16, marginBottom: 24, borderRadius: 20, overflow: "hidden" },
  festivalGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 130,
  },
  festivalTag: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.8)", letterSpacing: 1, marginBottom: 6 },
  festivalTitle: { fontSize: 24, fontWeight: "800", color: "#fff", lineHeight: 30 },
  festivalSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  festivalCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  festivalCtaText: { fontSize: 13, fontWeight: "700", color: "#6B1A1A" },
  highlightsCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  highlightsTitle: { fontSize: 17, fontWeight: "800", marginBottom: 4 },
  highlightRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  highlightIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  highlightText: { fontSize: 14, flex: 1 },
  newsletter: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  newsletterTitle: { fontSize: 14, fontWeight: "700", color: "#fff", marginBottom: 3 },
  newsletterSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 16 },
});
