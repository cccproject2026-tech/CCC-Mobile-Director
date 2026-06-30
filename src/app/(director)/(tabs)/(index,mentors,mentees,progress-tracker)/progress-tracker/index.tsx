// app/(director)/(tabs)/progress-tracker/index.tsx
import MenteeProgressCard from '@/components/Cards/MenteeCard/MenteeProgressCard';
import MentorCard from '@/components/Cards/MentorCard';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { GradientBackground } from '@/components/ui/design-system';
import { useMentees } from '@/hooks/useMentees';
import { useMentors } from '@/hooks/useMentors';
import { Mentee, Mentor } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter, usePathname } from 'expo-router';
import { appendReturnTo, buildReturnTo } from '@/utils/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    chatNotAvailableYet,
    dialPhone,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';

type TabKey = 'all' | 'mentor-wise' | 'in-progress' | 'completed';

function filterMenteesForTab(mentees: Mentee[], tab: TabKey, search: string): Mentee[] {
    let list = mentees;

    if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((m) =>
            `${m.firstName} ${m.lastName ?? ''}`.toLowerCase().includes(q),
        );
    }

    switch (tab) {
        case 'in-progress':
            return list.filter((m) => {
                const progress = m.progress ?? 0;
                return progress > 0 && progress < 100;
            });
        case 'completed':
            return list.filter((m) => (m.progress ?? 0) === 100);
        case 'all':
        default:
            return list;
    }
}

