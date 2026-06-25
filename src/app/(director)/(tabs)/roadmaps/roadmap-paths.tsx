import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
} from 'react-native';
import { GradientBackground } from '@/components/ui/design-system';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
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
import { Routes } from '@/navigation/routes';
import { appendReturnTo, buildReturnToWithParent, getReturnToParam } from '@/utils/navigation';
import { useSafeBack } from '@/hooks/useSafeBack';
import { useReturnToAwareBack } from '@/hooks/useReturnToAwareBack';

type TabKey = 'All' | 'Due' | 'Not Started' | 'Completed';

export default function MenteeRoadmapPathsScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const returnTo = getReturnToParam(params);
    const safeBack = useSafeBack({
        returnTo,
        fallback: Routes.roadmaps.indexWithTab('mentees'),
    });
    useReturnToAwareBack(returnTo);
    const { id: menteeIdParam, email: menteeEmailParam } = params;
    const menteeIdRaw = Array.isArray(menteeIdParam) ? menteeIdParam[0] : menteeIdParam;
    const menteeEmailRaw = Array.isArray(menteeEmailParam)
        ? menteeEmailParam[0]
        : menteeEmailParam;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('All');

    // Fetch mentee details for header name
    const { data: menteesData } = useMentees();
    const allMenteesFlat = menteesData?.pages.flatMap((page) => page.mentees) ?? [];
    const mentee = menteeIdRaw
        ? allMenteesFlat.find((m: Mentee) => m.id === menteeIdRaw)
        : menteeEmailRaw
          ? allMenteesFlat.find(
                (m: Mentee) =>
                    m.email?.toLowerCase() === String(menteeEmailRaw).toLowerCase()
            )
          : undefined;
    const menteeId = mentee?.id ?? menteeIdRaw;
    const menteeName = mentee
        ? `${mentee.firstName ?? ''} ${mentee.lastName ?? ''}`.trim() || mentee.email || 'Mentee'
        : 'Mentee';

    const pathsReturnTo = useMemo(
        () => buildReturnToWithParent(pathname, { id: menteeId }, returnTo),
        [menteeId, pathname, returnTo],
    );

    // Fetch assigned roadmaps
    const {
        data: roadmaps,
        isLoading,
        refetch,
    } = useAssignedRoadmaps(menteeId);

    const handleRemoveAssignedRoadmap = useCallback(
        (roadmapId: string, roadmapName: string) => {
            Alert.alert(
                'Remove Roadmap',
                `Do you want to remove "${roadmapName}" from ${menteeName}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                            // TODO: integrate unassign roadmap API when backend is ready
                        },
                    },
                ],
            );
        },
        [menteeName],
    );

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
        if (returnTo) {
            safeBack();
            return;
        }
        router.replace(Routes.roadmaps.indexWithTab('mentees'));
    };

    const handleRoadmapPress = (roadmapId: string) => {
        router.push({
            pathname: '/(director)/(tabs)/roadmaps/phase-list',
            params: appendReturnTo(
                {
                    roadmapId,
                    userId: menteeId,
                    pastorView: 'true',
                },
                pathsReturnTo,
            ),
        } as never);
    };

    const tabItems = [
        { key: 'All', label: 'All' },
        { key: 'Due', label: 'Due' },
        { key: 'Not Started', label: 'Not Started' },
        { key: 'Completed', label: 'Completed' },
    ];

    if (isLoading) {
        return (
            <GradientBackground>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading assigned roadmaps...</Text>
                </View>
            </GradientBackground>
        );
    }

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
                        <Text style={styles.headerTitle}>Revitalization Roadmap</Text>
                        <Text style={styles.headerSubtitle}>Mentee • {menteeName}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
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
                variant="frosted"
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
                                showRemove
                                onRemovePress={() =>
                                    handleRemoveAssignedRoadmap(item._id, cardData.title)
                                }
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
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 12, fontSize: 15 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    headerTitleContainer: { marginLeft: 0 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    moreButton: {
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
        justifyContent: 'center', alignItems: 'center',
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
