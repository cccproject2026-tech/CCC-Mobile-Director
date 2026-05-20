import MenteeCard from '@/components/Cards/MenteeCard';
import { UserCardSkeleton } from '@/components/Cards/MentorCard/UserCardSkeleton';
import SearchBar from '@/components/Header/SearchBar';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { GradientBackground } from '@/components/ui/design-system';
import { useMentorMentees } from '@/hooks/useMentors';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
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
import { featureNotAvailableYet } from '@/utils/contactActions';

const PHASES = ['All Phases', 'Phase 1', 'Phase 2', 'Phase 3'];

export default function MentorMentees() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
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
            onPress: () => {
                handleCloseModal();
                if (selectedMentee?.id) {
                    router.push(`/(director)/(tabs)/mentees/${selectedMentee.id}/progress` as any);
                }
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                router.push({
                    pathname: '/mentees/assign-mentors',
                    params: { id: selectedMentee?.id || '' },
                });
            },
        },
        {
            icon: 'checkmark-done-outline',
            label: 'Mentor Notes',
            onPress: () => {
                handleCloseModal();
                router.push({
                    pathname: '/mentees/notes',
                    params: { id: selectedMentee?.id || '' },
                } as any);
            },
        },
        {
            icon: 'book-outline',
            label: 'View Progress Report',
            onPress: () => {
                handleCloseModal();
                router.push('/(director)/(tabs)/progress-report' as any);
            },
        },
        {
            icon: 'stats-chart-outline',
            label: 'Micro Grant',
            onPress: () => {
                handleCloseModal();
                router.push('/(director)/(tabs)/micro-grant' as any);
            },
        },
        {
            icon: 'calendar-outline',
            label: 'Product and Services',
            onPress: () => {
                handleCloseModal();
                router.push('/(director)/(tabs)/product-and-services' as any);
            },
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
        if (!mentees) return [];
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
            mentees?.filter(m => !m.hasCompleted && (m.progress ?? 0) < 100).length ?? 0,
        [mentees],
    );

    if (isLoading) {
        return (
            <GradientBackground>
                <View style={styles.pageRoot}>
                    <TopBar notifications={3} showUserName showNotifications />
                    <View style={styles.loadingListContainer}>
                        <UserCardSkeleton layout="list" />
                        <UserCardSkeleton layout="list" />
                        <UserCardSkeleton layout="list" />
                        <UserCardSkeleton layout="list" />
                    </View>
                </View>
            </GradientBackground>
        );
    }

    if (isError) {
        return (
            <GradientBackground>
                <View style={styles.pageRoot}>
                    <TopBar notifications={3} showUserName showNotifications />
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.errorText}>
                            Failed to load mentees. Please try again.
                        </Text>
                    </View>
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <View style={styles.pageRoot}>
                <TopBar notifications={3} showUserName showNotifications />

                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <View style={styles.headerLeft}>
                                <View style={styles.backIconWrap}>
                                    <Ionicons name="chevron-back" size={20} color="#fff" />
                                </View>
                                <View style={styles.headerTitleWrapper}>
                                    <Text style={styles.headerTitle}>Mentees</Text>
                                    <Text style={styles.headerSubtitle}>
                                        Mentor › {mentorName}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: '/mentors/assign-mentees',
                                        params: { id },
                                    })
                                }
                                style={styles.assignButton}
                            >
                                <Ionicons name="add" size={16} color="#fff" />
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
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() =>
                                    router.push('/mentees/mentees-location' as any)
                                }
                            >
                                <Ionicons name="location-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsRow}>
                        {(['all', 'in-progress', 'completed'] as const).map(tab => (
                            <Pressable
                                key={tab}
                                onPress={() => handleTabChange(tab)}
                                style={[
                                    styles.tabButton,
                                    activeTab === tab && styles.tabButtonActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === tab && styles.tabTextActive,
                                    ]}
                                >
                                    {tab === 'all' ? 'All' : tab === 'in-progress' ? `In Progress (${inProgressCount})` : 'Completed'}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

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
                            <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
                        </Pressable>
                    </View>

                    {/* Mentees List */}
                    <FlatList
                        style={styles.list}
                        data={filteredMentees}
                        keyExtractor={item => item.id}
                        renderItem={({ item: mentee }) => (
                            <MenteeCard
                                data={mentee}
                                showMenu={true}
                                layout={viewMode}
                                onPress={() =>
                                    router.push(`/(director)/(tabs)/mentees/${mentee.id}` as any)
                                }
                                onMenuPress={() => handleMenuPress(mentee)}
                                onMarkComplete={() => featureNotAvailableYet('Mark complete')}
                                onIssueCertificate={() => featureNotAvailableYet('Issuing a certificate')}
                                onInviteAsFieldMentor={() =>
                                    router.push('/(director)/(tabs)/invite-field-mentor' as any)
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
                                <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyTitle}>No mentees assigned yet</Text>
                                <Text style={styles.emptySubtitle}>
                                    Assign mentees to this mentor to see them listed here.
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() => {
                                        router.push({
                                            pathname: '/mentors/assign-mentees',
                                            params: { id: mentor?.id },
                                        });
                                    }}
                                >
                                    <Ionicons name="person-add-outline" size={16} color="#fff" />
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
                    actions={menuItems as any}
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
        </GradientBackground>
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
        gap: 12,
    },
    errorText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 15 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 14,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleWrapper: { gap: 2 },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.2,
    },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    assignButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 7,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        borderRadius: 10,
    },
    assignButtonText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    iconButton: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    searchContainer: { paddingHorizontal: 16, marginBottom: 16 },

    tabsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonActive: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderColor: 'rgba(255,255,255,0.92)',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.85)',
    },
    tabTextActive: {
        color: '#0E5A62',
    },

    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sortLabel: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: 20,
    },
    sortButtonText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

    list: { flex: 1 },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    emptyContentContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 24,
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
    emptySubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 20,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        marginTop: 4,
    },
    emptyButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },
});
