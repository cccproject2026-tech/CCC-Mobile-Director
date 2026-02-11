import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
// import * as DropdownMenu from 'zeego/dropdown-menu';

export interface MenuItem {
    key: string;
    title: string;
    destructive?: boolean;
    icon?: { ios?: string; android?: string };
    onSelect: () => void;
}

type Props = {
    date: string;
    time: string;
    tz: string;
    person: string;
    role?: string;
    mode: string;
    platformIcon: any;
    avatar?: any;
    onPressChevron?: () => void;
    onPressMenu?: () => void;
    menuItems?: MenuItem[]; // OPTIONAL: If provided, shows Zeego menu. If not, uses onPressMenu
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
};

const AppointmentCard: React.FC<Props> = ({
    date,
    time,
    tz,
    person,
    role,
    mode,
    platformIcon,
    avatar,
    onPressChevron,
    onPressMenu,
    menuItems,
    onCall,
    onChat,
    onMail,
}) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardInner}>
                <View style={styles.thumbnailWrap}>
                    <Image source={platformIcon} resizeMode="cover" style={styles.thumbnail} />
                </View>

                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.dateTime} numberOfLines={1}>
                                {date}{' '}
                                <Text style={styles.timeHighlight}>Time</Text> {time} hrs {tz}
                            </Text>
                        </View>
                    </View>

                    {/* Absolutely positioned right icons */}
                    <View style={styles.rightIconsContainer}>
                        {(onPressMenu || menuItems) && (
                            <Pressable onPress={onPressMenu} hitSlop={12} style={styles.iconButton}>
                                <Ionicons name="ellipsis-vertical" size={20} color="#EAF7FF" />
                            </Pressable>
                        )}
                        {onPressChevron && (
                            <Pressable onPress={onPressChevron} hitSlop={12} style={styles.iconButton}>
                                <Ionicons name="chevron-forward" size={20} color="#EAF7FF" />
                            </Pressable>
                        )}
                    </View>

                    <View style={styles.personRow}>
                        <View style={styles.avatarContainer}>
                            {avatar ? (
                                <Image source={avatar} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Ionicons name="person" size={14} color="#fff" />
                                </View>
                            )}
                            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                        </View>
                        <Text style={styles.personName} numberOfLines={1}>
                            Pr. {person}
                        </Text>
                    </View>

                    <View style={styles.modeRow}>
                        <Text style={styles.modeLabel}>
                            Mode : <Text style={styles.modeValue}>{mode}</Text>
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <Pressable onPress={onCall} hitSlop={12} style={styles.actionIcon}>
                            <Ionicons name="call" size={18} color="#EAF7FF" />
                        </Pressable>
                        <Pressable onPress={onChat} hitSlop={12} style={styles.actionIcon}>
                            <MaterialCommunityIcons name="chat" size={18} color="#EAF7FF" />
                        </Pressable>
                        <Pressable onPress={onMail} hitSlop={12} style={styles.actionIcon}>
                            <MaterialIcons name="mail" size={18} color="#EAF7FF" />
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
    },
    cardInner: {
        flexDirection: 'row',
        gap: 16,
    },
    thumbnailWrap: {
        width: 100,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        position: 'relative',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 25,
    },
    dateTime: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    timeHighlight: {
        color: '#FFEA00',
        fontWeight: '700',
    },
    rightIconsContainer: {
        position: 'absolute',
        right: -5,
        top: -2,
    },
    iconButton: {
        padding: 5,
    },
    personRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    statusDot: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#1E3A6F',
    },
    personName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    modeRow: {
        marginTop: 6,
    },
    modeLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        fontWeight: '500',
    },
    modeValue: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginTop: 12,
    },
    actionIcon: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 6,
        borderRadius: 8,
    },
});

export default AppointmentCard;
