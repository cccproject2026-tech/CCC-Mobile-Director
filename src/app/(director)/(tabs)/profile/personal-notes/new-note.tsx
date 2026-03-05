import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
            const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
                ?? (err as { message?: string })?.message
                ?? 'Failed to save note. Please try again.';
            console.warn('Save personal note failed', err);
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
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
                                        <Text style={styles.profileName}>
                                            {isEdit ? 'Edit Note' : 'New Note'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.headerRight} />
                            </View>
                            <View style={styles.titleSection}>
                                <Text style={styles.title}>Personal Notes</Text>
                            </View>
                            {userName ? <Text style={styles.subtitle}>{userName}</Text> : null}
                        </View>

                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.tabButton, styles.tabButtonActive]}
                            >
                                <Text style={[styles.tabText, styles.tabTextActive]}>New</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.tabButton, styles.tabButtonInactive]}
                                onPress={() => router.back()}
                            >
                                <Text style={[styles.tabText, styles.tabTextInactive]}>Previous</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contentContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Write your note here..."
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                multiline
                                textAlignVertical="top"
                                value={noteContent}
                                onChangeText={setNoteContent}
                                editable={!saving}
                            />
                        </View>

                        <View style={styles.bottomContainer}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                <Text style={styles.saveButtonText}>
                                    {saving ? 'Saving...' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </ScrollView>
        </KeyboardAvoidingView>
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
    tabContainer: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
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
    contentContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        padding: 20,
    },
    textInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 24,
        minHeight: 120,
    },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    saveButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#1A4882', fontSize: 18, fontWeight: '700' },
});
