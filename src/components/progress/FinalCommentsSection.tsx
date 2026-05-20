import { roadmapTheme } from "@/components/ui/design-system";
import {
  useAddFinalComment,
  useDeleteFinalComment,
  useFinalComments,
  useUpdateFinalComment,
} from "@/hooks/useProgress";
import { useAuthStore } from "@/stores/auth.store";
import { FinalComment } from "@/types/progress.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  userId: string;
  onMarkProgramComplete?: () => void;
  canMarkComplete?: boolean;
  isMarkingComplete?: boolean;
};

export default function FinalCommentsSection({
  userId,
  onMarkProgramComplete,
  canMarkComplete = false,
  isMarkingComplete = false,
}: Props) {
  const { user: director } = useAuthStore();
  const directorId = director?.id ?? "";

  const { data: comments = [], isLoading, refetch } = useFinalComments(userId);
  const addComment = useAddFinalComment();
  const updateComment = useUpdateFinalComment();
  const deleteComment = useDeleteFinalComment();

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const existing = comments[0] as FinalComment | undefined;
  const hasComments = comments.length > 0;
  const readOnly = hasComments && !editingId;

  useEffect(() => {
    if (existing && !editingId) {
      setText(existing.comment ?? "");
    }
  }, [existing, editingId]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Comment required", "Please enter a final comment.");
      return;
    }
    if (!directorId) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    if (editingId) {
      updateComment.mutate(
        { userId, commentId: editingId, comment: trimmed },
        {
          onSuccess: () => {
            setEditingId(null);
            refetch();
            Alert.alert("Updated", "Final comment updated.");
          },
          onError: (e: Error) =>
            Alert.alert("Error", e.message || "Could not update comment."),
        }
      );
      return;
    }

    addComment.mutate(
      { userId, commentorId: directorId, comment: trimmed },
      {
        onSuccess: () => {
          refetch();
          Alert.alert("Saved", "Final comment added.");
        },
        onError: (e: Error) =>
          Alert.alert("Error", e.message || "Could not add comment."),
      }
    );
  };

  const handleDelete = (commentId: string) => {
    Alert.alert("Delete comment", "Remove this final comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteComment.mutate(
            { userId, commentId },
            {
              onSuccess: () => {
                setText("");
                setEditingId(null);
                refetch();
              },
              onError: (e: Error) =>
                Alert.alert("Error", e.message || "Could not delete comment."),
            }
          ),
      },
    ]);
  };

  const isSaving =
    addComment.isPending || updateComment.isPending || deleteComment.isPending;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Final Comments</Text>
        {hasComments && !editingId && (
          <Pressable
            hitSlop={8}
            onPress={() => {
              setEditingId(existing!._id);
              setText(existing!.comment);
            }}
          >
            <Ionicons name="create-outline" size={20} color={roadmapTheme.textPrimary} />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color="#fff" style={{ marginVertical: 12 }} />
      ) : (
        <>
          <TextInput
            style={[styles.input, readOnly && styles.inputReadOnly]}
            value={text}
            onChangeText={setText}
            placeholder="Add final comments for this user..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            editable={!readOnly}
          />

          {!readOnly && (
            <Pressable
              style={[styles.primaryBtn, isSaving && styles.btnDisabled]}
              disabled={isSaving}
              onPress={handleSubmit}
            >
              {isSaving ? (
                <ActivityIndicator color="#0E5A62" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {editingId ? "Update comment" : "Save comment"}
                </Text>
              )}
            </Pressable>
          )}

          {hasComments && existing && (
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {new Date(existing.updatedAt || existing.createdAt).toLocaleDateString()}
              </Text>
              {!editingId && (
                <Pressable onPress={() => handleDelete(existing._id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              )}
            </View>
          )}

          {!hasComments && (
            <Text style={styles.hint}>
              Add a final comment before marking the programme complete.
            </Text>
          )}

          {canMarkComplete && hasComments && onMarkProgramComplete && (
            <Pressable
              style={[styles.secondaryBtn, isMarkingComplete && styles.btnDisabled]}
              disabled={isMarkingComplete}
              onPress={onMarkProgramComplete}
            >
              {isMarkingComplete ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.secondaryBtnText}>Mark programme as completed</Text>
              )}
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  input: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(0,0,0,0.15)",
    color: roadmapTheme.textPrimary,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 14,
  },
  inputReadOnly: {
    opacity: 0.85,
  },
  primaryBtn: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#0E5A62",
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(111,212,190,0.5)",
    backgroundColor: "rgba(111,212,190,0.12)",
  },
  secondaryBtnText: {
    color: roadmapTheme.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  btnDisabled: { opacity: 0.6 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
  },
  deleteText: {
    color: "#ff8a8a",
    fontSize: 13,
    fontWeight: "600",
  },
  hint: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
  },
});