export default function ProgressTrackerIndex() {
    const router = useRouter();
    const pathname = usePathname();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

    const {
        data: menteesData,
        isLoading: menteesLoading,
        fetchNextPage: fetchNextMenteesPage,
        hasNextPage: hasNextMenteesPage,
        isFetchingNextPage: isFetchingNextMenteesPage,
    } = useMentees();
    const mentees = useMemo(
        () => menteesData?.pages.flatMap((page) => page.mentees) ?? [],
        [menteesData],
    );

    const {
        data: mentorsData,
        isLoading: mentorsLoading,
        fetchNextPage: fetchNextMentorsPage,
        hasNextPage: hasNextMentorsPage,
        isFetchingNextPage: isFetchingNextMentorsPage,
    } = useMentors(10);
    const mentors = useMemo(
        () => mentorsData?.pages.flatMap((page) => page.mentors) ?? [],
        [mentorsData],
    );

    const listRef = useRef<FlatList<Mentee | Mentor>>(null);

    const getFilterOptions = (): FilterOption[] => [
        { label: 'Course Completion', options: ['Latest', 'Oldest'], isExpandable: true },
        { label: 'Conference', isExpandable: true },
    ];
    const filterOptions = useMemo(() => getFilterOptions(), []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setTimeout(() => bottomSheetModalRef.current?.present(), 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => setSelectedMentee(null), 300);
    }, []);

    const menuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    if (!selectedMentee?.id) return;
                    router.push({
                        pathname: '/(director)/(tabs)/roadmaps/roadmap-paths',
                        params: appendReturnTo(
                            { id: selectedMentee.id },
                            buildReturnTo(pathname, {}),
                        ),
                    } as never);
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({
                        pathname: '/(director)/(tabs)/mentees/assign-mentors' as any,
                        params: { id: selectedMentee?.id ?? '' },
                    });
                }, 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({
                        pathname: '/(director)/(tabs)/mentees/remove-mentors' as any,
                        params: { id: selectedMentee?.id ?? '' },
                    });
                }, 300);
            },
        },
        { icon: 'person-add-outline', label: 'Assessments', onPress: () => router.push('/(director)/(tabs)/assessments') },
        {
            icon: 'person-remove-outline',
            label: 'Assignments',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/assignments'), 300);
            },
        },
        {
            icon: 'clipboard-outline',
            label: 'Roadmaps of Mentees',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    if (!selectedMentee?.id) return;
                    router.push(`/(director)/(tabs)/progress-tracker/${selectedMentee.id}` as any);
                }, 300);
            },
        },
        { icon: 'checkmark-done-outline', label: 'Mentor Notes', onPress: () => { handleCloseModal(); setTimeout(() => router.push('/(director)/(tabs)/mentees/notes' as any), 300); } },
        {
            icon: 'book-outline',
            label: 'View Progress Report',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/progress-tracker/report' as any), 300);
            },
        },
        {
            icon: 'stats-chart-outline',
            label: 'Micro Grant',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/micro-grant'), 300);
            },
        },
        {
            icon: 'calendar-outline',
            label: 'Product and Services',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/product-and-services'), 300);
            },
        },
    ];

    const tabs = [
        { key: 'all', label: 'All Mentees' },
        { key: 'mentor-wise', label: 'Mentor Wise' },
        { key: 'in-progress', label: 'In Progress' },
        { key: 'completed', label: 'Completed Mentees' },
    ];

    const handleTabChange = useCallback((tabKey: string) => {
        setActiveTab(tabKey as TabKey);
    }, []);

    const handleMentorPress = useCallback((mentor: Mentor) => {
        router.push(`/(director)/(tabs)/progress-tracker/mentors/${mentor.id}` as any);
    }, [router]);

    const filteredMentees = useMemo(
        () => filterMenteesForTab(mentees, activeTab, search),
        [mentees, activeTab, search],
    );

    const isMentorTab = activeTab === 'mentor-wise';

    const listData = useMemo(() => {
        if (isMentorTab) return mentors;
        return filteredMentees;
    }, [filteredMentees, isMentorTab, mentors]);

    useEffect(() => {
        console.log('[ProgressTracker] tab data', {
            activeTab,
            search,
            totalMenteesLoaded: mentees.length,
            filteredMenteesCount: filteredMentees.length,
            listDataCount: listData.length,
            apiPagesLoaded: menteesData?.pages.length ?? 0,
            hasNextMenteesPage,
            hasNextMentorsPage,
            tabData: listData.map((item) => {
                if (isMentorTab) {
                    const mentor = item as Mentor;
                    return {
                        id: mentor.id,
                        name: `${mentor.firstName} ${mentor.lastName ?? ''}`.trim(),
                        type: 'mentor',
                    };
                }
                const mentee = item as Mentee;
                return {
                    id: mentee.id,
                    name: `${mentee.firstName} ${mentee.lastName ?? ''}`.trim(),
                    hasCompleted: mentee.hasCompleted,
                    progress: mentee.progress,
                    type: 'mentee',
                };
            }),
        });
    }, [
        activeTab,
        filteredMentees,
        hasNextMenteesPage,
        hasNextMentorsPage,
        isMentorTab,
        listData,
        mentees.length,
        menteesData?.pages.length,
        search,
    ]);

    const isInitialLoading = isMentorTab
        ? mentorsLoading && mentors.length === 0
        : menteesLoading && mentees.length === 0;

    const isFetchingNextPage = isMentorTab
        ? isFetchingNextMentorsPage
        : isFetchingNextMenteesPage;

    const hasNextPage = isMentorTab ? hasNextMentorsPage : hasNextMenteesPage;

    const handleLoadMore = useCallback(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        if (isMentorTab) {
            fetchNextMentorsPage();
        } else {
            fetchNextMenteesPage();
        }
    }, [
        fetchNextMenteesPage,
        fetchNextMentorsPage,
        hasNextPage,
        isFetchingNextPage,
        isMentorTab,
    ]);

    const renderListItem = useCallback(
        ({ item }: { item: Mentee | Mentor }) => {
            if (isMentorTab) {
                const mentor = item as Mentor; 
                return (
                    <MentorCard
                        showMenu={false}
                        mentor={{
                            id: mentor.id,
                            name: `${mentor.firstName} ${mentor.lastName ?? ''}`,
                            role: mentor.role === 'field_mentor' ? 'Field Mentor' : 'Mentor',
                            menteesCount: mentor.assignedId?.length ?? 0,
                            description: mentor.profileInfo ?? 'No profile info',
                            profilePicture: mentor.profilePicture,
                        }}
                        layout={viewMode}
                        onCall={() => dialPhone(mentor.phoneNumber)}
                        onWhatsApp={() => openWhatsApp(mentor.phoneNumber)}
                        onMail={() => sendEmail(mentor.email)}
                        onChat={() => chatNotAvailableYet()}
                        onPress={() => handleMentorPress(mentor)}
                    />
                );
            }

            const mentee = item as Mentee;
            return (
                <MenteeProgressCard
                    data={mentee}
                    layout={viewMode}
                    showMenu={false}
                    onPress={() =>
                        router.push(
                            `/(director)/(tabs)/progress-tracker/${mentee.id}` as any,
                        )
                    }
                    onCall={() => dialPhone(mentee.phoneNumber)}
                    onChat={() => chatNotAvailableYet()}
                    onMail={() => sendEmail(mentee.email)}
                    onWhatsApp={() => openWhatsApp(mentee.phoneNumber)}
                    onMenuPress={() => handleMenuPress(mentee)}
                />
            );
        },
        [handleMenuPress, handleMentorPress, isMentorTab, router, viewMode],
    );

    const listEmptyComponent = (
        <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>
                {isMentorTab
                    ? 'No mentors found'
                    : activeTab === 'completed'
                      ? 'No completed mentees found'
                      : 'No pastors found'}
            </Text>
        </View>
    );

    const listFooterComponent = isFetchingNextPage ? (
        <View style={styles.footerLoader}>
            <ActivityIndicator color="#fff" />
        </View>
    ) : null;

    return (
        <GradientBackground>
            <View style={styles.pageRoot}>
                <TopBar showUserName showNotifications />

                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
                            <View style={styles.backIconWrap}>
                                <Ionicons name="chevron-back" size={20} color="#fff" />
                            </View>
                            <Text style={styles.headerTitle}>Progress Tracker</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                            style={styles.iconButton}
                        >
                            <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <TabSwitcher
                        variant="frosted"
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={handleTabChange}
                    />

                    {/* List */}
                    {isInitialLoading ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    ) : (
                        <FlatList
                            ref={listRef}
                            key={activeTab}
                            style={styles.flatList}
                            data={listData}
                            keyExtractor={(item) => item.id}
                            renderItem={renderListItem}
                            extraData={`${activeTab}-${listData.length}-${search}`}
                            contentContainerStyle={styles.flatListContent}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={false}
                            maxToRenderPerBatch={10}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            ListEmptyComponent={listEmptyComponent}
                            ListFooterComponent={listFooterComponent}
                        />
                    )}
                </View>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedMentee ? `${selectedMentee.firstName} ${selectedMentee.lastName ?? ''}` : ''}
                    image={selectedMentee?.profilePicture}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />

                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedFilter={selectedFilter}
                    onFilterSelect={filter => { setSelectedFilter(filter); setFilterModalVisible(false); }}
                    filterOptions={filterOptions}
                />
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    pageRoot: { flex: 1 },
    content: { flex: 1, paddingTop: 24 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 14,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
    flatList: { flex: 1 },
    flatListContent: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
    footerLoader: { paddingVertical: 20, alignItems: 'center' },
    centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '500' },
});
