import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface BadgeProps {
  label: string;
  variant?: "primary" | "gold" | "success" | "muted";
  size?: "sm" | "md";
}

export function Badge({ label, variant = "primary", size = "sm" }: BadgeProps) {
  const colors = useColors();

  const variantStyles = {
    primary: { bg: colors.primary + "18", text: colors.primary },
    gold: { bg: colors.gold + "22", text: colors.gold },
    success: { bg: "#16a34a18", text: "#16a34a" },
    muted: { bg: colors.muted, text: colors.mutedForeground },
  };

  const v = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: v.bg, paddingHorizontal: size === "sm" ? 8 : 12, paddingVertical: size === "sm" ? 3 : 5 }]}>
      <Text style={[styles.text, { color: v.text, fontSize: size === "sm" ? 10 : 12 }]}>{label}</Text>
    </View>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const colors = useColors();

  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: selected ? colors.primaryForeground : colors.foreground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 8, alignSelf: "flex-start" },
  text: { fontWeight: "700", letterSpacing: 0.3 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
});
