import { useSafeBack } from '@/hooks/useSafeBack';
import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { roadmapTheme } from './roadmapTheme';

type Props = {
  title: string;
  fallback?: Href;
  returnTo?: string;
  style?: StyleProp<ViewStyle>;
  onPressBack?: () => void;
  rightElement?: React.ReactNode;
};

export function ScreenBackHeader({
  title,
  fallback,
  returnTo,
  style,
  onPressBack,
  rightElement,
}: Props) {
  const defaultBack = useSafeBack({ fallback, returnTo });
  const handleBack = onPressBack ?? defaultBack;

  return (
    <View style={[styles.row, style]}>
      <Pressable onPress={handleBack} style={styles.backTitleArea} hitSlop={8}>
        <View style={styles.backIconWrap}>
          <Ionicons name="chevron-back" size={22} color={roadmapTheme.textPrimary} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </Pressable>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: roadmapTheme.divider,
    gap: 8,
  },
  backTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  backIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: roadmapTheme.textPrimary,
    letterSpacing: -0.2,
  },
});
