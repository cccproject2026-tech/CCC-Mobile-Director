import MentorCard from '@/components/Cards/MentorCard';
import SearchBar from '@/components/Header/SearchBar';
import AppModal from '@/components/Modals/AppModal';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import { GradientBackground, PrimaryButton } from '@/components/ui/design-system';
import { useAssignMentorsToMentee } from '@/hooks/useMentees';
import { useMentors } from '@/hooks/useMentors';
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
import { chatNotAvailableYet, dialPhone, openWhatsApp, sendEmail } from '@/utils/contactActions';

const STATES = ['North American', 'Canada', 'Mexico', 'Brazil'];

export default function AssignMentorsToMenteeScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { id: menteeIdParam } = useLocalSearchParams();
    const menteeId = Array.isArray(menteeIdParam) ? menteeIdParam[0] : menteeIdParam;

    const [search, setSearch] = useState('');
    const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Latest Join');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    const { data: mentorsData, isLoading } = useMentors(10);
    const mentors = useMemo(() => mentorsData?.pages.flatMap(page => page.mentors) || [], [mentorsData]);

    const assignMutation = useAssignMentorsToMentee();

    const toggleSelectMentor = (id: string) => {
        setSelectedMentors(prev =>
            prev.includes(id) ? prev.filter(mentorId => mentorId !== id) : [...prev, id],
        );
    };

    const getFilterOptions = (): FilterOption[] => [
        { label: 'Latest Join' },
        { label: 'Least number of Mentees' },
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

    const handleAssign = () => {
        if (!menteeId) { Alert.alert('Error', 'Mentee id is missing.'); return; }
        if (selectedMentors.length === 0) { Alert.alert('No Selection', 'Please select at least one mentor to assign.'); return; }

        const selectedNames = filteredMentors
            .filter(m => selectedMentors.includes(m.id))
            .map(m => `${m.firstName} ${m.lastName ?? ''}`)
            .join(', ');

        Alert.alert('Assign Mentors', `Are you sure you want to assign: ${selectedNames}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Assign',
                onPress: () => {
                    assignMutation.mutate(
                        { menteeId, mentorIds: selectedMentors },
                        {
                            onSuccess: () => setShowSuccessModal(true),
                            onError: (error) => {
                                Alert.alert(
                                    'Error',
                                    (error as Error)?.message || 'Failed to assign mentors. Please try again.',
                                );
                            },
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
        <>
            <AppModal
                visible={showSuccessModal}
                type="success"
                title="Assigned Mentor Successfully"
                autoClose={3000}
                onClose={() => {
                    setShowSuccessModal(false);
                    router.back();
                }}
            />
            <GradientBackground>
                <View style={[styles.inner, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <View style={styles.backIconWrap}>
                                <Ionicons name="chevron-back" size={20} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Assign Mentors</Text>
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
                            <Ionicons name="checkmark-circle" size={16} color="#6FD4BE" />
                            <Text style={styles.selectionBadgeText}>{selectedMentors.length} selected</Text>
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
                                        onCall={() => dialPhone(item.phoneNumber)}
                                        onChat={() => chatNotAvailableYet()}
                                        onMail={() => sendEmail(item.email)}
                                        onWhatsApp={() => openWhatsApp(item.phoneNumber)}
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
                                    <Text style={styles.emptyText}>No mentors available to assign.</Text>
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
                            disabled={selectedMentors.length === 0 || assignMutation.isPending}
                            style={styles.assignBtn}
                        />
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
        </>
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
        backgroundColor: 'rgba(111,212,190,0.12)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(111,212,190,0.25)',
        alignSelf: 'flex-start',
    },
    selectionBadgeText: { fontSize: 13, color: '#6FD4BE', fontWeight: '700' },
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
    checkboxSelected: {
        backgroundColor: '#6FD4BE',
        borderColor: '#6FD4BE',
    },
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
    assignBtn: { width: 'auto', minHeight: 44, paddingHorizontal: 24, borderRadius: 12 },
});
