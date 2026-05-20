import MenteeCard from '@/components/Cards/MenteeCard';
import { UserCardSkeleton } from '@/components/Cards/MentorCard/UserCardSkeleton';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { GradientBackground } from '@/components/ui/design-system';
import { useMentees } from '@/hooks/useMentees';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    chatNotAvailableYet,
    dialPhone,
    featureNotAvailableYet,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';

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

    const menuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push({ pathname: '/(director)/(tabs)/roadmaps', params: { id: selectedMentee?.id || '' } }), 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push({ pathname: '/mentees/assign-mentors', params: { id: selectedMentee?.id || '' } }), 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push({ pathname: '/mentees/remove-mentors', params: { id: selectedMentee?.id || '' } }), 300);
            },
        },
        {
            icon: 'people-outline',
            label: 'List of Mentors',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push({ pathname: '/(director)/(tabs)/mentors' }), 300);
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
                    router.push(`/(director)/(tabs)/mentees/${selectedMentee.id}/progress`);
                }, 300);
            },
        },
        {
            icon: 'checkmark-done-outline',
            label: 'Mentor Notes',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/mentees/notes'), 300);
            },
        },
        {
            icon: 'book-outline',
            label: 'View Progress Report',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/progress-report'), 300);
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

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setTimeout(() => bottomSheetModalRef.current?.present(), 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => setSelectedMentee(null), 300);
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
                (m: Mentee) =>
                    m.firstName.toLowerCase().includes(q) ||
                    (m.lastName ?? '').toLowerCase().includes(q) ||
                    (m.username ?? '').toLowerCase().includes(q) ||
                    m.role?.toLowerCase().includes(q) ||
                    (m as any).profileInfo?.toLowerCase().includes(q),
            );
        }
        if (activeTab === 'not-started') filtered = filtered.filter((m: Mentee) => (m.progress ?? 0) === 0);
        else if (activeTab === 'in-progress') filtered = filtered.filter((m: Mentee) => (m.progress ?? 0) > 0 && (m.progress ?? 0) < 100);
        else if (activeTab === 'completed') filtered = filtered.filter((m: Mentee) => m.progress === 100 || m.hasCompleted === true);

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
    }, [menteeList, search, activeTab, selectedFilter, selectedStateFilter]);

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
                    <TabSwitcher variant="frosted" tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

                    {/* Sort */}
                    <View style={styles.sortContainer}>
                        <Text style={styles.sortLabel}>Sort by</Text>
                        <Pressable onPress={() => setFilterModalVisible(true)} style={styles.sortButton}>
                            <Text style={styles.sortButtonText} numberOfLines={1}>
                                {selectedStateFilter || selectedFilter}
                            </Text>
                            <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
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
                                    showMenu={true}
                                    onPress={() => router.push(`/mentees/${mentee.id}`)}
                                    onCall={() => dialPhone(mentee.phoneNumber)}
                                    onChat={() => chatNotAvailableYet()}
                                    onMail={() => sendEmail(mentee.email)}
                                    onWhatsApp={() => openWhatsApp(mentee.phoneNumber)}
                                    onMenuPress={() => handleMenuPress(mentee)}
                                    onMarkComplete={() => featureNotAvailableYet('Mark complete')}
                                    onIssueCertificate={() => featureNotAvailableYet('Issuing a certificate')}
                                    onInviteAsFieldMentor={() => router.push('/(director)/(tabs)/invite-field-mentor')}
                                />
                            )}
                            contentContainerStyle={styles.flatListContent}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews
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
