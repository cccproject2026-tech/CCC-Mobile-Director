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
export function CommonCard({ children, style, compact = true }: Props) {
  return <View style={[styles.card, compact ? styles.cardCompact : null, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderRadius: homeLayout.cardRadius,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    padding: homeLayout.cardPadding,
    paddingBottom: homeLayout.cardPaddingBottom,
    gap: homeLayout.cardInnerGap,
  },
  cardCompact: {
    borderRadius: homeLayout.cardRadiusCompact,
    padding: 12,
    paddingBottom: 14,
    gap: 8,
  },
});
