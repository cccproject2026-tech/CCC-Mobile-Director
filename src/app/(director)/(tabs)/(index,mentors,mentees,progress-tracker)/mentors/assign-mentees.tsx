import AcceptedUserCard from '@/components/Cards/AcceptedUserCard';
import SearchBar from '@/components/Header/SearchBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import { useMentees } from '@/hooks/useMentees';
import { useAssignMenteesToMentor } from '@/hooks/useMentors';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    const { id: mentorIdParam } = useLocalSearchParams();
    const mentorId = Array.isArray(mentorIdParam) ? mentorIdParam[0] : mentorIdParam;

    const [search, setSearch] = useState('');
    const [selectedPastors, setSelectedPastors] = useState<string[]>([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Latest Join');

    const { data, isLoading } = useMentees();
    const mentees: Mentee[] = data?.mentees ?? [];

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

    // map mentees -> Pastor shape for the card
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
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assign New Pastors</Text>
            </View>

            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} />
            </View>

            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by</Text>
                <Pressable
                    style={styles.sortButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Text style={styles.sortText}>{getFilterDisplayText()}</Text>
                    <Ionicons name="chevron-down" size={18} color="#fff" />
                </Pressable>
            </View>

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
                    { paddingBottom: 100 + bottom },
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#fff' }}>No mentees available to assign.</Text>
                        </View>
                    ) : null
                }
            />

            <View style={[styles.bottomContainer, {}]}>
                <View style={styles.selectedNamesContainer}>
                    <Text style={styles.selectedNamesText} numberOfLines={1}>
                        {getSelectedNamesText()}
                    </Text>
                </View>
                <View style={[styles.bottomContainer, { paddingBottom: bottom + 16 }]}>
                    <View style={styles.selectedNamesContainer}>
                        <Text style={styles.selectedNamesText} numberOfLines={1}>
                            {getSelectedNamesText()}
                        </Text>
                    </View>

                    <LinearGradient
                        colors={['#7C3AED', '#38BDF8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            styles.gradientBorder,
                            (selectedPastors.length === 0 || assignMutation.isPending) &&
                            styles.gradientBorderDisabled,
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.assignButtonInner}
                            onPress={handleAssign}
                            disabled={selectedPastors.length === 0 || assignMutation.isPending}
                        >
                            <Text style={styles.assignButtonText}>
                                {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
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
        gap: 12,
    },
    sortLabel: {
        fontSize: 15,
        color: '#fff',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
    },
    sortText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E366F',
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedNamesContainer: {
        flex: 1,
    },
    selectedNamesText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
    },
    gradientBorderDisabled: {
        opacity: 0.5,
    },
    assignButtonInner: {
        backgroundColor: '#1E366F',
        borderRadius: 11,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    assignButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
