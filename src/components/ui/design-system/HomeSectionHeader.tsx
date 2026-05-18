import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type Ion = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: Ion;
  title: string;
  subtitle?: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  headerRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Section title row inside home cards (Pastor Home pattern). */
export function HomeSectionHeader({
  icon,
  title,
  subtitle,
  seeAllLabel = "See all",
  onSeeAll,
  headerRight,
  style,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color={roadmapTheme.textPrimary} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        {headerRight ??
          (onSeeAll ? (
            <Pressable onPress={onSeeAll} hitSlop={8}>
              <Text style={styles.seeAll}>{seeAllLabel}</Text>
            </Pressable>
          ) : null)}
      </View>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: roadmapTheme.textPrimary,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  subtitle: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  seeAll: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    fontSize: 13,
  },
});
