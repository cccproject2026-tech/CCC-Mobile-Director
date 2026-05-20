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
import { useMentees } from '@/hooks/useMentees';
import { useScholarships } from '@/hooks/useScholorships';
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
import {
    chatNotAvailableYet,
    dialPhone,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';

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
};

export default function ProductAndServices() {
    // Fetch mentees and scholarships
    const { data: menteesData, isLoading: menteesLoading } = useMentees();
    const { data: scholarshipsData, isLoading: scholarshipsLoading } = useScholarships();
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
                    if (!selectedMentee?.id) return;
                    router.push(`/(director)/(tabs)/mentees/${selectedMentee.id}/progress`);
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
                        pathname: '/(director)/(tabs)/mentees/assign-mentors',
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
                        pathname: '/(director)/(tabs)/mentees/remove-mentors',
                        params: { id: selectedMentee?.id ?? '' },
                    });
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
                setTimeout(() => {
                    router.push({
                        pathname: '/(director)/(tabs)/mentees/notes',
                        params: { id: selectedMentee?.id ?? '' },
                    } as any);
                }, 300);
            },
        },
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
                setTimeout(() => router.push('/(director)/(tabs)/appointments'), 300);
            },
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

    // Map scholarship type to tab key
    const tabKeyToType: Record<string, string> = {
        'full-scholarship': 'Full scholarship',
        'partial-scholarship': 'Partial scholarship',
        'adra-discount': 'ADRA Discount',
        'half-scholarship': 'Half Scholarship',
    };

    // Prepare mentee list for the selected scholarship tab
    const filteredMentees = useMemo(() => {
        if (!scholarshipsData || !menteesData) return [];
        const menteeList = Array.isArray(menteesData) ? menteesData : menteesData.mentees || [];
        const currentType = tabKeyToType[activeTab];
        const scholarship = scholarshipsData.find((s: any) => s.type === currentType);
        if (!scholarship) return [];
        // awardedList may be array of AwardedUser or string ids
        const awardedIds = (scholarship.awardedList || []).map((a: any) => typeof a === 'string' ? a : a.userId);
        let filtered = menteeList.filter((mentee: any) => awardedIds.includes(mentee.id));
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((mentee: any) =>
                (mentee.name || mentee.firstName || '').toLowerCase().includes(q)
            );
        }
        // Optionally, you can map mentee fields to match the MenteeCard props if needed
        return filtered;
    }, [scholarshipsData, menteesData, activeTab, search]);

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
                        {menteesLoading || scholarshipsLoading ? (
                            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 32 }}>Loading...</Text>
                        ) : filteredMentees.length === 0 ? (
                            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 32 }}>No mentees found for this scholarship.</Text>
                        ) : (
                            filteredMentees.map((mentee: any) => (
                                <MenteeCard
                                    key={mentee.id}
                                    data={mentee}
                                    showMenu={true}
                                    layout={viewMode}
                                    onPress={() =>
                                        router.push(`/(director)/(tabs)/mentees/${mentee.id}`)
                                    }
                                    onCall={() => dialPhone((mentee as any).phoneNumber)}
                                    onChat={() => chatNotAvailableYet()}
                                    onMail={() => sendEmail((mentee as any).email)}
                                    onWhatsApp={() => openWhatsApp((mentee as any).phoneNumber)}
                                    onMenuPress={() => handleMenuPress(mentee)}
                                />
                            ))
                        )}
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
