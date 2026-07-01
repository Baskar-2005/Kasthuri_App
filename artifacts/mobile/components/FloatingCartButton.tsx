import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface FloatingCartButtonProps {
  count?: number;
  bottomOffset?: number;
}

export function FloatingCartButton({ count = 2, bottomOffset = 90 }: FloatingCartButtonProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: 500,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 0.92, useNativeDriver: true, speed: 80 }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, speed: 80 }),
    ]).start();
    router.push("/cart");
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: bottomOffset, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <Pressable onPress={handlePress}>
          <LinearGradient
            colors={[colors.primary, colors.maroonDark]}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="bag-handle" size={22} color="#fff" />
            {count > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    zIndex: 100,
    shadowColor: "#6B1A1A",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#1A0800" },
});
