// app/(director)/(tabs)/micro-grant/[id].tsx
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import TopBar from '@/components/Header/TopBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useMicroGrantApplicationDetails } from '@/hooks/useMicroGrant';

const ApplicationDetails = () => {
    const router = useRouter();
    const { id: applicationId } = useLocalSearchParams();
    const { bottom } = useSafeAreaInsets();

    const { application, userProfile, isLoading, error } = useMicroGrantApplicationDetails(applicationId as string);

    const handleViewProfile = () => {
        console.log('View Profile clicked', application?.application.userId);
        if (application?.application.userId) {
            router.push(`/mentees/${application.application.userId}`);
        }
    };

    const handleNext = () => {
        router.push(`/micro-grant/review/${applicationId}`);
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
                    {error && <Text style={styles.errorText}>{(error as Error).message}</Text>}
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

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {application.application.formId?.title || 'The Center for Community Change Micro-Grant Application'}
                    </Text>
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
        </LinearGradient>
    );
};

export default ApplicationDetails;

const styles = StyleSheet.create({
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
    nextBtn: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    nextBtnText: {
        color: '#1a5b77',
        fontSize: 15,
        fontWeight: '700',
    },
});
