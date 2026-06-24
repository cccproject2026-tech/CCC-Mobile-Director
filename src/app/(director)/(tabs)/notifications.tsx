import NotificationCard, { Notification } from "@/components/Cards/NotificationsCard";
import TopBar from "@/components/Header/TopBar";
import {
    GradientBackground,
    homeLayout,
    roadmapTheme,
    ScreenBackHeader,
} from "@/components/ui/design-system";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/stores/auth.store";
import { AppNotification } from "@/types/notification.types";
import {
    formatNotificationTime,
    getNotificationRoute,
    mapNotificationModuleToCardType,
} from "@/utils/notificationNavigation";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { RefreshControl as GestureRefreshControl } from "react-native-gesture-handler";

function toCardData(item: AppNotification): Notification {
    return {
        id: item.id,
        title: item.title,
        description: item.details,
        time: formatNotificationTime(item.createdAt),
        type: mapNotificationModuleToCardType(item.module),
        read: item.read,
        module: item.module,
    };
}

function ListSeparator() {
    return <View style={styles.listSeparator} />;
}

export default function NotificationScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const {
        data,
        isSuccess,
        isError,
        isFetching,
        refetch,
    } = useNotifications(user?.role);

    const notifications = data?.items ?? [];
    const unreadCount = data?.unreadCount ?? 0;
    const showLoading = !data && isFetching;
    const showEmpty = isSuccess && notifications.length === 0;

    const handleNotificationPress = useCallback(
        (item: AppNotification) => {
            const route = getNotificationRoute(item.module);
            if (route) {
                router.push(route);
            }
        },
        [router],
    );

    const renderItem = useCallback(
        ({ item }: { item: AppNotification }) => (
            <NotificationCard
                data={toCardData(item)}
                onPress={() => handleNotificationPress(item)}
            />
        ),
        [handleNotificationPress],
    );

    const keyExtractor = useCallback((item: AppNotification) => item.id, []);

    const listEmptyComponent = useMemo(() => {
        if (showLoading) {
            return (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.stateText}>Loading alerts...</Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.centerBox}>
                    <Ionicons name="alert-circle-outline" size={40} color={roadmapTheme.textMuted} />
                    <Text style={styles.stateText}>Failed to load alerts</Text>
                </View>
            );
        }

        if (!showEmpty) {
            return null;
        }

        return (
            <View style={styles.centerBox}>
                <Ionicons name="notifications-off-outline" size={40} color={roadmapTheme.textMuted} />
                <Text style={styles.stateText}>No alerts yet</Text>
            </View>
        );
    }, [isError, showEmpty, showLoading]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false, title: "Alerts" }} />
            <GradientBackground>
                <View style={styles.root}>
                    <TopBar showNotifications={false} />

                    <ScreenBackHeader title="Alerts" />

                    {unreadCount > 0 && (
                        <View style={styles.badgeRow}>
                            <View style={styles.unreadBadge}>
                                <Ionicons name="ellipse" size={7} color={roadmapTheme.accentMint} />
                                <Text style={styles.unreadText}>
                                    {unreadCount} unread
                                </Text>
                            </View>
                        </View>
                    )}

                    <FlatList
                        data={notifications}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        ItemSeparatorComponent={ListSeparator}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.listContent,
                            notifications.length === 0 && styles.listContentEmpty,
                        ]}
                        initialNumToRender={12}
                        maxToRenderPerBatch={10}
                        windowSize={7}
                        removeClippedSubviews
                        refreshControl={
                            <GestureRefreshControl
                                refreshing={isFetching && Boolean(data)}
                                onRefresh={refetch}
                                tintColor="#fff"
                            />
                        }
                        ListEmptyComponent={listEmptyComponent}
                    />
                </View>
            </GradientBackground>
        </>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    badgeRow: {
        paddingHorizontal: homeLayout.screenPaddingH,
        marginBottom: 10,
    },
    unreadBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        alignSelf: "flex-start",
        backgroundColor: "rgba(111,212,190,0.12)",
        borderWidth: 1,
        borderColor: "rgba(111,212,190,0.22)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    unreadText: {
        color: roadmapTheme.accentMint,
        fontSize: 12,
        fontWeight: "700",
    },
    listContent: {
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingTop: 4,
        paddingBottom: 32,
    },
    listSeparator: {
        height: 10,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    centerBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: homeLayout.screenPaddingH,
        minHeight: 280,
    },
    stateText: {
        color: roadmapTheme.textMuted,
        fontSize: 15,
        textAlign: "center",
    },
});
