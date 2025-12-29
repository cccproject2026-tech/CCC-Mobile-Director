import { icons } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export type Notification = {
    title: string;
    description: string;
    time: string;
    type: "course" | "note" | "assignment" | "profile";
    read: boolean;
};

const typeIcon: Record<Notification["type"], keyof typeof Ionicons.glyphMap> = {
    course: "person-outline",
    note: "easel-outline",
    assignment: "book-outline",
    profile: "document-text-outline",
};

type Props = { data: Notification };

const NotificationCard: React.FC<Props> = ({ data }) => {
    const [line1, line2] = useMemo(() => {
        const idx = data.description.indexOf(" Interested");
        if (idx > 0) {
            return [data.description.slice(0, idx).trim(), data.description.slice(idx).trim()];
        }
        const mid = Math.max(28, Math.floor(data.description.length * 0.55));
        return [data.description.slice(0, mid).trim(), data.description.slice(mid).trim()];
    }, [data.description]);

    return (
        <View style={styles.wrapper}>
            <View style={styles.card}>

                <View style={styles.leftRail}>
                    <Ionicons name={typeIcon[data.type]} size={30} color="#EAF7FF" />
                </View>


                <View style={styles.rightBlock}>

                    <Text style={styles.title} numberOfLines={2}>
                        {data.title}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaLeft}>
                            <Image source={icons.myProfile} style={styles.metaAvatar} />
                            <View style={{ flexShrink: 1 }}>
                                <Text style={styles.metaLine} numberOfLines={1}>
                                    {line1}
                                </Text>
                                <Text style={styles.metaLine} numberOfLines={1}>
                                    {line2}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.timeText}>{data.time}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default NotificationCard;

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
    },
    card: {
        flexDirection: "row",
        backgroundColor: '#14517D',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    leftRail: {
        width: 64,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 2,
    },
    rightBlock: {
        flex: 1,
    },
    title: {
        color: "#EAF7FF",
        fontWeight: "700",
        fontSize: 16,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        lineHeight: 22,
    },
    metaRow: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    metaLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexShrink: 1,
    },
    metaAvatar: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.6)",
    },
    metaLine: {
        color: "#CFE9F3",
        fontSize: 13.5,
        lineHeight: 18,
    },
    timeText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
        marginLeft: 8,
    },
});
