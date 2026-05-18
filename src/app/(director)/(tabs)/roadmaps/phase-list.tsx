// app/(director)/(tabs)/roadmaps/phase-list.tsx

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { GradientBackground } from '@/components/ui/design-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoadmap } from '@/hooks/roadmap/useRoadmaps';
import TopBar from '@/components/Header/TopBar';
import RoadmapCard from '@/components/Cards/RoadmapCard';
import { RoadmapCardData } from '@/types/roadmap.types';
import SearchBar from '@/components/Header/SearchBar';

export default function PhaseListScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const roadmapId = params.roadmapId as string;
    const { data: roadmap, isLoading } = useRoadmap(roadmapId);

    const [searchQuery, setSearchQuery] = useState('');

    const handlePhasePress = (nestedRoadmapId: string) => {
        const phase = roadmap?.roadmaps?.find((r) => r._id === nestedRoadmapId);
        if (!phase) return;

        // Navigate to roadmap-form in edit mode
        router.push({
            pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
            params: {
                roadmapId,
                nestedRoadmapId,
                type: 'phase',
                isEditMode: 'true',
                name: phase.name || '',
                subheading: phase.roadMapDetails || '',
                completionTime: phase.duration || '',
                selectedDivision: phase.phase || '',
                bannerImage: phase.imageUrl || '',
            },
        });
    };

    const handleAddTask = () => {
        // Navigate to roadmap-creation for new phase
        console.log('Routing to here : roadmap-creation for new phase')
        console.log('roadmapId', roadmapId);
        console.log('type', 'phase');
        console.log('isEditMode', 'false');
        router.push({
            pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-creation',
            params: {
                roadmapId,
                type: 'phase',
                isEditMode: 'false',
            },
        });
    };

    const handleBack = () => {
        router.back();
    };

    const handleMenuPress = (phaseId: string) => {
        // Handle menu actions (edit, delete, etc.)
        console.log('Menu pressed for phase:', phaseId);
    };

    if (isLoading) {
        return (
            <GradientBackground>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading phases...</Text>
                </View>
            </GradientBackground>
        );
    }

    const phases = roadmap?.roadmaps || [];

    // Transform phases to RoadmapCardData format
    const phaseCards: (RoadmapCardData & { id: string })[] = phases.map((phase) => ({
        _id: phase._id,
        id: phase._id,
        title: phase.name,
        description: phase.roadMapDetails || phase.description || '',
        image: phase.imageUrl || require('@/assets/images/app/jumpstart.png'),
        completionTime: phase.duration ? `Months ${phase.duration}` : undefined,
        showArrow: false,
    }));

    // ✅ Filter phases based on search query
    const filteredPhases = useMemo(() => {
        if (!searchQuery.trim()) return phaseCards;

        const query = searchQuery.toLowerCase();
        return phaseCards.filter(
            (phase) =>
                phase.title.toLowerCase().includes(query) ||
                phase.description?.toLowerCase().includes(query)
        );
    }, [phaseCards, searchQuery]);

    console.log('Filtered Phases images :', filteredPhases.map(p => p.image));
    return (
        <GradientBackground>
            <TopBar showUserName />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <View style={styles.backIconWrap}>
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                    </View>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{roadmap?.name || 'Self Revitalization Phase'}</Text>
                        <Text style={styles.headerSubtitle}>Revitalization Roadmap</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={styles.addButtonText}>Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ✅ Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeValue={setSearchQuery}
                    placeholder="Search"
                    backgroundColor="rgba(255,255,255,0.1)"
                />
            </View>

            {/* Phase Cards */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {filteredPhases.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name={searchQuery ? "search-outline" : "folder-open-outline"}
                            size={64}
                            color="rgba(255,255,255,0.3)"
                        />
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No phases found' : 'No phases created yet'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Click the "Task" button to add a new phase'
                            }
                        </Text>
                    </View>
                ) : (
                    filteredPhases.map((card) => (
                        <RoadmapCard
                            key={card.id}
                            data={card}
                            onPress={() => handlePhasePress(card.id)}
                            showMenu={true}
                            onMenuPress={() => handleMenuPress(card.id)}
                        />
                    ))
                )}
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    backButton: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
    backIconWrap: {
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitleContainer: { flex: 1 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
    headerSubtitle: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.10)',
        paddingVertical: 7, paddingHorizontal: 12,
        borderRadius: 9, gap: 4,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    },
    addButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    moreButton: {
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
        justifyContent: 'center', alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});
