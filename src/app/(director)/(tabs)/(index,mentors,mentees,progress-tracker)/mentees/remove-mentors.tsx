import MentorCard from '@/components/Cards/MentorCard';
import SearchBar from '@/components/Header/SearchBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import { GradientBackground } from '@/components/ui/design-system';
import { useMenteeMentors, useRemoveMentorsFromMentee } from '@/hooks/useMentees';
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

export default function RemoveMentorsFromMenteeScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { id: menteeIdParam } = useLocalSearchParams();
    const menteeId = Array.isArray(menteeIdParam) ? menteeIdParam[0] : menteeIdParam;

    const [search, setSearch] = useState('');
    const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Latest Join');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    const { mentors, isLoading } = useMenteeMentors(menteeId);
    const removeMutation = useRemoveMentorsFromMentee();

    const toggleSelectMentor = (id: string) => {
        setSelectedMentors(prev =>
            prev.includes(id) ? prev.filter(mentorId => mentorId !== id) : [...prev, id],
        );
    };

    const getFilterOptions = (): FilterOption[] => [
        { label: 'Highest number of Mentees' },
        { label: 'Last Contacted', options: ['Oldest', 'Newest'], isExpandable: true },
        { label: 'State', options: STATES, isExpandable: true },
        { label: 'Conference', isExpandable: true },
    ];
    const filterOptions = useMemo(() => getFilterOptions(), []);

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) return `State : ${selectedFilter}`;
        return selectedFilter || 'Latest Join';
    };

    const filteredMentors = useMemo(() => {
        const q = search.toLowerCase();
        return mentors.filter(mentor =>
            `${mentor.firstName} ${mentor.lastName ?? ''}`.toLowerCase().includes(q),
        );
    }, [search, mentors]);

    const handleRemove = () => {
        if (!menteeId) { Alert.alert('Error', 'Mentee id is missing.'); return; }
        if (selectedMentors.length === 0) { Alert.alert('No Selection', 'Please select at least one mentor to remove.'); return; }

        const selectedNames = filteredMentors
            .filter(m => selectedMentors.includes(m.id))
            .map(m => `${m.firstName} ${m.lastName ?? ''}`)
            .join(', ');

        Alert.alert('Remove Mentors', `Are you sure you want to remove: ${selectedNames}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    removeMutation.mutate(
                        { menteeId, mentorIds: selectedMentors },
                        {
                            onSuccess: () => router.back(),
                            onError: () => Alert.alert('Error', 'Failed to remove mentors. Please try again.'),
                        },
                    );
                },
            },
        ]);
    };

    const getSelectedNamesText = () => {
        if (selectedMentors.length === 0) return 'No mentors selected';
        return filteredMentors
            .filter(m => selectedMentors.includes(m.id))
            .map(m => `${m.firstName} ${m.lastName ?? ''}`)
            .join(', ');
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
                    <Text style={styles.headerTitle}>Remove Mentors</Text>
                    <TouchableOpacity
                        onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                        style={styles.iconButton}
                    >
                        <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <SearchBar value={search} onChangeValue={setSearch} />
                </View>

                {/* Sort */}
                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Sort by</Text>
                    <Pressable style={styles.sortButton} onPress={() => setFilterModalVisible(true)}>
                        <Text style={styles.sortText}>{getFilterDisplayText()}</Text>
                        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
                    </Pressable>
                </View>

                {/* Selection badge */}
                {selectedMentors.length > 0 && (
                    <View style={styles.selectionBadge}>
                        <Ionicons name="close-circle" size={16} color="#F87171" />
                        <Text style={styles.selectionBadgeText}>{selectedMentors.length} selected for removal</Text>
                    </View>
                )}

                {/* Mentors List */}
                <FlatList
                    data={filteredMentors}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.mentorCardWrapper}>
                            <TouchableOpacity style={styles.checkbox} onPress={() => toggleSelectMentor(item.id)}>
                                <View style={[styles.checkboxInner, selectedMentors.includes(item.id) && styles.checkboxSelected]}>
                                    {selectedMentors.includes(item.id) && (
                                        <Ionicons name="checkmark" size={14} color="#fff" />
                                    )}
                                </View>
                            </TouchableOpacity>
                            <View style={styles.mentorCardContent}>
                                <MentorCard
                                    mentor={{
                                        id: item.id,
                                        name: `${item.firstName} ${item.lastName ?? ''}`,
                                        role: item.role ?? 'Mentor',
                                        menteesCount: item.assignedId ? item.assignedId.length : 0,
                                        description: item.profileInfo ?? '',
                                        profilePicture: item.profilePicture,
                                    }}
                                    showMenu={true}
                                    layout={viewMode}
                                    onCall={() => console.log('Call', item.id)}
                                    onChat={() => console.log('Chat', item.id)}
                                    onMail={() => console.log('Mail', item.id)}
                                    onWhatsApp={() => console.log('WhatsApp', item.id)}
                                />
                            </View>
                        </View>
                    )}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 120 + bottom }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="people-outline" size={36} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyText}>No mentors assigned to remove.</Text>
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
                    <TouchableOpacity
                        style={[styles.removeButton, (selectedMentors.length === 0 || removeMutation.isPending) && styles.removeButtonDisabled]}
                        onPress={handleRemove}
                        disabled={selectedMentors.length === 0 || removeMutation.isPending}
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
                    onFilterSelect={filter => { setSelectedFilter(filter); setFilterModalVisible(false); }}
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
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
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
    searchContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
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
    selectionBadgeText: { fontSize: 13, color: '#F87171', fontWeight: '700' },
    listContent: { paddingHorizontal: 16 },
    mentorCardWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkbox: { marginRight: 12 },
    checkboxInner: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.35)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: { backgroundColor: '#F87171', borderColor: '#F87171' },
    mentorCardContent: { flex: 1 },
    emptyContainer: { paddingVertical: 48, alignItems: 'center', gap: 10 },
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
    selectedNamesText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
    removeButton: {
        backgroundColor: '#F87171',
        borderRadius: 12,
        paddingVertical: 11,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonDisabled: { opacity: 0.45 },
    removeButtonText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
