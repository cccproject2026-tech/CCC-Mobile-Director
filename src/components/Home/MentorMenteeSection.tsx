
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import MentorMenteeCard from '../Cards/MentorMenteeCard';
import { useMentors } from '@/hooks/useMentors';
import { useMentees } from '@/hooks/useMentees';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

const MentorMenteeSection: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'mentors' | 'mentees'>('mentors');

    // Fetch mentors and mentees from API
    const { data: allMentors, isLoading: isLoadingMentors, error: isErrorMentors } = useMentors(10);
    const { data: menteesData, isLoading: isLoadingMentees, isError: isErrorMentees } = useMentees(10);
    console.log(menteesData, 'menteesData');
    console.log(allMentors, 'allMentors');
    // Limit to first 3 items
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
        // const allMentees = mentees ?? [];
        const mentee = mentees.find((m: any) => m.id === menteeId);
        const email = mentee?.email || '';
        router.push(`/(director)/(tabs)/mentees/${menteeId}${email ? `?email=${encodeURIComponent(email)}` : ''}` as any);
    };

    const handleSeeAll = () => {
        if (activeTab === 'mentors') {
            router.push('/(director)/(tabs)/mentors');
        } else {
            router.push('/(director)/(tabs)/mentees');
        }
    };

    return (
        <View style={styles.container}>
            {/* Tab Header */}
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

                <Pressable onPress={handleSeeAll}>
                    <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            </View>

            {/* List */}
            <View style={styles.listContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#EAF7FF" />
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
        </View>
    );
};

export default MentorMenteeSection;

const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 16,
        marginTop: 20,
    },
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
        paddingHorizontal: isSmallDevice ? 16 : 20,
        paddingVertical: isSmallDevice ? 8 : 10,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'transparent',
    },
    activeTab: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    tabText: {
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
    },
    activeTabText: {
        color: '#164d62',
    },
    seeAll: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '600',
        color: '#EAF7FF',
    },
    listContainer: {
        paddingBottom: 20,
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
        color: '#ff6b6b',
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '500',
    },
    emptyContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '500',
    },
});
