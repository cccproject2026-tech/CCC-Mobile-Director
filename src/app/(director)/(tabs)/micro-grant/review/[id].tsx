

import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import TopBar from '@/components/Header/TopBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useMicroGrantApplicationDetails, useUpdateApplicationStatus } from '@/hooks/useMicroGrant';

const ApplicationReview = () => {
    const router = useRouter();
    const { id: applicationId } = useLocalSearchParams();
    const { bottom } = useSafeAreaInsets();

    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const { application, userProfile, isLoading, error } = useMicroGrantApplicationDetails(applicationId as string);
    const updateStatusMutation = useUpdateApplicationStatus();


    console.log('Application Id: ', application?.application._id);
    const handleCheckboxToggle = (option: string) => {
        setSelectedOptions(prev =>
            prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
        );
    };


    const handleReject = () => {
        updateStatusMutation.mutate(
            { userId: application?.application._id as string, status: 'pending' },
            { onSuccess: () => router.push('/micro-grant') }
        );
    };

    const handleAccept = () => {
        updateStatusMutation.mutate(
            { userId: application?.application._id as string, status: 'accepted' },
            { onSuccess: () => router.push('/micro-grant') }
        );
    };

    const handleAddToPending = () => {
        updateStatusMutation.mutate(
            { userId: application?.application._id as string, status: 'pending' },
            { onSuccess: () => router.push('/micro-grant') }
        );
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <TopBar notifications={3} showUserName={true} showNotifications={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading application...</Text>
                </View>
            </LinearGradient>
        );
    }

    if (!application || error) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <TopBar notifications={3} showUserName={true} showNotifications={true} />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Application not found</Text>
                </View>
            </LinearGradient>
        );
    }

    const userName = `${userProfile?.firstName || 'Unknown'} ${userProfile?.lastName || 'User'}`.trim();
    const role = userProfile?.role || 'Pastor';
    const profilePicture = userProfile?.profilePicture;

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
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
                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {application.application.formId?.title || 'The Center for Community Change Micro-Grant Application'}
                    </Text>
                </View>

                {/* Reporting Procedures Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Reporting Procedures</Text>
                </View>

                <View style={styles.proceduresBox}>
                    <ProcedureItem text="Upon approval, a grant agreement will be signed based on the submitted Action Steps—the CCC may modify, suspend, or stop payment of grant funds if the terms of the agreement are changed or not followed." />
                    <ProcedureItem text="Upon completion of the project, the grantee must submit a grant report regarding the use of funds consisting of a narrative report and financial accounting—the report ought to include copies of relevant receipts and records of expenditures." />
                    <ProcedureItem text="Any grant funds that have not been used for, or committed to, the project upon expiration or termination of the grant agreement must be returned to the CCC." />
                </View>

                {/* Review Section */}
                <View style={styles.reviewBox}>
                    <Text style={styles.reviewTitle}>
                        Please review the grant application thoroughly before submission and ensure that all required sections are completed accurately
                    </Text>

                    <CheckboxItem
                        label="I have reviewed the application and filled out each the section to the best of my knowledge"
                        checked={selectedOptions.includes('reviewed')}
                        onToggle={() => handleCheckboxToggle('reviewed')}
                    />
                    <CheckboxItem
                        label="I have filled out the application, and I would like to discuss it with a center's director"
                        checked={selectedOptions.includes('discuss')}
                        onToggle={() => handleCheckboxToggle('discuss')}
                    />
                    <CheckboxItem
                        label="Other: Lorem ipsum dolor sit amet"
                        checked={selectedOptions.includes('other')}
                        onToggle={() => handleCheckboxToggle('other')}
                    />
                </View>

                {/* Action Buttons */}
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

                {/* Add to Pending Button */}
                <TouchableOpacity style={styles.pendingBtn} onPress={handleAddToPending} disabled={updateStatusMutation.isPending}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                    <Text style={styles.pendingBtnText}>Add to Pending</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
};

const ProcedureItem = ({ text }: { text: string }) => (
    <View style={styles.procedureItem}>
        <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
        <Text style={styles.procedureText}>{text}</Text>
    </View>
);

const CheckboxItem = ({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
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
    errorText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    titleContainer: {
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24,
    },
    userCard: {
        backgroundColor: 'rgba(23, 97, 146, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    userRole: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 8,
    },
    actionIconsInCard: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    applicationDate: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    viewProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    viewProfileText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    section: {
        backgroundColor: 'rgba(23, 97, 146, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    sectionSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        lineHeight: 20,
    },
    questionBox: {
        backgroundColor: 'rgba(23, 97, 146, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 16,
    },
    questionLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    questionHint: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginBottom: 12,
    },
    answerBox: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: 12,
    },
    answerText: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        marginTop: 12,
        marginBottom: 8,
    },
    downloadText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    fileHint: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        textAlign: 'center',
    },
    proceduresBox: {
        backgroundColor: 'rgba(23, 97, 146, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
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
        backgroundColor: 'rgba(23, 97, 146, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 16,
    },
    reviewTitle: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    checkboxLabel: {
        color: '#fff',
        fontSize: 13,
        flex: 1,
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
