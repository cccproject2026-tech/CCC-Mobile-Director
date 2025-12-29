

import NotificationCard, { Notification } from "@/components/Cards/NotificationsCard";
import TopBar from "@/components/Header/TopBar";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


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

export default function NotificationScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <>
            <Stack.Screen options={{ headerShown: false, title: "Notifications" }} />
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>

                <View style={styles.root}>
                    <TopBar
                        showNotifications={false}
                    />


                    <Pressable onPress={() => navigation.goBack()} style={styles.titleRow}>
                        <Ionicons name="chevron-back" size={22} color="#D9EEF8" />
                        <Text style={styles.titleText}>Notifications</Text>
                    </Pressable>

                    <View style={styles.divider} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    >
                        {dummyNotifications.map((n, idx) => (
                            <View key={`${n.title}-${idx}`} style={styles.block}>
                                <NotificationCard data={n} />
                                {idx !== dummyNotifications.length - 1 && (
                                    <View style={styles.sectionSeparator} />
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </LinearGradient >
        </>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },

    // Header
    appBar: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 6,
    },
    menuBtn: { paddingVertical: 6, paddingRight: 8 },
    logoWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.65)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    titleText: { color: "#EAF7FF", fontSize: 18, fontWeight: "700" },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.16)",
    },

    // List
    listContent: {
        paddingTop: 12,
        paddingBottom: 32,
        paddingHorizontal: 12,
    },
    block: { width: "100%" },
    sectionSeparator: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.16)",
        marginVertical: 16,
        marginHorizontal: 8,
    },
});
