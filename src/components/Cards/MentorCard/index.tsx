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
    embedded?: boolean;
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
    embedded = false,
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    onPress,
    onMenu,
    showMenu,
}: MentorCardProps) {
    const hasMenu = Boolean(showMenu && onMenu);
    const listMenuButton =
        hasMenu ? (
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

    const avatarSize = embedded ? 64 : 100;
    const hasDescription = Boolean(mentor.description?.trim());
    const showDescription = !embedded || hasDescription;

    if (layout === "list") {
        return (
            <View style={[styles.listContainer, embedded && styles.embeddedListContainer]}>
                <Pressable
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 }}
                    onPress={onPress}
                >
                    <View style={styles.listAvatarWrap}>
                        <ImageContainer src={mentor.profilePicture} size={46} />
                    </View>
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
                    {listMenuButton}
                </View>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.card,
                embedded && styles.embeddedCard,
            ]}
            pointerEvents="box-none"
        >
            <View style={[styles.cardRow, embedded && styles.embeddedCardRow]}>
                    <View style={styles.avatarColumn}>
                        <ImageContainer src={mentor.profilePicture} size={avatarSize} />
                    </View>

                    <View
                        style={[
                            styles.cardInfo,
                            embedded && styles.embeddedCardInfo,
                            hasMenu && styles.cardInfoWithMenu,
                        ]}
                    >
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onPress}
                            disabled={!onPress}
                        >
                            <View
                                style={[
                                    styles.contentStack,
                                    embedded && styles.embeddedContentStack,
                                ]}
                            >
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
                                <Text style={styles.role} numberOfLines={1}>
                                    -{mentor.role}
                                </Text>
                                {showDescription ? (
                                    <Text style={styles.desc} numberOfLines={embedded ? 2 : 3}>
                                        {hasDescription
                                            ? mentor.description
                                            : "No description available"}
                                    </Text>
                                ) : null}
                            </View>
                        </TouchableOpacity>

                        <View
                            style={[
                                styles.contactRow,
                                embedded ? styles.embeddedContactRow : styles.defaultContactRow,
                            ]}
                        >
                            <ContactIcons
                                onCall={onCall}
                                onChat={onChat}
                                onMail={onMail}
                                onWhatsApp={onWhatsApp}
                                small
                                btnStyles={{ marginRight: 4 }}
                            />
                        </View>
                    </View>
                </View>

            {hasMenu ? (
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
            ) : null}
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
        overflow: "hidden",
    },
    embeddedCard: {
        backgroundColor: "transparent",
        borderWidth: 0,
        borderRadius: 0,
        padding: 0,
        marginBottom: 0,
        overflow: "visible",
    },
    menuButton: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 30,
        backgroundColor: "transparent",
        padding: 4,
    },
    cardInfoWithMenu: {
        paddingRight: 28,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        minWidth: 0,
    },
    embeddedCardRow: {
        alignItems: "center",
    },
    avatarColumn: {
        flexShrink: 0,
        marginRight: 10,
    },
    cardInfo: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: 0,
        alignSelf: "flex-start",
    },
    embeddedCardInfo: {
        alignSelf: "center",
        justifyContent: "flex-start",
    },
    contentStack: {
        gap: 8,
    },
    embeddedContentStack: {
        gap: 6,
    },
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    defaultContactRow: {
        marginTop: 8,
    },
    embeddedContactRow: {
        marginTop: 6,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        flexShrink: 1,
    },
    role: {
        fontSize: 12,
        color: "rgba(255,255,255,0.6)",
        fontWeight: "600",
        textTransform: "capitalize",
    },
    desc: {
        fontSize: 13,
        color: "rgba(255,255,255,0.7)",
        lineHeight: 18,
    },
    avatar: { borderRadius: 12, overflow: "hidden" },
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
        overflow: "hidden",
        minWidth: 0,
    },
    embeddedListContainer: {
        backgroundColor: "transparent",
        borderWidth: 0,
        borderRadius: 0,
        padding: 0,
        marginBottom: 0,
    },
    listAvatarWrap: {
        marginRight: 10,
        flexShrink: 0,
    },
    listInfo: { flex: 1, flexDirection: "column", marginRight: 10, gap: 4, minWidth: 0 },
    listName: { fontSize: 14, fontWeight: "700", color: "#fff", flexShrink: 1 },
    menteesBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
    },
    dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#6FD4BE", marginRight: 5 },
    menteesText: { fontSize: 11, color: "#6FD4BE", fontWeight: "600" },
    row: { flexDirection: "row", alignItems: "center" },
    justifyBetween: { justifyContent: "space-between" },
});
