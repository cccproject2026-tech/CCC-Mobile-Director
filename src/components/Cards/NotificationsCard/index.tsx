import { icons } from "@/constants";
import { homeLayout, roadmapTheme } from "@/components/ui/design-system";
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

const typeColor: Record<Notification["type"], string> = {
    course: "#38BDF8",
    note: roadmapTheme.accentMint,
    assignment: "#FFB347",
    profile: "#A78BFA",
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

    const accent = typeColor[data.type];

    return (
        <View style={[styles.card, !data.read && styles.cardUnread]}>
            {/* unread dot */}
            {!data.read && <View style={styles.unreadDot} />}

            <View style={[styles.iconWrap, { backgroundColor: `${accent}18`, borderColor: `${accent}30` }]}>
                <Ionicons name={typeIcon[data.type]} size={22} color={accent} />
            </View>

            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>
                    {data.title}
                </Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaLeft}>
                        <Image source={icons.myProfile} style={styles.metaAvatar} />
                        <View style={styles.metaLines}>
                            <Text style={styles.metaLine} numberOfLines={1}>{line1}</Text>
                            {!!line2 && (
                                <Text style={styles.metaLine} numberOfLines={1}>{line2}</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.timeBadge}>
                        <Ionicons name="time-outline" size={11} color={roadmapTheme.textCaption} />
                        <Text style={styles.timeText}>{data.time}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default NotificationCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: homeLayout.cardRadiusCompact,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
    },
    cardUnread: {
        backgroundColor: "rgba(255,255,255,0.10)",
        borderColor: roadmapTheme.frostedBorderStrong,
    },
    unreadDot: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: roadmapTheme.accentMint,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 11,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    body: {
        flex: 1,
        gap: 8,
    },
    title: {
        color: roadmapTheme.textPrimary,
        fontWeight: "800",
        fontSize: 13,
        letterSpacing: 0.2,
        lineHeight: 19,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    metaLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 1,
    },
    metaAvatar: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    metaLines: { flexShrink: 1 },
    metaLine: {
        color: roadmapTheme.textMuted,
        fontSize: 12,
        lineHeight: 17,
    },
    timeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        flexShrink: 0,
    },
    timeText: {
        color: roadmapTheme.textCaption,
        fontSize: 11,
        fontWeight: "500",
    },
});
