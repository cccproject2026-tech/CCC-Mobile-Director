import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { homeLayout } from "./homeLayout";
import { roadmapTheme } from "./roadmapTheme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

/** Frosted card — Pastor Home + mentorship flows. */
export function CommonCard({ children, style, compact }: Props) {
  return <View style={[styles.card, compact ? styles.cardCompact : null, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderRadius: homeLayout.cardRadius,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    padding: 14,
    paddingBottom: 16,
    gap: 10,
  },
  cardCompact: {
    borderRadius: homeLayout.cardRadiusCompact,
    padding: 12,
    paddingBottom: 14,
    gap: 8,
  },
});
