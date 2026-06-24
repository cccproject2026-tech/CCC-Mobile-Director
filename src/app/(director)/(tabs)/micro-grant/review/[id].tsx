import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '@/components/Header/TopBar';
import { GradientBackground } from '@/components/ui/design-system';
import { useMicroGrantApplicationDetails, useUpdateApplicationStatus } from '@/hooks/useMicroGrant';
import {
    MICROGRANT_CONFIRMATION_LABELS,
    MICROGRANT_PAGE_TITLE,
    displayNameFromMicrograntDetail,
    getMicrograntOtherNote,
    getMicrograntReportingProcedureItems,
} from '@/utils/microgrant';

const ApplicationReview = () => {
    const router = useRouter();
    const { id: routeSlug } = useLocalSearchParams();
    const { bottom } = useSafeAreaInsets();

    const { application, userProfile, isLoading, error } = useMicroGrantApplicationDetails(
        routeSlug as string,
    );
    const updateStatusMutation = useUpdateApplicationStatus();
    const statusApplicationId = application?.application._id;

    const otherNote = useMemo(
        () => getMicrograntOtherNote(application?.application?.answers),
        [application?.application?.answers],
    );

    const reportingItems = getMicrograntReportingProcedureItems();

    const handleReject = () => {
        if (!statusApplicationId) return;
        updateStatusMutation.mutate(
            { applicationId: statusApplicationId, status: 'rejected' },
            { onSuccess: () => router.push('/(director)/(tabs)/micro-grant') },
        );
    };

    const handleAccept = () => {
        if (!statusApplicationId) return;
        updateStatusMutation.mutate(
            { applicationId: statusApplicationId, status: 'accepted' },
            { onSuccess: () => router.push('/(director)/(tabs)/micro-grant') },
        );
    };

    const handleAddToPending = () => {
        if (!statusApplicationId) return;
        updateStatusMutation.mutate(
            { applicationId: statusApplicationId, status: 'pending' },
            { onSuccess: () => router.push('/(director)/(tabs)/micro-grant') },
        );
    };

    if (isLoading) {
        return (
            <GradientBackground>
                <TopBar notifications={3} showUserName={true} showNotifications={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading application...</Text>
                </View>
            </GradientBackground>
        );
    }

    if (!application || error) {
        return (
            <GradientBackground>
                <TopBar notifications={3} showUserName={true} showNotifications={true} />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Application not found</Text>
                </View>
            </GradientBackground>
        );
    }

    const userName = displayNameFromMicrograntDetail(application, userProfile);

    return (
        <GradientBackground>
            <TopBar notifications={3} showUserName={true} showNotifications={true} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{MICROGRANT_PAGE_TITLE}</Text>
                </View>

                <View style={styles.applicantBanner}>
                    <Text style={styles.applicantLabel}>Applicant</Text>
                    <Text style={styles.applicantName}>{userName}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Reporting Procedures</Text>
                </View>

                <View style={styles.proceduresBox}>
                    {reportingItems.map((text) => (
                        <ProcedureItem key={text} text={text} />
                    ))}
                </View>

                <View style={styles.reviewBox}>
                    <Text style={styles.reviewTitle}>
                        Pastor confirmations submitted with this application
                    </Text>

                    <ReadOnlyConfirmation label={MICROGRANT_CONFIRMATION_LABELS.reviewed} />
                    <ReadOnlyConfirmation label={MICROGRANT_CONFIRMATION_LABELS.uploadsIncluded} />

                    {otherNote ? (
                        <View style={styles.otherNoteBox}>
                            <Text style={styles.otherNoteLabel}>Other notes from pastor</Text>
                            <Text style={styles.otherNoteText}>{otherNote}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={handleReject}
                        disabled={updateStatusMutation.isPending}
                    >
                        {updateStatusMutation.isPending ? (
                            <ActivityIndicator size="small" color="#1a5b77" />
                        ) : (
                            <Text style={styles.rejectBtnText}>REJECT</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={handleAccept}
                        disabled={updateStatusMutation.isPending}
                    >
                        {updateStatusMutation.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.acceptBtnText}>ACCEPT</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.pendingBtn}
                    onPress={handleAddToPending}
                    disabled={updateStatusMutation.isPending}
                >
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                    <Text style={styles.pendingBtnText}>Add to Pending</Text>
                </TouchableOpacity>
            </ScrollView>
        </GradientBackground>
    );
};

const ProcedureItem = ({ text }: { text: string }) => (
    <View style={styles.procedureItem}>
        <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
        <Text style={styles.procedureText}>{text}</Text>
    </View>
);

const ReadOnlyConfirmation = ({ label }: { label: string }) => (
    <View style={styles.confirmationRow}>
        <View style={styles.checkboxChecked}>
            <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
        <Text style={styles.confirmationLabel}>{label}</Text>
    </View>
);

export default ApplicationReview;

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        color: '#fff',
        fontSize: 16,
    },
    titleContainer: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 24,
    },
    applicantBanner: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
    },
    applicantLabel: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    applicantName: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    section: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    proceduresBox: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
        gap: 16,
    },
    procedureItem: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    starIcon: {
        marginTop: 3,
    },
    procedureText: {
        color: '#fff',
        fontSize: 13,
        lineHeight: 20,
        flex: 1,
    },
    reviewBox: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
    },
    reviewTitle: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
        fontWeight: '600',
    },
    confirmationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 14,
    },
    checkboxChecked: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#41B36E',
        borderColor: '#41B36E',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    confirmationLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        flex: 1,
        lineHeight: 20,
    },
    otherNoteBox: {
        marginTop: 4,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: 12,
    },
    otherNoteLabel: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 12,
        marginBottom: 6,
        fontWeight: '600',
    },
    otherNoteText: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    rejectBtn: {
        backgroundColor: '#fff',
    },
    acceptBtn: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#fff',
    },
    rejectBtnText: {
        color: '#1a5b77',
        fontSize: 15,
        fontWeight: '700',
    },
    acceptBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    pendingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
        marginBottom: 20,
    },
    pendingBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
