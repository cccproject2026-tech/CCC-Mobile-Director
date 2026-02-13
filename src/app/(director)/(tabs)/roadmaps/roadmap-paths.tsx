import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '@/components/Header/TopBar';
import SearchBar from '@/components/Header/SearchBar';
import { useAssignedRoadmaps } from '@/hooks/roadmap/useRoadmaps';
import RoadmapCard from '@/components/Cards/RoadmapCard';
import { getRoadmapCard } from '@/utils/roadmapMapper';
import { useMentees } from '@/hooks/useMentees';
import { Mentee } from '@/types/user.types';
import { TabSwitcher } from '@/components/Header/TabSwitcher';

type TabKey = 'All' | 'Due' | 'Not Started' | 'Completed';

export default function MenteeRoadmapPathsScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { id: menteeIdParam } = useLocalSearchParams();
    const menteeId = Array.isArray(menteeIdParam) ? menteeIdParam[0] : menteeIdParam;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('All');

    // Fetch mentee details for header name
    const { data: menteesData } = useMentees();
    const mentee = menteesData?.pages.flatMap(page => page.mentees).find((m: Mentee) => m.id === menteeId);
    const menteeName = mentee ? `${mentee.firstName} ${mentee.lastName ?? ''}` : 'Mentee';

    // Fetch assigned roadmaps
    const {
        data: roadmaps,
        isLoading,
        refetch,
    } = useAssignedRoadmaps(menteeId);

    // Filter roadmaps based on search and tabs
    const filteredRoadmaps = useMemo(() => {
        if (!roadmaps) return [];

        let filtered = roadmaps;

        // 1. Text Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.name.toLowerCase().includes(query) ||
                    (r.description || '').toLowerCase().includes(query)
            );
        }

        // 2. Tab Filter
        switch (activeTab) {
            case 'Completed':
                filtered = filtered.filter((r) => r.status === 'completed');
                break;
            case 'Not Started':
                filtered = filtered.filter((r) => r.status === 'not started');
                break;
            case 'Due':
                // 'Due' logic might need refinement based on exact business rules.
                // For now, let's assume 'in progress' or explicitly 'due' if avail.
                // Often 'in progress' is a good proxy if no explicit due date logic exists yet.
                filtered = filtered.filter((r) => r.status === 'in progress');
                break;
            case 'All':
            default:
                break;
        }

        return filtered;
    }, [roadmaps, searchQuery, activeTab]);

    const handleBack = () => {
        router.back();
    };

    const handleRoadmapPress = (roadmapId: string) => {
         // Navigate to detailed view if needed, or phase list
         // For now, maybe just log or go to generic roadmap detail
         console.log('Pressed roadmap', roadmapId);
    };

    const tabItems = [
        { key: 'All', label: 'All' },
        { key: 'Due', label: 'Due' },
        { key: 'Not Started', label: 'Not Started' },
        { key: 'Completed', label: 'Completed' },
    ];

    if (isLoading) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading assigned roadmaps...</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            <TopBar showUserName />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Revitalization Roadmap</Text>
                        <Text style={styles.headerSubtitle}>Mentee • {menteeName}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeValue={setSearchQuery}
                    placeholder="Search"
                    backgroundColor="rgba(255,255,255,0.1)"
                />
            </View>

            {/* Tabs */}
            <TabSwitcher
                tabs={tabItems}
                activeTab={activeTab}
                onChange={(key) => setActiveTab(key as TabKey)}
            />

            {/* Content List */}
            <FlatList
                data={filteredRoadmaps}
                keyExtractor={(item) => item._id}
                contentContainerStyle={[styles.listContent, { paddingBottom: bottom + 20 }]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const cardData = getRoadmapCard(item);
                    return (
                         <View style={styles.cardWrapper}>
                            <RoadmapCard
                                data={cardData}
                                onPress={() => handleRoadmapPress(item._id)}
                                showMenu={false}
                            />
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No roadmaps match your search' : 'No roadmaps found in this category'}
                        </Text>
                    </View>
                }
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitleContainer: {
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    moreButton: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tabContainer: {
        marginBottom: 8,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    cardWrapper: {
        marginBottom: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.5)',
        marginTop: 12,
        fontSize: 15,
    },
});
