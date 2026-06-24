import { InterestItem } from '@/types/interest.types';
import { roadmapTheme } from '@/components/ui/design-system';
import {
    dialPhone,
    getInterestContact,
    openSMS,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const isSmallDevice = SCREEN_WIDTH < 375;

type Props = {
    data: InterestItem;
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onPress?: () => void;
    onWhatsApp?: () => void;
    showDelete?: boolean;
    onDeletePress?: () => void;
    isDeleting?: boolean;
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

const InterestCard: React.FC<Props> = memo(({
    data,
    onCall,
    onChat,
    onMail,
    onPress,
    onWhatsApp,
    showDelete = false,
    onDeletePress,
    isDeleting = false,
}) => {
    const router = useRouter();
    const { phone, email } = getInterestContact(data);

    const handleCardPress = useCallback(() => {
        if (onPress) {
            onPress();
        } else {
            router.push({
                pathname: '/(director)/(tabs)/new-interests/interest-details',
                params: { interestId: data.id },
            });
        }
    }, [data.id, onPress, router]);

    const handleCall = useCallback(() => {
        if (onCall) onCall();
        else dialPhone(phone);
    }, [onCall, phone]);

    const handleChat = useCallback(() => {
        if (onChat) onChat();
        else openSMS(phone);
    }, [onChat, phone]);

    const handleMail = useCallback(() => {
        if (onMail) onMail();
        else sendEmail(email);
    }, [email, onMail]);

    const handleWhatsApp = useCallback(() => {
        if (onWhatsApp) onWhatsApp();
        else openWhatsApp(phone);
    }, [onWhatsApp, phone]);

    const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Unknown';

    return (
        <View style={[styles.card, showDelete && styles.cardWithDelete]}>
            {showDelete ? (
                <Pressable
                    hitSlop={10}
                    style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                    onPress={onDeletePress}
                    disabled={isDeleting}
                >
                    <Ionicons
                        name="trash-outline"
                        size={isSmallDevice ? 15 : 16}
                        color={isDeleting ? roadmapTheme.textCaption : '#F87171'}
                    />
                </Pressable>
            ) : null}

            <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleCardPress}
                style={styles.mainPressable}
            >
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
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity hitSlop={12} style={styles.iconButton} onPress={handleCall}>
                    <Ionicons name="call-outline" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={12} style={styles.iconButton} onPress={handleChat}>
                    <MaterialCommunityIcons name="message-outline" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={12} style={styles.iconButton} onPress={handleMail}>
                    <MaterialIcons name="mail-outline" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={12} style={styles.iconButton} onPress={handleWhatsApp}>
                    <Ionicons name="logo-whatsapp" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textPrimary} />
                </TouchableOpacity>
            </View>

            <Text style={styles.time}>{formatTime(data.createdAt)}</Text>

            <TouchableOpacity hitSlop={12} style={styles.iconButton} onPress={handleCardPress}>
                <Ionicons name="chevron-forward" size={isSmallDevice ? 16 : 18} color={roadmapTheme.textMuted} />
            </TouchableOpacity>
        </View>
    );
});

export default InterestCard;

const styles = StyleSheet.create({
    card: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: 14,
        padding: isSmallDevice ? 8 : 10,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        gap: isSmallDevice ? 6 : 8,
    },
    cardWithDelete: {
        paddingTop: isSmallDevice ? 28 : 30,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(248,113,113,0.1)',
        borderRadius: 9,
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.22)',
        zIndex: 2,
    },
    deleteButtonDisabled: {
        opacity: 0.5,
    },
    mainPressable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
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
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    time: {
        color: roadmapTheme.textSubtle,
        fontSize: isSmallDevice ? 10 : 11,
        marginLeft: isSmallDevice ? 4 : 6,
        flexShrink: 0,
    },
});
