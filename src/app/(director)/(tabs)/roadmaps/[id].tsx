import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React from 'react';
import { GradientBackground } from '@/components/ui/design-system';
import TopBar from '@/components/Header/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoadmap } from '@/hooks/roadmap/useRoadmaps';
import { Routes } from '@/navigation/routes';
import { mapStatusChip } from '@/utils/roadmapTaskParser';

export default function RoadmapAssignmentDetailScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams<{ id?: string; assignUser?: string }>();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const assignUser = Array.isArray(params.assignUser)
        ? params.assignUser[0]
        : params.assignUser;

    const { data: roadmap, isLoading, error } = useRoadmap(id);

    const nestedCount = roadmap?.roadmaps?.length ?? 0;
    const statusLabel = mapStatusChip(roadmap?.status);

    return (
        <GradientBackground>
            <TopBar showUserName />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {roadmap?.name ?? 'Roadmap'}
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            ) : error || !roadmap ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>Failed to load roadmap.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}>
                    <View style={styles.summaryCard}>
                        <View style={styles.chipRow}>
                            <View style={styles.chip}>
                                <Text style={styles.chipText}>{statusLabel}</Text>
                            </View>
                            <View style={styles.chip}>
                                <Text style={styles.chipText}>
                                    {nestedCount} phase{nestedCount === 1 ? '' : 's'}
                                </Text>
                            </View>
                        </View>
                        {roadmap.description || roadmap.roadMapDetails ? (
                            <Text style={styles.description}>
                                {roadmap.description || roadmap.roadMapDetails}
                            </Text>
                        ) : null}
                        {roadmap.duration ? (
                            <Text style={styles.meta}>Duration: {roadmap.duration}</Text>
                        ) : null}
                    </View>

                    <Text style={styles.sectionTitle}>Phases / nested roadmaps</Text>
                    {(roadmap.roadmaps ?? []).length === 0 ? (
                        <Text style={styles.emptyText}>No nested phases yet.</Text>
                    ) : (
                        roadmap.roadmaps.map((phase) => (
                            <TouchableOpacity
                                key={phase._id}
                                style={styles.phaseRow}
                                onPress={() => {
                                    if (assignUser) {
                                        router.push(
                                            Routes.roadmaps.taskFor(roadmap._id, phase._id, assignUser),
                                        );
                                    } else {
                                        router.push(Routes.roadmaps.phaseListFor(roadmap._id));
                                    }
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.phaseTitle}>{phase.name}</Text>
                                    <Text style={styles.phaseSub}>
                                        {mapStatusChip(phase.status)}
                                        {phase.duration ? ` · ${phase.duration}` : ''}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        ))
                    )}

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() =>
                            router.push(
                                assignUser
                                    ? Routes.roadmaps.phaseListFor(roadmap._id, assignUser, true)
                                    : Routes.roadmaps.phaseListFor(roadmap._id),
                            )
                        }
                    >
                        <Text style={styles.actionBtnText}>Open phase list</Text>
                    </TouchableOpacity>

                    {!assignUser ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBtnOutline]}
                            onPress={() => router.push(Routes.roadmaps.select)}
                        >
                            <Text style={styles.actionBtnText}>Assign to pastors</Text>
                        </TouchableOpacity>
                    ) : null}
                </ScrollView>
            )}
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: '#ff6b6b', fontWeight: '600' },
    summaryCard: {
        padding: 16,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    chipRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(94,179,209,0.25)',
    },
    chipText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    description: { color: 'rgba(255,255,255,0.85)', lineHeight: 20, fontSize: 14 },
    meta: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
    emptyText: { color: 'rgba(255,255,255,0.6)', marginBottom: 16 },
    phaseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 8,
        gap: 10,
    },
    phaseTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
    phaseSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    actionBtn: {
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
    },
    actionBtnOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    actionBtnText: { color: '#fff', fontWeight: '700' },
});
