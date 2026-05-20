import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useMemo } from 'react';
import { GradientBackground } from '@/components/ui/design-system';
import TopBar from '@/components/Header/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    useAssessment,
    useAssessmentAnswers,
    useAssessmentRecommendations,
} from '@/hooks/useAssessments';
import { Routes } from '@/navigation/routes';
import { ApiAssessmentSection } from '@/types/assessment.types';

function findChoiceLabel(
    sections: ApiAssessmentSection[] | undefined,
    sectionId: string,
    layerId: string,
    selectedChoice: string,
): string {
    const section = sections?.find((s) => s._id === sectionId);
    const layer = section?.layers.find((l) => l._id === layerId);
    const choice = layer?.choices.find(
        (c) =>
            c._id === selectedChoice ||
            c.text === selectedChoice ||
            String(c._id) === selectedChoice,
    );
    return choice?.text ?? selectedChoice;
}

export default function AssessmentResultScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams<{ assessmentId?: string; userId?: string }>();
    const assessmentId = Array.isArray(params.assessmentId)
        ? params.assessmentId[0]
        : params.assessmentId;
    const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

    const { data: assessment, isLoading: detailLoading } = useAssessment(assessmentId);
    const {
        data: answers,
        isLoading: answersLoading,
        error: answersError,
        refetch,
    } = useAssessmentAnswers(assessmentId, userId);
    const { data: recommendations } = useAssessmentRecommendations(assessmentId, userId);

    const isLoading = detailLoading || answersLoading;

    const preSurveyRows = useMemo(() => answers?.preSurveyAnswers ?? [], [answers]);

    const sectionBlocks = useMemo(() => {
        if (!answers?.sections?.length) return [];
        return answers.sections.map((sec) => ({
            sectionId: sec.sectionId,
            title:
                assessment?.sections?.find((s) => s._id === sec.sectionId)?.title ??
                'Section',
            layers: sec.layers.map((layer) => ({
                layerId: layer.layerId,
                label: findChoiceLabel(
                    assessment?.sections,
                    sec.sectionId,
                    layer.layerId,
                    layer.selectedChoice,
                ),
                answeredAt: layer.answeredAt,
            })),
        }));
    }, [answers, assessment]);

    if (!assessmentId || !userId) {
        return (
            <GradientBackground>
                <TopBar showUserName />
                <View style={styles.center}>
                    <Text style={styles.errorText}>Missing assessment or user.</Text>
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <TopBar showUserName />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>Assessment Result</Text>
                        <Text style={styles.headerSub} numberOfLines={1}>
                            {assessment?.name ?? 'Loading...'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading results...</Text>
                </View>
            ) : answersError ? (
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                    <Text style={styles.errorText}>Failed to load submitted answers</Text>
                    <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : !answers?.sections?.length && !preSurveyRows.length ? (
                <View style={styles.center}>
                    <Ionicons name="document-outline" size={56} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.emptyText}>No submitted answers yet.</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom + 24 }}
                >
                    {recommendations?.hasCdp ? (
                        <View style={styles.banner}>
                            <Ionicons name="bulb-outline" size={18} color="#fff" />
                            <Text style={styles.bannerText}>Recommendations available</Text>
                        </View>
                    ) : null}

                    {preSurveyRows.length > 0 && (
                        <View style={styles.block}>
                            <Text style={styles.blockTitle}>Pre-Survey</Text>
                            {preSurveyRows.map((row) => (
                                <View key={row._id} style={styles.row}>
                                    <Text style={styles.rowLabel}>{row.questionText}</Text>
                                    <Text style={styles.rowValue}>{row.answer}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {sectionBlocks.map((block) => (
                        <View key={block.sectionId} style={styles.block}>
                            <Text style={styles.blockTitle}>{block.title}</Text>
                            {block.layers.map((layer) => (
                                <View key={layer.layerId} style={styles.answerCard}>
                                    <Text style={styles.answerLabel}>Selected answer</Text>
                                    <Text style={styles.answerValue}>{layer.label}</Text>
                                    {layer.answeredAt ? (
                                        <Text style={styles.answerMeta}>
                                            {new Date(layer.answeredAt).toLocaleDateString()}
                                        </Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.detailLink}
                        onPress={() => router.push(Routes.assessments.detail(assessmentId))}
                    >
                        <Text style={styles.detailLinkText}>View assessment details</Text>
                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
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
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    loadingText: { color: '#fff', marginTop: 12 },
    errorText: { color: '#ff6b6b', marginTop: 12, fontWeight: '600' },
    emptyText: { color: 'rgba(255,255,255,0.7)', marginTop: 12, textAlign: 'center' },
    retryBtn: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    retryText: { color: '#fff', fontWeight: '700' },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(94,179,209,0.25)',
        marginBottom: 16,
        marginTop: 8,
    },
    bannerText: { color: '#fff', fontWeight: '600' },
    block: { marginBottom: 20 },
    blockTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
    row: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 8,
    },
    rowLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    rowValue: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 4 },
    answerCard: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    answerLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    answerValue: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 4 },
    answerMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 6 },
    detailLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
    },
    detailLinkText: { color: '#fff', fontWeight: '600' },
});
