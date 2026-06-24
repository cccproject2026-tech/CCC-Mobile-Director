import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useSafeBack } from '@/hooks/useSafeBack';
import { useAuthStore } from '@/stores/auth.store';
import { formatNotificationBadgeCount } from '@/utils/notificationNavigation';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('@/assets/images/app/CCClogo.png');


type Props = {
    showUserName?: boolean;
    notifications?: number;
    showNotifications?: boolean;
    showDrawer?: boolean;
    showBackButton?: boolean;
    showBackButtonText?: boolean;
    onPressBack?: () => void;
    size?: number;
    color?: string;
    onProfilePress?: () => void;
    role?: string;
    customTitle?: string;
};

const TopBar: React.FC<Props> = ({
    showUserName = false,
    notifications,
    showNotifications = true,
    showDrawer = true,
    showBackButton = false,
    showBackButtonText = false,
    onPressBack,
    size = 36,
    color = "#fff",
    onProfilePress,
    role,
    customTitle
}) => {
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation();
    const router = useRouter();
    const safeBack = useSafeBack();
    const { user } = useAuthStore();
    const liveUnreadCount = useUnreadNotificationCount(
        user?.role,
        showNotifications && notifications === undefined,
    );
    const badgeCount = notifications ?? liveUnreadCount;
    const badgeLabel = formatNotificationBadgeCount(badgeCount);
    const onMenuPress = () => navigation.dispatch(DrawerActions.openDrawer());
    const handleNotificationsPress = () => {
        router.push('/(director)/(tabs)/notifications');
    }

    const handleBackPress = () => {
        if (onPressBack) {
            onPressBack();
        } else {
            safeBack();
        }
    };

    return (
        <View style={[styles.headerRow, { paddingTop: top + 10, minHeight: top + 54 }]}>
            {/* Left */}
            <View style={styles.leftIconBox}>
                {showDrawer && (
                    <Pressable hitSlop={10} onPress={onMenuPress}>
                        <Ionicons name="menu" size={size} color={color} />
                    </Pressable>
                )}
                {showBackButton && (
                    <>
                        {showBackButtonText ? (
                            <Pressable
                                hitSlop={10}
                                onPress={handleBackPress}
                                style={styles.backButtonWithText}
                            >
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                                <Text style={styles.backButtonTextStyle}>Back</Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                hitSlop={10}
                                onPress={handleBackPress}
                                style={styles.backButtonBox}
                            >
                                <Ionicons name="arrow-back" size={size - 8} color={color} />
                            </Pressable>
                        )}
                    </>
                )}
            </View>
            {/* Center */}
            <View style={styles.centerArea}>
                {showUserName && (
                    <LinearGradient
                        colors={["#7C3AED", "#38BDF8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.innerNameContainer}>
                            <Text style={styles.nameText} numberOfLines={1}>
                                {customTitle ? customTitle : user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.firstName || user?.lastName || 'User'}
                            </Text>
                        </View>
                    </LinearGradient>
                )}
            </View>
            {/* Spacer so name pill and search icon never touch */}
            {showUserName && <View style={styles.headerSpacer} />}
            {/* Right */}
            <View style={styles.rightIconBox}>
                {/* Search button — navigates to global search */}
                <Pressable onPress={() => router.push('/search')} hitSlop={10} style={styles.searchButton}>
                    <Ionicons name="search" size={size - 6} color={color} />
                </Pressable>

                {showNotifications && (
                    <Pressable onPress={handleNotificationsPress} hitSlop={10} style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={size - 10} color={color} />
                        {badgeCount > 0 && (
                            <View
                                style={[
                                    styles.notificationBadge,
                                    badgeLabel.length > 2 && styles.notificationBadgeWide,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.notificationBadgeText,
                                        badgeLabel.length > 2 && styles.notificationBadgeTextSmall,
                                    ]}
                                >
                                    {badgeLabel}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                )}
                <Pressable onPress={onProfilePress} hitSlop={10}>
                    <View style={styles.profileBox}>
                        <Image source={LOGO} style={{ width: 27, height: 27, borderRadius: 15 }} />
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        width: "100%",
        backgroundColor: "transparent",
    },
    leftIconBox: {
        flexDirection: "row",
        flex: 0.2,
    },
    backButtonBox: {
        paddingHorizontal: 4,
    },
    backButtonWithText: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(139, 168, 189, 0.8)", // More opaque blue-gray
        paddingVertical: 10,
        paddingHorizontal: 14,
        paddingLeft: 10,
        paddingRight: 16,
        borderRadius: 12,
        gap: 8,
        minWidth: 90,
    },
    backButtonTextStyle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    centerArea: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingRight: 8,
        marginLeft: 10,
        minWidth: 0,
        flexShrink: 1,
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
    },
    innerNameContainer: {
        backgroundColor: "#176192",
        borderRadius: 11,
        paddingVertical: 9,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 85,
        maxWidth: 180,
    },
    nameText: {
        color: "#E2E8F0",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    headerSpacer: {
        width: 24,
        flexShrink: 0,
    },
    rightIconBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flexShrink: 0,
        gap: 10,
    },
    notificationBadge: {
        position: "absolute",
        backgroundColor: "#FACC15",
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        right: -10,
        top: -7,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    notificationBadgeWide: {
        minWidth: 26,
        right: -14,
    },
    notificationBadgeText: {
        color: "#000",
        fontWeight: "700",
        fontSize: 11,
    },
    notificationBadgeTextSmall: {
        fontSize: 9,
    },
    searchButton: {
        marginRight: 4,
    },
    notificationButton: {
        position: "relative",
        marginRight: 4,
    },
    profileBox: {
        width: 28,
        height: 28,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.65)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
});

export default TopBar;
