import TopBar from '@/components/Header/TopBar';
import { GradientBackground } from '@/components/ui/design-system';
import { useCdpSectionRecommendations } from '@/hooks/useAssessments';
import { useSafeBack } from '@/hooks/useSafeBack';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AssessmentCdpScreen() {
  const safeBack = useSafeBack();
  const { bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ assessmentId?: string; userId?: string }>();
  const assessmentId = Array.isArray(params.assessmentId)
    ? params.assessmentId[0]
    : params.assessmentId;
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const { assessmentTitle, sections, isLoading, isError, refetch } =
    useCdpSectionRecommendations(assessmentId, userId);

  const handleSharePlans = useCallback(async () => {
    const rows = sections.filter((row) => row.message.trim());
    if (rows.length === 0) return;

    const body = rows
      .map((row) => {
        const levelLine =
          row.level != null ? `Level: ${row.level}\n` : '';
        return `Section ${row.sectionNumber} - ${row.sectionTitle}\n${levelLine}\n${row.message}`;
      })
      .join('\n\n---\n\n');

    await Share.share({
      title: `CDP - ${assessmentTitle}`,
      message: `Customized Development Plan\n${assessmentTitle}\n\n${body}`,
    });
  }, [sections, assessmentTitle]);

  if (!assessmentId || !userId) {
    return (
      <GradientBackground>
        <TopBar showUserName showBackButton />
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            Missing assessment or user id. Please open the plan from a specific
            assessment.
          </Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <TopBar showUserName showBackButton onPressBack={safeBack} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customized Development Plan</Text>
        <Text style={styles.headerSub}>Review sent development plan sections.</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Failed to load development plan</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <Text style={styles.assessmentTitle}>{assessmentTitle}</Text>
            {sections.length > 0 ? (
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => void handleSharePlans()}
              >
                <Ionicons name="download-outline" size={16} color="#fff" />
                <Text style={styles.downloadText}>Download Plans</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {sections.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No customized development plan has been sent yet
              </Text>
            </View>
          ) : (
            sections.map((section) => (
              <View key={section.sectionId} style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>
                  Section {section.sectionNumber} - {section.sectionTitle}
                </Text>
                {section.level != null ? (
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>Level: {section.level}</Text>
                  </View>
                ) : null}
                <Text style={styles.cdpLabel}>Customized Development Plan:</Text>
                <Text style={styles.cdpMessage}>{section.message}</Text>
                {section.sentAt ? (
                  <Text style={styles.sentAt}>
                    Sent on {new Date(section.sentAt).toLocaleString()}
                  </Text>
                ) : null}
              </View>
            ))
          )}
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 12,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  assessmentTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(142, 197, 235, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(142, 197, 235, 0.45)',
  },
  downloadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sectionHeading: {
    color: '#8ec5eb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  levelText: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: '700',
  },
  cdpLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cdpMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 22,
  },
  sentAt: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },
});
