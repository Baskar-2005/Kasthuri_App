import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Review } from "@/constants/mockData";

export function ReviewCard({ review }: { review: Review }) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{review.name[0]}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.name, { color: colors.foreground }]}>{review.name}</Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={12}
                color={i < review.rating ? colors.gold : colors.border}
              />
            ))}
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{review.date}</Text>
          </View>
        </View>
        {review.verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: "#16a34a18" }]}>
            <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <Text style={[styles.text, { color: colors.mutedForeground }]}>{review.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  meta: { flex: 1, gap: 3 },
  name: { fontSize: 13, fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  date: { fontSize: 11, marginLeft: 4 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  verifiedText: { fontSize: 10, fontWeight: "600", color: "#16a34a" },
  text: { fontSize: 13, lineHeight: 20 },
});
