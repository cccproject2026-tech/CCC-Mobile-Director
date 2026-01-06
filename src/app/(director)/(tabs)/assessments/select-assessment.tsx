import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import TopBar from '@/components/Header/TopBar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/Header/SearchBar';
import { useAssessments } from '@/hooks/useAssessments';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AssessmentCard from '@/components/Cards/AssessmentCard'; // Same component!

type Props = {}

const SelectAssessment = (props: Props) => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();

    const [search, setSearch] = useState('');
    const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set());

    // Fetch assessments
    const { data: assessments, isLoading, error } = useAssessments();

    // Filter assessments based on search
    const filteredAssessments = useMemo(() => {
        if (!assessments) return [];

        if (!search.trim()) return assessments;

        const searchLower = search.toLowerCase().trim();
        return assessments.filter((assessment) =>
            assessment.name?.toLowerCase().includes(searchLower) ||
            assessment.description?.toLowerCase().includes(searchLower) ||
            assessment.type?.toLowerCase().includes(searchLower)
        );
    }, [assessments, search]);

    const handleToggleSelection = (assessmentId: string) => {
        setSelectedAssessments((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(assessmentId)) {
                newSet.delete(assessmentId);
            } else {
                newSet.add(assessmentId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedAssessments.size === filteredAssessments.length) {
            // Deselect all
            setSelectedAssessments(new Set());
        } else {
            // Select all
            const allIds = new Set(filteredAssessments.map((a) => a._id));
            setSelectedAssessments(allIds);
        }
    };
    const handleConfirm = () => {
        if (selectedAssessments.size === 0) {
            Alert.alert('No Selection', 'Please select at least one assessment to assign.');
            return;
        }

        const selected = Array.from(selectedAssessments);

        // Navigate to assign page with selected assessment IDs
        router.push({
            pathname: '/(director)/(tabs)/assessments/assign-assessments',
            params: {
                assessmentIds: JSON.stringify(selected)
            }
        });
    };

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            <TopBar showUserName={true} showNotifications={true} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                    <Ionicons name="arrow-redo-outline" size={32} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} placeholder="Search" />
            </View>

            {/* Select All */}
            <View style={styles.selectAllContainer}>
                <TouchableOpacity onPress={handleSelectAll}>
                    <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>
            </View>

            {/* Assessments List */}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading assessments...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                        <Text style={styles.errorText}>Failed to load assessments</Text>
                    </View>
                ) : filteredAssessments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#fff" style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyText}>
                            {search.trim() ? 'No assessments found' : 'No assessments available'}
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: bottom + 20 },
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredAssessments.map((assessment) => (
                            <AssessmentCard
                                key={assessment._id}
                                data={assessment}
                                selectionMode={true}
                                isSelected={selectedAssessments.has(assessment._id)}
                                onToggleSelection={() => handleToggleSelection(assessment._id)}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>
        </LinearGradient>
    );
};

export default SelectAssessment;

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
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    confirmButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
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
});
