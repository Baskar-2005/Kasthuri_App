import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function Shimmer({ style }: { style: any }) {
  const colors = useColors();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  return (
    <Animated.View
      style={[style, { backgroundColor: colors.border, opacity }]}
    />
  );
}

export function SkeletonCard({ layout = "grid" }: { layout?: "grid" | "list" | "large" }) {
  const colors = useColors();

  if (layout === "list") {
    return (
      <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Shimmer style={styles.listImage} />
        <View style={styles.listInfo}>
          <Shimmer style={styles.skLine1} />
          <Shimmer style={styles.skLine2} />
          <Shimmer style={styles.skLine3} />
          <Shimmer style={styles.skLine4} />
        </View>
      </View>
    );
  }

  if (layout === "large") {
    return (
      <View style={[styles.largeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Shimmer style={styles.largeImage} />
        <View style={styles.largeInfo}>
          <Shimmer style={styles.skLine1} />
          <Shimmer style={styles.skLine2} />
          <Shimmer style={styles.skLine3} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Shimmer style={styles.gridImage} />
      <View style={styles.gridInfo}>
        <Shimmer style={styles.skLine1} />
        <Shimmer style={styles.skLine2} />
        <Shimmer style={styles.skLine3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridCard: { borderRadius: 18, overflow: "hidden", borderWidth: 1, flex: 1 },
  gridImage: { height: 185 },
  gridInfo: { padding: 11, gap: 8 },
  listCard: { flexDirection: "row", borderRadius: 18, overflow: "hidden", borderWidth: 1, marginBottom: 12 },
  listImage: { width: 110, height: 130 },
  listInfo: { flex: 1, padding: 14, gap: 10 },
  largeCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1, marginBottom: 14 },
  largeImage: { height: 260 },
  largeInfo: { padding: 16, gap: 10 },
  skLine1: { height: 14, borderRadius: 7, width: "75%" },
  skLine2: { height: 11, borderRadius: 6, width: "50%" },
  skLine3: { height: 11, borderRadius: 6, width: "60%" },
  skLine4: { height: 11, borderRadius: 6, width: "40%" },
});
