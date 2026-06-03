import { ApiNote, NotesService } from '@/services/notes.service';
import { useAuthStore } from '@/stores/auth.store';
import { useNotesStore } from '@/stores/notes.store';
import {
    GradientBackground,
    homeLayout,
    roadmapTheme,
    ScreenBackHeader,
} from '@/components/ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import {
    router,
    Stack,
    useLocalSearchParams,
    useFocusEffect,
} from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PersonalNoteDetailScreen() {
    const params = useLocalSearchParams<{
        noteId: string;
        userId?: string;
        userName?: string;
    }>();
    const { user } = useAuthStore();
    const invalidateNotes = useNotesStore((s) => s.invalidateNotes);
    const noteId = params.noteId as string;
    const userId = params.userId ?? (user as { id?: string; _id?: string })?.id ?? (user as { _id?: string })?._id;
    const userName = params.userName;

    const [note, setNote] = useState<{
        id: string;
        content: string;
        date: string;
        time: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            const fetch = async () => {
                setLoading(true);
                try {
                    if (!userId || !noteId) return;
                    const single = await NotesService.getNoteById(userId, noteId);
                    if (!mounted) return;
                    if (single) {
                        const fid = single._id ?? (single as ApiNote & { id?: string }).id ?? '';
                        setNote({
                            id: fid,
                            content: single.content,
                            date: single.createdAt
                                ? new Date(single.createdAt).toLocaleDateString('en-US', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      year: '2-digit',
                                  })
                                : '',
                            time: single.createdAt
                                ? new Date(single.createdAt).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : '',
                        });
                        return;
                    }
                    const api = await NotesService.getNotes(userId, { cacheBust: true });
                    if (!mounted) return;
                    const found =
                        api.find((n: ApiNote) => (n._id ?? (n as ApiNote & { id?: string }).id) === noteId) ?? api[0];
                    if (found) {
                        const fid = (found as ApiNote)._id ?? (found as ApiNote & { id?: string }).id ?? '';
                        setNote({
                            id: fid,
                            content: found.content,
                            date: found.createdAt
                                ? new Date(found.createdAt).toLocaleDateString('en-US', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      year: '2-digit',
                                  })
                                : '',
                            time: found.createdAt
                                ? new Date(found.createdAt).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : '',
                        });
                    }
                } catch (err) {
                    console.warn('Failed to load personal note', err);
                } finally {
                    if (mounted) setLoading(false);
                }
            };
            fetch();
            return () => { mounted = false; };
        }, [userId, noteId])
    );

    const handleEdit = () => {
        router.push({
            pathname: '/(director)/(tabs)/profile/personal-notes/new-note',
            params: {
                userName,
                userId,
                noteId,
                isEdit: 'true',
                content: note?.content ?? '',
            },
        });
    };

    const handleDelete = () => {
        Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        if (!userId) return;
                        const ok = await NotesService.deleteNote(userId, noteId);
                        if (ok) {
                            invalidateNotes();
                            router.back();
                        } else {
                            Alert.alert('Error', 'Failed to delete note.');
                        }
                    } catch (err) {
                        console.warn('Failed to delete personal note', err);
                        Alert.alert('Error', 'Failed to delete note.');
                    }
                },
            },
        ]);
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />

                <ScreenBackHeader title="Note Detail" />

                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : (
                    <>
                        {/* Meta bar */}
                        <View style={styles.metaBar}>
                            <View style={styles.dateBadge}>
                                <Ionicons name="time-outline" size={13} color={roadmapTheme.textCaption} />
                                <Text style={styles.dateText}>
                                    {note?.date}  ·  {note?.time}
                                </Text>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.actionButton}
                                    onPress={handleEdit}
                                >
                                    <Ionicons name="create-outline" size={20} color={roadmapTheme.textPrimary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={handleDelete}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#F87171" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {userName ? (
                                <View style={styles.authorRow}>
                                    <Ionicons name="person-outline" size={13} color={roadmapTheme.textCaption} />
                                    <Text style={styles.authorText}>{userName}</Text>
                                </View>
                            ) : null}

                            <View style={styles.contentCard}>
                                <Text style={styles.contentText}>{note?.content}</Text>
                            </View>
                        </ScrollView>
                    </>
                )}
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: roadmapTheme.textMuted, fontSize: 15 },
    metaBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: homeLayout.screenPaddingH,
        marginBottom: 14,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: roadmapTheme.frostedSurface,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    dateText: {
        color: roadmapTheme.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    actionButtons: { flexDirection: 'row', gap: 8 },
    actionButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: roadmapTheme.frostedSurface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    deleteButton: {
        backgroundColor: 'rgba(248,113,113,0.1)',
        borderColor: 'rgba(248,113,113,0.25)',
    },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingBottom: 32,
        gap: 10,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 4,
    },
    authorText: {
        color: roadmapTheme.textCaption,
        fontSize: 12,
        fontWeight: '500',
    },
    contentCard: {
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: homeLayout.cardRadius,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 18,
    },
    contentText: {
        color: roadmapTheme.textPrimary,
        fontSize: 15,
        lineHeight: 26,
    },
});
