// app/(director)/(tabs)/progress-tracker/mentors/[id].tsx
import MenteeCard from '@/components/Cards/MenteeCard';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { useMentees } from '@/hooks/useMentees';
import { useUserProfile } from '@/hooks/useProfile';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type TabKey = 'all' | 'in-progress' | 'completed';

export default function MentorProgressTracker() {
    const router = useRouter();
    const { id: mentorId } = useLocalSearchParams<{ id: string }>();

    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

    // Fetch only the specific mentor's profile
    const { data: mentorProfile, isLoading: mentorLoading, isError: mentorError } = useUserProfile(mentorId);

    // Fetch all mentees
    const { data: menteesData, isLoading: menteesLoading } = useMentees();
    const allMentees: Mentee[] = useMemo(() => {
        return menteesData?.pages.flatMap(page => page.mentees) ?? [];
    }, [menteesData]);

    // Extract mentor data and assigned IDs
    const mentorData = mentorProfile;
    const assignedMenteeIds: string[] = Array.isArray(mentorData?.assignedId)
        ? mentorData.assignedId
        : [];

    // Debug logging
    useEffect(() => {
        if (mentorData) {
            console.log('🔍 Mentor Data:', {
                id: mentorData.id,
                name: `${mentorData.firstName} ${mentorData.lastName}`,
                assignedIds: assignedMenteeIds,
                assignedCount: assignedMenteeIds.length
            });
        }
    }, [mentorData, assignedMenteeIds]);

    useEffect(() => {
        console.log('👥 Total Mentees:', allMentees.length);
        console.log('🎯 Assigned Mentee IDs:', assignedMenteeIds);
    }, [allMentees, assignedMenteeIds]);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => {
            setSelectedMentee(null);
        }, 300);
    }, []);

    const menuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentors/mentor-mentees' as any);
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/assign-mentors' as any);
                }, 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/remove-mentors' as any);
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assessments',
            onPress: () => router.push('/(director)/(tabs)/assessments' as any),
        },
        {
            icon: 'person-remove-outline',
            label: 'Assignments',
            onPress: () => console.log('Assignments'),
        },
        {
            icon: 'clipboard-outline',
            label: 'Roadmaps of Mentees',
            onPress: () => console.log('Roadmaps of Mentees'),
        },
        {
            icon: 'checkmark-done-outline',
            label: 'Mentor Notes',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/notes' as any);
                }, 300);
            },
        },
        {
            icon: 'book-outline',
            label: 'View Progress Report',
            onPress: () => console.log('Assignments of Mentees'),
        },
        {
            icon: 'stats-chart-outline',
            label: 'Micro Grant',
            onPress: () => console.log('Progress of Mentees'),
        },
        {
            icon: 'calendar-outline',
            label: 'Product and Services',
            onPress: () => console.log('Schedule a Meeting'),
        },
    ];

    const tabs = [
        { key: 'all', label: 'All Mentees' },
        { key: 'in-progress', label: 'In-progress' },
        { key: 'completed', label: 'Completed' },
    ];

    const isLoading = menteesLoading || mentorLoading;

    // Filter mentees by mentor's assigned IDs
    const filteredMentees: Mentee[] = useMemo(() => {
        console.log('🔄 Starting filtering...');

        // IMPORTANT: First filter by assigned IDs
        let list = allMentees;

        // If mentor has no assigned mentees, return empty array
        if (!assignedMenteeIds || assignedMenteeIds.length === 0) {
            console.log('⚠️ No assigned mentees for this mentor');
            return [];
        }

        // Filter by mentor's assigned mentees
        list = list.filter(mentee => {
            const isAssigned = assignedMenteeIds.includes(mentee.id);
            if (!isAssigned) {
                console.log(`❌ Mentee ${mentee.firstName} ${mentee.lastName} (${mentee.id}) - NOT assigned`);
            } else {
                console.log(`✅ Mentee ${mentee.firstName} ${mentee.lastName} (${mentee.id}) - ASSIGNED`);
            }
            return isAssigned;
        });

        console.log(`📊 After assignedId filter: ${list.length} mentees`);

        // Filter by search
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                `${m.firstName} ${m.lastName ?? ''}`.toLowerCase().includes(q),
            );
            console.log(`🔍 After search filter: ${list.length} mentees`);
        }

        // Filter by tab
        if (activeTab === 'completed') {
            list = list.filter(m => m.hasCompleted || m.progress === 100);
            console.log(`✔️ After completed filter: ${list.length} mentees`);
        } else if (activeTab === 'in-progress') {
            list = list.filter(m => !m.hasCompleted && (m.progress ?? 0) < 100);
            console.log(`⏳ After in-progress filter: ${list.length} mentees`);
        }

        console.log(`🎯 Final filtered list: ${list.length} mentees`);
        return list;
    }, [allMentees, search, activeTab, assignedMenteeIds]);

    // Error state
    if (mentorError || (!mentorLoading && !mentorData)) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={styles.screen}
            >
                <View style={styles.pageRoot}>
                    <TopBar showUserName showNotifications />
                    <View style={styles.content}>
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Mentor not found</Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                                <Text style={styles.backButtonText}>Go Back</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={styles.screen}
        >
            <View style={styles.pageRoot}>
                <TopBar showUserName showNotifications />

                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.headerLeft}
                        >
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <View>
                                <Text style={styles.headerTitle}>Progress Tracker</Text>
                                {mentorData && (
                                    <Text style={styles.headerSubtitle}>
                                        Mentor &gt; {mentorData.firstName}{' '}
                                        {mentorData.lastName ?? ''} ({assignedMenteeIds.length} assigned)
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() =>
                                    setViewMode(viewMode === 'card' ? 'list' : 'card')
                                }
                                style={styles.iconButton}
                            >
                                <Ionicons
                                    name={viewMode === 'card' ? 'list' : 'grid'}
                                    size={24}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <TabSwitcher
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={tabKey => setActiveTab(tabKey as TabKey)}
                    />

                    {/* List */}
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    ) : filteredMentees.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyText}>
                                {assignedMenteeIds.length === 0
                                    ? 'No mentees assigned to this mentor'
                                    : activeTab === 'completed'
                                        ? 'No completed mentees'
                                        : activeTab === 'in-progress'
                                            ? 'No mentees in progress'
                                            : 'No mentees found'}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {filteredMentees.map(mentee => (
                                <MenteeCard
                                    key={mentee.id}
                                    data={mentee as Mentee}
                                    layout={viewMode}
                                    showMenu={true}
                                    onPress={() =>
                                        router.push(
                                            `/(director)/(tabs)/mentees/${mentee.id}/progress` as any,
                                        )
                                    }
                                    onCall={() =>
                                        console.log(
                                            'Call',
                                            `${mentee.firstName} ${mentee.lastName ?? ''}`,
                                        )
                                    }
                                    onChat={() =>
                                        console.log(
                                            'Chat',
                                            `${mentee.firstName} ${mentee.lastName ?? ''}`,
                                        )
                                    }
                                    onMail={() =>
                                        console.log(
                                            'Mail',
                                            `${mentee.firstName} ${mentee.lastName ?? ''}`,
                                        )
                                    }
                                    onWhatsApp={() =>
                                        console.log(
                                            'WhatsApp',
                                            `${mentee.firstName} ${mentee.lastName ?? ''}`,
                                        )
                                    }
                                    onMenuPress={() => handleMenuPress(mentee)}
                                    onMarkComplete={() =>
                                        console.log('Mark complete', mentee.firstName)
                                    }
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={
                        selectedMentee
                            ? `${selectedMentee.firstName} ${selectedMentee.lastName ?? ''}`
                            : ''
                    }
                    image={selectedMentee?.profilePicture}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    pageRoot: { flex: 1 },
    content: { flex: 1, paddingTop: 24 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.3)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginLeft: 8,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: { padding: 4 },

    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },

    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#176192',
        fontSize: 14,
        fontWeight: '600',
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 16,
        textAlign: 'center',
    },
});
