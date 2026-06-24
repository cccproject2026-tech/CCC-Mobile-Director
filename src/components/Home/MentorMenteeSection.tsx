
import { useMentees } from '@/hooks/useMentees';
import { useMentors } from '@/hooks/useMentors';
import { CommonCard, roadmapTheme } from '@/components/ui/design-system';
import { useMenteesNavigationStore } from '@/stores/menteesNavigation.store';
import { useMentorsNavigationStore } from '@/stores/mentorsNavigation.store';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import MentorMenteeCard from '../Cards/MentorMenteeCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

const MentorMenteeSection: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'mentors' | 'mentees'>('mentors');

    const { data: allMentors, isLoading: isLoadingMentors, error: isErrorMentors } = useMentors(10);
    const { data: menteesData, isLoading: isLoadingMentees, isError: isErrorMentees } = useMentees(10);

    const mentors = useMemo(() => {
        const allMentor = allMentors?.pages.flatMap((page: any) => page.mentors) ?? [];
        return allMentor && Array.isArray(allMentor) ? allMentor.slice(0, 3) : [];
    }, [allMentors]);

    const mentees = useMemo(() => {
        const allMentees = menteesData?.pages.flatMap((page: any) => page.mentees) ?? [];
        return Array.isArray(allMentees) ? allMentees.slice(0, 3) : [];
    }, [menteesData]);

    const isLoading = activeTab === 'mentors' ? isLoadingMentors : isLoadingMentees;
    const isError = activeTab === 'mentors' ? isErrorMentors : isErrorMentees;

    const handleMentorPress = (mentorId: string) => {
        const mentor = mentors.find(m => m.id === mentorId);
        const email = mentor?.email || '';
        router.push(`/(director)/(tabs)/mentors/${mentorId}${email ? `?email=${encodeURIComponent(email)}` : ''}` as any);
    };

    const handleMenteePress = (menteeId: string) => {
        const mentee = mentees.find((m: any) => m.id === menteeId);
        const email = mentee?.email || '';
        router.push(`/(director)/(tabs)/mentees/${menteeId}${email ? `?email=${encodeURIComponent(email)}` : ''}` as any);
    };

    const handleSeeAll = () => {
        if (activeTab === 'mentors') {
            useMentorsNavigationStore.getState().setFullMenu();
            router.push('/(director)/(tabs)/mentors');
        } else {
            useMenteesNavigationStore.getState().setFullMenu();
            router.push('/(director)/(tabs)/mentees');
        }
    };

    return (
        <CommonCard>
            <View style={styles.header}>
                <View style={styles.tabs}>
                    <Pressable
                        style={[styles.tab, activeTab === 'mentors' && styles.activeTab]}
                        onPress={() => setActiveTab('mentors')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'mentors' && styles.activeTabText,
                            ]}
                        >
                            Mentors
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.tab, activeTab === 'mentees' && styles.activeTab]}
                        onPress={() => setActiveTab('mentees')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'mentees' && styles.activeTabText,
                            ]}
                        >
                            Mentees
                        </Text>
                    </Pressable>
                </View>

                <Pressable onPress={handleSeeAll} hitSlop={8}>
                    <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            </View>

            <View style={styles.listContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={roadmapTheme.textPrimary} />
                    </View>
                ) : isError ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                            Failed to load {activeTab === 'mentors' ? 'mentors' : 'mentees'}
                        </Text>
                    </View>
                ) : (
                    <>
                        {activeTab === 'mentors' &&
                            (mentors.length > 0 ? (
                                mentors.map((mentor) => (
                                    <MentorMenteeCard
                                        key={mentor.id}
                                        name={mentor.firstName + ' ' + (mentor.lastName || '')}
                                        role={mentor.role}
                                        metricLabel={mentor.assignedId ? `${mentor.assignedId.length} Mentees` : 'Mentor'}
                                        onPress={() => handleMentorPress(mentor.id)}
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No mentors found</Text>
                                </View>
                            ))}

                        {activeTab === 'mentees' &&
                            (mentees.length > 0 ? (
                                mentees.map((mentee: any) => (
                                    <MentorMenteeCard
                                        key={mentee.id}
                                        name={`${mentee.firstName} ${mentee.lastName || ''}`.trim()}
                                        role={mentee.role || 'Pastor'}
                                        metricValue={mentee.lastContacted ? `${mentee.lastContacted} Days Ago` : 'N/A'}
                                        onPress={() => handleMenteePress(mentee.id)}
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No mentees found</Text>
                                </View>
                            ))}
                    </>
                )}
            </View>
        </CommonCard>
    );
};

export default MentorMenteeSection;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isSmallDevice ? 10 : 12,
    },
    tabs: {
        flexDirection: 'row',
        gap: isSmallDevice ? 6 : 8,
    },
    tab: {
        paddingHorizontal: isSmallDevice ? 14 : 16,
        paddingVertical: isSmallDevice ? 7 : 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        backgroundColor: 'transparent',
    },
    activeTab: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderColor: 'rgba(255,255,255,0.92)',
    },
    tabText: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '700',
        color: roadmapTheme.textMuted,
    },
    activeTabText: {
        color: roadmapTheme.textActive,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
    },
    listContainer: {
        gap: 12,
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: '#fca5a5',
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '500',
    },
    emptyContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: roadmapTheme.textMuted,
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '500',
    },
});
