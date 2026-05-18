import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type Props = {
  title: string;
  subtitle?: string;
  showDivider?: boolean;
  variant?: "default" | "compact";
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({
  title,
  subtitle,
  showDivider,
  variant = "default",
  style,
}: Props) {
  const isCompact = variant === "compact";

  return (
    <View style={[styles.wrap, isCompact ? styles.wrapCompact : null, style]}>
      <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isCompact ? styles.subtitleCompact : null]}>{subtitle}</Text>
      ) : null}

      {showDivider ? (
        <View style={[styles.dividerRow, isCompact ? styles.dividerRowCompact : null]} pointerEvents="none">
          <View style={styles.dividerLine} />
          <Ionicons name="leaf-outline" size={14} color={roadmapTheme.accentMint} />
          <View style={styles.dividerLine} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 6,
  },
  wrapCompact: {
    paddingTop: 6,
    marginBottom: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 20,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
  subtitleCompact: {
    fontSize: 12.5,
    marginTop: 6,
    lineHeight: 18,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  dividerRowCompact: {
    marginTop: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: roadmapTheme.divider,
  },
});
