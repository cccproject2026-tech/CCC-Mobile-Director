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
import { Roadmap } from '@/types/roadmap.types';
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
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedRoadmapIds, setSelectedRoadmapIds] = useState<Set<string>>(new Set());

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

    const {
        data: roadmaps,
        isLoading,
    } = useAssignedRoadmaps(menteeId);

    const filteredRoadmaps = useMemo((): Roadmap[] => {
        if (!roadmaps) return [];

        let filtered: Roadmap[] = roadmaps;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.name.toLowerCase().includes(query) ||
                    (r.description || '').toLowerCase().includes(query)
            );
        }

        switch (activeTab) {
            case 'Completed':
                filtered = filtered.filter((r) => r.status === 'completed');
                break;
            case 'Not Started':
                filtered = filtered.filter((r) => r.status === 'not started');
                break;
            case 'Due':
                filtered = filtered.filter((r) => r.status === 'in progress');
                break;
            case 'All':
            default:
                break;
        }

        return filtered;
    }, [roadmaps, searchQuery, activeTab]);

    const allVisibleSelected =
        filteredRoadmaps.length > 0 &&
        filteredRoadmaps.every((r) => selectedRoadmapIds.has(r._id));

    const handleToggleSelectionMode = useCallback(() => {
        setSelectionMode((prev) => {
            if (prev) {
                setSelectedRoadmapIds(new Set());
            }
            return !prev;
        });
    }, []);

    const handleToggleRoadmapSelect = useCallback((roadmapId: string) => {
        if (!roadmapId) return;
        setSelectedRoadmapIds((prev) => {
            const next = new Set(prev);
            if (next.has(roadmapId)) {
                next.delete(roadmapId);
            } else {
                next.add(roadmapId);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        const visibleIds = filteredRoadmaps.map((r) => r._id);
        setSelectedRoadmapIds((prev) => {
            const allSelected = visibleIds.every((id) => prev.has(id));
            if (allSelected) {
                const next = new Set(prev);
                visibleIds.forEach((id) => next.delete(id));
                return next;
            }
            const next = new Set(prev);
            visibleIds.forEach((id) => next.add(id));
            return next;
        });
    }, [filteredRoadmaps]);

    const handleDeleteSelected = useCallback(() => {
        if (selectedRoadmapIds.size === 0) {
            Alert.alert('No Selection', 'Please select at least one roadmap.');
            return;
        }
        const count = selectedRoadmapIds.size;
        Alert.alert(
            'Remove Roadmaps',
            `Do you want to remove ${count} roadmap${count > 1 ? 's' : ''} from ${menteeName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: integrate unassign roadmap API when backend is ready
                        setSelectedRoadmapIds(new Set());
                        setSelectionMode(false);
                    },
                },
            ],
        );
    }, [menteeName, selectedRoadmapIds]);

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
            <View style={styles.flex1}>
                <TopBar showUserName />

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
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[
                                styles.selectButton,
                                selectionMode && styles.selectButtonActive,
                            ]}
                            onPress={handleToggleSelectionMode}
                        >
                            <Ionicons
                                name={selectionMode ? 'close' : 'checkmark'}
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.selectButtonText}>
                                {selectionMode ? 'Cancel' : 'Select'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreButton}>
                            <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeValue={setSearchQuery}
                        placeholder="Search"
                        backgroundColor="rgba(255,255,255,0.1)"
                    />
                </View>

                <TabSwitcher
                    variant="frosted"
                    tabs={tabItems}
                    activeTab={activeTab}
                    onChange={(key) => setActiveTab(key as TabKey)}
                />

                {selectionMode ? (
                    <View style={styles.selectAllContainer}>
                        <Text style={styles.selectionCountText}>
                            {selectedRoadmapIds.size} selected
                        </Text>
                        <TouchableOpacity onPress={handleSelectAll}>
                            <Text style={styles.selectAllText}>
                                {allVisibleSelected ? 'Deselect All' : 'Select All'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                <FlatList
                    data={filteredRoadmaps}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: selectionMode ? bottom + 90 : bottom + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const cardData = getRoadmapCard(item);
                        return (
                            <View style={styles.cardWrapper}>
                                <RoadmapCard
                                    data={cardData}
                                    onPress={
                                        selectionMode
                                            ? undefined
                                            : () => handleRoadmapPress(item._id)
                                    }
                                    selectionMode={selectionMode}
                                    isSelected={selectedRoadmapIds.has(item._id)}
                                    onToggleSelection={() => handleToggleRoadmapSelect(item._id)}
                                />
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="document-text-outline"
                                size={48}
                                color="rgba(255,255,255,0.3)"
                            />
                            <Text style={styles.emptyText}>
                                {searchQuery
                                    ? 'No roadmaps match your search'
                                    : 'No roadmaps found in this category'}
                            </Text>
                        </View>
                    }
                />

                {selectionMode ? (
                    <View style={[styles.selectionActionBar, { paddingBottom: bottom + 12 }]}>
                        <TouchableOpacity
                            style={[
                                styles.deleteButton,
                                selectedRoadmapIds.size === 0 && styles.deleteButtonDisabled,
                            ]}
                            onPress={handleDeleteSelected}
                            disabled={selectedRoadmapIds.size === 0}
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                            <Text style={styles.deleteButtonText}>Delete Selected</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
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
    headerTitleContainer: { marginLeft: 0, flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        gap: 4,
    },
    selectButtonActive: {
        backgroundColor: 'rgba(111,212,190,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(111,212,190,0.45)',
    },
    selectButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
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
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    selectionCountText: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 13,
        fontWeight: '500',
    },
    selectAllText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
    selectionActionBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingTop: 14,
        backgroundColor: 'rgba(15,59,92,0.97)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.12)',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: 'rgba(255, 107, 107, 0.12)',
        borderColor: 'rgba(255, 107, 107, 0.35)',
    },
    deleteButtonDisabled: {
        opacity: 0.4,
    },
    deleteButtonText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '700',
    },
});
