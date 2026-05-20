import { InterestItem } from '@/types/interest.types';
import { roadmapTheme } from '@/components/ui/design-system';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const isSmallDevice = SCREEN_WIDTH < 375;

type Props = {
    data: InterestItem;
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onPress?: () => void;
    onWhatsApp?: () => void;
};

const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

const InterestCard: React.FC<Props> = memo(({ data, onCall, onChat, onMail, onPress, onWhatsApp }) => {
    const router = useRouter();

    const handleCardPress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push({
                pathname: '/(director)/(tabs)/new-interests/interest-details',
                params: { interestId: data.id },
            });
        }
    };

    const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Unknown';

    return (
        <Pressable onPress={handleCardPress} style={styles.card}>
            <View style={styles.avatarCircle}>
                {data.profilePicture ? (
                    <Image source={{ uri: data.profilePicture }} style={styles.avatarImage} />
                ) : (
                    <Ionicons
                        name="person-outline"
                        size={isSmallDevice ? 16 : 18}
                        color={roadmapTheme.accentMint}
                    />
                )}
            </View>

            <View style={styles.infoBlock}>
                <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
                <Text style={styles.role} numberOfLines={1}>
                    {data.title || 'Pastor'}
                </Text>
            </View>

            <View style={styles.actions}>
                <Pressable hitSlop={12} onPress={onCall}>
                    <Ionicons name="call-outline" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textPrimary} />
                </Pressable>
                <Pressable hitSlop={12} onPress={onChat}>
                    <MaterialCommunityIcons name="message-outline" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textPrimary} />
                </Pressable>
                <Pressable hitSlop={12} onPress={onMail}>
                    <MaterialIcons name="mail-outline" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textPrimary} />
                </Pressable>
                <Pressable hitSlop={12} onPress={onWhatsApp}>
                    <Ionicons name="logo-whatsapp" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textPrimary} />
                </Pressable>
            </View>

            <Text style={styles.time}>{formatTime(data.createdAt)}</Text>

            <Pressable hitSlop={12} onPress={onPress}>
                <Ionicons name="chevron-forward" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textMuted} />
            </Pressable>
        </Pressable>
    );
});

export default InterestCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: 14,
        padding: isSmallDevice ? 8 : 10,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        gap: isSmallDevice ? 6 : 8,
    },
    avatarCircle: {
        width: isSmallDevice ? 44 : 48,
        height: isSmallDevice ? 44 : 48,
        borderRadius: isSmallDevice ? 22 : 24,
        backgroundColor: 'rgba(111, 212, 190, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.28)',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: isSmallDevice ? 22 : 24,
    },
    infoBlock: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        color: roadmapTheme.textPrimary,
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    role: {
        color: roadmapTheme.textMuted,
        fontSize: isSmallDevice ? 11 : 12,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 4 : 5,
    },
    time: {
        color: roadmapTheme.textSubtle,
        fontSize: isSmallDevice ? 10 : 11,
        marginLeft: isSmallDevice ? 4 : 6,
        flexShrink: 0,
    },
});
