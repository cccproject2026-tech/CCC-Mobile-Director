// app/(director)/(tabs)/progress-tracker/index.tsx
import MenteeCard from '@/components/Cards/MenteeCard';
import MentorCard from '@/components/Cards/MentorCard';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { useMentees } from '@/hooks/useMentees';
import { useMentors } from '@/hooks/useMentors';
import { Mentee, Mentor } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
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

    const getFilterOptions = (): FilterOption[] => {
        return [
            {
                label: 'Course Completion',
                options: ['Latest', 'Oldest'],
                isExpandable: true,
            },
            {
                label: 'Conference',
                isExpandable: true,
            },
        ];
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);

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
                    router.push('/(director)/(tabs)/mentors/mentor-mentees');
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/assign-mentors');
                }, 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/remove-mentors');
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assessments',
            onPress: () => router.push('/(director)/(tabs)/assessments'),
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
                    router.push('/(director)/(tabs)/mentees/notes');
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
        { key: 'mentor-wise', label: 'Mentor Wise' },
        { key: 'in-progress', label: 'In-progress' },
    ];

    const isLoading = menteesLoading || mentorsLoading;

    const handleMentorPress = (mentor: Mentor) => {
        // Navigate to dedicated mentor detail page
        router.push(`/(director)/(tabs)/progress-tracker/mentors/${mentor.id}`);
    };

    const filteredMentees: Mentee[] = useMemo(() => {
        let list = mentees;

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                `${m.firstName} ${m.lastName ?? ''}`.toLowerCase().includes(q),
            );
        }

        if (activeTab === 'in-progress') {
            list = list.filter(m => !m.hasCompleted && (m.progress ?? 0) < 100);
        }

        return list;
    }, [mentees, search, activeTab]);

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
                            <Text style={styles.headerTitle}>Progress Tracker</Text>
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
                    ) : (
                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {activeTab === 'mentor-wise'
                                ? mentors.map(item => (
                                    <MentorCard
                                        key={item.id}
                                        showMenu={true}
                                        mentor={{
                                            id: item.id,
                                            name: `${item.firstName} ${item.lastName ?? ''}`,
                                            role:
                                                item.role === 'field_mentor'
                                                    ? 'Field Mentor'
                                                    : 'Mentor',
                                            menteesCount: item.assignedId?.length ?? 0,
                                            description:
                                                item.profileInfo ?? 'No profile info',
                                            profilePicture: item.profilePicture,
                                        }}
                                        layout={viewMode}
                                        onCall={() =>
                                            console.log('CALL', item.phoneNumber)
                                        }
                                        onWhatsApp={() =>
                                            console.log('WHATSAPP', item.phoneNumber)
                                        }
                                        onMail={() => console.log('MAIL', item.email)}
                                        onChat={() => console.log('CHAT')}
                                        onPress={() => handleMentorPress(item)}
                                    />
                                ))
                                : filteredMentees.map(mentee => (
                                    <MenteeCard
                                        key={mentee.id}
                                        data={mentee as Mentee}
                                        layout={viewMode}
                                        showMenu={true}
                                        onPress={() =>
                                            router.push(
                                                `/(director)/(tabs)/mentees/${mentee.id}/progress`,
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
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
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
});
