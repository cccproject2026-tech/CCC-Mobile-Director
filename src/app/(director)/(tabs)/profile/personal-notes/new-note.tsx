import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotesService } from '@/services/notes.service';
import { useAuthStore } from '@/stores/auth.store';
import { useNotesStore } from '@/stores/notes.store';
import {
    GradientBackground,
    homeLayout,
    roadmapTheme,
    ScreenBackHeader,
} from '@/components/ui/design-system';

export default function NewPersonalNoteScreen() {
    const params = useLocalSearchParams<{
        userId?: string;
        userName?: string;
        noteId?: string;
        isEdit?: string;
        content?: string;
    }>();
    const { user } = useAuthStore();
    const invalidateNotes = useNotesStore((s) => s.invalidateNotes);
    const paramUserId = params.userId && String(params.userId).trim() && String(params.userId) !== 'undefined' ? params.userId : undefined;
    const userId = paramUserId ?? (user as { id?: string; _id?: string })?.id ?? (user as { _id?: string })?._id;
    const userName = params.userName ?? (((`${user?.firstName ?? ''} ${user?.lastName ?? ''}`).trim()) || undefined);
    const noteId = params.noteId;
    const isEdit = params.isEdit === 'true';
    const [noteContent, setNoteContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [initializedFromParams, setInitializedFromParams] = useState(false);

    useEffect(() => {
        if (!isEdit || initializedFromParams) return;
        const contentFromParams = params.content ?? '';
        if (contentFromParams) {
            setNoteContent(contentFromParams);
            setInitializedFromParams(true);
        }
    }, [isEdit, params.content, initializedFromParams]);

    useEffect(() => {
        if (!isEdit) {
            setNoteContent('');
            setInitializedFromParams(false);
        }
    }, [isEdit]);

    const handleSave = async () => {
        const trimmedContent = noteContent.trim();
        if (!userId) {
            Alert.alert('Error', 'Missing user id. Please log in again.');
            return;
        }
        if (!trimmedContent) {
            Alert.alert('Error', 'Please enter some content before saving.');
            return;
        }
        try {
            setSaving(true);
            if (isEdit && noteId) {
                await NotesService.updateNote(userId, noteId, trimmedContent);
                invalidateNotes();
                Alert.alert('Success', 'Note updated successfully!', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            } else {
                const created = await NotesService.createNote(userId, trimmedContent);
                if (created) invalidateNotes();
                setNoteContent('');
                setInitializedFromParams(false);
                Alert.alert('Success', 'Note saved successfully!', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
                (err as { message?: string })?.message ??
                'Failed to save note. Please try again.';
            console.warn('Save personal note failed', err);
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >
                    <ScreenBackHeader
                        title={isEdit ? 'Edit Note' : 'New Note'}
                        onBack={() => router.back()}
                    />

                    {userName ? (
                        <View style={styles.subtitleRow}>
                            <Ionicons name="person-outline" size={13} color={roadmapTheme.textCaption} />
                            <Text style={styles.subtitle}>{userName}</Text>
                        </View>
                    ) : null}

                    <ScrollView
                        style={styles.flex}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.editorCard}>
                            <View style={styles.editorHeader}>
                                <Ionicons name="document-text-outline" size={16} color={roadmapTheme.accentMint} />
                                <Text style={styles.editorLabel}>Note content</Text>
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Write your note here..."
                                placeholderTextColor={roadmapTheme.textCaption}
                                multiline
                                textAlignVertical="top"
                                value={noteContent}
                                onChangeText={setNoteContent}
                                editable={!saving}
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <Text style={styles.saveButtonText}>Saving...</Text>
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={18} color={roadmapTheme.textActive} />
                                    <Text style={styles.saveButtonText}>
                                        {isEdit ? 'Update Note' : 'Save Note'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    flex: { flex: 1 },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: homeLayout.screenPaddingH,
        marginBottom: 14,
    },
    subtitle: {
        color: roadmapTheme.textCaption,
        fontSize: 13,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingBottom: 32,
        gap: 14,
    },
    editorCard: {
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: homeLayout.cardRadius,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 14,
        gap: 10,
    },
    editorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: roadmapTheme.divider,
    },
    editorLabel: {
        color: roadmapTheme.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    textInput: {
        color: roadmapTheme.textPrimary,
        fontSize: 15,
        lineHeight: 24,
        minHeight: 200,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: homeLayout.cardRadiusCompact,
        minHeight: 48,
        paddingVertical: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: {
        color: roadmapTheme.textActive,
        fontSize: 15,
        fontWeight: '800',
    },
});
