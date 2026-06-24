import MenteeProgressCard from '@/components/Cards/MenteeCard/MenteeProgressCard';
import { UserCardSkeleton } from '@/components/Cards/MentorCard/UserCardSkeleton';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ActionBottomSheet, { ActionItem } from '@/components/Sheets/ActionBottomSheet';
import { GradientBackground } from '@/components/ui/design-system';
import { useMentees } from '@/hooks/useMentees';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    InteractionManager,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useMenteesNavigationStore } from '@/stores/menteesNavigation.store';
import {
    chatNotAvailableYet,
    dialPhone,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';

function getRouteParam(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
}

function isAssignMentorDashboardFlow(params: Record<string, string | string[] | undefined>): boolean {
    const flow = getRouteParam(params.flow);
    if (flow === 'full') return false;
    const type = getRouteParam(params.type);
    return type === 'home' || flow === 'assign-mentor';
}

export default function Mentees() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] =
        useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const [selectedStateFilter, setSelectedStateFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [menuMentee, setMenuMentee] = useState<Mentee | null>(null);
    const params = useLocalSearchParams();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const menuMode = useMenteesNavigationStore((s) => s.menuMode);
    const setAssignMentorOnlyMenu = useMenteesNavigationStore((s) => s.setAssignMentorOnlyMenu);
    const setFullMenu = useMenteesNavigationStore((s) => s.setFullMenu);

    // URL params can set mode on entry; store keeps it across profile / assign / back.
    useFocusEffect(
        useCallback(() => {
            const flow = getRouteParam(params.flow);
            const type = getRouteParam(params.type);
            if (flow === 'full' || type === 'Field-Mentor-Home') {
                setFullMenu();
                return;
            }
            if (isAssignMentorDashboardFlow(params)) {
                setAssignMentorOnlyMenu();
            }
        }, [params.flow, params.type, setAssignMentorOnlyMenu, setFullMenu]),
    );

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setMenuMentee(null);
    }, []);

    const buildMenuItems = useCallback(
        (mentee: Mentee): ActionItem[] => {
            const menteeId = mentee.id;
            const afterClose = (action: () => void) => {
                handleCloseModal();
                setTimeout(action, 200);
            };

            if (menuMode === 'assign-mentor-only') {
                return [
                    {
                        icon: 'person-add-outline',
                        label: 'Assign Mentor',
                        onPress: () =>
                            afterClose(() =>
                                router.push({
                                    pathname: '/mentees/assign-mentors',
                                    params: {
                                        id: menteeId,
                                        flow: 'assign-mentor',
                                        type: 'home',
                                    },
                                }),
                            ),
                    },
                ];
            }

            return [
                {
                    icon: 'people-outline',
                    label: 'Revitalization Roadmaps',
                    onPress: () =>
                        afterClose(() =>
                            router.push({
                                pathname: '/(director)/(tabs)/roadmaps',
                                params: { id: menteeId },
                            }),
                        ),
                },
                {
                    icon: 'person-add-outline',
                    label: 'Assign Mentor',
                    onPress: () =>
                        afterClose(() =>
                            router.push({
                                pathname: '/mentees/assign-mentors',
                                params: { id: menteeId },
                            }),
                        ),
                },
                {
                    icon: 'person-remove-outline',
                    label: 'Remove Mentor',
                    onPress: () =>
                        afterClose(() =>
                            router.push({
                                pathname: '/mentees/remove-mentors',
                                params: { id: menteeId },
                            }),
                        ),
                },
                {
                    icon: 'people-outline',
                    label: 'List of Mentors',
                    onPress: () =>
                        afterClose(() => router.push({ pathname: '/(director)/(tabs)/mentors' })),
                },
                {
                    icon: 'person-add-outline',
                    label: 'Assessments',
                    onPress: () => router.push('/(director)/(tabs)/assessments'),
                },
                {
                    icon: 'person-remove-outline',
                    label: 'Assignments',
                    onPress: () =>
                        afterClose(() => router.push('/(director)/(tabs)/assignments')),
                },
                {
                    icon: 'clipboard-outline',
                    label: 'Roadmaps of Mentees',
                    onPress: () =>
                        afterClose(() => {
                            router.push(`/(director)/(tabs)/mentees/${menteeId}/progress`);
                        }),
                },
                {
                    icon: 'checkmark-done-outline',
                    label: 'Mentor Notes',
                    onPress: () => afterClose(() => router.push('/mentees/notes')),
                },
                {
                    icon: 'book-outline',
                    label: 'View Progress Report',
                    onPress: () =>
                        afterClose(() =>
                            router.push('/(director)/(tabs)/progress-tracker/report' as any),
                        ),
                },
                {
                    icon: 'stats-chart-outline',
                    label: 'Micro Grant',
                    onPress: () =>
                        afterClose(() => router.push('/(director)/(tabs)/micro-grant')),
                },
                {
                    icon: 'calendar-outline',
                    label: 'Product and Services',
                    onPress: () =>
                        afterClose(() => router.push('/(director)/(tabs)/product-and-services')),
                },
            ];
        },
        [handleCloseModal, menuMode, router],
    );

    const sheetActions = useMemo(
        () => (menuMentee ? buildMenuItems(menuMentee) : []),
        [buildMenuItems, menuMentee],
    );

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setMenuMentee(mentee);
    }, []);

    useEffect(() => {
        if (!menuMentee) return;
        const task = InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                bottomSheetModalRef.current?.present();
            });
        });
        return () => task.cancel();
    }, [menuMentee]);

    const {
        data: mentees,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMentees();

    const menteeList = useMemo(() => {
        return mentees?.pages.flatMap(page => page.mentees) || [];
    }, [mentees]);

    const dynamicStates = useMemo(() => {
        const states = menteeList
            .map((m: Mentee) => (m as any).state || (m as any).profileInfo?.state)
            .filter(Boolean) as string[];
        return Array.from(new Set(states));
    }, [menteeList]);

    const getFilterOptions = (): FilterOption[] => [
        { label: 'Course Completion', options: ['Latest', 'Oldest'], isExpandable: true },
        { label: 'State', options: dynamicStates, isExpandable: true },
        { label: 'Conference', isExpandable: true },
    ];

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
                (m: Mentee) =>
                    m.firstName.toLowerCase().includes(q) ||
                    (m.lastName ?? '').toLowerCase().includes(q) ||
                    (m.username ?? '').toLowerCase().includes(q) ||
                    m.role?.toLowerCase().includes(q) ||
                    (m as any).profileInfo?.toLowerCase().includes(q),
            );
        }
        // if (activeTab === 'not-started') filtered = filtered.filter((m: Mentee) => (m.progress ?? 0) === 0);
        // else if (activeTab === 'in-progress') filtered = filtered.filter((m: Mentee) => (m.progress ?? 0) > 0 && (m.progress ?? 0) < 100);
        // else if (activeTab === 'completed') filtered = filtered.filter((m: Mentee) => m.progress === 100 || m.hasCompleted === true);
    if (params?.type === "Field-Mentor-Home") {
        filtered = filtered.filter(
            (m: Mentee) =>
                m.progress === 100 || m.hasCompleted === true
        );
    } else {
        // normal tabs filtering
        if (activeTab === 'not-started') {
            filtered = filtered.filter((m: Mentee) => (m.progress ?? 0) === 0);
        } else if (activeTab === 'in-progress') {
            filtered = filtered.filter(
                (m: Mentee) =>
                    (m.progress ?? 0) > 0 &&
                    (m.progress ?? 0) < 100
            );
        } else if (activeTab === 'completed') {
            filtered = filtered.filter(
                (m: Mentee) =>
                    m.progress === 100 ||
                    m.hasCompleted === true
            );
        }
    }

        if (selectedStateFilter) {
            filtered = filtered.filter(
                (m: Mentee) => ((m as any).state || (m as any).profileInfo?.state || '').toLowerCase() === selectedStateFilter.toLowerCase(),
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
    }, [menteeList, search, activeTab, selectedFilter, selectedStateFilter,    params?.type,]);

    const notStartedCount = useMemo(() => menteeList.filter((m: Mentee) => (m.progress ?? 0) === 0).length, [menteeList]);
    const inProgressCount = useMemo(() => menteeList.filter((m: Mentee) => (m.progress ?? 0) > 0 && (m.progress ?? 0) < 100).length, [menteeList]);
    const completedCount = useMemo(() => menteeList.filter((m: Mentee) => m.progress === 100 || m.hasCompleted === true).length, [menteeList]);

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'not-started', label: 'Not Started', badge: notStartedCount },
        { key: 'in-progress', label: 'In Progress', badge: inProgressCount },
        { key: 'completed', label: 'Completed', badge: completedCount },
    ];

    if (isError) {
        return (
            <GradientBackground>
                <View style={styles.innerContainer}>
                    <TopBar notifications={3} showUserName showNotifications />
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.errorText}>Failed to load pastors. Please try again.</Text>
                    </View>
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <View style={styles.innerContainer}>
                <TopBar notifications={3} showUserName showNotifications />

                <View style={styles.contentContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <View style={styles.backIconWrap}>
                                <Ionicons name="chevron-back" size={20} color="#fff" />
                            </View>
                            <Text style={styles.headerTitle}>Pastors</Text>
                        </TouchableOpacity>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                                style={styles.iconButton}
                            >
                                <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => router.push('/mentees/mentees-location')}
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
                     {  params?.type !== "Field-Mentor-Home" &&  <TabSwitcher variant="frosted" tabs={tabs} activeTab={activeTab} onChange={handleTabChange} /> }

                    {/* Sort */}
                 {  params?.type !== "Field-Mentor-Home" && <View style={styles.sortContainer}>
                        <Text style={styles.sortLabel}>Sort by</Text>
                        <Pressable onPress={() => setFilterModalVisible(true)} style={styles.sortButton}>
                            <Text style={styles.sortButtonText} numberOfLines={1}>
                                {selectedStateFilter || selectedFilter}
                            </Text>
                            <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
                        </Pressable>
                    </View> }

                    {/* List / Skeleton */}
                    {isLoading && menteeList.length === 0 ? (
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
                                <MenteeProgressCard
                                    data={mentee}
                                    layout={viewMode}
                                    showMenu={true}
                                    onPress={() => router.push(`/mentees/${mentee.id}`)}
                                    onCall={() => dialPhone(mentee.phoneNumber)}
                                    onChat={() => chatNotAvailableYet()}
                                    onMail={() => sendEmail(mentee.email)}
                                    onWhatsApp={() => openWhatsApp(mentee.phoneNumber)}
                                    onMenuPress={() => handleMenuPress(mentee)}
                                    onInviteAsFieldMentor={() =>
                                        router.push({
                                            pathname: '/(director)/(tabs)/course-completed',
                                            params: { initialTab: 'invited' },
                                        } as any)
                                    }
                                    paramsData={params?.type}
                                />
                            )}
                            contentContainerStyle={styles.flatListContent}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={false}
                            maxToRenderPerBatch={10}
                            onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
                            onEndReachedThreshold={0.5}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.3)" />
                                    <Text style={styles.emptyText}>No pastors found</Text>
                                </View>
                            }
                            ListFooterComponent={() =>
                                isFetchingNextPage ? (
                                    <View style={{ paddingVertical: 20 }}>
                                        <ActivityIndicator color="#fff" />
                                    </View>
                                ) : null
                            }
                        />
                    )}
                </View>

                {menuMentee ? (
                    <ActionBottomSheet
                        ref={bottomSheetModalRef}
                        title={menuMentee.username || menuMentee.firstName || ''}
                        image={menuMentee.profilePicture}
                        actions={sheetActions}
                        onClose={handleCloseModal}
                    />
                ) : null}

                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedFilter={selectedStateFilter || selectedFilter}
                    onFilterSelect={filter => {
                        if (dynamicStates.includes(filter)) setSelectedStateFilter(filter);
                        else setSelectedFilter(filter);
                        setFilterModalVisible(false);
                    }}
                    filterOptions={filterOptions}
                />
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    innerContainer: { flex: 1 },
    contentContainer: { flex: 1, paddingTop: 24 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
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
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
    headerActions: { flexDirection: 'row', gap: 8 },
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
    sortContainer: {
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
    flatList: { flex: 1 },
    flatListContent: { paddingHorizontal: 16, paddingBottom: 24 },
    emptyContainer: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '500' },
});
