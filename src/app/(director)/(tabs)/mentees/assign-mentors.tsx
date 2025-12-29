import MentorCard from '@/components/Cards/MentorCard';
import SearchBar from '@/components/Header/SearchBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import { useAssignMentorsToMentee } from '@/hooks/useMentees';
import { useMentors } from '@/hooks/useMentors';
import { Mentor } from '@/types/user.types';
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

    const { mentors, isLoading } = useMentors();

    const assignMutation = useAssignMentorsToMentee();

    const toggleSelectMentor = (id: string) => {
        setSelectedMentors(prev =>
            prev.includes(id) ? prev.filter(mentorId => mentorId !== id) : [...prev, id],
        );
    };

    const getFilterOptions = (): FilterOption[] => {
        return [
            { label: 'Latest Join' },
            { label: 'Least number of Mentees' },
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

    const filteredMentors = useMemo(() => {
        const q = search.toLowerCase();
        return mentors.filter(mentor =>
            `${mentor.firstName} ${mentor.lastName ?? ''}`.toLowerCase().includes(q),
        );
    }, [search, mentors]);

    const handleAssign = () => {
        if (!menteeId) {
            Alert.alert('Error', 'Mentee id is missing.');
            return;
        }

        if (selectedMentors.length === 0) {
            Alert.alert('No Selection', 'Please select at least one mentor to assign.');
            return;
        }

        const selectedNames = filteredMentors
            .filter(m => selectedMentors.includes(m.id))
            .map(m => `${m.firstName} ${m.lastName ?? ''}`)
            .join(', ');

        console.log('Assigning mentors:', {
            menteeId,
            mentorIds: selectedMentors,
            names: selectedNames,
        });

        Alert.alert(
            'Assign Mentors',
            `Are you sure you want to assign: ${selectedNames}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Assign',
                    onPress: () => {
                        assignMutation.mutate(
                            { menteeId, mentorIds: selectedMentors },
                            {
                                onSuccess: () => {
                                    router.back();
                                },
                                onError: () => {
                                    Alert.alert('Error', 'Failed to assign mentors. Please try again.');
                                },
                            },
                        );
                    },
                },
            ],
        );
    };

    const getSelectedNamesText = () => {
        if (selectedMentors.length === 0) return 'No mentors selected';

        const names = filteredMentors
            .filter(m => selectedMentors.includes(m.id))
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
                <Text style={styles.headerTitle}>Assign Mentors</Text>
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

            {/* Mentors List */}
            <FlatList
                data={filteredMentors}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.mentorCardWrapper}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => toggleSelectMentor(item.id)}
                        >
                            <View
                                style={[
                                    styles.checkboxInner,
                                    selectedMentors.includes(item.id) && styles.checkboxSelected,
                                ]}
                            >
                                {selectedMentors.includes(item.id) && (
                                    <Ionicons name="checkmark" size={16} color="#fff" />
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
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#fff' }}>No mentors available to assign.</Text>
                        </View>
                    ) : null
                }
            />

            {/* Sticky Bottom Assign Container */}
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
                        (selectedMentors.length === 0 || assignMutation.isPending) &&
                        styles.gradientBorderDisabled,
                    ]}
                >
                    <TouchableOpacity
                        style={styles.assignButtonInner}
                        onPress={handleAssign}
                        disabled={selectedMentors.length === 0 || assignMutation.isPending}
                    >
                        <Text style={styles.assignButtonText}>
                            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
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
    mentorCardWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: {
        marginRight: 12,
    },
    checkboxInner: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#7C3AED',
        borderColor: '#7C3AED',
    },
    mentorCardContent: {
        flex: 1,
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
    selectedNamesContainer: { flex: 1 },
    selectedNamesText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    gradientBorder: { padding: 2, borderRadius: 13 },
    gradientBorderDisabled: { opacity: 0.5 },
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
