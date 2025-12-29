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
                    colorMode="light"
                    radius={10}
                    height={46}
                    width={46}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />

                {/* Name + small badge */}
                <View style={styles.listInfo}>
                    <Skeleton
                        colorMode="light"
                        height={16}
                        width={"70%"}
                        colors={["#dbe9f5", "#b9d4e6"]}
                    />
                    <Skeleton
                        colorMode="light"
                        height={12}
                        width={80}
                        colors={["#dbe9f5", "#b9d4e6"]}
                    />
                </View>

                {/* Right side icons placeholder */}
                <View style={styles.listIcons}>
                    <Skeleton
                        colorMode="light"
                        radius={999}
                        height={24}
                        width={24}
                        colors={["#dbe9f5", "#b9d4e6"]}
                    />
                    <Skeleton
                        colorMode="light"
                        radius={999}
                        height={24}
                        width={24}
                        colors={["#dbe9f5", "#b9d4e6"]}
                    />
                </View>
            </View>
        );
    }

    // CARD layout
    return (
        <View style={styles.card}>
            <View style={styles.cardRow}>
                {/* Avatar */}
                <Skeleton
                    colorMode="light"
                    radius={10}
                    height={70}
                    width={70}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />

                <View style={styles.cardInfo}>
                    {/* Name + badge row */}
                    <View style={styles.row}>
                        <Skeleton
                            colorMode="light"
                            height={18}
                            width={"50%"}
                            colors={["#dbe9f5", "#b9d4e6"]}
                        />
                        <View style={{ marginLeft: 8 }}>
                            <Skeleton
                                colorMode="light"
                                height={14}
                                width={90}
                                colors={["#dbe9f5", "#b9d4e6"]}
                            />
                        </View>
                    </View>

                    {/* Role */}
                    <View style={{ marginTop: 6 }}>
                        <Skeleton
                            colorMode="light"
                            height={14}
                            width={80}
                            colors={["#dbe9f5", "#b9d4e6"]}
                        />
                    </View>

                    {/* Description */}
                    <View style={{ marginTop: 8, gap: 6 }}>
                        <Skeleton
                            colorMode="light"
                            height={14}
                            width={"100%"}
                            colors={["#dbe9f5", "#b9d4e6"]}
                        />
                        <Skeleton
                            colorMode="light"
                            height={14}
                            width={"80%"}
                            colors={["#dbe9f5", "#b9d4e6"]}
                        />
                    </View>
                </View>

                {/* Menu icon placeholder */}
                <Skeleton
                    colorMode="light"
                    radius={999}
                    height={24}
                    width={24}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />
            </View>

            {/* Bottom contact icons row */}
            <View style={styles.contactsRow}>
                <Skeleton
                    colorMode="light"
                    radius={999}
                    height={30}
                    width={30}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />
                <Skeleton
                    colorMode="light"
                    radius={999}
                    height={30}
                    width={30}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />
                <Skeleton
                    colorMode="light"
                    radius={999}
                    height={30}
                    width={30}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />
                <Skeleton
                    colorMode="light"
                    radius={999}
                    height={30}
                    width={30}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    /* Card layout skeleton */
    card: {
        backgroundColor: "rgba(33, 58, 115, 1)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        padding: 12,
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
        backgroundColor: "rgba(24,68,123,1)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        padding: 10,
        marginBottom: 8,
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
