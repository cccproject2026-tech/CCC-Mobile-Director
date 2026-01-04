import MenteeCard from '@/components/Cards/MenteeCard';
import { UserCardSkeleton } from '@/components/Cards/MentorCard/UserCardSkeleton';
import SearchBar from '@/components/Header/SearchBar';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { useMentorMentees } from '@/hooks/useMentors';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PHASES = ['All Phases', 'Phase 1', 'Phase 2', 'Phase 3'];

export default function MentorMentees() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // mentor id from route
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] =
        useState<'all' | 'in-progress' | 'completed'>('in-progress');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] =
        useState('Course Completion : Latest');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { mentor, mentees, isLoading, isError } = useMentorMentees(id);
    const mentorName = mentor
        ? `${mentor.firstName} ${mentor.lastName ?? ''}`
        : 'Mentor';

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const getFilterOptions = (): FilterOption[] => {
        return [
            { label: 'Last Contact : Oldest' },
            { label: 'Last Contact : Newest' },
            { label: 'Course Completion : Latest' },
            {
                label: 'Phase',
                options: PHASES,
                isExpandable: true,
            },
        ];
    };

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, []);

    const handleTabChange = (tab: 'all' | 'in-progress' | 'completed') => {
        setActiveTab(tab);
    };

    const menuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: router.push.bind(
                router,
                '/(director)/(tabs)/mentors/mentor-mentees',
            ),
        },
        {
            icon: 'person-add-outline',
            label: 'Assessments',
            onPress: router.push.bind(
                router,
                '/(director)/(tabs)/mentors/assign-mentees',
            ),
        },
        {
            icon: 'person-remove-outline',
            label: 'Assignments',
            onPress: router.push.bind(
                router,
                '/(director)/(tabs)/mentors/remove-mentee',
            ),
        },
        {
            icon: 'clipboard-outline',
            label: 'Roadmaps of Mentees',
            onPress: () => console.log('Roadmaps of Mentees'),
        },
        {
            icon: 'checkmark-done-outline',
            label: 'Mentor Notes',
            onPress: () => console.log('Assessments of Mentees'),
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

    const getFilterDisplayText = () => {
        if (PHASES.includes(selectedFilter)) {
            return selectedFilter;
        }
        return selectedFilter || 'Course Completion : Latest';
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);

    const filteredMentees = useMemo(() => {
        let list = mentees;

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                m =>
                    m.firstName.toLowerCase().includes(q) ||
                    (m.lastName?.toLowerCase().includes(q) ?? false),
            );
        }

        if (activeTab === 'completed') {
            list = list.filter(m => m.hasCompleted || m.progress === 100);
        } else if (activeTab === 'in-progress') {
            list = list.filter(m => !m.hasCompleted && (m.progress ?? 0) < 100);
        }

        return list;
    }, [mentees, search, activeTab]);

    const inProgressCount = useMemo(
        () =>
            mentees.filter(m => !m.hasCompleted && (m.progress ?? 0) < 100).length,
        [mentees],
    );

    if (isLoading) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={{ flex: 1, paddingBottom: bottom + height * 0.05 }}
            >
                <View style={styles.pageRoot}>
                    <TopBar notifications={3} showUserName showNotifications />
                    <View style={styles.loadingListContainer}>
                        <UserCardSkeleton layout="list" />
                        <UserCardSkeleton layout="list" />
                        <UserCardSkeleton layout="list" />
                        <UserCardSkeleton layout="list" />
                    </View>
                </View>
            </LinearGradient>
        );
    }

    if (isError) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={{ flex: 1, paddingBottom: bottom + height * 0.05 }}
            >
                <View style={styles.pageRoot}>
                    <TopBar notifications={3} showUserName showNotifications />
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                            Failed to load mentees. Please try again.
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1 }}
        >
            <View style={styles.pageRoot}>
                <TopBar notifications={3} showUserName showNotifications />

                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <View style={styles.headerLeft}>
                                <Ionicons name="chevron-back" size={28} color="#fff" />
                                <View style={styles.headerTitleWrapper}>
                                    <Text style={styles.headerTitle}>Mentees</Text>
                                    <Text style={styles.headerSubtitle}>
                                        Mentor &gt; {mentorName}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: '/(director)/(tabs)/mentors/assign-mentees',
                                        params: { id },
                                    })
                                }
                                style={styles.assignButton}
                            >
                                <Ionicons name="add" size={18} color="#fff" />
                                <Text style={styles.assignButtonText}>Assign</Text>
                            </TouchableOpacity>
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
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() =>
                                    router.push(
                                        '/(director)/(tabs)/mentors/mentor-mentee-locations',
                                    )
                                }
                            >
                                <Ionicons name="location-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsRow}>
                        <Pressable
                            onPress={() => handleTabChange('all')}
                            style={[
                                styles.tabButton,
                                activeTab === 'all' && styles.tabButtonActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'all' && styles.tabTextActive,
                                ]}
                            >
                                All
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleTabChange('in-progress')}
                            style={[
                                styles.tabButton,
                                activeTab === 'in-progress' && styles.tabButtonActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'in-progress' && styles.tabTextActive,
                                ]}
                            >
                                In-progress ({inProgressCount})
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleTabChange('completed')}
                            style={[
                                styles.tabButton,
                                activeTab === 'completed' && styles.tabButtonActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'completed' && styles.tabTextActive,
                                ]}
                            >
                                Completed
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.profileSwiperContainer} />

                    {/* Sort */}
                    <View style={styles.sortRow}>
                        <Text style={styles.sortLabel}>Sort by</Text>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            style={styles.sortButton}
                        >
                            <Text style={styles.sortButtonText} numberOfLines={1}>
                                {getFilterDisplayText()}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Mentees List (FlatList) */}
                    <FlatList
                        style={styles.list}
                        data={filteredMentees}
                        keyExtractor={item => item.id}
                        renderItem={({ item: mentee }) => (
                            <MenteeCard
                                data={mentee}
                                layout={viewMode}
                                onPress={() =>
                                    router.push(`/(director)/(tabs)/mentees/${mentee.id}`)
                                }
                                onMenuPress={() => handleMenuPress(mentee)}
                                onMarkComplete={() =>
                                    console.log('Mark complete', mentee.firstName)
                                }
                                onIssueCertificate={() =>
                                    console.log('Issue certificate', mentee.firstName)
                                }
                                onInviteAsFieldMentor={() =>
                                    console.log('Invite as field mentor', mentee.firstName)
                                }
                            />
                        )}
                        contentContainerStyle={
                            filteredMentees.length === 0
                                ? styles.emptyContentContainer
                                : styles.listContent
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyTitle}>No mentees assigned yet</Text>
                                <Text style={styles.emptySubtitle}>
                                    Assign mentees to this mentor to see them listed here.
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() =>
                                        router.push('/(director)/(tabs)/mentors/assign-mentees')
                                    }
                                >
                                    <Ionicons name="person-add-outline" size={18} color="#fff" />
                                    <Text style={styles.emptyButtonText}>Assign Mentees</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={
                        selectedMentee
                            ? `${selectedMentee.firstName} ${selectedMentee.lastName ?? ''}`
                            : ''
                    }
                    image={selectedMentee?.profilePicture || undefined}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />

                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedFilter={selectedFilter}
                    onFilterSelect={filter => {
                        setSelectedFilter(filter);
                        setFilterModalVisible(false);
                    }}
                    filterOptions={filterOptions}
                />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    pageRoot: { flex: 1 },
    content: { flex: 1, paddingTop: 24 },

    loadingListContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    errorText: { color: '#fff', textAlign: 'center', fontSize: 16 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    headerTitleWrapper: { marginLeft: 8 },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    assignButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 8,
    },
    assignButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    iconButton: { padding: 4 },

    searchContainer: { paddingHorizontal: 16, marginBottom: 16 },

    tabsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: '#14517D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#ffffff',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    tabTextActive: {
        color: '#1a5b77',
    },

    profileSwiperContainer: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.3)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },

    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sortLabel: { fontSize: 16, color: '#fff' },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 999,
    },
    sortButtonText: { fontSize: 16, fontWeight: '500', color: '#fff' },

    list: { flex: 1 },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    emptyContentContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 16,
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 16,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
})
