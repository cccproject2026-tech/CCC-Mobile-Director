import MenteeCard from '@/components/Cards/MenteeCard';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STATES = ['North American', 'Canada', 'Mexico', 'Brazil'];

type Mentee = {
    id: string;
    name: string;
    role: string;
    description: string;
    scholarshipAmount: number;
    dateOfApproval: string;
    status: string;
    profileImage: string;
}
// KEEPING MOCK DATA FOR NOW
const mockMentees: Mentee[] = [
    {
        id: '1',
        name: 'John Doe',
        role: 'Pastor',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 500,
        dateOfApproval: '10/06/25',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: '2',
        name: 'Jane Smith',
        role: 'Seminarian',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 500,
        dateOfApproval: '10/06/25',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        id: '3',
        name: 'John Ross',
        role: 'Pastor',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 500,
        dateOfApproval: '10/06/25',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    {
        id: '4',
        name: 'Sarah Johnson',
        role: 'Pastor',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 350,
        dateOfApproval: '20/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
    {
        id: '5',
        name: 'Michael Brown',
        role: 'Pastor',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 300,
        dateOfApproval: '15/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
    },
    {
        id: '6',
        name: 'David Wilson',
        role: 'Pastor',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 250,
        dateOfApproval: '10/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/35.jpg',
    },
    {
        id: '7',
        name: 'Emily Davis',
        role: 'Pastor',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 250,
        dateOfApproval: '12/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/46.jpg',
    },
    {
        id: '8',
        name: 'Robert Taylor',
        role: 'Pastor',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 150,
        dateOfApproval: '05/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/36.jpg',
    },
    {
        id: '9',
        name: 'Lisa Anderson',
        role: 'Pastor',
        description:
            'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 150,
        dateOfApproval: '08/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/47.jpg',
    },
];

export default function ProductAndServices() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<string>('full-scholarship');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(
        'Course Completion : Oldest'
    );
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

    const tabs = [
        { key: 'full-scholarship', label: 'Full Scholarship' },
        { key: 'partial-scholarship', label: 'Partial Scholarship' },
        { key: 'adra-discount', label: 'ADRA Discount' },
        { key: 'half-scholarship', label: 'Half Scholarship' },
    ];

    const getFilterOptions = (): FilterOption[] => [
        {
            label: 'Course Completion',
            options: ['Latest', 'Oldest'],
            isExpandable: true,
        },
        {
            label: 'State',
            options: STATES,
            isExpandable: true,
        },
        {
            label: 'Conference',
            isExpandable: true,
        },
    ];

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
                    router.push('/(director)/(tabs)/mentees/assign-mentor');
                }, 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/remove-mentor');
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
                    router.push(`/(director)/(tabs)/mentees/notes`);
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

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State: ${selectedFilter}`;
        }
        return selectedFilter || `Course Completion : ${selectedFilter}`;
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);

    const filteredMentees = useMemo(() => {
        let filtered = mockMentees;

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((mentee) =>
                mentee.name.toLowerCase().includes(q)
            );
        }

        if (activeTab === 'full-scholarship') {
            filtered = filtered.filter(
                (mentee) => mentee.scholarshipAmount === 500
            );
        } else if (activeTab === 'partial-scholarship') {
            filtered = filtered.filter(
                (mentee) =>
                    typeof mentee.scholarshipAmount === 'number' &&
                    mentee.scholarshipAmount > 250 &&
                    mentee.scholarshipAmount < 500
            );
        } else if (activeTab === 'half-scholarship') {
            filtered = filtered.filter(
                (mentee) => mentee.scholarshipAmount === 250
            );
        } else if (activeTab === 'adra-discount') {
            filtered = filtered.filter(
                (mentee) => mentee.scholarshipAmount === 150
            );
        }

        return filtered;
    }, [search, activeTab]);

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container,]}
        >
            <View style={styles.flex1}>
                <TopBar notifications={3} showUserName />

                <View style={[styles.flex1, styles.contentTop]}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.headerBack}
                        >
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text style={styles.headerTitle}>Product and Services</Text>
                        </TouchableOpacity>

                        <View style={styles.headerIconsRow}>
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
                                        '/(director)/(tabs)/product-and-services/settings'
                                    )
                                }
                            >
                                <Ionicons
                                    name="settings-outline"
                                    size={24}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchWrapper}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <TabSwitcher
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={handleTabChange}
                    />

                    {/* Sort By */}
                    <View style={styles.sortRow}>
                        <Text style={styles.sortLabel}>Sort by</Text>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            style={styles.sortButton}
                        >
                            <Text
                                style={styles.sortButtonText}
                                numberOfLines={1}
                            >
                                {getFilterDisplayText()}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Mentees List */}
                    <ScrollView
                        style={styles.listScroll}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredMentees.map((mentee) => (
                            <MenteeCard
                                key={mentee.id}
                                data={mentee}
                                layout={viewMode}
                                onPress={() =>
                                    router.push(`/(director)/(tabs)/mentees/${mentee.id}`)
                                }
                                onCall={() => console.log('Call', mentee.name)}
                                onChat={() => console.log('Chat', mentee.name)}
                                onMail={() => console.log('Mail', mentee.name)}
                                onWhatsApp={() => console.log('WhatsApp', mentee.name)}
                                onMenuPress={() => handleMenuPress(mentee)}
                            />
                        ))}
                    </ScrollView>
                </View>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedMentee?.name || ''}
                    image={selectedMentee?.profileImage}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />

                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedFilter={selectedFilter}
                    onFilterSelect={(filter) => {
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
    container: {
        flex: 1,
    },
    flex1: {
        flex: 1,
    },
    contentTop: {
        paddingTop: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.3)',
    },
    headerBack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        marginLeft: 8,
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    headerIconsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 12,
    },
    iconButton: {
        padding: 4,
    },
    searchWrapper: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sortLabel: {
        fontSize: 16,
        color: '#fff',
        marginRight: 8,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sortButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        marginRight: 6,
    },
    listScroll: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContent: {
        paddingBottom: 24,
    },
});
