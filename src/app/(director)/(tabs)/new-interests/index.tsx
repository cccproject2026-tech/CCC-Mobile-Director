import AcceptedUserCard from '@/components/Cards/AcceptedUserCard';
import InterestCard from '@/components/Cards/InterestCard';
import { InterestCardSkeleton } from '@/components/Cards/InterestCard/InterestCardSkeleton';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import AssignInterestChoiceModal from '@/components/Modals/AssignInterestChoiceModal';
import FilterModal from '@/components/Modals/FilterModal';
import {
    GradientBackground,
    homeLayout,
    roadmapTheme,
    ScreenBackHeader,
} from '@/components/ui/design-system';
import { Colors } from '@/constants/Colors';
import { useDeleteInterest, useInterests } from '@/hooks/useInterest';
import { InterestItem, InterestStatus } from '@/types/interest.types';
import {
    dialPhone,
    getInterestContact,
    openSMS,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

type InterestTab = InterestStatus;

export default function InterestReceivedScreen() {
    const [activeTab, setActiveTab] = useState<InterestTab>('new');
    const [search, setSearch] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [assignPickerItem, setAssignPickerItem] = useState<InterestItem | null>(null);

    const router = useRouter();
    const { data: interestsData, isLoading, error, isRefetching, refetch } = useInterests();
    const deleteInterest = useDeleteInterest();
 
    const countryOptions = useMemo(() => {
        const list = Array.isArray(interestsData) ? interestsData : [];
 
        const countries = list
            .map(i => i.churchDetails?.[0]?.country)
            .filter((c): c is string => typeof c === 'string' && !!c);

        const unique = Array.from(new Set(countries));

        return ['All', ...unique];
    }, [interestsData]);
 
    const groupedInterests = useMemo(() => {
        const list = Array.isArray(interestsData) ? interestsData : [];

        return {
            new: list.filter(i => i.status === 'new'),
            pending: list.filter(i => i.status === 'pending'),
            accepted: list.filter(i => i.status === 'accepted'),
            rejected: list.filter(i => i.status === 'rejected'),
        };
    }, [interestsData]);

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

    const onAcceptedAssignPress = useCallback((item: InterestItem) => {
        if (!item.user?._id) {
            Alert.alert('Unable to assign', 'User ID is missing for this interest.');
            return;
        }
        setAssignPickerItem(item);
    }, []);

    const closeAssignPicker = useCallback(() => setAssignPickerItem(null), []);

    const navigateAssignMentorForPastor = useCallback(() => {
        const id = assignPickerItem?.user?._id;
        setAssignPickerItem(null);
        if (!id) return;
        router.push({
            pathname: '/(director)/(tabs)/mentees/assign-mentors' as any,
            params: { id: String(id) },
        });
    }, [assignPickerItem, router]);

    const navigateAssignMenteesForMentor = useCallback(() => {
        const id = assignPickerItem?.user?._id;
        setAssignPickerItem(null);
        if (!id) return;
        router.push({
            pathname: '/(director)/(tabs)/mentors/assign-mentees' as any,
            params: { id: String(id) },
        });
    }, [assignPickerItem, router]);

    const getInterestContactHandlers = useCallback((item: InterestItem) => {
        const { phone, email } = getInterestContact(item);

        return {
            onCall: () => dialPhone(phone),
            onChat: () => openSMS(phone),
            onMail: () => sendEmail(email),
            onWhatsApp: () => openWhatsApp(phone),
        };
    }, []);

    const handleDeleteInterest = useCallback((item: InterestItem) => {
        const interestId = String(item.id ?? '');
        if (!interestId) {
            Alert.alert('Unable to delete', 'Interest ID is missing for this record.');
            return;
        }

        const fullName =
            `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || 'this interest';

        Alert.alert(
            'Delete Interest',
            `Are you sure you want to delete "${fullName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteInterest.mutateAsync(interestId);
                            Alert.alert('Success', 'Interest form deleted successfully!');
                        } catch (deleteError) {
                            console.error('Error deleting interest:', deleteError);
                            Alert.alert('Error', 'Failed to delete interest. Please try again.');
                        }
                    },
                },
            ],
        );
    }, [deleteInterest]);

    const tabs = [
        { key: 'new' as InterestTab, label: 'New', badge: groupedInterests.new.length },
        { key: 'pending' as InterestTab, label: 'Pending', badge: groupedInterests.pending.length },
        { key: 'accepted' as InterestTab, label: 'Accepted', badge: groupedInterests.accepted.length },
        { key: 'rejected' as InterestTab, label: 'Rejected', badge: groupedInterests.rejected.length },
    ];

    return (
        <View style={styles.screenRoot}>
        <GradientBackground>
            <View style={styles.container}>
                <TopBar showUserName showNotifications />

                <View style={styles.inner}>
                    <ScreenBackHeader title="Interest Received" />

                    <View style={styles.searchWrapper}>
                        <SearchBar value={search} onChangeValue={setSearch} variant="frosted" />
                    </View>

                    <TabSwitcher
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={(key) => setActiveTab(key as InterestTab)}
                        variant="frosted"
                    />

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
                            <Ionicons name="chevron-down" size={16} color={roadmapTheme.textPrimary} />
                        </Pressable>
                    </View>

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
                                            ? <AcceptedUserCard
                                                key={item.id}
                                                data={item}
                                                onAssignPress={() => {
                                                    router.push({
                                                        pathname: '/mentees/assign-mentors',
                                                        params: { id: item?.user?._id || '' },
                                                    });
                                                }} />
                                            : <InterestCard
                                                key={item.id}
                                                data={item}
                                                {...getInterestContactHandlers(item)}
                                                showDelete={activeTab === 'rejected'}
                                                onDeletePress={() => handleDeleteInterest(item)}
                                                isDeleting={
                                                    deleteInterest.isPending &&
                                                    deleteInterest.variables === String(item.id)
                                                }
                                            />
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

                <AssignInterestChoiceModal
                    visible={!!assignPickerItem}
                    onClose={closeAssignPicker}
                    onAssignMentor={navigateAssignMentorForPastor}
                    onAssignMentees={navigateAssignMenteesForMentor}
                />

            </View>
        </GradientBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    screenRoot: {
        flex: 1,
        backgroundColor: Colors.appBgGradient[0],
    },
    container: { flex: 1 },
    inner: { flex: 1, paddingTop: 8 },
    searchWrapper: {
        paddingHorizontal: homeLayout.screenPaddingH,
        marginBottom: 14,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: homeLayout.screenPaddingH,
        marginBottom: 14,
        alignItems: 'center',
        gap: 8,
    },
    filterLabel: {
        fontSize: 14,
        color: roadmapTheme.textMuted,
        fontWeight: '600',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.08)',
        gap: 4,
    },
    filterButtonText: {
        color: roadmapTheme.textPrimary,
        fontSize: 13,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: homeLayout.screenPaddingH,
        gap: 10,
        paddingTop: 4,
        paddingBottom: 24,
    },
    error: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    errorText: { color: '#fca5a5', fontSize: 15, textAlign: 'center' },
    noData: {
        color: roadmapTheme.textMuted,
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
        lineHeight: 20,
    },
});
