import AcceptedUserCard from '@/components/Cards/AcceptedUserCard';
import SearchBar from '@/components/Header/SearchBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import { GradientBackground, PrimaryButton } from '@/components/ui/design-system';
import { useMentees } from '@/hooks/useMentees';
import { useAssignMenteesToMentor } from '@/hooks/useMentors';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STATES = ['North American', 'Canada', 'Mexico', 'Brazil'];

export default function AssignNewPastorsScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { id: mentorIdParam } = useLocalSearchParams<{ id: string }>();
    const mentorId = Array.isArray(mentorIdParam) ? mentorIdParam[0] : mentorIdParam;
    const [search, setSearch] = useState('');
    const [selectedPastors, setSelectedPastors] = useState<string[]>([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Latest Join');

    const { data, isLoading } = useMentees();
    const mentees: Mentee[] = data?.pages.flatMap((page: any) => page.mentees) ?? [];

    const assignMutation = useAssignMenteesToMentor();

    const toggleSelectPastor = (id: string) => {
        setSelectedPastors(prev =>
            prev.includes(id) ? prev.filter(pastorId => pastorId !== id) : [...prev, id],
        );
    };

    const getFilterOptions = (): FilterOption[] => {
        return [
            { label: 'Latest Join' },
            { label: 'Least number of Mentors' },
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
    };
    const filterOptions = useMemo(() => getFilterOptions(), []);

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State : ${selectedFilter}`;
        }
        return selectedFilter || 'Latest Join';
    };

    const pastorsFromMentees = useMemo(
        () =>
            mentees.map<
                Mentee & { mentorsAssigned: boolean; mentors: number; hasLoggedIn: boolean }
            >(m => ({
                ...m,
                mentorsAssigned: false,
                mentors: 0,
                hasLoggedIn: !!m.lastContacted,
            })),
        [mentees],
    );

    const filteredPastors = useMemo(() => {
        const q = search.toLowerCase();
        return pastorsFromMentees.filter(pastor =>
            `${pastor.firstName} ${pastor.lastName ?? ''}`.toLowerCase().includes(q),
        );
    }, [search, pastorsFromMentees]);

    const handleAssign = () => {
        if (!mentorId) {
            Alert.alert('Error', 'Mentor id is missing.');
            return;
        }

        if (selectedPastors.length === 0) {
            Alert.alert('No Selection', 'Please select at least one pastor to assign.');
            return;
        }

        const selectedNames = filteredPastors
            .filter(p => selectedPastors.includes(p.id))
            .map(p => `${p.firstName} ${p.lastName ?? ''}`)
            .join(', ');

        Alert.alert(
            'Assign Pastors',
            `Are you sure you want to assign: ${selectedNames}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Assign',
                    onPress: () => {
                        assignMutation.mutate(
                            { mentorId, menteeIds: selectedPastors },
                            {
                                onSuccess: () => {
                                    router.back();
                                },
                                onError: () => {
                                    Alert.alert('Error', 'Failed to assign. Please try again.');
                                },
                            },
                        );
                    },
                },
            ],
        );
    };

    const getSelectedNamesText = () => {
        if (selectedPastors.length === 0) return 'No pastors selected';

        const names = filteredPastors
            .filter(p => selectedPastors.includes(p.id))
            .map(p => `${p.firstName} ${p.lastName ?? ''}`);

        return names.join(', ');
    };

    return (
        <GradientBackground>
            <View style={[styles.inner, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <View style={styles.backIconWrap}>
                            <Ionicons name="chevron-back" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Assign New Pastors</Text>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <SearchBar value={search} onChangeValue={setSearch} />
                </View>

                {/* Sort */}
                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Sort by</Text>
                    <Pressable
                        style={styles.sortButton}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Text style={styles.sortText}>{getFilterDisplayText()}</Text>
                        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
                    </Pressable>
                </View>

                {/* Selection count badge */}
                {selectedPastors.length > 0 && (
                    <View style={styles.selectionBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#6FD4BE" />
                        <Text style={styles.selectionBadgeText}>
                            {selectedPastors.length} selected
                        </Text>
                    </View>
                )}

                <FlatList
                    data={filteredPastors}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <AcceptedUserCard
                            data={item}
                            selectable={true}
                            isSelected={selectedPastors.includes(item.id)}
                            onToggleSelect={() => toggleSelectPastor(item.id)}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: 120 + bottom },
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="people-outline" size={36} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyText}>No mentees available to assign.</Text>
                            </View>
                        ) : null
                    }
                />

                {/* Sticky Bottom */}
                <View style={[styles.bottomContainer, { paddingBottom: bottom + 16 }]}>
                    <View style={styles.selectedNamesContainer}>
                        <Text style={styles.selectedNamesText} numberOfLines={1}>
                            {getSelectedNamesText()}
                        </Text>
                    </View>
                    <PrimaryButton
                        label={assignMutation.isPending ? 'Assigning...' : 'Assign'}
                        onPress={handleAssign}
                        disabled={selectedPastors.length === 0 || assignMutation.isPending}
                        style={styles.assignBtn}
                    />
                </View>

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
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    inner: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
        gap: 12,
    },
    backButton: {},
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.2,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    sortLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.65)',
        fontWeight: '500',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 7,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: 20,
    },
    sortText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    selectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginHorizontal: 16,
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(111,212,190,0.12)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(111,212,190,0.25)',
        alignSelf: 'flex-start',
    },
    selectionBadgeText: {
        fontSize: 13,
        color: '#6FD4BE',
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    emptyContainer: {
        paddingVertical: 48,
        alignItems: 'center',
        gap: 10,
    },
    emptyText: { color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: '500' },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15,59,92,0.97)',
        paddingHorizontal: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.12)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedNamesContainer: {
        flex: 1,
    },
    selectedNamesText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    assignBtn: {
        width: 'auto',
        minHeight: 44,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
});
