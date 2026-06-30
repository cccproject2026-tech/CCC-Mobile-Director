import {
    ActivityIndicator,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GradientBackground } from '@/components/ui/design-system';
import TopBar from '@/components/Header/TopBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfile } from '@/hooks/useProfile';
import { useRoadmap } from '@/hooks/roadmap/useRoadmaps';
import {
    useAddRoadmapComment,
    useNestedRoadmapTask,
    useReplyRoadmapQuery,
    useRoadmapComments,
    useRoadmapQueries,
    useRoadmapTaskDocuments,
    useRoadmapTaskExtras,
} from '@/hooks/roadmap/useRoadmapTask';
import { useAuthStore } from '@/stores/auth.store';
import { Routes } from '@/navigation/routes';
import { getReturnToParam } from '@/utils/navigation';
import { useSafeBack } from '@/hooks/useSafeBack';
import { useReturnToAwareBack } from '@/hooks/useReturnToAwareBack';
import { RoadmapExtra } from '@/types/roadmap.types';
import {
    documentsByFieldName,
    formatExtraValue,
    formatRoadmapDate,
    mapStatusChip,
    recordMatchesNestedTask,
    withNestedTaskScope,
} from '@/utils/roadmapTaskParser';
import {
    buildTaskScreenGetApis,
    buildTaskScreenWriteApis,
    logTaskScreenGetApis,
    logTaskScreenWriteApis,
    logTaskScreenWriteRequest,
    TaskScreenGetApi,
} from '@/utils/roadmapTaskApiDebug';

type TaskTab = 'response' | 'comments' | 'queries';
type QueryTab = 'pending' | 'answered';

