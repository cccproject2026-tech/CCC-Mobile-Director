import NotificationCard, { Notification } from "@/components/Cards/NotificationsCard";
import TopBar from "@/components/Header/TopBar";
import {
    GradientBackground,
    homeLayout,
    roadmapTheme,
    ScreenBackHeader,
} from "@/components/ui/design-system";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const dummyNotifications: Notification[] = [
    {
        title: "4 PASTORS COMPLETED THEIR COURSE TODAY !",
        description: "Pr. John Doe , Pr. John Doe and two more.",
        time: "9:43 am",
        type: "course",
        read: false,
    },
    {
        title: "NEW MENTOR HAS BEEN ASSIGNED TO PR. MICHAEL",
        description: "Mentor John Doe Loream Ipsum Interested in receiving mento",
        time: "9:43 am",
        type: "note",
        read: false,
    },
    {
        title: "5 NEW INTERESTS RECIEVED TODAY !",
        description: "Loream Ipsum Interested in receiving mentoring in",
        time: "9:43 am",
        type: "assignment",
        read: true,
    },
    {
        title: "PR. MICHAEL HAS SUBMITTED ASSIGNMENT",
        description: "Loream Ipsum Interested in receiving mentoring in",
        time: "9:43 am",
        type: "course",
        read: true,
    },
    {
        title: "YOUR PROFILE IS INCOMPLETE",
        description: "Loream Ipsum Interested in receiving mentoring in",
        time: "9:43 am",
        type: "profile",
        read: true,
    },
];

const unreadCount = dummyNotifications.filter((n) => !n.read).length;

export default function NotificationScreen() {
    const navigation = useNavigation();

    return (
        <>
            <Stack.Screen options={{ headerShown: false, title: "Notifications" }} />
            <GradientBackground>
                <View style={styles.root}>
                    <TopBar showNotifications={false} />

                    <ScreenBackHeader
                        title="Notifications"
                        onBack={() => navigation.goBack()}
                    />

                    {/* unread badge row */}
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

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    >
                        {dummyNotifications.map((n, idx) => (
                            <NotificationCard key={`${n.title}-${idx}`} data={n} />
                        ))}
                    </ScrollView>
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
        gap: 10,
    },
});
