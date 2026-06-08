import { GradientBackground, homeLayout, roadmapTheme } from '@/components/ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const SUMMARY_METRICS = [
  { icon: 'people-outline' as const, label: 'Active Users', value: '1,248', trend: '+12%', accent: '#77C2F0' },
  { icon: 'shield-checkmark-outline' as const, label: 'System Health', value: '92%', trend: 'Good', accent: '#36DB83' },
  { icon: 'stats-chart-outline' as const, label: 'Completion Rate', value: '85%', trend: '+8%', accent: '#E8C88A' },
  { icon: 'school-outline' as const, label: 'Roadmaps Active', value: '34', trend: '+3', accent: '#C084FC' },
];

const INSIGHTS = [
  {
    id: '1',
    icon: 'trending-up-outline' as const,
    accent: '#36DB83',
    tag: 'Growth',
    title: 'User engagement increased by 12% this month',
    body: 'Active participation across mentees and mentors has grown steadily. Consider expanding mentorship pairings to sustain this momentum.',
  },
  {
    id: '2',
    icon: 'alert-circle-outline' as const,
    accent: '#F59E0B',
    tag: 'Attention',
    title: '6 mentees have not logged in for over 2 weeks',
    body: 'Re-engagement outreach may help. These mentees were previously active but have gone quiet — a check-in is recommended.',
  },
  {
    id: '3',
    icon: 'ribbon-outline' as const,
    accent: '#77C2F0',
    tag: 'Achievement',
    title: 'Course completion rate hit an all-time high',
    body: '85% of enrolled mentees completed at least one roadmap phase this month, up from 77% last month.',
  },
  {
    id: '4',
    icon: 'bulb-outline' as const,
    accent: '#C084FC',
    tag: 'Suggestion',
    title: 'Assessments are underutilized this quarter',
    body: 'Only 40% of mentees have been assigned an assessment. Assigning tailored assessments can improve CDP outcomes significantly.',
  },
  {
    id: '5',
    icon: 'heart-outline' as const,
    accent: '#FB7185',
    tag: 'Wellbeing',
    title: 'Mentor satisfaction scores remain high',
    body: 'Average mentor feedback score is 4.7/5. Recognizing top mentors publicly could further reinforce positive engagement.',
  },
];

export default function AiInsightsScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleRow}>
          <LinearGradient colors={['rgba(119,194,240,0.3)', 'rgba(119,194,240,0.08)']} style={styles.headerIcon}>
            <Ionicons name="sparkles-outline" size={18} color="#77C2F0" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>AI Insights</Text>
            <Text style={styles.headerSub}>Powered by AI · Updated just now</Text>
          </View>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + 24 }]}
      >
        {/* Summary Metrics */}
        <View style={styles.metricsGrid}>
          {SUMMARY_METRICS.map((m) => (
            <View key={m.label} style={styles.metricCard}>
              <View style={[styles.metricIconBg, { backgroundColor: m.accent + '22' }]}>
                <Ionicons name={m.icon} size={18} color={m.accent} />
              </View>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <View style={styles.metricTrendRow}>
                <Ionicons name="caret-up" size={10} color={m.accent} />
                <Text style={[styles.metricTrend, { color: m.accent }]}>{m.trend}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Section title */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="flash-outline" size={15} color="rgba(255,255,255,0.6)" />
          <Text style={styles.sectionTitle}>AI-Generated Insights</Text>
          <Text style={styles.sectionCount}>{INSIGHTS.length} insights</Text>
        </View>

        {/* Insight Cards */}
        {INSIGHTS.map((insight) => (
          <View key={insight.id} style={styles.insightCard}>
            <View style={styles.insightTop}>
              <View style={[styles.insightIconBg, { backgroundColor: insight.accent + '22' }]}>
                <Ionicons name={insight.icon} size={18} color={insight.accent} />
              </View>
              <View style={[styles.insightTag, { backgroundColor: insight.accent + '22', borderColor: insight.accent + '44' }]}>
                <Text style={[styles.insightTagText, { color: insight.accent }]}>{insight.tag}</Text>
              </View>
            </View>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightBody}>{insight.body}</Text>
            <View style={[styles.insightDivider, { backgroundColor: insight.accent + '33' }]} />
            <Pressable style={styles.insightAction}>
              <Text style={[styles.insightActionText, { color: insight.accent }]}>Take Action</Text>
              <Ionicons name="arrow-forward" size={13} color={insight.accent} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: homeLayout.screenPaddingH,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: roadmapTheme.divider,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(119,194,240,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: roadmapTheme.textPrimary,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(54,219,131,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(54,219,131,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#36DB83',
  },
  liveText: {
    color: '#36DB83',
    fontSize: 11,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: homeLayout.screenPaddingH,
    paddingTop: 16,
    gap: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  metricCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  metricIconBg: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    color: roadmapTheme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  metricTrend: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    flex: 1,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sectionCount: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
  },
  insightCard: {
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  insightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTag: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  insightTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  insightTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  insightBody: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  insightDivider: {
    height: 1,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  insightActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
