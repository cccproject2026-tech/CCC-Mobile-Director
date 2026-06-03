import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { roadmapTheme } from './roadmapTheme';

type Props = {
  title: string;
  subtitle?: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
};

/** Consistent section header row used across home dashboard cards */
export function HomeCardHeader({
  title,
  subtitle,
  seeAllLabel = 'View all',
  onSeeAll,
}: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 375;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8} style={styles.seeAllRow}>
            <Text style={[styles.seeAll, compact && styles.seeAllCompact]}>
              {seeAllLabel}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#EAF7FF" />
          </Pressable>
        ) : (
          <View style={styles.seeAllRow}>
            <Text style={[styles.seeAll, compact && styles.seeAllCompact]}>
              {seeAllLabel}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#EAF7FF" />
          </View>
        )}
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: 15,
  },
  subtitle: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  subtitleCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  seeAllCompact: {
    fontSize: 11,
  },
});
