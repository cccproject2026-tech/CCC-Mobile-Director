import { roadmapTheme } from "@/components/ui/design-system";
import { InterestItem } from "@/types/interest.types";
import { Mentee } from "@/types/user.types";
import {
    chatNotAvailableYet,
    dialPhone,
    openWhatsApp,
    sendEmail,
} from "@/utils/contactActions";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallDevice = SCREEN_WIDTH < 375;

interface AcceptedUserCardProps {
    data: InterestItem | Mentee;
    selectable?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    showAssignButton?: boolean;
    onAssignPress?: () => void;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

function contactFromCardData(data: InterestItem | Mentee) {
    const email =
        "email" in data && data.email ? String(data.email).trim() : undefined;
    if ("churchDetails" in data && data.churchDetails?.length) {
        const phone =
            (data as InterestItem).phoneNumber?.trim() ||
            data.churchDetails[0]?.churchPhone?.trim() ||
            undefined;
        return { phone, email };
    }
    const phone =
        "phoneNumber" in data ? data.phoneNumber?.trim() || undefined : undefined;
    return { phone, email };
}

const AcceptedUserCard = memo(
    ({
        data,
        selectable = false,
        isSelected = false,
        onToggleSelect,
        showAssignButton = true,
        onAssignPress,
    }: AcceptedUserCardProps) => {

        const stopPropagation = useCallback(
            (e: any, cb?: () => void) => {
                if (selectable) e.stopPropagation();
                cb?.();
            },
            [selectable]
        );

        const Wrapper = selectable ? TouchableOpacity : View;

        const fullName =
            `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || "Unknown";

        const country = ('churchDetails' in data) ? (data.churchDetails?.[0]?.country || "Unknown") : "Unknown";

        const { phone: contactPhone, email: contactEmail } = contactFromCardData(data);

        return (
            <Wrapper
                {...(selectable
                    ? {
                        onPress: onToggleSelect,
                        activeOpacity: 0.7,
                        style: [styles.acceptedCard, isSelected && styles.selectedCard],
                    }
                    : { style: styles.acceptedCard })}
            >
                {selectable && (
                    <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && (
                                <Ionicons name="checkmark" size={18} color={roadmapTheme.textActive} />
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.topRow}>
                    <View style={styles.profileImageContainer}>
                        {data.profilePicture ? (
                            <Image source={{ uri: data.profilePicture }} style={styles.profileImage} />
                        ) : (
                            <Ionicons
                                name="person-outline"
                                size={isSmallDevice ? 40 : 50}
                                color={roadmapTheme.accentMint}
                            />
                        )}
                    </View>

                    <View style={styles.userInfoContainer}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {fullName}
                        </Text>
                        <Text style={styles.userRole} numberOfLines={1}>
                            {('title' in data ? data.title : ('role' in data ? data.role : "")) || "Not Specified"}
                        </Text>

                        {country !== "Unknown" && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Country: </Text>
                                <Text style={styles.infoValue}>{country}</Text>
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Created:</Text>
                            <Text style={styles.infoValue}>
                                {formatDate(data.createdAt)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.contactIcons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(e) => stopPropagation(e, () => dialPhone(contactPhone))}
                        >
                            <Ionicons name="call-outline" size={20} color={roadmapTheme.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(e) => stopPropagation(e, chatNotAvailableYet)}
                        >
                            <Ionicons name="chatbubble-outline" size={20} color={roadmapTheme.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(e) => stopPropagation(e, () => sendEmail(contactEmail))}
                        >
                            <Ionicons name="mail-outline" size={20} color={roadmapTheme.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(e) => stopPropagation(e, () => openWhatsApp(contactPhone))}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color={roadmapTheme.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {!selectable && showAssignButton && (
                        <Pressable style={styles.assignButton} onPress={onAssignPress}>
                            <Text style={styles.assignButtonText}>Assign</Text>
                            <Ionicons name="arrow-forward" size={14} color={roadmapTheme.textActive} />
                        </Pressable>
                    )}
                </View>
            </Wrapper>
        );
    }
);

export default AcceptedUserCard;

const styles = StyleSheet.create({
    acceptedCard: {
        padding: 14,
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        borderRadius: 16,
        position: "relative",
    },
    selectedCard: {
        borderColor: roadmapTheme.accentMint,
        borderWidth: 2,
        backgroundColor: "rgba(111, 212, 190, 0.12)",
    },
    checkboxContainer: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: roadmapTheme.frostedBorderStrong,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    checkboxSelected: {
        backgroundColor: "rgba(255,255,255,0.92)",
        borderColor: "rgba(255,255,255,0.92)",
    },
    topRow: {
        flexDirection: "row",
        marginBottom: 14,
    },
    profileImageContainer: {
        width: isSmallDevice ? 90 : 100,
        height: isSmallDevice ? 90 : 100,
        backgroundColor: "rgba(111, 212, 190, 0.14)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.28)",
        borderRadius: 14,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        flexShrink: 0,
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    userInfoContainer: {
        flex: 1,
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    userName: {
        fontSize: isSmallDevice ? 16 : 17,
        fontWeight: "800",
        color: roadmapTheme.textPrimary,
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    userRole: {
        fontSize: isSmallDevice ? 13 : 14,
        color: roadmapTheme.textMuted,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        flexWrap: "wrap",
    },
    infoLabel: {
        fontSize: isSmallDevice ? 12 : 13,
        color: roadmapTheme.textSubtle,
        marginRight: 4,
    },
    infoValue: {
        fontSize: isSmallDevice ? 12 : 13,
        color: roadmapTheme.textPrimary,
        fontWeight: "500",
        flexShrink: 1,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    contactIcons: {
        flexDirection: "row",
        gap: 4,
        flex: 1,
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    assignButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginLeft: 8,
        flexShrink: 0,
    },
    assignButtonText: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: "700",
        color: roadmapTheme.textActive,
    },
});
