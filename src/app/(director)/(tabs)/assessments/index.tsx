import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo } from 'react'
import { GradientBackground } from '@/components/ui/design-system';
import TopBar from '@/components/Header/TopBar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/Header/SearchBar';
import { useAssessments } from '@/hooks/useAssessments';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AssessmentCard from '@/components/Cards/AssessmentCard';
import { RefreshControl } from 'react-native-gesture-handler';

type Props = {}

const Assessments = (props: Props) => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();

    const [search, setSearch] = React.useState('');

    // Fetch assessments
    const { data: assessments, isLoading, error, refetch, isFetching } = useAssessments();

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

    const handleAssessmentPress = (assessment: any) => {
        // Navigate to assessment details
        router.push({
            pathname: '/(director)/(tabs)/assessments/[id]',
            params: { id: assessment._id }
        });
    };
    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <GradientBackground>
            <TopBar showUserName={true} showNotifications={true} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <View style={styles.backIconWrap}>
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Assessments</Text>
                </TouchableOpacity>

                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('/(director)/(tabs)/assessments/select-assessment')}
                    >
                        <Ionicons name="checkmark-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('/(director)/(tabs)/assessments/create-assessment')}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} placeholder="Search assessments..." />
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
                        <Text style={styles.errorSubtext}>
                            {error instanceof Error ? error.message : 'An unexpected error occurred'}
                        </Text>
                    </View>
                ) : filteredAssessments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#fff" style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyText}>
                            {search.trim() ? 'No assessments found matching your search.' : 'No assessments available.'}
                        </Text>
                        {!search.trim() && (
                            <TouchableOpacity
                                style={styles.emptyCreateButton}
                                onPress={() => router.push('/(director)/(tabs)/assessments/create-assessment')}
                            >
                                <Ionicons name="add-outline" size={20} color="#fff" />
                                <Text style={styles.emptyCreateText}>Create Your First Assessment</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: bottom + 20 },
                        ]}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching} // Indicator shows while fetching
                                onRefresh={onRefresh}
                                tintColor="#fff" // iOS color
                                colors={['#1D548D']} // Android colors
                            />
                        }
                    >
                        {/* Assessment Count */}
                        <View style={styles.countContainer}>
                            <Text style={styles.countText}>
                                {filteredAssessments.length} {filteredAssessments.length === 1 ? 'Assessment' : 'Assessments'}
                                {search.trim() ? ' found' : ''}
                            </Text>
                        </View>

                        {filteredAssessments.map((assessment) => (
                            <AssessmentCard
                                key={assessment._id}
                                data={assessment}
                                onPress={() => handleAssessmentPress(assessment)}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>
        </GradientBackground>
    );
}

export default Assessments

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.12)",
    },
    backButton: { flexDirection: "row", alignItems: "center", gap: 10 },
    backIconWrap: {
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: -0.2 },
    headerButtons: { flexDirection: 'row', gap: 8 },
    iconButton: {
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.16)",
        alignItems: "center", justifyContent: "center",
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    countContainer: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    countText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
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
    errorSubtext: {
        color: '#fff',
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
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
    emptyCreateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
        gap: 8,
    },
    emptyCreateText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
