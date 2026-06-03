import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { roadmapTheme } from './roadmapTheme';

type Props = {
  title: string;
  subtitle?: string;
};

/** Consistent section header row used across home dashboard cards */
export function HomeCardHeader({ title, subtitle }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 375;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
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
  title: {
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
});
