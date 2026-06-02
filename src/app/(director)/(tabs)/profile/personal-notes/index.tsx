import { ApiNote, NotesService } from '@/services/notes.service';
import { useNotesStore } from '@/stores/notes.store';
import { useAuthStore } from '@/stores/auth.store';
import {
    GradientBackground,
    homeLayout,
    roadmapTheme,
    ScreenBackHeader,
} from '@/components/ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
                    .replace(/<(.|\\n)*?>/g, '')
                    .substring(0, 200);
                return { id: noteId, content: n.content, date, time, preview } as UINote;
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
        if (userId && invalidationKey > 0) fetchNotes(true);
    }, [userId, invalidationKey, fetchNotes]);

    const handleNotePress = (note: UINote) => {
        router.push({
            pathname: '/(director)/(tabs)/profile/personal-notes/note-detail',
            params: { noteId: note.id, userId, userName },
        });
    };

    const handleNewNote = () => {
        router.push({
            pathname: '/(director)/(tabs)/profile/personal-notes/new-note',
            params: { userName, userId },
        });
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />

                <ScreenBackHeader title="Personal Notes" onBack={() => router.back()} />

                {/* Tab row */}
                <View style={styles.tabRow}>
                    <Pressable style={styles.tabNew} onPress={handleNewNote}>
                        <Ionicons name="add-circle-outline" size={16} color={roadmapTheme.textActive} />
                        <Text style={styles.tabNewText}>New Note</Text>
                    </Pressable>
                    <View style={styles.tabCountBadge}>
                        <Text style={styles.tabCountText}>{notes.length} notes</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Loading notes...</Text>
                    </View>
                ) : notes.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Ionicons name="document-text-outline" size={40} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyText}>No notes yet</Text>
                        <Text style={styles.emptySubtext}>{'Tap "New Note" to create your first note'}</Text>
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
                                <View style={styles.noteIconWrap}>
                                    <Ionicons name="document-text-outline" size={18} color={roadmapTheme.accentMint} />
                                </View>
                                <View style={styles.noteContent}>
                                    <Text style={styles.notePreview} numberOfLines={2}>
                                        {note.preview}
                                    </Text>
                                    <View style={styles.noteFooter}>
                                        <Ionicons name="time-outline" size={12} color={roadmapTheme.textCaption} />
                                        <Text style={styles.noteDate}>{note.date}</Text>
                                        <Text style={styles.noteDot}>·</Text>
                                        <Text style={styles.noteTime}>{note.time}</Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={roadmapTheme.textCaption}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: homeLayout.screenPaddingH,
        marginBottom: 14,
    },
    tabNew: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: homeLayout.cardRadiusCompact,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    tabNewText: {
        color: roadmapTheme.textActive,
        fontSize: 14,
        fontWeight: '800',
    },
    tabCountBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: roadmapTheme.frostedSurface,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    tabCountText: {
        color: roadmapTheme.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: roadmapTheme.textMuted, fontSize: 15 },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 32,
    },
    emptyText: {
        color: roadmapTheme.textMuted,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 8,
    },
    emptySubtext: {
        color: roadmapTheme.textCaption,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingBottom: 24,
        gap: 10,
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: homeLayout.cardRadiusCompact,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 14,
        gap: 12,
    },
    noteIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: 'rgba(111,212,190,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(111,212,190,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteContent: { flex: 1, gap: 6 },
    notePreview: {
        color: roadmapTheme.textPrimary,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    noteFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    noteDate: { color: roadmapTheme.textCaption, fontSize: 12 },
    noteDot: { color: roadmapTheme.textCaption, fontSize: 12 },
    noteTime: { color: roadmapTheme.textCaption, fontSize: 12 },
});
