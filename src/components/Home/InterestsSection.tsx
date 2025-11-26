import { useInterests } from '@/hooks/useInterest';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import InterestCard from '../Cards/InterestCard';
import { InterestCardSkeleton } from '../Cards/InterestCard/InterestCardSkeleton';

const InterestsSection = () => {
    const { data, isLoading } = useInterests();

    const interests = Array.isArray(data) ? data : data || [];

    const latestThree = interests
        .filter((item: any) => item.status === 'pending' || item.status === 'new')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
    const pendingInterestsLength = interests.filter((item: any) => item.status === 'pending' || item.status === 'new').length;

    return (
        <View style={styles.sectionWrapper}>
            {/* HEADER */}
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <Text style={styles.sectionTitle}>New Interests</Text>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {isLoading ? '...' : pendingInterestsLength}
                        </Text>
                    </View>
                </View>

                <Pressable>
                    <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            </View>

            {/* LIST */}
            <View style={styles.listWrapper}>
                {isLoading ? (
                    <>
                        <InterestCardSkeleton />
                        <InterestCardSkeleton />
                        <InterestCardSkeleton />
                    </>
                ) : latestThree.length > 0 ? (
                    latestThree.map((item: any) => (
                        <InterestCard
                            key={item.id}
                            data={item}
                            onCall={() => console.log("Call", item.firstName)}
                            onChat={() => console.log("Chat", item.firstName)}
                            onMail={() => console.log("Mail", item.firstName)}
                            onPress={() => console.log("Open", item.id)}
                        />
                    ))
                ) : (
                    <Text style={styles.emptyText}>No new interests</Text>
                )}
            </View>
        </View>
    );
};

export default InterestsSection;

const styles = StyleSheet.create({
    sectionWrapper: {
        marginTop: 14,
        borderBottomColor: "#ffffff22",
        borderBottomWidth: 1,
        paddingBottom: 18,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    sectionTitle: {
        fontSize: 15,
        color: "#e7f6fc",
        fontWeight: "700",
    },
    badge: {
        backgroundColor: "#EAF7FF",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        minWidth: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        color: "#164d62",
        fontWeight: "700",
        fontSize: 12,
    },
    seeAll: {
        color: "#cfe9f3",
        fontWeight: "600",
        fontSize: 13,
    },
    listWrapper: {
        marginTop: 10,
        gap: 12,
    },
    emptyText: {
        color: "#cfe9f3",
        fontSize: 13,
        opacity: 0.7,
    },
});
