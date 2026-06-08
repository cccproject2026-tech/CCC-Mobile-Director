import { CommonCard, roadmapTheme } from '../ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { ApiNote, NotesService } from '@/services/notes.service';
import { useNotesStore } from '@/stores/notes.store';

const NOTE_ACCENT_COLORS = ['#77C2F0', '#E8C88A', '#C084FC', '#36DB83', '#FB7185'];

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const DirectorsNotesSection = () => {
  const { user } = useAuthStore();
  const userId = (user as any)?.id ?? (user as any)?._id;
  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Director';
  const invalidationKey = useNotesStore((s) => s.invalidationKey);

  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await NotesService.getNotes(userId);
      setNotes(data.slice(0, 3));
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [userId, invalidationKey]);

  useFocusEffect(useCallback(() => { fetchNotes(); }, [fetchNotes]));

  const handleAddNote = () =>
    router.push({
      pathname: '/(director)/(tabs)/profile/personal-notes/new-note',
      params: { userName, userId },
    });

  const handleViewAll = () =>
    router.push('/(director)/(tabs)/profile/personal-notes' as any);

  const handleNotePress = (note: ApiNote) =>
    router.push({
      pathname: '/(director)/(tabs)/profile/personal-notes/note-detail',
      params: { noteId: note._id, userId, userName },
    });

  return (
    <CommonCard>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['rgba(232,200,138,0.3)', 'rgba(232,200,138,0.08)']}
            style={styles.iconBg}
          >
            <Ionicons name="book-outline" size={18} color="#E8C88A" />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Director's Notes</Text>
            <Text style={styles.subtitle}>
              {loading ? 'Loading...' : `${notes.length} recent note${notes.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleViewAll} style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={12} color="#E8C88A" />
        </Pressable>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Keep important notes, updates, and observations about your mentees and program.
      </Text>

      <View style={styles.divider} />

      {/* Notes List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#E8C88A" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="document-text-outline" size={32} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>No notes yet</Text>
          <Text style={styles.emptySubtext}>Tap "Add New Note" to create your first note</Text>
        </View>
      ) : (
        <View style={styles.notesList}>
          {notes.map((note, index) => {
            const accent = NOTE_ACCENT_COLORS[index % NOTE_ACCENT_COLORS.length];
            const preview = (note.content || '').replace(/<(.|\n)*?>/g, '').trim();
            const relDate = formatRelativeDate(note.createdAt);
            return (
              <View key={note._id}>
                <Pressable style={styles.noteRow} onPress={() => handleNotePress(note)}>
                  <View style={[styles.noteAccent, { backgroundColor: accent }]} />
                  <View style={styles.noteContent}>
                    <View style={styles.noteTitleRow}>
                      <Text style={styles.notePreview} numberOfLines={1}>{preview || 'Untitled note'}</Text>
                      <Text style={styles.noteDate}>{relDate}</Text>
                    </View>
                    <Text style={styles.noteBody} numberOfLines={1}>{preview}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.25)" />
                </Pressable>
                {index < notes.length - 1 && <View style={styles.noteDivider} />}
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.divider} />

      {/* Footer CTA */}
      <Pressable style={styles.addNoteBtn} onPress={handleAddNote}>
        <View style={styles.addNoteBtnInner}>
          <Ionicons name="add-circle-outline" size={16} color="#E8C88A" />
          <Text style={styles.addNoteText}>Add New Note</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.35)" />
      </Pressable>
    </CommonCard>
  );
};

export default DirectorsNotesSection;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(232,200,138,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: roadmapTheme.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232,200,138,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232,200,138,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  viewAllText: {
    color: '#E8C88A',
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: roadmapTheme.divider,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyText: {
    color: roadmapTheme.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    textAlign: 'center',
  },
  notesList: {
    gap: 0,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  noteAccent: {
    width: 3,
    borderRadius: 4,
    alignSelf: 'stretch',
    minHeight: 32,
  },
  noteContent: {
    flex: 1,
    gap: 3,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notePreview: {
    flex: 1,
    color: roadmapTheme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  noteDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    flexShrink: 0,
  },
  noteBody: {
    color: roadmapTheme.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  noteDivider: {
    height: 1,
    backgroundColor: roadmapTheme.divider,
    marginLeft: 13,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(232,200,138,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(232,200,138,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  addNoteBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addNoteText: {
    color: '#E8C88A',
    fontSize: 13,
    fontWeight: '700',
  },
});
