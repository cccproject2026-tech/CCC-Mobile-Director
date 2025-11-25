import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

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
                            menuItems ? (
                                // Use Zeego menu if menuItems provided
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger>
                                        <Pressable hitSlop={12} style={styles.iconButton}>
                                            <Ionicons name="ellipsis-vertical" size={20} color="#EAF7FF" />
                                        </Pressable>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content >
                                        {menuItems.map((item) => (
                                            item.key.startsWith('separator') ? (
                                                <DropdownMenu.Separator key={item.key} />
                                            ) : (
                                                <DropdownMenu.Item
                                                    key={item.key}
                                                    destructive={item.destructive}
                                                    onSelect={item.onSelect}
                                                >
                                                    <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
                                                    {item.icon && (
                                                        <DropdownMenu.ItemIcon
                                                            ios={{
                                                                name: Platform.OS === 'android'
                                                                    ? (item.icon.android || 'ic_menu_view') as any
                                                                    : (item.icon.ios || 'circle') as any,
                                                            }}
                                                        />
                                                    )}
                                                </DropdownMenu.Item>
                                            )
                                        ))}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            ) : (
                                // Use regular Pressable if only onPressMenu provided (backward compatible)
                                <Pressable onPress={onPressMenu} hitSlop={12} style={styles.iconButton}>
                                    <Ionicons name="ellipsis-vertical" size={20} color="#EAF7FF" />
                                </Pressable>
                            )
                        )}
                        {onPressChevron && (
                            <Pressable onPress={onPressChevron} hitSlop={12} style={styles.iconButton}>
                                <Ionicons name="chevron-forward" size={20} color="#EAF7FF" />
                            </Pressable>
                        )}
                    </View>

                    <View style={styles.personRow}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="person-circle-outline" size={24} color="#fff" />
                            </View>
                        )}
                        <Text style={styles.personName} numberOfLines={1}>
                            {person}{role ? ` - ${role}` : ''}
                        </Text>
                    </View>

                    <View style={styles.modeRow}>
                        <Text style={styles.modeLabel}>
                            Mode :{' '}
                            <Text style={styles.modeValue}>{mode}</Text>
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <Pressable onPress={onCall} hitSlop={12}>
                            <Ionicons name="call-outline" size={20} color="#EAF7FF" />
                        </Pressable>
                        <Pressable onPress={onChat} hitSlop={12}>
                            <MaterialCommunityIcons name="message-outline" size={20} color="#EAF7FF" />
                        </Pressable>
                        <Pressable onPress={onMail} hitSlop={12}>
                            <MaterialIcons name="mail-outline" size={20} color="#EAF7FF" />
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 16,
        padding: 8,
        marginBottom: 12,
    },
    cardInner: {
        flexDirection: 'row',
        gap: 12,
    },
    thumbnailWrap: {
        width: 85,
        height: 85,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        position: 'relative',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 32,
    },
    dateTime: {
        color: '#EAF7FF',
        fontSize: 14,
        fontWeight: '600',
    },
    timeHighlight: {
        color: '#d7f96c',
        fontWeight: '700',
    },
    rightIconsContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 2,
    },
    personRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        paddingRight: 32,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    personName: {
        color: '#EAF7FF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    modeRow: {
        marginTop: 6,
        paddingRight: 32,
    },
    modeLabel: {
        color: '#CFE9F3',
        fontSize: 13,
    },
    modeValue: {
        color: '#EAF7FF',
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
});

export default AppointmentCard;
