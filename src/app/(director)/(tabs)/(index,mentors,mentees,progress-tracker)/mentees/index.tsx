import MenteeCard from '@/components/Cards/MenteeCard';
import { UserCardSkeleton } from '@/components/Cards/MentorCard/UserCardSkeleton';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { useMentees } from '@/hooks/useMentees';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function Mentees() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] =
        useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const [selectedStateFilter, setSelectedStateFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
    const { data: mentees, isLoading, isError, error } = useMentees();

    if (isError) {
        console.log('Error : ', error);
    }

    const menteeList = Array.isArray(mentees) ? mentees : mentees?.mentees || [];

    const dynamicStates = useMemo(() => {
        const states = menteeList
            .map(m => m.state || m.profileInfo?.state)
            .filter(Boolean) as string[];
        return Array.from(new Set(states));
    }, [menteeList]);

    const getFilterOptions = (): FilterOption[] => {
        return [
            {
                label: 'Course Completion',
                options: ['Latest', 'Oldest'],
                isExpandable: true,
            },
            {
                label: 'State',
                options: dynamicStates,
                isExpandable: true,
            },
            {
                label: 'Conference',
                isExpandable: true,
            },
        ];
    };

    const menuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/mentors/mentor-mentees');
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/mentees/assign-mentors');
                }, 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/mentees/remove-mentors');
                }, 300);
            },
        },
        { icon: 'person-add-outline', label: 'Assessments', onPress: () => router.push('/(director)/(tabs)/assessments') },
        { icon: 'person-remove-outline', label: 'Assignments', onPress: () => console.log('Assignments') },
        { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
        {
            icon: 'checkmark-done-outline',
            label: 'Mentor Notes',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push(`/mentees/notes`);
                }, 300);
            },
        },
        { icon: 'book-outline', label: 'View Progress Report', onPress: () => console.log('Assignments of Mentees') },
        { icon: 'stats-chart-outline', label: 'Micro Grant', onPress: () => console.log('Progress of Mentees') },
        { icon: 'calendar-outline', label: 'Product and Services', onPress: () => console.log('Schedule a Meeting') },
    ];

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

    const handleTabChange = (key: string) => {
        if (key === 'all' || key === 'not-started' || key === 'in-progress' || key === 'completed') {
            setActiveTab(key);
        }
    };

    const filterOptions = useMemo(() => getFilterOptions(), [dynamicStates]);

    const filteredMentees = useMemo(() => {
        let filtered = menteeList;

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                mentee =>
                    mentee.name.toLowerCase().includes(q) ||
                    mentee.role?.toLowerCase().includes(q) ||
                    mentee.description?.toLowerCase().includes(q),
            );
        }

        if (activeTab === 'not-started') {
            filtered = filtered.filter(mentee => (mentee.progress ?? 0) === 0);
        } else if (activeTab === 'in-progress') {
            filtered = filtered.filter(
                mentee => (mentee.progress ?? 0) > 0 && (mentee.progress ?? 0) < 100,
            );
        } else if (activeTab === 'completed') {
            filtered = filtered.filter(
                mentee => mentee.progress === 100 || mentee.hasCompleted === true,
            );
        }

        if (selectedStateFilter) {
            filtered = filtered.filter(
                m =>
                    (m.state || m.profileInfo?.state || '').toLowerCase() ===
                    selectedStateFilter.toLowerCase(),
            );
        }

        if (selectedFilter.startsWith('Course Completion')) {
            const isLatest = selectedFilter.includes('Latest');
            filtered = [...filtered].sort((a, b) => {
                const pa = a.progress ?? 0;
                const pb = b.progress ?? 0;
                return isLatest ? pb - pa : pa - pb;
            });
        }

        return filtered;
    }, [menteeList, search, activeTab, selectedFilter, selectedStateFilter]);

    const notStartedCount = useMemo(
        () => menteeList.filter(m => (m.progress ?? 0) === 0).length,
        [menteeList],
    );

    const inProgressCount = useMemo(
        () =>
            menteeList.filter(
                m => (m.progress ?? 0) > 0 && (m.progress ?? 0) < 100,
            ).length,
        [menteeList],
    );

    const completedCount = useMemo(
        () =>
            menteeList.filter(
                m => m.progress === 100 || m.hasCompleted === true,
            ).length,
        [menteeList],
    );

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'not-started', label: 'Not Started', badge: notStartedCount },
        { key: 'in-progress', label: 'In-progress', badge: inProgressCount },
        { key: 'completed', label: 'Completed', badge: completedCount },
    ];

    // LOADING / ERROR


    if (isError) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <TopBar notifications={3} showUserName showNotifications />
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                        }}
                    >
                        <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>
                            Failed to load mentees. Please try again.
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        );
    }

    // MAIN UI
    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={styles.container}
        >
            <View style={styles.innerContainer}>
                <TopBar notifications={3} showUserName showNotifications />

                <View style={styles.contentContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text style={styles.headerTitle}>Mentees</Text>
                        </TouchableOpacity>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                                style={styles.actionButton}
                            >
                                <Ionicons
                                    name={viewMode === 'card' ? 'list' : 'grid'}
                                    size={24}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => router.push('/mentees/mentees-location')}
                            >
                                <Ionicons name="location-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

                    <View style={styles.profileSwiperContainer} />

                    {/* Sort */}
                    <View style={styles.sortContainer}>
                        <Text style={styles.sortLabel}>Sort by</Text>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            style={styles.sortButton}
                        >
                            <Text style={styles.sortButtonText} numberOfLines={1}>
                                {selectedStateFilter || selectedFilter}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </Pressable>
                    </View>

                    {/* List / Skeleton */}
                    {isLoading ? (
                        <View style={styles.flatListContent}>
                            <UserCardSkeleton layout={viewMode} />
                            <UserCardSkeleton layout={viewMode} />
                            <UserCardSkeleton layout={viewMode} />
                            <UserCardSkeleton layout={viewMode} />
                        </View>
                    ) : (
                        <FlatList
                            style={styles.flatList}
                            data={filteredMentees}
                            keyExtractor={item => item.id}
                            renderItem={({ item: mentee }) => (
                                <MenteeCard
                                    data={mentee}
                                    layout={viewMode}
                                    onPress={() =>
                                        router.push(`/mentees/${mentee.id}`)
                                    }
                                    onCall={() => console.log('Call', mentee.name)}
                                    onChat={() => console.log('Chat', mentee.name)}
                                    onMail={() => console.log('Mail', mentee.name)}
                                    onWhatsApp={() => console.log('WhatsApp', mentee.name)}
                                    onMenuPress={() => handleMenuPress(mentee)}
                                    onMarkComplete={() => console.log('Mark complete', mentee.name)}
                                    onIssueCertificate={() =>
                                        console.log('Issue certificate', mentee.name)
                                    }
                                    onInviteAsFieldMentor={() =>
                                        console.log('Invite as field mentor', mentee.name)
                                    }
                                />
                            )}
                            contentContainerStyle={styles.flatListContent}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews
                            maxToRenderPerBatch={10}
                            updateCellsBatchingPeriod={50}
                            initialNumToRender={5}
                            windowSize={10}
                            getItemLayout={(data, index) => ({
                                length: viewMode === 'list' ? 68 : 280,
                                offset: (viewMode === 'list' ? 68 : 280) * index,
                                index,
                            })}
                        />
                    )}
                </View>

                {/* MODALS */}
                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedMentee?.username || selectedMentee?.firstName || ''}
                    image={selectedMentee?.profilePicture}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />

                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedFilter={selectedStateFilter || selectedFilter}
                    onFilterSelect={filter => {
                        if (dynamicStates.includes(filter)) {
                            setSelectedStateFilter(filter);
                        } else {
                            setSelectedFilter(filter);
                        }
                        setFilterModalVisible(false);
                    }}
                    filterOptions={filterOptions}
                />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    innerContainer: { flex: 1 },
    contentContainer: { flex: 1, paddingTop: 24 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { marginLeft: 8, fontSize: 18, fontWeight: '600', color: '#fff' },
    headerActions: { flexDirection: 'row', gap: 12 },
    actionButton: { padding: 4 },
    searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
    profileSwiperContainer: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sortLabel: { fontSize: 14, color: '#fff' },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 20,
    },
    sortButtonText: { fontSize: 14, fontWeight: '500', color: '#fff' },
    flatList: { flex: 1 },
    flatListContent: { paddingHorizontal: 16 },
});
