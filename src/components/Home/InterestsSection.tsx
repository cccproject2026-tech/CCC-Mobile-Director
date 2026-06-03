import { useInterests } from '@/hooks/useInterest';
import { CommonCard, HomeSectionHeader, roadmapTheme } from '@/components/ui/design-system';
import {
    chatNotAvailableYet,
    dialPhone,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';
import { InterestItem } from '@/types/interest.types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import InterestCard from '../Cards/InterestCard';
import { InterestCardSkeleton } from '../Cards/InterestCard/InterestCardSkeleton';

const InterestsSection = () => {
    const router = useRouter();
    const { data, isLoading } = useInterests();

    const interests = Array.isArray(data) ? data : data || [];
    const latestThree = interests
        .filter((item: any) => item.status === 'pending' || item.status === 'new')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
    const pendingInterestsLength = interests.filter((item: any) => item.status === 'pending' || item.status === 'new').length;

    const interestPhone = (item: InterestItem) =>
        item.phoneNumber?.trim() ||
        item.churchDetails?.[0]?.churchPhone?.trim() ||
        undefined;

    const badge = (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>
                {isLoading ? '...' : pendingInterestsLength}
            </Text>
        </View>
    );

    return (
        <CommonCard>
            <HomeSectionHeader
                icon="sparkles-outline"
                title="New Interests"
                headerRight={
                    <View style={styles.headerRight}>
                        {badge}
                        <Pressable
                            hitSlop={8}
                            onPress={() => router.push('/(director)/(tabs)/new-interests' as any)}
                        >
                            <Text style={styles.seeAll}>See all</Text>
                        </Pressable>
                    </View>
                }
            />

            <View style={styles.listWrapper}>
                {isLoading ? (
                    <>
                        <InterestCardSkeleton />
                        <InterestCardSkeleton />
                        <InterestCardSkeleton />
                    </>
                ) : latestThree.length > 0 ? (
                    latestThree.map((item: InterestItem) => (
                        <InterestCard
                            key={item.id}
                            data={item}
                            onCall={() => dialPhone(interestPhone(item))}
                            onChat={chatNotAvailableYet}
                            onMail={() => sendEmail(item.email)}
                            onWhatsApp={() => openWhatsApp(interestPhone(item))}
                            onPress={() =>
                                router.push({
                                    pathname: '/(director)/(tabs)/new-interests/interest-details',
                                    params: { interestId: item.id },
                                })
                            }
                        />
                    ))
                ) : (
                    <Text style={styles.emptyText}>No new interests</Text>
                )}
            </View>
        </CommonCard>
    );
};

export default InterestsSection;

const styles = StyleSheet.create({
    badge: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: roadmapTheme.textActive,
        fontWeight: '700',
        fontSize: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    seeAll: {
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
        fontSize: 13,
    },
    listWrapper: {
        gap: 12,
    },
    emptyText: {
        color: roadmapTheme.textMuted,
        fontSize: 13,
    },
});
