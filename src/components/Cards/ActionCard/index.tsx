import { icons } from '@/constants';
import { HOME_ICON_COLOR, homeLayout, roadmapTheme } from '@/components/ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

interface ActionCardProps {
    icon: ImageSourcePropType;
    title: string;
    count?: number;
    onPress?: () => void;
}

export const Icons = {
    ribbon: icons.certificateBadge,
    school: icons.fieldMentorIcon,
};

export const ActionCard: React.FC<ActionCardProps> = ({ icon, title, count, onPress }) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
        <View style={styles.left}>
            <View style={styles.iconWrap}>
                <Image source={icon} style={styles.icon} tintColor={HOME_ICON_COLOR} />
            </View>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.right}>
            {count !== undefined && (
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{count}</Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={HOME_ICON_COLOR} />
        </View>
    </Pressable>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: homeLayout.cardRadiusCompact,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        paddingVertical: 10,
        paddingHorizontal: 12,
        minHeight: 48,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: roadmapTheme.frostedSurface,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: roadmapTheme.textPrimary,
        flex: 1,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 999,
        minWidth: 24,
        height: 24,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        fontSize: 12,
        fontWeight: '800',
        color: roadmapTheme.textActive,
    },
});
