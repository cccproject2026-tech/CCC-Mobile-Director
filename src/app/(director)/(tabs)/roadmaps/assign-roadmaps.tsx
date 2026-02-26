// app/(director)/(tabs)/roadmaps/assign-roadmaps.tsx
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import TopBar from '@/components/Header/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/Header/SearchBar';
import { useMentees, useAssignRoadmapsToMentee } from '@/hooks/useMentees';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenteeCard from '@/components/Cards/MenteeCard';

const AssignRoadmaps = () => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();

    // Get selected roadmap IDs from params
    const selectedRoadmapIds = useMemo(() => {
        const ids = params.roadmapIds;
        if (typeof ids === 'string') {
            return JSON.parse(ids);
        }
        return [];
    }, [params.roadmapIds]);

    const [search, setSearch] = useState('');
    const [selectedMentees, setSelectedMentees] = useState<Set<string>>(new Set());

    // Fetch mentees
    const { 
        data, 
        isLoading, 
        error, 
        hasNextPage, 
        fetchNextPage, 
        isFetchingNextPage 
    } = useMentees();
    const mentees = data?.pages.flatMap((page) => page.mentees) ?? [];
    let isRoadmapavailable=mentees.some((mentee) => mentee.assignedRoadmapIds?.length > 0);
    console.log("isRoadmapavailable:----->>>>>>>>>>>>>>", isRoadmapavailable,mentees[0].assignedRoadmapIds?.length);
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#fff" />
            </View>
        );
    };

    // Assign mutation
    const assignMutation = useAssignRoadmapsToMentee();

    // Filter mentees based on search
    const filteredMentees = useMemo(() => {
        if (!search.trim()) return mentees;

        const searchLower = search.toLowerCase().trim();
        return mentees.filter((mentee) =>
            `${mentee.firstName} ${mentee.lastName}`.toLowerCase().includes(searchLower) ||
            mentee.firstName?.toLowerCase().includes(searchLower) ||
            mentee.lastName?.toLowerCase().includes(searchLower) ||
            mentee.username?.toLowerCase().includes(searchLower) ||
            mentee.email?.toLowerCase().includes(searchLower)
        );
    }, [mentees, search]);

    const selectableMentees = useMemo(() => {
        return filteredMentees.filter((m) =>
            !selectedRoadmapIds.every((id: string) => m.assignedRoadmapIds?.includes(id))
        );
    }, [filteredMentees, selectedRoadmapIds]);

    const alreadyAssignedMentees = useMemo(() => {
        // console.log("Calculating already assigned mentees with selectedRoadmapIds:", selectedRoadmapIds);
        return filteredMentees.filter((m) =>
            selectedRoadmapIds.length > 0 &&
            selectedRoadmapIds.every((id: string) => m.assignedRoadmapIds?.includes(id))
        );
    }, [filteredMentees, selectedRoadmapIds]);

    const areAllSelectableSelected = useMemo(() => {
        return selectableMentees.length > 0 && selectableMentees.every(m => selectedMentees.has(m.id));
    }, [selectableMentees, selectedMentees]);

    const handleToggleSelection = (menteeId: string) => {
        setSelectedMentees((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(menteeId)) {
                newSet.delete(menteeId);
            } else {
                newSet.add(menteeId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        setSelectedMentees((prev) => {
            const newSet = new Set(prev);
            if (areAllSelectableSelected) {
                // Deselect all visible selectable
                selectableMentees.forEach((m) => newSet.delete(m.id));
            } else {
                // Select all visible selectable
                selectableMentees.forEach((m) => newSet.add(m.id));
            }
            return newSet;
        });
    };

    const handleAssign = async () => {
        if (selectedMentees.size === 0) {
            Alert.alert('No Selection', 'Please select at least one mentee.');
            return;
        }

        if (selectedRoadmapIds.length === 0) {
            Alert.alert('No Roadmaps', 'No roadmaps selected to assign.');
            return;
        }

        try {
            const menteeIdArray = Array.from(selectedMentees);
            // console.log("Mentee ID Array:", menteeIdArray);
            await assignMutation.mutateAsync({
                menteeIds: menteeIdArray,
                roadmapIds: selectedRoadmapIds,
            });

            Alert.alert(
                'Success',
                `Roadmaps assigned to ${selectedMentees.size} mentee(s) successfully.`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(director)/(tabs)/roadmaps'),
                    },
                ]
            );
        } catch (err: any) {
            console.error('Failed to assign roadmaps:', err);
            let errorMessage = err?.message || 'Failed to assign roadmaps. Please try again.';

            // Attempt to replace user IDs with names for better readability
            if (mentees.length > 0) {
                errorMessage = errorMessage.replace(/[a-f0-9]{24}/g, (match: string) => {
                    const found = mentees.find((m) => m.id === match);
                    return found ? `${found.firstName} ${found.lastName}`.trim() || found.username || match : match;
                });
            }

            Alert.alert('Assignment Failed', errorMessage);
        }
    };
    // Get selected mentee names for footer
    const selectedMenteeNames = useMemo(() => {
        const names = Array.from(selectedMentees)
            .slice(0, 3)
            .map((id) => {
                const mentee = mentees.find((m) => m.id === id);
                return `${mentee?.firstName || ''} ${mentee?.lastName || ''}`.trim() || mentee?.username || 'Unknown';
            });

        if (selectedMentees.size > 3) {
            return `${names.join(', ')} +${selectedMentees.size - 3} more`;
        }
        return names.join(', ');
    }, [selectedMentees, mentees]);

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            <TopBar showUserName={true} showNotifications={true} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                    <Text style={styles.headerTitle}>Assign to</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} placeholder="Search mentees" />
            </View>

            {/* Select All */}
            <View style={styles.selectAllContainer}>
                <TouchableOpacity onPress={handleSelectAll}>
                    <Text style={styles.selectAllText}>
                        {areAllSelectableSelected
                            ? 'Deselect All'
                            : 'Select All'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Mentees List */}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading mentees...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                        <Text style={styles.errorText}>Failed to load mentees</Text>
                    </View>
                ) : filteredMentees.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#fff" style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyText}>
                            {search.trim() ? 'No mentees found' : 'No mentees available'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={selectableMentees}
                        renderItem={({ item }) => (
                            <MenteeCard
                                key={item.id}
                                data={item}
                                layout="card"
                                isSelected={selectedMentees.has(item.id)}
                                onToggleSelect={() => handleToggleSelection(item.id)}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 100 }]}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="checkmark-done-circle-outline" size={56} color="#fff" style={{ opacity: 0.5 }} />
                                <Text style={styles.emptyText}>All mentees already have this roadmap assigned</Text>
                            </View>
                        }
                        ListFooterComponent={
                            <>
                                {renderFooter()}
                                {alreadyAssignedMentees.length > 0 && (
                                    <View style={styles.assignedSection}>
                                        <View style={styles.assignedSectionHeader}>
                                            <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.5)" />
                                            <Text style={styles.assignedSectionTitle}>
                                                Already Assigned ({alreadyAssignedMentees.length})
                                            </Text>
                                        </View>
                                        {alreadyAssignedMentees.map((item) => (
                                            <View key={item.id} style={styles.assignedCard} pointerEvents="none">
                                                <MenteeCard
                                                    data={item}
                                                    layout="card"
                                                    isSelected={false}
                                                    onToggleSelect={() => {}}
                                                    disabled={true}
                                                />
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        }
                    />
                )}
            </View>

            {/* Footer with Assign Button */}
            {selectedMentees.size > 0 && (
                <View style={[styles.footer, { paddingBottom: bottom + 16 }]}>
                    <View style={styles.footerContent}>
                        <Text style={styles.footerText} numberOfLines={1}>
                            {selectedMenteeNames}
                        </Text>
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={handleAssign}
                            disabled={assignMutation.isPending}
                        >
                            {assignMutation.isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.assignButtonText}>Assign</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </LinearGradient>
    );
};

export default AssignRoadmaps;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        marginLeft: 8,
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    selectAllContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'flex-end',
    },
    selectAllText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    footer: {
        backgroundColor: 'rgba(21, 35, 96, 0.95)',
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#fff',
        marginRight: 16,
    },
    assignButton: {
        backgroundColor: '#7B3FF2',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(0, 255, 255, 0.4)',
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    assignButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    errorText: {
        color: '#ff6b6b',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
    footerLoading: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    assignedSection: {
        marginTop: 8,
    },
    assignedSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 4,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        marginBottom: 4,
    },
    assignedSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    assignedCard: {
        opacity: 0.45,
    },
});
