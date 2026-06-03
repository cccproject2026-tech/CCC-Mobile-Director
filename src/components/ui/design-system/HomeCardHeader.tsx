import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { roadmapTheme } from './roadmapTheme';

type Props = {
  title: string;
  subtitle?: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function HomeCardHeader({ title, subtitle, iconName, iconColor, actionLabel, onAction }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 375;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <LinearGradient
            colors={[`${iconColor}44`, `${iconColor}11`]}
            style={styles.iconBg}
          >
            <Ionicons name={iconName} size={18} color={iconColor} />
          </LinearGradient>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, compact && styles.subtitleCompact]} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={[styles.actionBtn, { borderColor: `${iconColor}33`, backgroundColor: `${iconColor}11` }]}>
            <Text style={[styles.actionText, { color: iconColor }]}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={12} color={iconColor} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: roadmapTheme.textPrimary,
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 14,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '500',
  },
  subtitleCompact: {
    fontSize: 9,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexShrink: 0,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
