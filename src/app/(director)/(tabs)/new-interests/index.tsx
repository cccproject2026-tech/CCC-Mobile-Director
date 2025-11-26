import AcceptedUserCard from '@/components/Cards/AcceptedUserCard';
import InterestCard from '@/components/Cards/InterestCard';
import { InterestCardSkeleton } from '@/components/Cards/InterestCard/InterestCardSkeleton';
// import FilterModal from '@/components/director/FilterModal';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal from '@/components/Modals/FilterModal';
import { useInterests } from '@/hooks/useInterest';
import { InterestItem } from '@/types/interest.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const isSmallDevice = SCREEN_WIDTH < 375;

type InterestTab = 'new' | 'pending' | 'accepted';

const COUNTRIES = ['All', 'USA', 'Canada', 'Mexico', 'Brazil'];

export type MappedInterest = {
    id: string;
    name: string;
    role: string;
    time: string;
    state: string;
    profileImage?: string;
    status: 'new' | 'pending' | 'accepted';

    firstName?: string;
    lastName?: string;
    title?: string;
    createdAt?: string;
};

export default function InterestReceivedScreen() {
    const [activeTab, setActiveTab] = useState<InterestTab>('new');
    const [search, setSearch] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const router = useRouter();
    const { data: interestsData, isLoading, error } = useInterests();

    /** ---------------------
     * Mapping Function
     ----------------------*/
    const mapInterestItem = (item: any): MappedInterest => {
        const fullName = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || 'Unknown';
        const firstName = item.firstName ?? '';
        const lastName = item.lastName ?? '';

        const church = item.churchDetails?.[0];
        const state = church?.country ?? 'Unknown';

        return {
            id: item._id ?? item.id,
            name: fullName,
            role: item.title || 'Not Provided',
            time: item.createdAt,
            state,
            profileImage: item.profilePicture,
            status: item.status || 'new',

            // 👇 Add fields needed by InterestCard
            firstName,
            lastName,
            title: item.title,
            createdAt: item.createdAt,
        } as MappedInterest & Partial<InterestItem>;
    };


    const toInterestItem = (item: MappedInterest): InterestItem => {
        return {
            id: item.id,
            firstName: item.firstName ?? '',
            lastName: item.lastName ?? '',
            title: item.role ?? '',
            createdAt: item.time ?? '',
            profilePicture: item.profileImage,

            // Required fields but not used → give safe defaults
            churchDetails: [],
            interests: [],
            phoneNumber: '',
            email: '',
            conference: '',
            yearsInMinistry: '',
            currentCommunityProjects: '',
            comments: '',
            updatedAt: '',
            status: item.status
        };
    };



    /** ---------------------
     * Group by backend status
     ----------------------*/
    const groupedInterests = useMemo(() => {
        const list = Array.isArray(interestsData) ? interestsData : [];
        const mapped = list.map(mapInterestItem);


        return {
            new: mapped.filter(i => i.status === 'new'),
            pending: mapped.filter(i => i.status === 'pending'),
            accepted: mapped.filter(i => i.status === 'accepted')
        };
    }, [interestsData]);

    /** ---------------------
     * Filtered Interests
     ----------------------*/
    const filteredInterests = useMemo(() => {
        let list = groupedInterests[activeTab];

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(i =>
                i.name.toLowerCase().includes(q) ||
                i.role.toLowerCase().includes(q) ||
                i.state.toLowerCase().includes(q)
            );
        }

        if (selectedFilter !== 'All') {
            list = list.filter(i => i.state === selectedFilter);
        }

        return list;
    }, [search, activeTab, selectedFilter, groupedInterests]);

    /** ---------------------
     * Tabs
     ----------------------*/
    const tabs = [
        { key: 'new' as InterestTab, label: 'New', badge: groupedInterests.new.length },
        { key: 'pending' as InterestTab, label: 'Pending', badge: groupedInterests.pending.length },
        { key: 'accepted' as InterestTab, label: 'Accepted', badge: groupedInterests.accepted.length }
    ];

    /** ---------------------
     * RENDER
     ----------------------*/
    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <View style={styles.flex1}>
                <TopBar notifications={3} showUserName showNotifications />

                <View style={[styles.flex1, styles.pt6]}>

                    {/* BACK BUTTON */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backRow}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                        <Text style={styles.backText}>Interest Received</Text>
                    </TouchableOpacity>

                    {/* SEARCH */}
                    <View style={styles.searchWrapper}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* TABS */}
                    <TabSwitcher
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={(key) => setActiveTab(key as InterestTab)}
                    />

                    {/* FILTERS */}
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Filters</Text>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            style={styles.filterButton}
                        >
                            <Text style={styles.filterButtonText} numberOfLines={1}>
                                {selectedFilter === 'All'
                                    ? 'All Countries'
                                    : `Country: ${selectedFilter}`}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </Pressable>
                    </View>

                    {/* LIST */}
                    {isLoading ? (
                        <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.listContainer}>
                                <InterestCardSkeleton />
                                <InterestCardSkeleton />
                                <InterestCardSkeleton />
                                <InterestCardSkeleton />
                            </View>
                        </ScrollView>
                    ) : error ? (
                        <View style={styles.errorWrapper}>
                            <Text style={styles.errorText}>Error loading: {error.message}</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.listContainer}>
                                {filteredInterests.length > 0 ? (
                                    filteredInterests.map(item =>
                                        activeTab === 'accepted' ? (
                                            <AcceptedUserCard key={item.id} data={item} />
                                        ) : (
                                            <InterestCard key={item.id} data={toInterestItem(item)} />
                                        )
                                    )
                                ) : (
                                    <Text style={styles.noDataText}>
                                        No interests found{search ? ` for "${search}"` : ''}.
                                    </Text>
                                )}
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* FILTER MODAL */}
                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedFilter={selectedFilter}
                    onFilterSelect={(f) => {
                        setSelectedFilter(f);
                        setFilterModalVisible(false);
                    }}
                    filterOptions={[{ label: 'Country', options: COUNTRIES, isExpandable: true }]}
                />

            </View>
        </LinearGradient>
    );
}


/* ------------------------------------------------
   PURE STYLESHEET VERSION (NO NATIVEWIND)
------------------------------------------------- */
const styles = StyleSheet.create({
    flex1: { flex: 1 },

    pt6: { paddingTop: 24 },

    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },

    backText: {
        marginLeft: 8,
        fontSize: 20,
        fontWeight: '600',
        color: '#fff'
    },

    searchWrapper: {
        paddingHorizontal: 16,
        marginBottom: 16
    },

    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 16
    },

    filterLabel: { fontSize: 16, color: '#fff' },

    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 999
    },

    filterButtonText: {
        color: '#fff',
        fontSize: 16,
        marginRight: 6,
        fontWeight: '500',
        maxWidth: 160
    },

    listScroll: { flex: 1, paddingHorizontal: 16 },

    listContainer: {
        paddingTop: 8,
        paddingBottom: 24,
        gap: 12
    },

    errorWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16
    },

    errorText: {
        color: '#fba',
        textAlign: 'center',
        fontSize: 16
    },

    noDataText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 40
    }
});
