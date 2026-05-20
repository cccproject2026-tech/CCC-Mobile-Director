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

export default function RoadmapMentorPastorsScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams<{ mentorId?: string }>();
    const mentorId = Array.isArray(params.mentorId) ? params.mentorId[0] : params.mentorId;

    const { mentor, mentees, isLoading, isError } = useMentorMentees(mentorId);

    const mentorName = mentor
        ? `${mentor.firstName ?? ''} ${mentor.lastName ?? ''}`.trim()
        : 'Mentor';

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
                </View>
            ) : isError ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>Failed to load pastors.</Text>
                </View>
            ) : mentees.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No assigned pastors for this mentor.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}>
                    <Text style={styles.hint}>
                        Tap a pastor to view their assigned roadmaps and task progress.
                    </Text>
                    {mentees.map((mentee) => (
                        <TouchableOpacity
                            key={mentee.id}
                            onPress={() => router.push(Routes.roadmaps.indexWithPastor(mentee.id))}
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
    errorText: { color: '#ff6b6b', fontWeight: '600' },
    emptyText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
    hint: { color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: 20 },
});