export default function RoadmapTaskScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        roadmapId?: string;
        taskId?: string;
        userId?: string;
        returnTo?: string;
    }>();

    const returnTo = getReturnToParam(params);
    const roadmapId = Array.isArray(params.roadmapId) ? params.roadmapId[0] : params.roadmapId;
    const taskId = Array.isArray(params.taskId) ? params.taskId[0] : params.taskId;
    const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
    const taskFallback = useMemo(
        () => Routes.roadmaps.phaseListFor(roadmapId ?? '', userId, true),
        [roadmapId, userId],
    );
    const safeBack = useSafeBack({ returnTo, fallback: taskFallback });
    useReturnToAwareBack(returnTo);

    const currentUserId = useAuthStore((s) => s.user?.id ?? '');

    const [activeTab, setActiveTab] = useState<TaskTab>('response');
    const [queryTab, setQueryTab] = useState<QueryTab>('pending');
    const [commentText, setCommentText] = useState('');
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

    const { data: phaseRoadmap, isLoading: phaseLoading, isError: phaseError, error: phaseErrorObj } =
        useRoadmap(roadmapId);
    const { data: task, isLoading: taskLoading, isError: taskIsError, error: taskError } =
        useNestedRoadmapTask(roadmapId, taskId);
    const {
        data: pastorProfile,
        isLoading: profileLoading,
        isError: profileError,
        error: profileErrorObj,
    } = useUserProfile(userId ?? '');
    const {
        data: extras = [],
        isLoading: extrasLoading,
        isError: extrasError,
        error: extrasErrorObj,
    } = useRoadmapTaskExtras(roadmapId, userId, taskId);
    const {
        data: documents = [],
        isLoading: documentsLoading,
        isError: documentsError,
        error: documentsErrorObj,
    } = useRoadmapTaskDocuments(roadmapId, userId, taskId);
    const {
        data: comments = [],
        isLoading: commentsLoading,
        isError: commentsError,
        error: commentsErrorObj,
    } = useRoadmapComments(roadmapId, userId);
    const {
        data: queries = [],
        isLoading: queriesLoading,
        isError: queriesError,
        error: queriesErrorObj,
    } = useRoadmapQueries(roadmapId, userId, queryTab, taskId);

    const writeApis = useMemo(
        () => (roadmapId ? buildTaskScreenWriteApis(roadmapId) : []),
        [roadmapId],
    );

    const getApiCalls = useMemo((): TaskScreenGetApi[] => {
        if (!roadmapId || !userId || !taskId) return [];

        const defs = buildTaskScreenGetApis(roadmapId, userId, taskId, queryTab);
        const stateByKey: Record<
            string,
            { response: unknown; isLoading: boolean; isError: boolean; error: unknown }
        > = {
            phaseRoadmap: {
                response: phaseRoadmap,
                isLoading: phaseLoading,
                isError: phaseError,
                error: phaseErrorObj,
            },
            nestedTask: {
                response: task,
                isLoading: taskLoading,
                isError: taskIsError,
                error: taskError,
            },
            pastorProfile: {
                response: pastorProfile,
                isLoading: profileLoading,
                isError: profileError,
                error: profileErrorObj,
            },
            taskExtras: {
                response: extras,
                isLoading: extrasLoading,
                isError: extrasError,
                error: extrasErrorObj,
            },
            taskDocuments: {
                response: documents,
                isLoading: documentsLoading,
                isError: documentsError,
                error: documentsErrorObj,
            },
            comments: {
                response: comments,
                isLoading: commentsLoading,
                isError: commentsError,
                error: commentsErrorObj,
            },
            queries: {
                response: queries,
                isLoading: queriesLoading,
                isError: queriesError,
                error: queriesErrorObj,
            },
        };

        return defs.map((def) => ({
            ...def,
            ...stateByKey[def.key],
        }));
    }, [
        roadmapId,
        userId,
        taskId,
        queryTab,
        phaseRoadmap,
        phaseLoading,
        phaseError,
        phaseErrorObj,
        task,
        taskLoading,
        taskIsError,
        taskError,
        pastorProfile,
        profileLoading,
        profileError,
        profileErrorObj,
        extras,
        extrasLoading,
        extrasError,
        extrasErrorObj,
        documents,
        documentsLoading,
        documentsError,
        documentsErrorObj,
        comments,
        commentsLoading,
        commentsError,
        commentsErrorObj,
        queries,
        queriesLoading,
        queriesError,
        queriesErrorObj,
    ]);

    const loggedWriteApisRef = useRef(false);
    const lastGetLogKeyRef = useRef('');

    useEffect(() => {
        if (!roadmapId || !userId || !taskId || loggedWriteApisRef.current) return;
        logTaskScreenWriteApis(writeApis);
        loggedWriteApisRef.current = true;
    }, [roadmapId, userId, taskId, writeApis]);

    useEffect(() => {
        if (getApiCalls.length === 0) return;

        const logKey = getApiCalls
            .map(
                (call) =>
                    `${call.key}:${call.isLoading ? 'loading' : call.isError ? 'error' : 'done'}`,
            )
            .join('|');

        if (logKey === lastGetLogKeyRef.current) return;
        lastGetLogKeyRef.current = logKey;

        logTaskScreenGetApis(getApiCalls);
    }, [getApiCalls]);

    const addComment = useAddRoadmapComment(roadmapId ?? '', userId ?? '', taskId);
    const replyQuery = useReplyRoadmapQuery(roadmapId ?? '', userId ?? '', taskId);

    const taskComments = useMemo(() => {
        if (!taskId) return comments;
        return comments.filter((c) => recordMatchesNestedTask(c, taskId));
    }, [comments, taskId]);

    const pastorName = pastorProfile
        ? `${pastorProfile.firstName ?? ''} ${pastorProfile.lastName ?? ''}`.trim()
        : 'Pastor';

    const uploadMap = useMemo(() => documentsByFieldName(documents), [documents]);

    const answerByName = useMemo(() => {
        const map = new Map<string, (typeof extras)[number]>();
        extras.forEach((row) => {
            const key = String(row.name ?? row.key ?? '').trim().toLowerCase();
            if (key) map.set(key, row);
        });
        return map;
    }, [extras]);

    const hasResponses = extras.length > 0;
    const statusLabel = mapStatusChip(task?.status);

    const handleAddComment = async () => {
        const text = commentText.trim();
        if (!text || !userId || !currentUserId || !roadmapId) return;
        const payload = withNestedTaskScope(
            { text, userId, mentorId: currentUserId },
            taskId,
        );
        const addCommentApi = writeApis.find((api) => api.key === 'addComment');
        if (addCommentApi) {
            logTaskScreenWriteRequest(addCommentApi, payload);
        }
        const response = await addComment.mutateAsync(payload);
        if (addCommentApi) {
            logTaskScreenWriteRequest(addCommentApi, payload, response);
        }
        setCommentText('');
    };

    const handleReply = async (queryId: string) => {
        const repliedAnswer = (replyDrafts[queryId] ?? '').trim();
        if (!repliedAnswer || !currentUserId || !roadmapId) return;
        const payload = { repliedAnswer, repliedMentorId: currentUserId };
        const replyApi = writeApis.find((api) => api.key === 'replyQuery');
        const resolvedReplyApi = replyApi
            ? {
                  ...replyApi,
                  endpoint: replyApi.endpoint.replace('{queryId}', queryId),
              }
            : undefined;
        if (resolvedReplyApi) {
            logTaskScreenWriteRequest(resolvedReplyApi, payload);
        }
        const response = await replyQuery.mutateAsync({
            queryId,
            payload,
        });
        if (resolvedReplyApi) {
            logTaskScreenWriteRequest(resolvedReplyApi, payload, response);
        }
        setReplyDrafts((prev) => ({ ...prev, [queryId]: '' }));
    };

    const openFile = (url: string) => {
        if (url) Linking.openURL(url).catch(() => {});
    };

    const renderAnswerCard = (label: string, value: string, type?: string) => (
        <View key={`${label}-${type}`} style={styles.answerCard}>
            <Text style={styles.answerLabel}>{label}</Text>
            {type === 'SIGNATURE' && value.startsWith('http') ? (
                <Image source={{ uri: value }} style={styles.signatureImage} resizeMode="contain" />
            ) : (
                <Text style={styles.answerValue}>{value || '—'}</Text>
            )}
        </View>
    );

    const renderTemplateExtra = (extra: RoadmapExtra, idx: number): React.ReactNode => {
        const type = String(extra.type ?? '').toUpperCase();
        const label = String(extra.name ?? '').trim();

        if (type === 'SECTION') {
            const children = extra.sections ?? [];
            return (
                <View key={`section-${idx}`} style={styles.sectionBlock}>
                    <Text style={styles.sectionTitle}>{label || 'Section'}</Text>
                    {children.length === 0 ? (
                        <Text style={styles.emptyInline}>No fields in this section.</Text>
                    ) : (
                        children.map((child, ci) => renderTemplateExtra(child, ci))
                    )}
                </View>
            );
        }

        const answer = answerByName.get(label.toLowerCase());
        const uploads = uploadMap.get(label.toLowerCase()) ?? [];

        if (type === 'TEXT_DISPLAY') {
            return (
                <View key={`display-${idx}`} style={styles.displayBlock}>
                    <Text style={styles.displayText}>{label}</Text>
                </View>
            );
        }

        const value = answer ? formatExtraValue(answer) : '';
        const cards: React.ReactNode[] = [];

        if (answer || type !== 'UPLOAD') {
            cards.push(renderAnswerCard(label, value, type));
        }

        if (uploads.length > 0 || type === 'UPLOAD') {
            const files = uploads.flatMap((b) => b.files ?? []);
            cards.push(
                <View key={`uploads-${idx}`} style={styles.filesBlock}>
                    <Text style={styles.answerLabel}>{label || 'Uploads'}</Text>
                    {files.length === 0 ? (
                        <Text style={styles.emptyInline}>No files uploaded.</Text>
                    ) : (
                        files.map((f) => (
                            <TouchableOpacity
                                key={f.fileUrl}
                                style={styles.fileRow}
                                onPress={() => openFile(f.fileUrl)}
                            >
                                <Ionicons name="document-outline" size={18} color="#fff" />
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {f.fileName || 'Document'}
                                </Text>
                                <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>,
            );
        }

        return <View key={`field-${idx}`}>{cards}</View>;
    };

    const renderResponse = () => {
        if (extrasLoading) {
            return (
                <View style={styles.centerBox}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.loadingText}>Loading pastor responses…</Text>
                </View>
            );
        }

        if (!hasResponses) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={56} color="rgba(255,255,255,0.35)" />
                    <Text style={styles.emptyTitle}>Task not submitted yet</Text>
                    <Text style={styles.emptySub}>
                        Responses will appear here after {pastorName} completes this task.
                    </Text>
                </View>
            );
        }

        const templateExtras = task?.extras ?? [];
        return (
            <View>
                <Text style={styles.blockHeading}>Pastor response</Text>
                <Text style={styles.blockSub}>
                    Answers saved by {pastorName} for this task.
                </Text>
                {templateExtras.length > 0
                    ? templateExtras.map((extra, idx) => renderTemplateExtra(extra, idx))
                    : extras.map((row, idx) =>
                          renderAnswerCard(
                              String(row.name ?? row.key ?? `Field ${idx + 1}`),
                              formatExtraValue(row),
                              String(row.type ?? ''),
                          ),
                      )}
            </View>
        );
    };

    const renderComments = () => (
        <View>
            <View style={styles.composeRow}>
                <TextInput
                    style={styles.composeInput}
                    placeholder="Add a comment…"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                />
                <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={handleAddComment}
                    disabled={addComment.isPending || !commentText.trim()}
                >
                    {addComment.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="send" size={18} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
            {commentsLoading ? (
                <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
            ) : taskComments.length === 0 ? (
                <Text style={styles.emptyInline}>No comments yet.</Text>
            ) : (
                taskComments.map((c) => {
                    const author = c.mentorId
                        ? `${c.mentorId.firstName ?? ''} ${c.mentorId.lastName ?? ''}`.trim()
                        : 'Mentor';
                    return (
                        <View key={c._id} style={styles.commentCard}>
                            <Text style={styles.commentAuthor}>{author}</Text>
                            {c.addedDate ? (
                                <Text style={styles.commentDate}>{formatRoadmapDate(c.addedDate)}</Text>
                            ) : null}
                            <Text style={styles.commentText}>{c.text}</Text>
                        </View>
                    );
                })
            )}
        </View>
    );

    const renderQueries = () => (
        <View>
            <TabSwitcher
                tabs={[
                    { key: 'pending', label: 'Pending', badge: queryTab === 'pending' ? queries.length : undefined },
                    { key: 'answered', label: 'Answered' },
                ]}
                activeTab={queryTab}
                onChange={(k) => setQueryTab(k as QueryTab)}
                variant="frosted"
            />
            {queriesLoading ? (
                <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
            ) : queries.length === 0 ? (
                <Text style={styles.emptyInline}>
                    No {queryTab === 'pending' ? 'pending' : 'answered'} queries.
                </Text>
            ) : (
                queries.map((q) => (
                    <View key={q._id} style={styles.queryCard}>
                        <Text style={styles.queryAuthor}>{pastorName}</Text>
                        {q.createdDate ? (
                            <Text style={styles.commentDate}>{formatRoadmapDate(q.createdDate)}</Text>
                        ) : null}
                        <Text style={styles.queryText}>{q.actualQueryText}</Text>

                        {queryTab === 'pending' && !q.repliedAnswer ? (
                            <View style={styles.replyRow}>
                                <TextInput
                                    style={styles.replyInput}
                                    placeholder="Write your answer…"
                                    placeholderTextColor="rgba(255,255,255,0.45)"
                                    value={replyDrafts[q._id] ?? ''}
                                    onChangeText={(t) =>
                                        setReplyDrafts((prev) => ({ ...prev, [q._id]: t }))
                                    }
                                />
                                <TouchableOpacity
                                    style={styles.sendBtn}
                                    onPress={() => handleReply(q._id)}
                                    disabled={replyQuery.isPending}
                                >
                                    <Ionicons name="send" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        {q.repliedAnswer ? (
                            <View style={styles.replyBubble}>
                                <Text style={styles.replyLabel}>Reply</Text>
                                <Text style={styles.commentText}>{q.repliedAnswer}</Text>
                                {q.repliedDate ? (
                                    <Text style={styles.commentDate}>
                                        {formatRoadmapDate(q.repliedDate)}
                                    </Text>
                                ) : null}
                            </View>
                        ) : null}
                    </View>
                ))
            )}
        </View>
    );

    if (!roadmapId || !taskId || !userId) {
        return (
            <GradientBackground>
                <TopBar showUserName />
                <View style={styles.centerBox}>
                    <Text style={styles.errorText}>Missing task parameters.</Text>
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <TopBar showUserName />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => (returnTo ? safeBack() : router.back())} style={styles.backRow}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {task?.name ?? 'Task'}
                        </Text>
                        <Text style={styles.headerSub}>
                            {phaseRoadmap?.name ?? 'Roadmap'} · {pastorName}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>{statusLabel}</Text>
                </View>
            </View>

            {taskLoading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            ) : taskError ? (
                <View style={styles.centerBox}>
                    <Text style={styles.errorText}>Failed to load task.</Text>
                </View>
            ) : (
                <>
                    <View style={styles.mainTabs}>
                        <TabSwitcher
                            tabs={[
                                { key: 'response', label: 'Response' },
                                { key: 'comments', label: 'Comments', badge: taskComments.length || undefined },
                                { key: 'queries', label: 'Queries' },
                            ]}
                            activeTab={activeTab}
                            onChange={(k) => setActiveTab(k as TaskTab)}
                            variant="frosted"
                        />
                    </View>

                    <ScrollView
                        contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}
                    >
                        {task?.roadMapDetails || task?.description ? (
                            <View style={styles.instructionsBox}>
                                <Text style={styles.instructionsTitle}>Task instructions</Text>
                                <Text style={styles.instructionsBody}>
                                    {task.roadMapDetails || task.description}
                                </Text>
                            </View>
                        ) : null}

                        {activeTab === 'response' && renderResponse()}
                        {activeTab === 'comments' && renderComments()}
                        {activeTab === 'queries' && renderQueries()}
{hasResponses &&
                        <TouchableOpacity
                            style={styles.detailLink}
                            onPress={() => router.push(Routes.roadmaps.detail(roadmapId))}
                        >
                            <Text style={styles.detailLinkText}>View roadmap template</Text>
                            <Ionicons name="chevron-forward" size={16} color="#fff" />
                        </TouchableOpacity> }
                    </ScrollView>
                </>
            )}
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
        gap: 10,
    },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
    statusChip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(94,179,209,0.25)',
    },
    statusChipText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    mainTabs: { paddingHorizontal: 16, paddingTop: 10 },
    centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    loadingText: { color: '#fff', marginTop: 12 },
    errorText: { color: '#ff6b6b', fontWeight: '600' },
    blockHeading: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 4 },
    blockSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16 },
    instructionsBox: {
        padding: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    instructionsTitle: { color: '#fff', fontWeight: '700', marginBottom: 6 },
    instructionsBody: { color: 'rgba(255,255,255,0.8)', lineHeight: 20, fontSize: 14 },
    answerCard: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    answerLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
    answerValue: { color: '#fff', fontSize: 15, marginTop: 4, lineHeight: 21 },
    signatureImage: { width: '100%', height: 120, marginTop: 8, borderRadius: 8 },
    sectionBlock: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(90,141,203,0.4)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        marginBottom: 12,
    },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
    displayBlock: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.04)',
        marginBottom: 8,
    },
    displayText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20 },
    filesBlock: { marginBottom: 10 },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginTop: 6,
    },
    fileName: { flex: 1, color: '#fff', fontSize: 14 },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 12 },
    emptySub: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    emptyInline: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 12 },
    composeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    composeInput: {
        flex: 1,
        minHeight: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.06)',
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: 'rgba(15,74,118,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentCard: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 10,
    },
    commentAuthor: { color: '#fff', fontWeight: '700', fontSize: 14 },
    commentDate: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
    commentText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 6, lineHeight: 20 },
    queryCard: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 12,
        marginTop: 8,
    },
    queryAuthor: { color: '#fff', fontWeight: '700' },
    queryText: { color: 'rgba(255,255,255,0.9)', marginTop: 6, lineHeight: 20 },
    replyRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    replyInput: {
        flex: 1,
        minHeight: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#fff',
        paddingHorizontal: 10,
        fontSize: 14,
    },
    replyBubble: {
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    replyLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
    detailLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 16,
        marginTop: 8,
    },
    detailLinkText: { color: '#fff', fontWeight: '600' },
});
