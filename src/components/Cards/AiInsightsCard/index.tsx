import { roadmapTheme, useHomeGridLayout } from '@/components/ui/design-system';
import { isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

type Props = {
  title: string;
  desciption: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  data: any;
};

const METRICS = [
  {
    icon: 'people-outline' as const,
    iconSize: 22,
    label: 'Overall Users',
    value: '1248',
    sub: 'Total Active Users',
    trend: '12% this month',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    iconSize: 18,
    label: 'System Health',
    value: '92%',
    sub: 'System health score',
    trend: 'Good',
  },
  {
    icon: 'stats-chart-outline' as const,
    iconSize: 18,
    label: 'Performance analytics',
    value: '85%',
    sub: 'Course Completion rate',
    trend: '8% this month',
  },
];

const AiInsightCard: React.FC<Props> = ({ title, desciption, iconName }) => {
  const { width } = useWindowDimensions();
  const compact = width < 375;
  const { gridStyle, onGridLayout, getTileStyle } = useHomeGridLayout(3, 3);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSubContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconName} size={18} color={roadmapTheme.textPrimary} />
          </View>
          <Text style={[styles.titleText, compact && styles.titleTextCompact]}>{title}</Text>
        </View>
        <View style={styles.viewAllContainer}>
          <Text style={styles.viewAllText}>View Insights</Text>
          <Ionicons name="chevron-forward" size={14} color="#EAF7FF" />
        </View>
      </View>
      <Text style={[styles.descriptionText, compact && styles.descriptionTextCompact]}>
        {desciption}
      </Text>

      <View style={gridStyle} onLayout={onGridLayout}>
        {METRICS.map((metric, index) => (
          <View
            key={metric.label}
            style={[
              getTileStyle(index),
              styles.metricCell,
              index < METRICS.length - 1 && styles.metricCellDivider,
            ]}
          >
            <Ionicons name={metric.icon} size={metric.iconSize} color="#77C2F0" />
            <Text style={[styles.usersText, compact && styles.usersTextCompact]}>
              {metric.label}
            </Text>
            <Text style={[styles.countText, compact && styles.countTextCompact]}>
              {metric.value}
            </Text>
            <Text style={[styles.activeUsersText, compact && styles.activeUsersTextCompact]}>
              {metric.sub}
            </Text>
            <View style={styles.caretUpContainer}>
              <Ionicons name="caret-up" color="#36DB83" size={13} />
              <Text style={styles.violationText}>{metric.trend}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AiInsightCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerSubContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  titleText: {
    flex: 1,
    color: roadmapTheme.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  titleTextCompact: {
    fontSize: 14,
  },
  descriptionText: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  descriptionTextCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  metricCell: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingRight: 4,
    gap: 2,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  metricCellDivider: {
    borderRightWidth: 1,
    borderRightColor: '#4E84AC',
  },
  viewAllText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  usersText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
  usersTextCompact: {
    fontSize: 9,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
  },
  countTextCompact: {
    fontSize: 10,
  },
  activeUsersText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 12,
  },
  activeUsersTextCompact: {
    fontSize: 8,
  },
  violationText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
    color: '#36DB83',
    marginLeft: 2,
  },
  caretUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});
