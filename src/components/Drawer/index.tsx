import { MenuItem } from '@/constants';
import { homeLayout, roadmapTheme } from '@/components/ui/design-system';
import { Colors } from '@/constants/Colors';
import { useMenteesNavigationStore } from '@/stores/menteesNavigation.store';
import { useMentorsNavigationStore } from '@/stores/mentorsNavigation.store';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomDrawerProps extends DrawerContentComponentProps {
    menuItems: MenuItem[];
    expandAllByDefault?: boolean;
}

export default function CustomDrawerContent(props: CustomDrawerProps) {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { user, logout } = useAuthStore();

    const currentUserRole = (user?.role ?? '') as 'director' | 'super admin';

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

    const filteredMenuItems = useMemo(() => {
        const filterItems = (items: MenuItem[]): MenuItem[] =>
            items.reduce((acc: MenuItem[], item) => {
                const isAllowed = !item.roles || item.roles.includes(currentUserRole);
                if (isAllowed) {
                    const newItem: MenuItem = { ...item };
                    if (item.children?.length) newItem.children = filterItems(item.children);
                    if (newItem.children?.length || !item.children?.length) acc.push(newItem);
                }
                return acc;
            }, []);
        return filterItems(props.menuItems);
    }, [props.menuItems, currentUserRole]);

    const [expandedItems, setExpandedItems] = useState(() =>
        initExpanded(filteredMenuItems, !!props.expandAllByDefault)
    );

    const toggleExpand = useCallback((id: string) =>
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] })), []);

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

    const renderMenuItem = (item: MenuItem, isNested = false, index: number, total: number) => {
        const hasChildren = (item.children?.length ?? 0) > 0;
        const expanded = expandedItems[item.id];
        const isLast = index === total - 1;
        const isLogout = item.id === 'logout';

        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={[styles.menuItem, isNested && styles.menuItemNested]}
                    activeOpacity={0.7}
                    onPress={() => {
                        if (isLogout) { handleLogout(); return; }
                        if (hasChildren) { toggleExpand(item.id); return; }
                        if (item.route) {
                            props.navigation.closeDrawer();
                            if (item.id === 'all-pastors') {
                                useMenteesNavigationStore.getState().setFullMenu();
                                router.push({
                                    pathname: item.route as any,
                                    params: { flow: 'full' },
                                });
                                return;
                            }
                            if (item.id === 'all-mentors') {
                                useMentorsNavigationStore.getState().setFullMenu();
                                router.push({
                                    pathname: item.route as any,
                                    params: { flow: 'full' },
                                });
                                return;
                            }
                            router.push(item.route as any);
                        }
                    }}
                >
                    {/* Icon wrap */}
                    <View style={[styles.iconWrap, isLogout && styles.iconWrapLogout]}>
                        {item.iconType === 'image' ? (
                            <Image source={item.icon} style={styles.itemIcon} />
                        ) : (
                            <Ionicons
                                name={item.icon as any}
                                size={18}
                                color={isLogout ? '#EF4444' : BRAND}
                            />
                        )}
                    </View>

                    <Text style={[styles.menuLabel, isLogout && styles.menuLabelLogout]}>
                        {item.label}
                    </Text>

                    {item.badge && item.badge > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                    )}

                    {hasChildren ? (
                        <Ionicons
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color='#94A3B8'
                        />
                    ) : item.showChevron ? (
                        <Ionicons name="chevron-forward" size={16} color='#94A3B8' />
                    ) : null}
                </TouchableOpacity>

                {!isLast && <View style={styles.divider} />}

                {hasChildren && expanded &&
                    item.children!.map((child, i) =>
                        renderMenuItem(child, true, i, item.children!.length)
                    )}
            </View>
        );
    };

    const displayName = user
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
        : 'Guest User';

    return (
        <View style={styles.root}>
            {/* Header — gradient */}
            <LinearGradient colors={[...Colors.appBgGradient]} style={[styles.header, { paddingTop: top + 16 }]}>
                <View style={styles.avatarWrap}>
                    {user?.profilePicture ? (
                        <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                    ) : (
                        <Ionicons name="person-outline" size={26} color={roadmapTheme.accentMint} />
                    )}
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                    {user?.role ? (
                        <View style={styles.rolePill}>
                            <Text style={styles.roleText}>{user.role}</Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => props.navigation.closeDrawer()}
                    hitSlop={8}
                >
                    <Ionicons name="close" size={20} color={roadmapTheme.textPrimary} />
                </TouchableOpacity>
            </LinearGradient>

            {/* Body — white */}
            <ScrollView
                style={styles.menuScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.menuContent}
            >
                {filteredMenuItems.map((item, index) =>
                    renderMenuItem(item, false, index, filteredMenuItems.length)
                )}
            </ScrollView>

            {/* Footer — gradient */}
            <LinearGradient
                colors={[...Colors.appBgGradient]}
                style={[styles.footer, { paddingBottom: bottom + 12 }]}
            >
                <Text style={styles.footerTitle}>Contact Information</Text>

                <View style={styles.contactRow}>
                    <View style={styles.contactIconWrap}>
                        <Ionicons name="call-outline" size={13} color={roadmapTheme.accentMint} />
                    </View>
                    <Text style={styles.contactText}>269-471-0159</Text>
                </View>

                <View style={styles.contactRow}>
                    <View style={styles.contactIconWrap}>
                        <Ionicons name="mail-outline" size={13} color={roadmapTheme.accentMint} />
                    </View>
                    <Text style={styles.contactText}>communitychange@andrews.edu</Text>
                </View>

                <View style={styles.footerLogoRow}>
                    <Image
                        source={require('@/assets/images/app/footerIcon.png')}
                        style={styles.footerLogo}
                        resizeMode="contain"
                    />
                    <Image
                        source={require('@/assets/images/app/CCClogo.png')}
                        style={styles.footerCCCLogo}
                        resizeMode="contain"
                    />
                </View>
            </LinearGradient>
        </View>
    );
}

