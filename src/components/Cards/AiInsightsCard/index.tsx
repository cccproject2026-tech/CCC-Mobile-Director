import { roadmapTheme } from '@/components/ui/design-system';
import { isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  desciption: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  data: any;
};

const METRICS = [
  {
    icon: 'people-outline' as const,
    label: 'Active Users',
    value: '1,248',
    trend: '+12%',
    sub: 'this month',
    accent: '#77C2F0',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    label: 'System Health',
    value: '92%',
    trend: 'Good',
    sub: 'health score',
    accent: '#36DB83',
  },
  {
    icon: 'stats-chart-outline' as const,
    label: 'Completion',
    value: '85%',
    trend: '+8%',
    sub: 'course rate',
    accent: '#E8C88A',
  },
];

const AiInsightCard: React.FC<Props> = ({ title, desciption, iconName }) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['rgba(119,194,240,0.25)', 'rgba(119,194,240,0.08)']}
            style={styles.iconBg}
          >
            <Ionicons name={iconName} size={18} color="#77C2F0" />
          </LinearGradient>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Powered by AI</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Live</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{desciption}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Metrics */}
      <View style={styles.metricsRow}>
        {METRICS.map((metric, index) => (
          <React.Fragment key={metric.label}>
            <View style={styles.metricCell}>
              <View style={[styles.metricIconBg, { backgroundColor: metric.accent + '22' }]}>
                <Ionicons name={metric.icon} size={15} color={metric.accent} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <View style={styles.metricTrendRow}>
                <Ionicons name="caret-up" size={10} color={metric.accent} />
                <Text style={[styles.metricTrend, { color: metric.accent }]}>
                  {metric.trend}
                </Text>
                <Text style={styles.metricSub}> {metric.sub}</Text>
              </View>
            </View>
            {index < METRICS.length - 1 && <View style={styles.verticalDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={13} color="rgba(255,255,255,0.4)" />
        <Text style={styles.footerText}>Updated just now</Text>
        <View style={styles.footerSpacer} />
        <Pressable style={styles.viewInsightsBtn} onPress={() => router.push('/ai-insights')}>
          <Text style={styles.viewInsightsText}>View Insights</Text>
          <Ionicons name="arrow-forward" size={12} color="#77C2F0" />
        </Pressable>
      </View>
    </View>
  );
};

export default AiInsightCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
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
    borderColor: 'rgba(119,194,240,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: roadmapTheme.textPrimary,
    fontWeight: '800',
    fontSize: isSmallDevice ? 15 : 16,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
    letterSpacing: 0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(54,219,131,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(54,219,131,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#36DB83',
  },
  badgeText: {
    color: '#36DB83',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: roadmapTheme.textMuted,
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: roadmapTheme.divider,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  metricIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricValue: {
    color: roadmapTheme.textPrimary,
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  metricTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metricTrend: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 1,
  },
  metricSub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: roadmapTheme.divider,
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: roadmapTheme.divider,
  },
  footerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
  },
  footerSpacer: {
    flex: 1,
  },
  viewInsightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(119,194,240,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(119,194,240,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  viewInsightsText: {
    color: '#77C2F0',
    fontSize: 11,
    fontWeight: '600',
  },
});
