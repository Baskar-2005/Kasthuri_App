import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { TRENDING_SEARCHES, RECENT_SEARCHES, CATEGORIES, PRODUCTS } from "@/constants/mockData";
import { ProductCard } from "@/components/ui/ProductCard";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");

  const suggestions = query.length > 0
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.inputWrap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search sarees, lehengas, jewellery..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
          <Pressable hitSlop={8}>
            <Ionicons name="mic-outline" size={18} color={colors.primary} />
          </Pressable>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
      </View>

      <FlatList
        data={suggestions.length > 0 ? suggestions : []}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <View style={styles.content}>
            {/* Query suggestions */}
            {query.length > 0 && suggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Results</Text>
              </View>
            )}

            {/* Empty query state */}
            {query.length === 0 && (
              <>
                {/* Recent Searches */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Searches</Text>
                    <Pressable hitSlop={8}>
                      <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
                    </Pressable>
                  </View>
                  {RECENT_SEARCHES.map((s, i) => (
                    <Pressable
                      key={i}
                      style={[styles.searchRow, { borderBottomColor: colors.border }]}
                      onPress={() => setQuery(s)}
                    >
                      <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.searchText, { color: colors.foreground }]}>{s}</Text>
                      <View style={{ flex: 1 }} />
                      <Ionicons name="arrow-up-back" size={14} color={colors.mutedForeground} />
                    </Pressable>
                  ))}
                </View>

                {/* Trending Searches */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Searches</Text>
                  <View style={styles.chipRow}>
                    {TRENDING_SEARCHES.map((t, i) => (
                      <Pressable
                        key={i}
                        style={[styles.trendChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                        onPress={() => { Haptics.selectionAsync(); setQuery(t); }}
                      >
                        <Ionicons name="trending-up" size={12} color={colors.gold} />
                        <Text style={[styles.trendText, { color: colors.foreground }]}>{t}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Popular Categories */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Popular Categories</Text>
                  {CATEGORIES.map((c) => (
                    <Pressable
                      key={c.id}
                      style={[styles.categoryRow, { borderBottomColor: colors.border }]}
                      onPress={() => router.push({ pathname: "/category/[id]", params: { id: c.id, name: c.name } })}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: c.bgColor }]}>
                        <Ionicons name={c.icon as any} size={18} color={c.accentColor} />
                      </View>
                      <Text style={[styles.categoryText, { color: colors.foreground }]}>{c.name}</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <ProductCard product={item} layout="list" />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15 },
  cancelText: { fontSize: 15, fontWeight: "600" },
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  clearText: { fontSize: 13, fontWeight: "600" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchText: { fontSize: 14 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  trendChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  trendText: { fontSize: 13, fontWeight: "500" },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  categoryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  categoryText: { flex: 1, fontSize: 14, fontWeight: "500" },
});