const BRAND = Colors.appBgGradient[1]; // #1A4F7A

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },

    // ── Header (gradient) ─────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingBottom: 18,
        gap: 12,
    },
    avatarWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(111,212,190,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(111,212,190,0.28)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
    },
    avatarImage: { width: '100%', height: '100%', borderRadius: 26 },
    headerInfo: { flex: 1, minWidth: 0, gap: 4 },
    userName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.2,
    },
    rolePill: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    roleText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },

    // ── Body (white) ──────────────────────────────────────────────────────────
    menuScroll: { flex: 1, backgroundColor: '#fff' },
    menuContent: { paddingVertical: 6 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: homeLayout.screenPaddingH,
        gap: 12,
    },
    menuItemNested: {
        paddingLeft: homeLayout.screenPaddingH + 42,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: '#EAF3FB',
        borderWidth: 1,
        borderColor: '#C8DFF0',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    iconWrapLogout: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    itemIcon: { width: 18, height: 18, tintColor: BRAND },
    menuLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1A3A5C',
    },
    menuLabelLogout: { color: '#EF4444' },
    badge: {
        backgroundColor: BRAND,
        borderRadius: 999,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
    divider: {
        height: 1,
        backgroundColor: '#EEF2F7',
        marginHorizontal: homeLayout.screenPaddingH,
    },

    // ── Footer (gradient) ─────────────────────────────────────────────────────
    footer: {
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingTop: 16,
    },
    footerTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 10,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    contactIconWrap: {
        width: 26,
        height: 26,
        borderRadius: 7,
        backgroundColor: 'rgba(111,212,190,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(111,212,190,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        flex: 1,
    },
    footerLogoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
    },
    footerLogo: {
        width: 32,
        height: 32,
        tintColor: 'rgba(255,255,255,0.35)',
    },
    footerCCCLogo: {
        width: 48,
        height: 28,
        tintColor: 'rgba(255,255,255,0.55)',
    },
});
