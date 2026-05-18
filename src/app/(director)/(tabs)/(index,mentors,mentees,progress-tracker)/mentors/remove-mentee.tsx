import MenteeCard from '@/components/Cards/MenteeCard';
import SearchBar from '@/components/Header/SearchBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import { GradientBackground } from '@/components/ui/design-system';
import { useMentorMentees, useRemoveMenteesFromMentor } from '@/hooks/useMentors';
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
        <GradientBackground>
            <View style={[styles.inner, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <View style={styles.backIconWrap}>
                            <Ionicons name="chevron-back" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Remove a Mentee</Text>
                    <TouchableOpacity
                        onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                        style={styles.iconButton}
                    >
                        <Ionicons
                            name={viewMode === 'card' ? 'list' : 'grid'}
                            size={20}
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
                        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
                    </Pressable>
                </View>

                {/* Selection badge */}
                {selectedMentees.length > 0 && (
                    <View style={styles.selectionBadge}>
                        <Ionicons name="close-circle" size={16} color="#F87171" />
                        <Text style={styles.selectionBadgeText}>
                            {selectedMentees.length} selected for removal
                        </Text>
                    </View>
                )}

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
                    contentContainerStyle={[styles.listContent, { paddingBottom: 120 + bottom }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="people-outline" size={36} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyText}>No mentees assigned to remove.</Text>
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

                    <TouchableOpacity
                        style={[
                            styles.removeButton,
                            (selectedMentees.length === 0 || removeMutation.isPending) && styles.removeButtonDisabled,
                        ]}
                        onPress={handleRemove}
                        disabled={selectedMentees.length === 0 || removeMutation.isPending}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.removeButtonText}>
                            {removeMutation.isPending ? 'Removing...' : 'Remove'}
                        </Text>
                    </TouchableOpacity>
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
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.2,
    },
    iconButton: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
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
    sortLabel: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
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
    sortText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
    selectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginHorizontal: 16,
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(248,113,113,0.12)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.25)',
        alignSelf: 'flex-start',
    },
    selectionBadgeText: {
        fontSize: 13,
        color: '#F87171',
        fontWeight: '700',
    },
    listContent: { paddingHorizontal: 16 },
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
    selectedNamesContainer: { flex: 1 },
    selectedNamesText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    removeButton: {
        backgroundColor: '#F87171',
        borderRadius: 12,
        paddingVertical: 11,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonDisabled: { opacity: 0.45 },
    removeButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
    },
});
