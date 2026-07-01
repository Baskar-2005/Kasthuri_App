import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import type { Category } from "@/constants/mockData";

interface CategoryCardProps {
  category: Category;
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ICON_MAP: Record<string, IconName> = {
  woman: "woman",
  man: "man",
  happy: "happy",
  diamond: "diamond",
  star: "star",
  heart: "heart",
};

export function CategoryCard({ category }: CategoryCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/category/[id]", params: { id: category.id, name: category.name } });
  };

  const iconName = ICON_MAP[category.icon] ?? "grid";

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[styles.card, { backgroundColor: category.bgColor }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Ionicons name={iconName} size={26} color={category.accentColor} />
        <Text style={[styles.label, { color: category.accentColor }]}>{category.name}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 72,
    height: 80,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontSize: 11, fontWeight: "700", textAlign: "center" },
});
