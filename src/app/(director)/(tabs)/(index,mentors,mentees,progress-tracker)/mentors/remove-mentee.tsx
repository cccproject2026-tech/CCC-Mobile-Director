
import MenteeCard from '@/components/Cards/MenteeCard';
import SearchBar from '@/components/Header/SearchBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import { useMentorMentees, useRemoveMenteesFromMentor } from '@/hooks/useMentors';
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

export default function RemoveMenteeScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { id: mentorIdParam } = useLocalSearchParams();
    const mentorId = Array.isArray(mentorIdParam) ? mentorIdParam[0] : mentorIdParam;
    console.log('Mentor ID:', mentorId);
    const [search, setSearch] = useState('');
    const [selectedMentees, setSelectedMentees] = useState<string[]>([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Latest Join');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    const { mentees, isLoading } = useMentorMentees(mentorId);
console.log('Mentees:', mentees);

    const removeMutation = useRemoveMenteesFromMentor();

    const toggleSelectMentee = (id: string) => {
        setSelectedMentees(prev =>
            prev.includes(id) ? prev.filter(menteeId => menteeId !== id) : [...prev, id],
        );
    };

    const getFilterOptions = (): FilterOption[] => {
        return [
            { label: 'Highest number of Mentors' },
            {
                label: 'Last Contacted',
                options: ['Oldest', 'Newest'],
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
    };
    const filterOptions = useMemo(() => getFilterOptions(), []);

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State : ${selectedFilter}`;
        }
        return selectedFilter || 'Latest Join';
    };

    const filteredMentees = useMemo(() => {
        const q = search.toLowerCase();
        return mentees.filter(mentee =>
            `${mentee.firstName} ${mentee.lastName ?? ''}`.toLowerCase().includes(q),
        );
    }, [search, mentees]);

    const handleRemove = () => {
        if (!mentorId) {
            Alert.alert('Error', 'Mentor id is missing.');
            return;
        }

        if (selectedMentees.length === 0) {
            Alert.alert('No Selection', 'Please select at least one mentee to remove.');
            return;
        }

        const selectedNames = filteredMentees
            .filter(m => selectedMentees.includes(m.id))
            .map(m => `${m.firstName} ${m.lastName ?? ''}`)
            .join(', ');

        Alert.alert(
            'Remove Mentees',
            `Are you sure you want to remove: ${selectedNames}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        removeMutation.mutate(
                            { mentorId, menteeIds: selectedMentees },
                            {
                                onSuccess: () => {
                                    router.back();
                                },
                                onError: () => {
                                    Alert.alert('Error', 'Failed to remove mentees. Please try again.');
                                },
                            },
                        );
                    },
                },
            ],
        );
    };

    const getSelectedNamesText = () => {
        if (selectedMentees.length === 0) return 'No mentees selected';

        const names = filteredMentees
            .filter(m => selectedMentees.includes(m.id))
            .map(m => `${m.firstName} ${m.lastName ?? ''}`);

        return names.join(', ');
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Remove a Mentee</Text>
                <TouchableOpacity
                    onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                    style={styles.viewToggle}
                >
                    <Ionicons
                        name={viewMode === 'card' ? 'list' : 'grid'}
                        size={24}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} />
            </View>

            {/* Sort By */}
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

            {/* Mentees List */}
            <FlatList
                data={filteredMentees}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <MenteeCard
                        data={item as Mentee}
                        layout={viewMode}
                        showMenu={true}
                        isSelected={selectedMentees.includes(item.id)}
                        onToggleSelect={() => toggleSelectMentee(item.id)}
                        onWhatsApp={() =>
                            console.log('WhatsApp', `${item.firstName} ${item.lastName ?? ''}`)
                        }
                        onCall={() =>
                            console.log('Call', `${item.firstName} ${item.lastName ?? ''}`)
                        }
                        onChat={() =>
                            console.log('Chat', `${item.firstName} ${item.lastName ?? ''}`)
                        }
                        onMail={() =>
                            console.log('Mail', `${item.firstName} ${item.lastName ?? ''}`)
                        }
                    />
                )}
                contentContainerStyle={[styles.listContent, { paddingBottom: 100 + bottom }]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#fff' }}>No mentees assigned to remove.</Text>
                        </View>
                    ) : null
                }
            />

            {/* Sticky Bottom Remove Container */}
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
                        (selectedMentees.length === 0 || removeMutation.isPending) &&
                        styles.gradientBorderDisabled,
                    ]}
                >
                    <TouchableOpacity
                        style={styles.removeButtonInner}
                        onPress={handleRemove}
                        disabled={selectedMentees.length === 0 || removeMutation.isPending}
                    >
                        <Text style={styles.removeButtonText}>
                            {removeMutation.isPending ? 'Removing...' : 'Remove'}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
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
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: { marginRight: 12 },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
    },
    viewToggle: { padding: 4 },
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
    sortLabel: { fontSize: 15, color: '#fff' },
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
    sortText: { fontSize: 14, color: '#fff', fontWeight: '500' },
    listContent: { paddingHorizontal: 16 },
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
    selectedNamesContainer: { flex: 1 },
    selectedNamesText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    gradientBorder: { padding: 2, borderRadius: 13 },
    gradientBorderDisabled: { opacity: 0.5 },
    removeButtonInner: {
        backgroundColor: '#1E366F',
        borderRadius: 11,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
