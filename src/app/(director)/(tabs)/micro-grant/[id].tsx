// app/(director)/(tabs)/micro-grant/[id].tsx
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import TopBar from '@/components/Header/TopBar';
import { GradientBackground } from '@/components/ui/design-system';
import { useMicroGrantApplicationDetails } from '@/hooks/useMicroGrant';
import {
    MICROGRANT_PAGE_TITLE,
    displayNameFromMicrograntDetail,
} from '@/utils/microgrant';

const ApplicationDetails = () => {
    const router = useRouter();
    const { id: userId } = useLocalSearchParams();
    const { bottom } = useSafeAreaInsets();

    const { application, userProfile, isLoading, error } = useMicroGrantApplicationDetails(userId as string);

    const handleViewProfile = () => {
        if (application?.application.userId) {
            router.push(`/(director)/(tabs)/mentees/${application.application.userId}` as any);
        }
    };

    const handleNext = () => {
        if (!userId) return;
        router.push(`/(director)/(tabs)/micro-grant/review/${userId}` as any);
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
                    <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.emptyText}>Application not found</Text>
                    {error && <Text style={styles.errorText}>{(error as Error).message}</Text>}
                </View>
            </GradientBackground>
        );
    }

    const userName = displayNameFromMicrograntDetail(application, userProfile);
    const role = userProfile?.role || application.user?.role || 'Pastor';
    const profilePicture = userProfile?.profilePicture;

    return (
        <GradientBackground>
            <TopBar notifications={3} showUserName={true} showNotifications={true} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{MICROGRANT_PAGE_TITLE}</Text>
                </View>

                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarCircle}>
                        {profilePicture ? (
                            <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person-outline" size={24} color="#EAF7FF" />
                        )}
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.userRole}>{role}</Text>
                        <View style={styles.actionIconsInCard}>
                            <Ionicons name="call-outline" size={16} color="#EAF7FF" />
                            <MaterialCommunityIcons name="message-outline" size={16} color="#EAF7FF" />
                            <MaterialIcons name="mail-outline" size={16} color="#EAF7FF" />
                            <Ionicons name="logo-whatsapp" size={16} color="#EAF7FF" />
                        </View>
                        <Text style={styles.applicationDate}>
                            Application received on {new Date(application.application.createdAt).toLocaleDateString('en-US')}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.viewProfileBtn} onPress={handleViewProfile}>
                        <Text style={styles.viewProfileText}>View Profile</Text>
                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Cover Sheet Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Cover Sheet</Text>
                    <Text style={styles.sectionSubtitle}>
                        Please answer the questions succinctly following Prompts
                    </Text>
                </View>

                {/* Questions and Answers */}
                {Object.entries(application.application.answers || {}).map(([question, answer], index) => (
                    <View key={index} style={styles.questionBox}>
                        <Text style={styles.questionLabel}>{question} *</Text>
                        <Text style={styles.questionHint}>
                            [{typeof answer === 'string' ? answer.substring(0, 50) : ''}...]
                        </Text>
                        <View style={styles.answerBox}>
                            <Text style={styles.answerText}>{answer as string}</Text>
                        </View>
                    </View>
                ))}

                {/* Download File Section */}
                <View style={styles.questionBox}>
                    <Text style={styles.questionLabel}>
                        Please upload here any supporting documents or media (photos, videos, publications, etc.)
                    </Text>
                    <TouchableOpacity style={styles.downloadBtn}>
                        <Ionicons name="download-outline" size={20} color="#fff" />
                        <Text style={styles.downloadText}>Download File</Text>
                    </TouchableOpacity>
                    <Text style={styles.fileHint}>
                        [Upload up to 10 supported files. Max 100 MB per file.]
                    </Text>
                </View>

                {/* Next Button */}
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                    <Text style={styles.nextBtnText}>Next</Text>
                </TouchableOpacity>
            </ScrollView>
        </GradientBackground>
    );
};

export default ApplicationDetails;

const styles = StyleSheet.create({
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 12, fontSize: 14 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 12 },
    emptyText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
    errorText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center' },
    titleContainer: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    title: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 24 },
    userCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    avatarCircle: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    userInfo: { flex: 1 },
    userName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 3 },
    userRole: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 8 },
    actionIconsInCard: { flexDirection: 'row', gap: 14, marginBottom: 8 },
    applicationDate: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
    viewProfileBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.10)',
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 9, gap: 4,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    },
    viewProfileText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    section: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
    },
    sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    sectionSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 20 },
    questionBox: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
    },
    questionLabel: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 8 },
    questionHint: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 12 },
    answerBox: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 },
    answerText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20 },
    downloadBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.10)',
        paddingVertical: 11, paddingHorizontal: 16,
        borderRadius: 10, gap: 8,
        marginTop: 12, marginBottom: 8,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    },
    downloadText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    fileHint: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center' },
    nextBtn: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingVertical: 14, borderRadius: 12,
        alignItems: 'center', marginBottom: 20,
    },
    nextBtnText: { color: '#0E5A62', fontSize: 15, fontWeight: '800' },
});
