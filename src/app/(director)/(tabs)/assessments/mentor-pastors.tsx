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
import { useMentorMentees } from '@/hooks/useMentors';
import { Routes } from '@/navigation/routes';
import MenteeCard from '@/components/Cards/MenteeCard';

export default function MentorPastorsScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams<{ mentorId?: string }>();
    const mentorId = Array.isArray(params.mentorId) ? params.mentorId[0] : params.mentorId;

    const { mentor, mentees, isLoading, isError } = useMentorMentees(mentorId);

    const mentorName = mentor
        ? `${mentor.firstName ?? ''} ${mentor.lastName ?? ''}`.trim()
        : 'Mentor';

    const handlePastorPress = (pastorId: string) => {
        router.push(Routes.assessments.indexWithPastor(pastorId));
    };

    return (
        <GradientBackground>
            <TopBar showUserName />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>Mentor Pastors</Text>
                        <Text style={styles.headerSub}>{mentorName}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading pastors...</Text>
                </View>
            ) : isError ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>Failed to load mentor pastors</Text>
                </View>
            ) : mentees.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="people-outline" size={56} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.emptyText}>No assigned pastors for this mentor.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}>
                    <Text style={styles.hint}>
                        Showing {mentees.length} pastor{mentees.length === 1 ? '' : 's'} assigned to{' '}
                        {mentorName}. Tap to view assigned assessments.
                    </Text>
                    {mentees.map((mentee) => (
                        <TouchableOpacity
                            key={mentee.id}
                            onPress={() => handlePastorPress(mentee.id)}
                            activeOpacity={0.85}
                        >
                            <MenteeCard data={mentee} showMenu={false} layout="card" />
                        </TouchableOpacity>
                    ))}
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
    errorText: { color: '#ff6b6b', fontWeight: '600' },
    emptyText: { color: 'rgba(255,255,255,0.7)', marginTop: 12, textAlign: 'center' },
    hint: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
});
