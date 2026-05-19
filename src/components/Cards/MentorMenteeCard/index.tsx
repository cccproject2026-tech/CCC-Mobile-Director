import { icons } from '@/constants';
import { homeLayout, roadmapTheme } from '@/components/ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    name: string;
    role: string;
    metricLabel?: string;
    metricValue?: string;
    avatar?: any;
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    onPress?: () => void;
};

const MentorMenteeCard: React.FC<Props> = ({
    name,
    role,
    metricLabel,
    metricValue,
    avatar = icons.myProfile,
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    onPress,
}) => (
    <Pressable style={styles.card} onPress={onPress}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
            <Image source={avatar} style={styles.avatar} resizeMode="cover" />
        </View>

        {/* Info */}
        <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.role} numberOfLines={1}>{role}</Text>
            <View style={styles.actions}>
                <Pressable hitSlop={12} onPress={onCall}>
                    <Ionicons name="call-outline" size={16} color={roadmapTheme.textPrimary} />
                </Pressable>
                <Pressable hitSlop={12} onPress={onChat}>
                    <Ionicons name="chatbubble-outline" size={16} color={roadmapTheme.textPrimary} />
                </Pressable>
                <Pressable hitSlop={12} onPress={onMail}>
                    <Ionicons name="mail-outline" size={16} color={roadmapTheme.textPrimary} />
                </Pressable>
                <Pressable hitSlop={12} onPress={onWhatsApp}>
                    <Ionicons name="logo-whatsapp" size={16} color={roadmapTheme.textPrimary} />
                </Pressable>
            </View>
        </View>

        {/* Metric + chevron */}
        <View style={styles.right}>
            {metricLabel && (
                <View style={styles.metricBadge}>
                    <Text style={styles.metricText}>
                        {metricValue ? `${metricLabel}\n${metricValue}` : metricLabel}
                    </Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={roadmapTheme.textCaption} />
        </View>
    </Pressable>
);

export default MentorMenteeCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: homeLayout.cardRadiusCompact,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 10,
        gap: 10,
    },
    avatarWrap: {
        width: 48,
        height: 48,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'rgba(111,212,190,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(111,212,190,0.22)',
        flexShrink: 0,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    name: {
        color: roadmapTheme.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    role: {
        color: roadmapTheme.textMuted,
        fontSize: 12,
        marginBottom: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
    },
    metricBadge: {
        backgroundColor: 'rgba(111,212,190,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(111,212,190,0.22)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
    },
    metricText: {
        color: roadmapTheme.accentMint,
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 15,
    },
});
