// components/common/UserCardSkeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "moti/skeleton";

type Layout = "card" | "list";

interface UserCardSkeletonProps {
    layout?: Layout;
}

export const UserCardSkeleton: React.FC<UserCardSkeletonProps> = ({
    layout = "card",
}) => {
    if (layout === "list") {
        return (
            <View style={styles.listContainer}>
                {/* Avatar */}
                <Skeleton
                    colorMode="dark"
                    radius={10}
                    height={46}
                    width={46}
                />

                {/* Name + small badge */}
                <View style={styles.listInfo}>
                    <Skeleton colorMode="dark" height={16} width={"70%"} />
                    <Skeleton colorMode="dark" height={12} width={80} />
                </View>

                {/* Right side icons placeholder */}
                <View style={styles.listIcons}>
                    <Skeleton colorMode="dark" radius={999} height={24} width={24} />
                    <Skeleton colorMode="dark" radius={999} height={24} width={24} />
                </View>
            </View>
        );
    }

    // CARD layout
    return (
        <View style={styles.card}>
            <View style={styles.cardRow}>
                {/* Avatar */}
                <Skeleton colorMode="dark" radius={10} height={70} width={70} />

                <View style={styles.cardInfo}>
                    <View style={styles.row}>
                        <Skeleton colorMode="dark" height={18} width={"50%"} />
                        <View style={{ marginLeft: 8 }}>
                            <Skeleton colorMode="dark" height={14} width={90} />
                        </View>
                    </View>
                    <View style={{ marginTop: 6 }}>
                        <Skeleton colorMode="dark" height={14} width={80} />
                    </View>
                    <View style={{ marginTop: 8, gap: 6 }}>
                        <Skeleton colorMode="dark" height={14} width={"100%"} />
                        <Skeleton colorMode="dark" height={14} width={"80%"} />
                    </View>
                </View>

                <Skeleton colorMode="dark" radius={999} height={24} width={24} />
            </View>

            {/* Bottom contact icons row */}
            <View style={styles.contactsRow}>
                <Skeleton colorMode="dark" radius={999} height={30} width={30} />
                <Skeleton colorMode="dark" radius={999} height={30} width={30} />
                <Skeleton colorMode="dark" radius={999} height={30} width={30} />
                <Skeleton colorMode="dark" radius={999} height={30} width={30} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    /* Card layout skeleton */
    card: {
        backgroundColor: "rgba(255,255,255,0.09)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        padding: 14,
        marginBottom: 12,
    },
    cardRow: {
        flexDirection: "row",
        marginBottom: 12,
        alignItems: "flex-start",
        gap: 12,
    },
    cardInfo: {
        flex: 1,
        gap: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    contactsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    /* List layout skeleton */
    listContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        padding: 12,
        marginBottom: 10,
    },
    listInfo: {
        flex: 1,
        marginLeft: 12,
        gap: 6,
    },
    listIcons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
