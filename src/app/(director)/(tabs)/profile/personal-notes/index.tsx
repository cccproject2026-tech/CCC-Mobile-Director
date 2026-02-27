import { ApiNote, NotesService } from '@/services/notes.service';
import { useNotesStore } from '@/stores/notes.store';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';

interface UINote {
    id: string;
    content: string;
    date: string;
    time: string;
    preview: string;
}

export default function PersonalNotesScreen() {
    const { user } = useAuthStore();
    const userId = (user as { id?: string; _id?: string })?.id ?? (user as { _id?: string })?._id;
    const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Personal Notes';
    const [activeTab, setActiveTab] = useState<'new' | 'previous'>('previous');
    const [notes, setNotes] = useState<UINote[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotes = useCallback(async (cacheBust = true) => {
        if (!userId) return;
        setLoading(true);
        try {
            const apiNotes: ApiNote[] = await NotesService.getNotes(userId, { cacheBust });
            const mapped = apiNotes.map((n) => {
                const noteId = n._id ?? (n as ApiNote & { id?: string }).id ?? '';
                const created = n.createdAt ? new Date(n.createdAt) : new Date();
                const date = created.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit',
                });
                const time = created.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const preview = (n.content || '')
                    .replace(/<(.|\n)*?>/g, '')
                    .substring(0, 200);
                return {
                    id: noteId,
                    content: n.content,
                    date,
                    time,
                    preview,
                } as UINote;
            });
            setNotes(mapped);
        } catch (err) {
            console.warn('Failed to fetch personal notes', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const invalidationKey = useNotesStore((s) => s.invalidationKey);

    useFocusEffect(
        useCallback(() => {
            fetchNotes(true);
        }, [fetchNotes])
    );

    useEffect(() => {
        if (userId && invalidationKey > 0) {
            fetchNotes(true);
        }
    }, [userId, invalidationKey, fetchNotes]);

    const handleNotePress = (note: UINote) => {
        router.push({
            pathname: '/(director)/(tabs)/profile/personal-notes/note-detail',
            params: {
                noteId: note.id,
                userId,
                userName,
            },
        });
    };

    const handleNewNote = () => {
        router.push({
            pathname: '/(director)/(tabs)/profile/personal-notes/new-note',
            params: {
                userName,
                userId,
            },
        });
    };

    return (
        <LinearGradient
            colors={['#1A3A6B', '#2B5A8E', '#1A3A6B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <View style={styles.profileBadge}>
                                <Text style={styles.profileName}>Personal Notes</Text>
                            </View>
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.tabButton,
                            activeTab === 'new' ? styles.tabButtonActive : styles.tabButtonInactive,
                        ]}
                        onPress={handleNewNote}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'new' ? styles.tabTextActive : styles.tabTextInactive,
                            ]}
                        >
                            New
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.tabButton,
                            activeTab === 'previous' ? styles.tabButtonActive : styles.tabButtonInactive,
                        ]}
                        onPress={() => setActiveTab('previous')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'previous' ? styles.tabTextActive : styles.tabTextInactive,
                            ]}
                        >
                            Previous
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Loading notes...</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {notes.map((note) => (
                            <TouchableOpacity
                                key={note.id}
                                activeOpacity={0.85}
                                style={styles.noteCard}
                                onPress={() => handleNotePress(note)}
                            >
                                <View style={styles.noteContent}>
                                    <Text style={styles.notePreview} numberOfLines={3}>
                                        {note.preview}
                                    </Text>
                                    <View style={styles.noteFooter}>
                                        <Text style={styles.noteDate}>{note.date}</Text>
                                        <Text style={styles.noteTime}>{note.time}</Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={24}
                                    color="rgba(255,255,255,0.6)"
                                    style={styles.chevron}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    profileBadge: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    profileName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    headerRight: { width: 40 },
    tabContainer: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonActive: { backgroundColor: '#FFFFFF' },
    tabButtonInactive: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
    tabText: { fontSize: 16, fontWeight: '600' },
    tabTextActive: { color: '#1A3A6B' },
    tabTextInactive: { color: '#FFFFFF' },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: 'rgba(255,255,255,0.9)', fontSize: 16 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        padding: 20,
        marginBottom: 16,
        gap: 12,
    },
    noteContent: { flex: 1 },
    notePreview: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    noteFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    noteDate: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, fontWeight: '500' },
    noteTime: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, fontWeight: '500' },
    chevron: { marginLeft: 8 },
});
