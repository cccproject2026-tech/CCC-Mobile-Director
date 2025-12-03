import { MenuItem } from '@/constants';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomDrawerProps extends DrawerContentComponentProps {
    menuItems: MenuItem[];
    expandAllByDefault?: boolean;
}

export default function CustomDrawerContent(props: CustomDrawerProps) {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    // Destructure user and logout from the store
    const { user, logout } = useAuthStore();

    // Get the current user's role, default to empty string if user is null
    const currentUserRole = (user?.role ?? '') as 'director' | 'super admin';

    // Expandable groups initialization
    const initExpanded = (items: MenuItem[], expandAll: boolean) => {
        const result: Record<string, boolean> = {};
        const traverse = (items: MenuItem[]) =>
            items.forEach(item => {
                if (item.children?.length) {
                    result[item.id] = expandAll;
                    traverse(item.children);
                }
            });
        traverse(items);
        return result;
    };

    // 1. Filtered Menu Items Logic
    const filteredMenuItems = useMemo(() => {
        const filterItems = (items: MenuItem[]): MenuItem[] => {
            return items.reduce((acc: MenuItem[], item) => {

                // Check role restriction
                const isAllowed = !item.roles || item.roles.includes(currentUserRole);

                if (isAllowed) {
                    const newItem: MenuItem = { ...item };

                    // Recursively filter children if they exist
                    if (item.children?.length) {
                        newItem.children = filterItems(item.children);
                    }

                    // Only add the item if it's allowed OR if it's a parent 
                    // that still has children after filtering
                    if (newItem.children?.length || !item.children?.length) {
                        acc.push(newItem);
                    }
                }
                return acc;
            }, []);
        };

        return filterItems(props.menuItems);
    }, [props.menuItems, currentUserRole]);


    // Initialize state using the filtered list
    const [expandedItems, setExpandedItems] = useState(() =>
        initExpanded(filteredMenuItems, !!props.expandAllByDefault)
    );

    const toggleExpand = useCallback((id: string) =>
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] })), []);

    const handleLogoPress = useCallback(() => {
        props.navigation.closeDrawer();
    }, [props.navigation]);

    const handleLogout = useCallback(() => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    props.navigation.closeDrawer();
                    await logout();
                    router.replace('/(auth)');
                },
            },
        ]);
    }, [props.navigation, logout, router]);

    const renderMenuItem = (
        item: MenuItem,
        isNested = false,
        index: number,
        total: number
    ) => {
        const hasChildren = (item.children?.length ?? 0) > 0;
        const expanded = expandedItems[item.id];
        const isLast = index === total - 1;

        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={[styles.drawerItem, isNested && styles.nestedItem]}
                    onPress={() => {
                        if (item.id === 'logout') {
                            handleLogout();
                            return;
                        }

                        if (hasChildren) {
                            toggleExpand(item.id);
                            return;
                        }

                        if (item.route) {
                            props.navigation.closeDrawer();
                            router.push(item.route as any);
                        }
                    }}
                >
                    <View style={styles.leftRow}>
                        <View style={styles.iconContainer}>
                            {item.iconType === 'image' ? (
                                <Image source={item.icon} style={styles.itemIcon} />
                            ) : (
                                <Ionicons name={item.icon as any} size={20} color="#0A5A8A" />
                            )}
                        </View>

                        <Text style={styles.drawerLabel}>{item.label}</Text>

                        {item.badge && item.badge > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                        )}
                    </View>

                    {hasChildren ? (
                        <Ionicons
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color="#0A5A8A"
                        />
                    ) : (
                        item.showChevron && (
                            <Ionicons name="chevron-forward" size={16} color="#999" />
                        )
                    )}
                </TouchableOpacity>

                {!isLast && <View style={styles.divider} />}

                {hasChildren && expanded &&
                    item.children!.map((child, i) =>
                        renderMenuItem(child, true, i, item.children!.length)
                    )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {user && user.profilePicture ? (
                    <Image
                        source={{ uri: user.profilePicture }}
                        style={styles.avatar}
                    />
                ) : (
                    <Ionicons name="person-circle-outline" size={48} color="#fff" style={styles.avatar} />
                )}
                <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>
                        {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.logoButton} onPress={handleLogoPress}>
                    <Image
                        source={require('@/assets/images/app/CCClogo.png')}
                        style={styles.logoImage}
                    />
                </TouchableOpacity>
            </View>

            {/* Menu - Renders FILTERED items */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.menuContent}
            >
                {filteredMenuItems.map((item, index) =>
                    renderMenuItem(item, false, index, filteredMenuItems.length)
                )}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: bottom + 5 }]}>
                <Text style={styles.footerTitle}>Contact Information</Text>

                <View style={styles.contactRow}>
                    <Ionicons name="call" size={14} color="#fff" />
                    <Text style={styles.contactText}>: 269-471-0159</Text>
                </View>

                <View style={styles.contactRow}>
                    <Ionicons name="mail" size={14} color="#fff" />
                    <Text style={styles.contactText}>: communitychange@andrews.edu</Text>
                </View>

                {/* Extra margin so the logo NEVER gets cut */}
                <View style={{ marginTop: 22, marginBottom: bottom + 10, alignItems: "center" }}>
                    <Image
                        source={require('@/assets/images/app/footerIcon.png')}
                        style={styles.footerLogo}
                        resizeMode="contain"
                    />
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        backgroundColor: '#14517D',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },

    userName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },

    logoButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    logoImage: { width: 26, height: 26 },

    menuContent: { paddingVertical: 8 },

    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },

    nestedItem: { paddingLeft: 48 },

    leftRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },

    iconContainer: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },

    itemIcon: { width: 22, height: 22 },

    drawerLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#0A5A8A',
        marginLeft: 12,
        flex: 1,
    },

    badge: {
        backgroundColor: '#0A5A8A',
        borderRadius: 12,
        minWidth: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        marginLeft: 6,
    },

    badgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

    divider: { height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 20 },

    footer: {
        backgroundColor: '#14517D',
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    footerLogo: {
        width: 34,
        height: 34,
        tintColor: '#fff',
    },

    footerTitle: { fontSize: 16, color: '#fff', fontWeight: '600', marginBottom: 12 },

    contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },

    contactText: { fontSize: 13, color: '#fff', marginLeft: 4 },
});
