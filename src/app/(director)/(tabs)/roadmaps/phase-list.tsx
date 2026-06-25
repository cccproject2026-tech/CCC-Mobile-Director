// app/(director)/(tabs)/roadmaps/phase-list.tsx

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    InteractionManager,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GradientBackground } from '@/components/ui/design-system';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { appendReturnTo, buildReturnTo, getReturnToParam } from '@/utils/navigation';
import { useSafeBack } from '@/hooks/useSafeBack';
import { useReturnToAwareBack } from '@/hooks/useReturnToAwareBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoadmap, useUpdateRoadmap } from '@/hooks/roadmap/useRoadmaps';
import { NestedRoadmap, UpdateRoadmapRequest } from '@/types/roadmap.types';
import TopBar from '@/components/Header/TopBar';
import RoadmapCard from '@/components/Cards/RoadmapCard';
import { RoadmapCardData } from '@/types/roadmap.types';
import SearchBar from '@/components/Header/SearchBar';
import { Routes } from '@/navigation/routes';
import ActionBottomSheet, { ActionItem } from '@/components/Sheets/ActionBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function PhaseListScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const roadmapId = params.roadmapId as string;
    const userId = (params.userId as string) || undefined;
    const pastorView = params.pastorView === 'true';
    const returnTo = getReturnToParam(params);
    const pastorBackFallback = useMemo(
        () => (userId ? Routes.roadmaps.indexWithPastor(userId) : Routes.roadmaps.index),
        [userId],
    );
    const safeBack = useSafeBack({ returnTo, fallback: pastorBackFallback });
    useReturnToAwareBack(pastorView ? returnTo : undefined);
    const { data: roadmap, isLoading } = useRoadmap(roadmapId);

    const phaseListParams = useMemo(
        () => ({
            roadmapId,
            ...(userId ? { userId } : {}),
            ...(pastorView ? { pastorView: 'true' } : {}),
        }),
        [pastorView, roadmapId, userId],
    );

    const phaseListReturnTo = useMemo(
        () => buildReturnTo(pathname, phaseListParams),
        [pathname, phaseListParams],
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPhase, setSelectedPhase] = useState<(RoadmapCardData & { id: string }) | null>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const updateRoadmapMutation = useUpdateRoadmap();

    const mapNestedRoadmapForPatch = useCallback((nested: NestedRoadmap) => ({
        _id: nested._id,
        name: nested.name,
        roadMapDetails: nested.roadMapDetails || nested.description || '',
        description: nested.description || nested.roadMapDetails || '',
        duration: nested.duration,
        phase: nested.phase || '',
        status: nested.status || 'not started',
        meetings: nested.meetings || [],
        ...(nested.extras?.length ? { extras: nested.extras } : {}),
        ...(nested.imageUrl ? { imageUrl: nested.imageUrl } : {}),
    }), []);

    const handleDeletePhase = useCallback(
        (phaseId: string) => {
            if (!roadmap) {
                Alert.alert('Error', 'Roadmap data is not loaded yet.');
                return;
            }

            const remainingRoadmaps = (roadmap.roadmaps ?? [])
                .filter((nested) => nested._id !== phaseId)
                .map(mapNestedRoadmapForPatch);

            const payload: UpdateRoadmapRequest = {
                name: roadmap.name,
                roadMapDetails: roadmap.roadMapDetails || roadmap.description || '',
                description: roadmap.description || roadmap.roadMapDetails || '',
                duration: roadmap.duration,
                ...(roadmap.imageUrl ? { imageUrl: roadmap.imageUrl } : {}),
                ...(roadmap.divisions?.length ? { divisions: roadmap.divisions } : {}),
                roadmaps: remainingRoadmaps,
            };

            console.log('[Delete Phase] PATCH payload:', { roadmapId, payload });

            updateRoadmapMutation.mutate(
                { roadmapId, payload },
                {
                    onSuccess: (response) => {
                        console.log('[Delete Phase] PATCH response:', response);
                        Alert.alert('Success', 'Phase deleted successfully.');
                    },
                    onError: (error) => {
                        console.error('[Delete Phase] PATCH error:', error);
                        Alert.alert('Error', 'Failed to delete the phase. Please try again.');
                    },
                },
            );
        },
        [mapNestedRoadmapForPatch, roadmap, roadmapId, updateRoadmapMutation],
    );

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setSelectedPhase(null);
    }, []);

    const handlePhasePress = useCallback(
        (nestedRoadmapId: string) => {
            const phase = roadmap?.roadmaps?.find((r) => r._id === nestedRoadmapId);
            if (!phase) return;

            if (pastorView && userId) {
                router.push({
                    pathname: '/(director)/(tabs)/roadmaps/task',
                    params: appendReturnTo(
                        {
                            roadmapId,
                            taskId: nestedRoadmapId,
                            userId,
                        },
                        phaseListReturnTo,
                    ),
                } as never);
                return;
            }

            router.push({
                pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                params: appendReturnTo(
                    {
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
                    phaseListReturnTo,
                ),
            } as never);
        },
        [pastorView, phaseListReturnTo, roadmap?.roadmaps, roadmapId, router, userId],
    );

    const handleAddTask = () => {
        router.push({
            pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-creation',
            params: appendReturnTo(
                {
                    roadmapId,
                    type: 'phase',
                    isEditMode: 'false',
                },
                phaseListReturnTo,
            ),
        } as never);
    };

    const handleBack = () => {
        if (pastorView) {
            safeBack();
            return;
        }
        router.back();
    };

   
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
        status: phase.status === 'completed'
            ? 'completed'
            : phase.status === 'in progress'
              ? 'in-progress'
              : 'initial',
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

    const buildPhaseMenuItems = useCallback(
        (phase: RoadmapCardData & { id: string }): ActionItem[] => {
            const phaseId = phase.id;
            const afterClose = (action: () => void) => {
                handleCloseModal();
                setTimeout(action, 200);
            };

            return [
                // {
                //     icon: 'create-outline',
                //     label: 'Edit Phase',
                //     onPress: () => {
                //         afterClose(() => handlePhasePress(phaseId));
                //     },
                // },
                // {
                //     icon: 'person-add-outline',
                //     label: 'Assign to',
                //     onPress: () => {
                //         afterClose(() =>
                //             router.push({
                //                 pathname: '/(director)/(tabs)/roadmaps/assign-roadmaps',
                //                 params: { roadmapIds: phaseId },
                //             }),
                //         );
                //     },
                // },
                {
                    icon: 'trash-outline',
                    label: 'Delete Phase',
                    onPress: () => {
                        const phaseName = phase.title || 'this phase';
                        handleCloseModal();
                        Alert.alert(
                            'Delete Phase',
                            `Are you sure you want to delete "${phaseName}"?`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => {
                                        handleDeletePhase(phaseId);
                                    },
                                },
                            ],
                        );
                    },
                },
            ];
        },
        [handleCloseModal, handleDeletePhase, handlePhasePress, router],
    );

    const sheetActions = useMemo(
        () => (selectedPhase ? buildPhaseMenuItems(selectedPhase) : []),
        [buildPhaseMenuItems, selectedPhase],
    );

    const handleMenuPress = useCallback((phase: RoadmapCardData & { id: string }) => {
        setSelectedPhase(phase);
    }, []);

    useEffect(() => {
        if (!selectedPhase) return;
        const task = InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                bottomSheetModalRef.current?.present();
            });
        });
        return () => task.cancel();
    }, [selectedPhase]);

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
                    {/* <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
                    </TouchableOpacity> */}
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
                            onMenuPress={() => handleMenuPress(card)}
                        />
                    ))
                )}
            </ScrollView>
            {selectedPhase ? (
                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedPhase.title || ''}
                    subtitle={selectedPhase.completionTime}
                    actions={sheetActions}
                    onClose={handleCloseModal}
                />
            ) : null}
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
