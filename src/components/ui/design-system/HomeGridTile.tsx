import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { homeTileStyles } from './homeGrid';
import { homeLayout } from './homeLayout';
import { resolveHomeTileIconColor } from './homeTileColors';

type Ion = React.ComponentProps<typeof Ionicons>['name'];

export type HomeGridTileProps = {
  iconName: Ion;
  label: string;
  subtitle?: string;
  accentKey?: string;
  badge?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function HomeGridTile({
  iconName,
  label,
  subtitle,
  accentKey,
  badge,
  onPress,
  style,
  disabled,
}: HomeGridTileProps) {
  const { width } = useWindowDimensions();
  const compact = width < 375;
  const iconColor = resolveHomeTileIconColor(accentKey);
  const showBadge = badge != null && Number(badge) > 0;
  const normalizedLabel = label.replace(/\n/g, ' ').trim();

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={disabled}
      style={[homeTileStyles.base, styles.tile, style]}
    >
      <View style={styles.iconRow}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={iconName}
            size={compact ? 17 : 19}
            color={iconColor}
          />
        </View>
        {showBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {Number(badge) > 99 ? '99+' : String(badge)}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.labelZone}>
        <Text
          style={[homeTileStyles.label, compact && styles.labelCompact]}
          numberOfLines={subtitle ? 2 : 4}
        >
          {normalizedLabel}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, compact && styles.subtitleCompact]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    gap: 4,
  },
  iconRow: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FB7185',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 59, 92, 0.5)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  labelZone: {
    minHeight: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  labelCompact: {
    fontSize: 9,
    lineHeight: 12,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    width: '100%',
  },
  subtitleCompact: {
    fontSize: 8,
  },
});
