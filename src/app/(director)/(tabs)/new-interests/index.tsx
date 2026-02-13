import AcceptedUserCard from '@/components/Cards/AcceptedUserCard';
import InterestCard from '@/components/Cards/InterestCard';
import { InterestCardSkeleton } from '@/components/Cards/InterestCard/InterestCardSkeleton';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal from '@/components/Modals/FilterModal';
import { useInterests } from '@/hooks/useInterest';
import { InterestStatus } from '@/types/interest.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

type InterestTab = InterestStatus;

export default function InterestReceivedScreen() {
    const [activeTab, setActiveTab] = useState<InterestTab>('new');
    const [search, setSearch] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const router = useRouter();
    const { data: interestsData, isLoading, error, isRefetching, refetch } = useInterests();

    /** ------------------------------------
     * Country filter options
     -------------------------------------*/
    const countryOptions = useMemo(() => {
        const list = Array.isArray(interestsData) ? interestsData : [];

        const countries = list
            .map(i => i.churchDetails?.[0]?.country)
            .filter((c): c is string => typeof c === 'string' && !!c);

        const unique = Array.from(new Set(countries));

        return ['All', ...unique];
    }, [interestsData]);


    /** ------------------------------------
     * Group by status
     -------------------------------------*/
    const groupedInterests = useMemo(() => {
        const list = Array.isArray(interestsData) ? interestsData : [];

        return {
            new: list.filter(i => i.status === 'new'),
            pending: list.filter(i => i.status === 'pending'),
            accepted: list.filter(i => i.status === 'accepted'),
            rejected: list.filter(i => i.status === 'rejected'),
        };
    }, [interestsData]);

    /** ------------------------------------
     * Apply search + filter
     -------------------------------------*/
    const filteredInterests = useMemo(() => {
        let list = groupedInterests[activeTab as keyof typeof groupedInterests] ?? [];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(i => {
                const fullName = `${i.firstName ?? ''} ${i.lastName ?? ''}`.toLowerCase();
                const churchCountry = i.churchDetails?.[0]?.country?.toLowerCase() || '';
                const title = i.title?.toLowerCase() || '';

                return (
                    fullName.includes(q) ||
                    title.includes(q) ||
                    churchCountry.includes(q)
                );
            });
        }

        if (selectedFilter !== 'All') {
            list = list.filter(i =>
                i.churchDetails?.[0]?.country === selectedFilter
            );
        }

        return list;
    }, [search, activeTab, selectedFilter, groupedInterests]);

    /** ------------------------------------
     * Tabs
     -------------------------------------*/
    const tabs = [
        { key: 'new' as InterestTab, label: 'New', badge: groupedInterests.new.length },
        { key: 'pending' as InterestTab, label: 'Pending', badge: groupedInterests.pending.length },
        { key: 'accepted' as InterestTab, label: 'Accepted', badge: groupedInterests.accepted.length },
        { key: 'rejected' as InterestTab, label: 'Rejected', badge: groupedInterests.rejected.length },
    ];

    /** ------------------------------------
     * Render
     -------------------------------------*/
    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <View style={styles.container}>
                <TopBar notifications={3} showUserName showNotifications />

                <View style={styles.inner}>
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
                            <Text style={styles.filterButtonText}>
                                {selectedFilter === 'All'
                                    ? 'All Countries'
                                    : `Country: ${selectedFilter}`}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </Pressable>
                    </View>

                    {/* LIST */}
                    {isLoading ? (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.list}>
                                <InterestCardSkeleton />
                                <InterestCardSkeleton />
                                <InterestCardSkeleton />
                            </View>
                        </ScrollView>
                    ) : error ? (
                        <View style={styles.error}>
                            <Text style={styles.errorText}>
                                Error loading: {error.message}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefetching}
                                    onRefresh={refetch}
                                    tintColor="#fff"
                                    colors={["#fff"]}
                                />
                            }
                        >
                            <View style={styles.list}>
                                {filteredInterests.length > 0 ? (
                                    filteredInterests.map(item =>
                                        activeTab === 'accepted'
                                            ? <AcceptedUserCard key={item.id} data={item} />
                                            : <InterestCard key={item.id} data={item} />
                                    )
                                ) : (
                                    <Text style={styles.noData}>
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
                    filterOptions={[{
                        label: 'Country',
                        options: countryOptions,
                        isExpandable: true
                    }]}
                />

            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, paddingTop: 24 },
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
    searchWrapper: { paddingHorizontal: 16, marginBottom: 16 },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        marginBottom: 16,
        alignItems: 'center',
        gap: 8
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
        marginRight: 6,
        fontSize: 16,
        fontWeight: '500'
    },
    list: { paddingHorizontal: 16, gap: 12, paddingTop: 8, paddingBottom: 24 },
    error: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    errorText: { color: '#fba', fontSize: 16, textAlign: 'center' },
    noData: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14
    }
});
