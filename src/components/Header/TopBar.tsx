import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('@/assets/images/app/CCClogo.png');

type Props = {
    showUserName?: boolean;
    showNotifications?: boolean;
    notifications?: number;        // ← use this only
    showDrawer?: boolean;
    showBackButton?: boolean;
    showBackButtonText?: boolean;
    onPressBack?: () => void;
    onProfilePress?: () => void;
};

const TopBar: React.FC<Props> = ({
    showUserName = false,
    showNotifications = true,
    notifications = 0,            // ← default
    showDrawer = true,
    showBackButton = false,
    showBackButtonText = false,
    onPressBack,
    onProfilePress,
}) => {
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation();
    const router = useRouter();

    // Get username from auth store
    const user = useAuthStore((state) => state.user);
    const userName = user ? `${user.firstName} ${user.lastName}` : '';

    const handleMenuPress = () => navigation.dispatch(DrawerActions.openDrawer());
    const handleBackPress = () => (onPressBack ? onPressBack() : router.back());

    const handleNotificationsPress = () => {
        router.push('/(director)/(tabs)/notification');
    };

    return (
        <View style={[styles.headerRow, { paddingTop: top + 10 }]}>

            {/* LEFT */}
            <View style={styles.left}>
                {showDrawer && (
                    <Pressable onPress={handleMenuPress} hitSlop={10}>
                        <Ionicons name="menu" size={30} color="#fff" />
                    </Pressable>
                )}

                {showBackButton && (
                    showBackButtonText ? (
                        <Pressable
                            hitSlop={10}
                            onPress={handleBackPress}
                            style={styles.backWithText}
                        >
                            <Ionicons name="chevron-back" size={22} color="#fff" />
                            <Text style={styles.backText}>Back</Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={handleBackPress} hitSlop={10}>
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </Pressable>
                    )
                )}
            </View>

            {/* CENTER */}
            <View style={styles.center}>
                {showUserName && userName !== '' && (
                    <View style={styles.namePill}>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {userName}
                        </Text>
                    </View>
                )}
            </View>

            {/* RIGHT */}
            <View style={styles.right}>
                {showNotifications && (
                    <Pressable
                        onPress={handleNotificationsPress}
                        hitSlop={10}
                        style={styles.notificationBtn}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#fff" />

                        {/* Badge only if notifications > 0 */}
                        {notifications > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {notifications > 9 ? '9+' : notifications}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                )}

                <Pressable onPress={onProfilePress} hitSlop={10}>
                    <View style={styles.profile}>
                        <Image source={LOGO} style={styles.profileImage} />
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

export default TopBar;



const styles = StyleSheet.create({
    headerRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: 'transparent',
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 0.2,
    },

    backWithText: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139,168,189,0.8)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        gap: 6,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    namePill: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    nameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    right: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        flex: 0.2,
    },

    notificationBtn: {
        position: 'relative',
    },

    badge: {
        position: 'absolute',
        right: -8,
        top: -5,
        backgroundColor: '#FACC15',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 10,
    },

    profile: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    profileImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
});
