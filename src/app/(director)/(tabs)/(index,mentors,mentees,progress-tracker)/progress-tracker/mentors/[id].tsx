// app/(director)/(tabs)/progress-tracker/mentors/[id].tsx
import MenteeProgressCard from '@/components/Cards/MenteeCard/MenteeProgressCard';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import { GradientBackground } from '@/components/ui/design-system';
import { useMentees } from '@/hooks/useMentees';
import { useUserProfile } from '@/hooks/useProfile';
import { Mentee } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    chatNotAvailableYet,
    dialPhone,
    featureNotAvailableYet,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';

type TabKey = 'all' | 'in-progress' | 'completed';

export default function MentorProgressTracker() {
    const router = useRouter();
    const { id: mentorIdParam } = useLocalSearchParams<{ id: string }>();
    const mentorId = Array.isArray(mentorIdParam) ? mentorIdParam[0] : mentorIdParam;

    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

    const { data: mentorProfile, isLoading: mentorLoading, isError: mentorError } = useUserProfile(mentorId);
    const { data: menteesData, isLoading: menteesLoading } = useMentees();
    const allMentees: Mentee[] = useMemo(() => menteesData?.pages.flatMap(page => page.mentees) ?? [], [menteesData]);

    const mentorData = mentorProfile;
    const assignedMenteeIds: string[] = Array.isArray(mentorData?.assignedId) ? mentorData.assignedId : [];

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setTimeout(() => bottomSheetModalRef.current?.present(), 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => setSelectedMentee(null), 300);
    }, []);

    const menuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({
                        pathname: '/(director)/(tabs)/mentors/mentor-mentees',
                        params: { id: mentorId ?? '' },
                    } as any);
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({
                        pathname: '/(director)/(tabs)/mentees/assign-mentors',
                        params: { id: selectedMentee?.id ?? '' },
                    } as any);
                }, 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({
                        pathname: '/(director)/(tabs)/mentees/remove-mentors',
                        params: { id: selectedMentee?.id ?? '' },
                    } as any);
                }, 300);
            },
        },
        { icon: 'person-add-outline', label: 'Assessments', onPress: () => router.push('/(director)/(tabs)/assessments' as any) },
        {
            icon: 'person-remove-outline',
            label: 'Assignments',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/assignments' as any), 300);
            },
        },
        {
            icon: 'clipboard-outline',
            label: 'Roadmaps of Mentees',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    if (!selectedMentee?.id) return;
                    router.push(`/(director)/(tabs)/mentees/${selectedMentee.id}/progress` as any);
                }, 300);
            },
        },
        {
            icon: 'checkmark-done-outline',
            label: 'Mentor Notes',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/mentees/notes' as any), 300);
            },
        },
        {
            icon: 'book-outline',
            label: 'View Progress Report',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/progress-tracker/report' as any), 300);
            },
        },
        {
            icon: 'stats-chart-outline',
            label: 'Micro Grant',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/micro-grant' as any), 300);
            },
        },
        {
            icon: 'calendar-outline',
            label: 'Product and Services',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/product-and-services' as any), 300);
            },
        },
    ];

    const tabs = [
        { key: 'all', label: 'All Mentees' },
        { key: 'in-progress', label: 'In Progress' },
        { key: 'completed', label: 'Completed' },
    ];

    const isLoading = menteesLoading || mentorLoading;

    const filteredMentees: Mentee[] = useMemo(() => {
        let list = allMentees;

        if (!assignedMenteeIds || assignedMenteeIds.length === 0) {
            return [];
        }

        list = list.filter(mentee => assignedMenteeIds.includes(mentee.id));

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(m => `${m.firstName} ${m.lastName ?? ''}`.toLowerCase().includes(q));
        }

        if (activeTab === 'completed') {
            list = list.filter(m => m.hasCompleted || m.progress === 100);
        } else if (activeTab === 'in-progress') {
            list = list.filter(m => !m.hasCompleted && (m.progress ?? 0) < 100);
        }

        return list;
    }, [allMentees, search, activeTab, assignedMenteeIds]);

    if (mentorError || (!mentorLoading && !mentorData)) {
        return (
            <GradientBackground>
                <View style={styles.pageRoot}>
                    <TopBar showUserName showNotifications />
                    <View style={styles.content}>
                        <View style={styles.centerState}>
                            <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.errorText}>Mentor not found</Text>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                                <Text style={styles.backBtnText}>Go Back</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <View style={styles.pageRoot}>
                <TopBar showUserName showNotifications />

                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
                            <View style={styles.backIconWrap}>
                                <Ionicons name="chevron-back" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>Progress Tracker</Text>
                                {mentorData && (
                                    <Text style={styles.headerSubtitle}>
                                        Mentor › {mentorData.firstName} {mentorData.lastName ?? ''} ({assignedMenteeIds.length} assigned)
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                            style={styles.iconButton}
                        >
                            <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <TabSwitcher
                        variant="frosted"
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={tabKey => setActiveTab(tabKey as TabKey)}
                    />

                    {/* List */}
                    {isLoading ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    ) : filteredMentees.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyText}>
                                {assignedMenteeIds.length === 0
                                    ? 'No mentees assigned to this mentor'
                                    : activeTab === 'completed'
                                        ? 'No completed mentees'
                                        : activeTab === 'in-progress'
                                            ? 'No mentees in progress'
                                            : 'No mentees found'}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {filteredMentees.map(mentee => (
                                <MenteeProgressCard
                                    key={mentee.id}
                                    data={mentee as Mentee}
                                    layout={viewMode}
                                    showMenu={true}
                                    onPress={() => router.push(`/(director)/(tabs)/mentees/${mentee.id}/progress` as any)}
                                    onCall={() => dialPhone(mentee.phoneNumber)}
                                    onChat={() => chatNotAvailableYet()}
                                    onMail={() => sendEmail(mentee.email)}
                                    onWhatsApp={() => openWhatsApp(mentee.phoneNumber)}
                                    onMenuPress={() => handleMenuPress(mentee)}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedMentee ? `${selectedMentee.firstName} ${selectedMentee.lastName ?? ''}` : ''}
                    image={selectedMentee?.profilePicture}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    pageRoot: { flex: 1 },
    content: { flex: 1, paddingTop: 24 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 14,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
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
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2, fontWeight: '500' },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
    centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    errorText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center' },
    backBtn: {
        paddingHorizontal: 24,
        paddingVertical: 11,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
    },
    backBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    emptyContainer: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '500', textAlign: 'center' },
});
