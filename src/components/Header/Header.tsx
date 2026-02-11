import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
    showNewMeeting?: boolean;
    onNewMeetingPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    showBackButton = false,
    showNewMeeting = false,
    onNewMeetingPress,
}) => {
    const router = useRouter();
    const { top } = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                {showBackButton && (
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </Pressable>
                )}
                <Text style={styles.title}>{title}</Text>
            </View>

            {showNewMeeting && (
                <Pressable onPress={onNewMeetingPress} style={styles.newMeetingButton}>
                    <Ionicons name="add" size={20} color="#FFFFFF" style={styles.newMeetingIcon} />
                    <Text style={styles.newMeetingText}>New Meeting</Text>
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: "transparent",
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#EAF7FF",
    },
    newMeetingButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    newMeetingIcon: {
        marginRight: 6,
    },
    newMeetingText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
