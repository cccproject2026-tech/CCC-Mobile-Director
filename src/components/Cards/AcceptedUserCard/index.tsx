import { InterestItem } from "@/types/interest.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallDevice = SCREEN_WIDTH < 375;

interface AcceptedUserCardProps {
    data: InterestItem;
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

        const country = data.churchDetails?.[0]?.country || "Unknown";

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
                                <Ionicons name="checkmark" size={18} color="#1A4882" />
                            )}
                        </View>
                    </View>
                )}

                {/* TOP ROW */}
                <View style={styles.topRow}>
                    <View style={styles.profileImageContainer}>
                        {data.profilePicture ? (
                            <Image source={{ uri: data.profilePicture }} style={styles.profileImage} />
                        ) : (
                            <Ionicons
                                name="person-outline"
                                size={isSmallDevice ? 40 : 50}
                                color="#fff"
                            />
                        )}
                    </View>

                    <View style={styles.userInfoContainer}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {fullName}
                        </Text>
                        <Text style={styles.userRole} numberOfLines={1}>
                            {data.title || "Pastor"}
                        </Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Country: </Text>
                            <Text style={styles.infoValue}>{country}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Created:</Text>
                            <Text style={styles.infoValue}>
                                {formatDate(data.createdAt)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* BOTTOM */}
                <View style={styles.bottomRow}>
                    <View style={styles.contactIcons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(e) => stopPropagation(e, () => console.log("Call"))}
                        >
                            <Ionicons name="call-outline" size={20} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(e) => stopPropagation(e, () => console.log("Chat"))}
                        >
                            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(e) => stopPropagation(e, () => console.log("Mail"))}
                        >
                            <Ionicons name="mail-outline" size={20} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(e) => stopPropagation(e, () => console.log("WhatsApp"))}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {!selectable && showAssignButton && (
                        <LinearGradient
                            colors={["#7C3AED", "#38BDF8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <TouchableOpacity
                                style={styles.innerButtonContainer}
                                onPress={onAssignPress}
                            >
                                <Text style={styles.assignButtonText}>Assign</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    )}
                </View>
            </Wrapper>
        );
    }
);

export default AcceptedUserCard;

/* STYLES UNCHANGED */
const styles = StyleSheet.create({
    acceptedCard: {
        padding: 16,
        backgroundColor: "#1A4882",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 16,
        marginBottom: 12,
        position: "relative",
    },
    selectedCard: {
        borderColor: "#38BDF8",
        borderWidth: 2,
        backgroundColor: "#1F5A9E",
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
        borderColor: "rgba(255,255,255,0.5)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    checkboxSelected: {
        backgroundColor: "#fff",
        borderColor: "#fff",
    },
    topRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    profileImageContainer: {
        width: isSmallDevice ? 90 : 110,
        height: isSmallDevice ? 90 : 110,
        backgroundColor: "#14517D",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.5)",
        borderRadius: 16,
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
        fontSize: isSmallDevice ? 16 : 18,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
    },
    userRole: {
        fontSize: isSmallDevice ? 13 : 14,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        flexWrap: "wrap",
    },
    infoLabel: {
        fontSize: isSmallDevice ? 12 : 13,
        color: "#fff",
        marginRight: 4,
    },
    infoValue: {
        fontSize: isSmallDevice ? 12 : 13,
        color: "rgba(255,255,255,0.8)",
        flexShrink: 1,
    },
    warningText: {
        fontSize: isSmallDevice ? 12 : 13,
        color: "#FACC15",
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    contactIcons: {
        flexDirection: "row",
        gap: 8,
        flex: 1,
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
        marginLeft: 8,
        flexShrink: 0,
    },
    innerButtonContainer: {
        backgroundColor: "#1A4882",
        borderRadius: 11,
        paddingVertical: 8,
        paddingHorizontal: isSmallDevice ? 12 : 16,
        alignItems: "center",
        justifyContent: "center",
    },
    assignButtonText: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: "600",
        color: "#fff",
    },
});
