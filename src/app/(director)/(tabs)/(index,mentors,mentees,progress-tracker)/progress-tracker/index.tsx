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
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
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

type TabKey = 'all' | 'mentor-wise' | 'in-progress';

export default function ProgressTrackerIndex() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

    const { data: menteesData, isLoading: menteesLoading } = useMentees();
    const mentees: Mentee[] = menteesData?.pages.flatMap((page) => page.mentees) ?? [];

    const { data: mentorsData, isLoading: mentorsLoading } = useMentors(10);
    const mentors: Mentor[] = mentorsData?.pages.flatMap((page) => page.mentors) ?? [];

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
                        pathname: '/(director)/(tabs)/roadmaps',
                        params: { id: selectedMentee.id },
                    });
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
    ];

    const isLoading = menteesLoading || mentorsLoading;

    const handleMentorPress = (mentor: Mentor) => {
        router.push(`/(director)/(tabs)/progress-tracker/mentors/${mentor.id}` as any);
    };

    const filteredMentees: Mentee[] = useMemo(() => {
        let list = mentees;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(m => `${m.firstName} ${m.lastName ?? ''}`.toLowerCase().includes(q));
        }
        if (activeTab === 'in-progress') {
            list = list.filter(m => !m.hasCompleted && (m.progress ?? 0) < 100);
        }
        return list;
    }, [mentees, search, activeTab]);

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
                        onChange={tabKey => setActiveTab(tabKey as TabKey)}
                    />

                    {/* List */}
                    {isLoading ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {activeTab === 'mentor-wise'
                                ? mentors.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.3)" />
                                        <Text style={styles.emptyText}>No mentors found</Text>
                                    </View>
                                ) : mentors.map(item => (
                                    <MentorCard
                                        key={item.id}
                                        showMenu={true}
                                        mentor={{
                                            id: item.id,
                                            name: `${item.firstName} ${item.lastName ?? ''}`,
                                            role: item.role === 'field_mentor' ? 'Field Mentor' : 'Mentor',
                                            menteesCount: item.assignedId?.length ?? 0,
                                            description: item.profileInfo ?? 'No profile info',
                                            profilePicture: item.profilePicture,
                                        }}
                                        layout={viewMode}
                                        onCall={() => dialPhone(item.phoneNumber)}
                                        onWhatsApp={() => openWhatsApp(item.phoneNumber)}
                                        onMail={() => sendEmail(item.email)}
                                        onChat={() => chatNotAvailableYet()}
                                        onPress={() => handleMentorPress(item)}
                                    />
                                ))
                                : filteredMentees.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.3)" />
                                        <Text style={styles.emptyText}>No pastors found</Text>
                                    </View>
                                ) : filteredMentees.map(mentee => (
                                    <MenteeProgressCard
                                        key={mentee.id}
                                        data={mentee as Mentee}
                                        layout={viewMode}
                                        showMenu={true}
                                        onPress={() =>
                                            router.push(
                                                `/(director)/(tabs)/progress-tracker/${mentee.id}` as any
                                            )
                                        }
                                        onCall={() => dialPhone(mentee.phoneNumber)}
                                        onChat={() => chatNotAvailableYet()}
                                        onMail={() => sendEmail(mentee.email)}
                                        onWhatsApp={() => openWhatsApp(mentee.phoneNumber)}
                                        onMenuPress={() => handleMenuPress(mentee)}
                                    />
                                ))
                            }
                        </ScrollView>
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
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
    centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '500' },
});
