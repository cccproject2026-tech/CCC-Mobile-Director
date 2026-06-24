import React from "react";
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ContactIcons from "./ContactIcons";

export interface MentorCardData {
    id: string;
    name: string;
    role: string;
    menteesCount?: number;
    description?: string;
    profilePicture?: string;
}

interface MentorCardProps {
    mentor: MentorCardData;
    layout?: "card" | "list";
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    onPress?: () => void;
    onMenu?: () => void;
    showMenu?: boolean;
}

export default function MentorCard({
    mentor,
    layout = "card",
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    onPress,
    onMenu,
    showMenu,
}: MentorCardProps) {
    const menuButton =
        onMenu && showMenu ? (
            <TouchableOpacity
                activeOpacity={1}
                hitSlop={16}
                onPress={onMenu}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
            >
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
        ) : null;

    const cardMenuButton =
        onMenu && showMenu ? (
            <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={1}
                hitSlop={16}
                onPress={onMenu}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
            >
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
        ) : null;

    if (layout === "list") {
        return (
            <View style={styles.listContainer}>
                <Pressable
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 }}
                    onPress={onPress}
                >
                    <ImageContainer src={mentor.profilePicture} size={46} />
                    <View style={styles.listInfo}>
                        <Text style={styles.listName} numberOfLines={1}>
                            {mentor.name}
                        </Text>
                        {mentor.menteesCount ? (
                            <View style={styles.menteesBadge}>
                                <View style={styles.dot} />
                                <Text style={styles.menteesText}>{mentor.menteesCount} Mentees</Text>
                            </View>
                        ) : null}
                    </View>
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ContactIcons
                        small
                        onCall={onCall}
                        onChat={onChat}
                        onMail={onMail}
                        onWhatsApp={onWhatsApp}
                        btnStyles={{ marginRight: 3 }}
                    />
                    {menuButton}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card} pointerEvents="box-none">
            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                <View style={styles.cardRow}>
                    <View>
                        <ImageContainer src={mentor.profilePicture} size={100} />
                        <ContactIcons
                            onCall={onCall}
                            onChat={onChat}
                            onMail={onMail}
                            onWhatsApp={onWhatsApp}
                            small
                            btnStyles={{ marginRight: 5, marginTop: 4 }}
                        />
                    </View>

                    <View style={[styles.cardInfo, cardMenuButton && styles.cardInfoWithMenu]}>
                        <View style={[styles.row, styles.justifyBetween]}>
                            <View style={styles.row}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {mentor.name}
                                </Text>
                                {mentor.menteesCount ? (
                                    <View style={styles.menteesBadge}>
                                        <View style={styles.dot} />
                                        <Text style={styles.menteesText}>
                                            {mentor.menteesCount} Mentees
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        <Text style={styles.role}>-{mentor.role}</Text>
                        <Text style={styles.desc} numberOfLines={2}>
                            {mentor.description ?? "No description available"}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {cardMenuButton}
        </View>
    );
}

const ImageContainer = ({ src, size }: { src?: string; size: number }) => (
    <View style={[styles.avatar, { width: size, height: size }]}>
        {src ? (
            <Image source={{ uri: src }} style={styles.img} />
        ) : (
            <View style={styles.placeholder}>
                <Ionicons name="person-outline" size={size * 0.45} color="#fff" />
            </View>
        )}
    </View>
);

export const styles = StyleSheet.create({
    card: {
        backgroundColor: "rgba(255,255,255,0.09)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        padding: 14,
        marginBottom: 12,
    },
    menuButton: {
        position: "absolute",
        top: 14,
        right: 14,
        zIndex: 30,
        backgroundColor: "transparent",
    },
    cardInfoWithMenu: {
        paddingRight: 28,
    },
    cardRow: { flexDirection: "row" },
    cardInfo: { flex: 1 },
    name: { fontSize: 16, fontWeight: "700", color: "#fff", marginRight: 16 },
    role: {
        fontSize: 12,
        color: "rgba(255,255,255,0.6)",
        marginBottom: 6,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    desc: { fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 20, marginTop: 8 },
    avatar: { borderRadius: 12, overflow: "hidden", marginRight: 12 },
    img: { width: "100%", height: "100%" },
    placeholder: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    listContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        padding: 12,
        marginBottom: 10,
        justifyContent: "space-between",
    },
    listInfo: { flexDirection: "row", alignItems: "center", marginRight: 10 },
    listName: { fontSize: 14, fontWeight: "700", color: "#fff", marginRight: 6 },
    menteesBadge: { flexDirection: "row", alignItems: "center" },
    dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#6FD4BE", marginRight: 5 },
    menteesText: { fontSize: 11, color: "#6FD4BE", fontWeight: "600" },
    row: { flexDirection: "row", alignItems: "center" },
    justifyBetween: { justifyContent: "space-between" },
});
