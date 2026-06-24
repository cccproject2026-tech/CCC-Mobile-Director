import { roadmapTheme } from "@/components/ui/design-system";
import { useFinalComments } from "@/hooks/useProgress";
import { FinalComment } from "@/types/progress.types";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Props = {
  userId: string;
};

function CommentBlock({ comment }: { comment: FinalComment }) {
  return (
    <View style={styles.commentBlock}>
      <Text style={styles.commentText}>{comment.comment}</Text>
      <Text style={styles.metaText}>
        {new Date(comment.updatedAt || comment.createdAt).toLocaleString()}
      </Text>
    </View>
  );
}

/** Read-only mentor final comments for director review. */
export default function FinalCommentsSection({ userId }: Props) {
  const { data: comments = [], isLoading } = useFinalComments(userId);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Final Comments</Text>
      <Text style={styles.subtitle}>
        Added by the mentor when marking the programme complete.
      </Text>

      {isLoading ? (
        <ActivityIndicator color="#fff" style={{ marginVertical: 12 }} />
      ) : comments.length === 0 ? (
        <Text style={styles.empty}>
          No final comments have been recorded yet. The mentor adds these before
          marking the programme complete.
        </Text>
      ) : (
        comments.map((comment) => (
          <CommentBlock key={comment._id} comment={comment} />
        ))
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
  title: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  empty: {
    color: roadmapTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  commentBlock: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.12)",
    padding: 12,
    gap: 8,
  },
  commentText: {
    color: roadmapTheme.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  metaText: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
  },
});
