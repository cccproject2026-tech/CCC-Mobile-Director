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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GradientBackground } from '@/components/ui/design-system';
import TopBar from '@/components/Header/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import {
    useAssessments,
    useAssignedAssessmentsForUser,
    useDeleteAssessmentMutation
} from '@/hooks/useAssessments';
import { useMentees } from '@/hooks/useMentees';
import { useMentors } from '@/hooks/useMentors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AssessmentCard from '@/components/Cards/AssessmentCard';
import { RefreshControl } from 'react-native-gesture-handler';
import { Routes } from '@/navigation/routes';
import { ApiAssessment, AssignedAssessmentView } from '@/types/assessment.types';
import { Mentor } from '@/types/user.types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import ActionBottomSheet, { ActionItem } from '@/components/Sheets/ActionBottomSheet';
type MainTab = 'library' | 'assigned' | 'mentor';
type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'completed';

const STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'not_started', label: 'Not Started' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
];

export default function AssessmentsScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const deleteAssessmentMutation = useDeleteAssessmentMutation();
    const params = useLocalSearchParams<{ tab?: string; assignUser?: string }>();

    const initialTab = (params.tab as MainTab) || 'library';
    const initialPastor = params.assignUser ?? '';

    const [mainTab, setMainTab] = useState<MainTab>(
        ['library', 'assigned', 'mentor'].includes(initialTab) ? initialTab : 'library',
    );
    const [search, setSearch] = useState('');
    const [selectedPastorId, setSelectedPastorId] = useState<string>(
        typeof initialPastor === 'string' ? initialPastor : '',
    );
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [menuAssessment, setMenuAssessment] = useState<ApiAssessment | null>(null);
    const [menuOpenSeq, setMenuOpenSeq] = useState(0);
    const [menuSheetEpoch, setMenuSheetEpoch] = useState(0);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    useEffect(() => {
        if (params.tab && ['library', 'assigned', 'mentor'].includes(params.tab)) {
            setMainTab(params.tab as MainTab);
        }
        if (params.assignUser && typeof params.assignUser === 'string') {
            setSelectedPastorId(params.assignUser);
        }
    }, [params.tab, params.assignUser]);

    const {
        data: libraryAssessments,
        isLoading: libraryLoading,
        error: libraryError,
        refetch: refetchLibrary,
        isFetching: libraryFetching,
    } = useAssessments();

    const {
        data: assignedAssessments,
        isLoading: assignedLoading,
        error: assignedError,
        refetch: refetchAssigned,
        isFetching: assignedFetching,
    } = useAssignedAssessmentsForUser(selectedPastorId || undefined);

    const { data: menteesData, isLoading: menteesLoading } = useMentees(50);
    const pastors = useMemo(
        () => menteesData?.pages.flatMap((p) => p.mentees) ?? [],
        [menteesData],
    );

    const { data: mentorsData, isLoading: mentorsLoading } = useMentors(20);
    const mentors = useMemo(
        () => mentorsData?.pages.flatMap((p) => p.mentors) ?? [],
        [mentorsData],
    );

    const filteredLibrary = useMemo(() => {
        if (!libraryAssessments) return [];
        const q = search.toLowerCase().trim();
        if (!q) return libraryAssessments;
        return libraryAssessments.filter(
            (a) =>
                a.name?.toLowerCase().includes(q) ||
                a.description?.toLowerCase().includes(q) ||
                a.type?.toLowerCase().includes(q),
        );
    }, [libraryAssessments, search]);

    const filteredPastors = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return pastors;
        return pastors.filter(
            (p) =>
                p.firstName?.toLowerCase().includes(q) ||
                p.lastName?.toLowerCase().includes(q) ||
                p.email?.toLowerCase().includes(q) ||
                `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase().includes(q),
        );
    }, [pastors, search]);

    const filteredAssigned = useMemo(() => {
        const list = assignedAssessments ?? [];
        if (statusFilter === 'all') return list;
        return list.filter((a) => {
            const s = a.progressStatus ?? 'not_started';
            if (statusFilter === 'completed') return s === 'completed' || s === 'submitted';
            if (statusFilter === 'in_progress') return s === 'submitted';
            return s === 'not_started';
        });
    }, [assignedAssessments, statusFilter]);

    const filteredMentors = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return mentors;
        return mentors.filter(
            (m) =>
                m.firstName?.toLowerCase().includes(q) ||
                m.lastName?.toLowerCase().includes(q) ||
                m.email?.toLowerCase().includes(q),
        );
    }, [mentors, search]);

    const selectedPastorName = useMemo(() => {
        const pastor = pastors.find((p) => p.id === selectedPastorId);
        if (!pastor) return 'this user';
        return `${pastor.firstName ?? ''} ${pastor.lastName ?? ''}`.trim() || pastor.email || 'this user';
    }, [pastors, selectedPastorId]);

    const handleRemoveAssignedAssessment = useCallback(
        (assessment: AssignedAssessmentView) => {
            const assessmentName =
                assessment.name ?? (assessment as { title?: string }).title ?? 'this assessment';

            Alert.alert(
                'Remove Assessment',
                `Do you want to remove "${assessmentName}" from ${selectedPastorName}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                            // TODO: integrate unassign API when backend is ready
                        },
                    },
                ],
            );
        },
        [selectedPastorName],
    );

    const onRefresh = useCallback(() => {
        if (mainTab === 'library') refetchLibrary();
        else if (mainTab === 'assigned' && selectedPastorId) refetchAssigned();
    }, [mainTab, refetchLibrary, refetchAssigned, selectedPastorId]);

    const handleAssignedPress = (assessment: AssignedAssessmentView) => {
        const id = assessment._id;
        const submitted =
            assessment.progressStatus === 'submitted' ||
            assessment.progressStatus === 'completed';
        if (submitted && selectedPastorId) {
            router.push(Routes.assessments.resultFor(id, selectedPastorId));
        } else {
            router.push(Routes.assessments.detail(id));
        }
    };

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, []);

    const handleSheetDismissed = useCallback(() => {
        setMenuAssessment(null);
        setMenuSheetEpoch((key) => key + 1);
    }, []);

    const buildMenuItems = useCallback(
        (assessment: ApiAssessment): ActionItem[] => {
            const assessmentId = assessment._id;
            const assessmentName = assessment.name ?? (assessment as { title?: string }).title ?? 'Assessment';
            const afterClose = (action: () => void) => {
                handleCloseModal();
                setTimeout(action, 200);
            };

            return [
                {
                    icon: 'create-outline',
                    label: 'Edit Assessment',
                    onPress: () =>
                        afterClose(() =>
                            router.push({
                                pathname: '/assessments/[id]',
                                params: { id: assessmentId },
                            }),
                        ),
                },
                {
                    icon: 'person-add-outline',
                    label: 'Assign to',
                    onPress: () =>
                        afterClose(() =>
                            router.push({
                                pathname: '/(director)/(tabs)/assessments/assign-assessments',
                                params: { assessmentIds: assessmentId },
                            }),
                        ),
                },
                {
                    icon: 'trash-outline',
                    label: 'Delete Assessment',
                    onPress: () => {
                        handleCloseModal();
                        Alert.alert(
                            'Delete Assessment',
                            `Are you sure you want to delete "${assessmentName}"?`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await deleteAssessmentMutation.mutateAsync(assessmentId);
                                            Alert.alert('Success', 'Assessment deleted successfully.');
                                        } catch {
                                            Alert.alert('Error', 'Failed to delete assessment.');
                                        }
                                    },
                                },
                            ],
                        );
                    },
                },
            ];
        },
        [deleteAssessmentMutation, handleCloseModal, router],
    );

    const sheetActions = useMemo(
        () => (menuAssessment ? buildMenuItems(menuAssessment) : []),
        [buildMenuItems, menuAssessment],
    );

    const handleAssessmentMenuPress = useCallback((assessment: ApiAssessment) => {
        setMenuAssessment(assessment);
        setMenuOpenSeq((seq) => seq + 1);
    }, []);

    useEffect(() => {
        if (!menuAssessment) return;
        const task = InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                bottomSheetModalRef.current?.present();
            });
        });
        return () => task.cancel();
    }, [menuAssessment?._id, menuOpenSeq]);

    const isRefreshing =
        (mainTab === 'library' && libraryFetching) ||
        (mainTab === 'assigned' && assignedFetching);

    const renderLoading = (msg: string) => (
        <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>{msg}</Text>
        </View>
    );

    const renderError = (msg: string) => (
        <View style={styles.centerBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>{msg}</Text>
        </View>
    );

    const renderEmpty = (msg: string) => (
        <View style={styles.centerBox}>
            <Ionicons name="document-text-outline" size={56} color="#fff" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>{msg}</Text>
        </View>
    );

    const renderPastorPicker = () => {
        if (filteredPastors.length === 0) {
            return (
                <Text style={styles.hintText}>
                    {search.trim()
                        ? 'No pastors found matching your search.'
                        : 'No pastors available.'}
                </Text>
            );
        }

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pastorPicker}>
                {filteredPastors.map((p) => {
                    const active = p.id === selectedPastorId;
                    const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.email;
                    return (
                        <TouchableOpacity
                            key={p.id}
                            style={[styles.pastorChip, active && styles.pastorChipActive]}
                            onPress={() => setSelectedPastorId(p.id)}
                        >
                            <Text style={[styles.pastorChipText, active && styles.pastorChipTextActive]}>
                                {name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        );
    };

    const renderLibrary = () => {
        if (libraryLoading) return renderLoading('Loading assessments...');
        if (libraryError) return renderError('Failed to load assessments');
        if (filteredLibrary.length === 0) {
            return renderEmpty(
                search.trim()
                    ? 'No assessments found matching your search.'
                    : 'No assessments in library.',
            );
        }
        return (
            <>
                <Text style={styles.countText}>
                    {filteredLibrary.length} assessment{filteredLibrary.length === 1 ? '' : 's'}
                </Text>
                {filteredLibrary.map((assessment) => (
                    <AssessmentCard
                        key={assessment._id}
                        data={assessment}
                        showMenu
                        onPress={() => router.push(Routes.assessments.detail(assessment._id))}
                        onMenuPress={() => handleAssessmentMenuPress(assessment)}
                    />
                ))}
            </>
        );
    };

    const renderAssigned = () => {
        if (menteesLoading) return renderLoading('Loading pastors...');
        if (!selectedPastorId) {
            return (
                <>
                    <Text style={styles.hintText}>Select a pastor to view assigned assessments.</Text>
                    {renderPastorPicker()}
                </>
            );
        }
        if (assignedLoading) return renderLoading('Loading assigned assessments...');
        if (assignedError) return renderError('Failed to load assigned assessments');
        return (
            <>
                {renderPastorPicker()}
                <TabSwitcher
                    tabs={STATUS_TABS}
                    activeTab={statusFilter}
                    onChange={(k) => setStatusFilter(k as StatusFilter)}
                    variant="frosted"
                />
                {filteredAssigned.length === 0 ? (
                    renderEmpty('No assessments assigned to this pastor.')
                ) : (
                    <>
                        <Text style={styles.countText}>{filteredAssigned.length} assigned</Text>
                        {filteredAssigned.map((assessment) => (
                            <AssessmentCard
                                key={`${assessment._id}-${assessment.assignmentId ?? ''}`}
                                data={assessment}
                                showRemove
                                onPress={() => handleAssignedPress(assessment)}
                                onRemovePress={() => handleRemoveAssignedAssessment(assessment)}
                            />
                        ))}
                    </>
                )}
            </>
        );
    };

    const renderMentor = () => {
        if (mentorsLoading) return renderLoading('Loading mentors...');
        if (filteredMentors.length === 0) return renderEmpty('No mentors found.');
        return (
            <>
                <Text style={styles.hintText}>
                    Select a mentor to view their assigned pastors and assessments.
                </Text>
                {filteredMentors.map((mentor: Mentor) => (
                    <TouchableOpacity
                        key={mentor.id}
                        style={styles.mentorRow}
                        onPress={() => router.push(Routes.assessments.mentorPastorsFor(mentor.id))}
                    >
                        <View style={styles.mentorAvatar}>
                            <Ionicons name="person" size={22} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.mentorName}>
                                {`${mentor.firstName ?? ''} ${mentor.lastName ?? ''}`.trim()}
                            </Text>
                            <Text style={styles.mentorEmail}>{mentor.email}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                ))}
            </>
        );
    };

    return (
        <GradientBackground>
            <TopBar showUserName showNotifications />

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
                        onPress={() => router.push(Routes.assessments.select)}
                    >
                        <Ionicons name="checkmark-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push(Routes.assessments.create)}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <SearchBar
                    value={search}
                    onChangeValue={setSearch}
                    placeholder={
                        mainTab === 'assigned'
                            ? 'Search pastors...'
                            : mainTab === 'mentor'
                              ? 'Search mentors...'
                              : 'Search assessments...'
                    }
                />
            </View>

            <View style={styles.mainTabs}>
                <TabSwitcher
                    tabs={[
                        { key: 'library', label: 'Library' },
                        { key: 'assigned', label: 'Assigned' },
                        { key: 'mentor', label: 'Mentor View' },
                    ]}
                    activeTab={mainTab}
                    onChange={(k) => setMainTab(k as MainTab)}
                    variant="frosted"
               
                />
            </View>

            <View style={styles.content}>
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        mainTab !== 'mentor' ? (
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                                tintColor="#fff"
                                colors={['#1D548D']}
                            />
                        ) : undefined
                    }
                >
                    {mainTab === 'library' && renderLibrary()}
                    {mainTab === 'assigned' && renderAssigned()}
                    {mainTab === 'mentor' && renderMentor()}
                </ScrollView>
            </View>
            <ActionBottomSheet
                key={`assessment-menu-${menuSheetEpoch}`}
                ref={bottomSheetModalRef}
                title={
                    menuAssessment?.name ||
                    (menuAssessment as { title?: string } | null)?.title ||
                    'Assessment'
                }
                subtitle={menuAssessment?.type || ''}
                image={menuAssessment?.bannerImage}
                actions={sheetActions}
                onClose={handleCloseModal}
                onDismissed={handleSheetDismissed}
            />
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    backIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    headerButtons: { flexDirection: 'row', gap: 8 },
    iconButton: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    mainTabs: { paddingHorizontal: 16, marginTop: 4, },
    content: { flex: 1,marginTop:-4 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 0 },
    countText: { color: '#fff', fontSize: 14, fontWeight: '600', opacity: 0.8, marginBottom: 8 },
    hintText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    centerBox: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: { color: '#fff', marginTop: 16, fontSize: 16 },
    errorText: { color: '#ff6b6b', marginTop: 16, fontSize: 16, fontWeight: '600' },
    emptyText: { color: '#fff', marginTop: 16, fontSize: 16, textAlign: 'center', opacity: 0.7 },
    pastorPicker: { marginBottom: 12, maxHeight: 44 },
    pastorChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    pastorChipActive: {
        backgroundColor: 'rgba(94,179,209,0.35)',
        borderColor: 'rgba(94,179,209,0.6)',
    },
    pastorChipText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
    pastorChipTextActive: { color: '#fff' },
    mentorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        marginBottom: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        gap: 12,
    },
    mentorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mentorName: { color: '#fff', fontSize: 16, fontWeight: '700' },
    mentorEmail: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },
});
