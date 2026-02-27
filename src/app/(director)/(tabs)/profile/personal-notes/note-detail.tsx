import { ApiNote, NotesService } from '@/services/notes.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useAuthStore } from '@/stores/auth.store';
import { useNotesStore } from '@/stores/notes.store';

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
                    const found = api.find((n: ApiNote) => (n._id ?? (n as ApiNote & { id?: string }).id) === noteId) ?? api[0];
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
            return () => {
                mounted = false;
            };
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
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Note</Text>
                    </View>
                    {userName ? (
                        <Text style={styles.subtitle}>{userName}</Text>
                    ) : null}
                </View>

                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.dateContainer}>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateText}>
                                    {note?.date} - {note?.time}
                                </Text>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.actionButton}
                                    onPress={handleEdit}
                                >
                                    <Ionicons name="create-outline" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.actionButton}
                                    onPress={handleDelete}
                                >
                                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.contentContainer}>
                                <Text style={styles.contentText}>{note?.content}</Text>
                            </View>
                        </ScrollView>
                    </>
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
    titleSection: { marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
    subtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, fontWeight: '500' },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: 'rgba(255,255,255,0.9)', fontSize: 16 },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    dateBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dateText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    actionButtons: { flexDirection: 'row', gap: 12 },
    actionButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
    contentContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        padding: 24,
    },
    contentText: { color: '#FFFFFF', fontSize: 16, lineHeight: 26 },
});
