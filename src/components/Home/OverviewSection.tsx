import { useDirectorOverview } from '@/hooks/useProgress';
import { CommonCard, HomeSectionHeader, homeLayout, roadmapTheme } from '@/components/ui/design-system';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CIRCLE_SIZE = SCREEN_WIDTH * 0.26;

const OverviewSection = () => {
    const { data, isLoading } = useDirectorOverview();

    if (isLoading) {
        return (
            <CommonCard>
                <ActivityIndicator size="large" color={roadmapTheme.textPrimary} style={styles.loader} />
            </CommonCard>
        );
    }

    if (!data) {
        return (
            <CommonCard>
                <Text style={styles.empty}>No Data Available</Text>
            </CommonCard>
        );
    }

    const pieData = [
        { value: data.completedPastors, color: '#38BDF8', text: 'Graduated' },
        { value: data.totalPastors - data.completedPastors, color: '#7C3AED', text: 'In-progress' },
        { value: 0, color: roadmapTheme.accentMint, text: 'Ready to Graduate' },
    ];

    return (
        <View style={styles.wrapper}>
            {/* Stat circles */}
            <CommonCard>
                <HomeSectionHeader
                    icon="stats-chart-outline"
                    title="Overview"
                    subtitle="Mentors, pastors, and completion at a glance."
                />
                <View style={styles.circleRow}>
                    <StatCircle label="Total Mentors" value={data.totalMentors} color="#38BDF8" />
                    <StatCircle label="Total Pastors" value={data.totalPastors} color="#7C3AED" />
                    <StatCircle label="Completed" value={data.completedPastors} color={roadmapTheme.accentMint} />
                </View>
            </CommonCard>

            {/* Graduate status pie */}
            <CommonCard>
                <View style={styles.cardTitleRow}>
                    <View style={styles.cardTitleIconWrap}>
                        <Text style={styles.cardTitleIcon}>🎓</Text>
                    </View>
                    <View style={styles.cardTitleTexts}>
                        <Text style={styles.cardTitle}>Graduate Status of Pastors</Text>
                        <Text style={styles.cardSubtitle}>Progress breakdown for the year</Text>
                    </View>
                    <View style={styles.yearBadge}>
                        <Text style={styles.yearText}>2025</Text>
                    </View>
                </View>

                <View style={styles.pieRow}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={SCREEN_WIDTH * 0.18}
                        innerRadius={SCREEN_WIDTH * 0.13}
                        innerCircleColor={roadmapTheme.frostedSurfaceStrong}
                        centerLabelComponent={() => (
                            <View style={styles.pieCenterWrap}>
                                <Text style={styles.pieCenterValue}>{data.totalPastors}</Text>
                                <Text style={styles.pieCenterLabel}>Total</Text>
                            </View>
                        )}
                    />
                    <View style={styles.legendList}>
                        {pieData.map((item, i) => (
                            <View key={i} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                <View>
                                    <Text style={styles.legendLabel}>{item.text}</Text>
                                    <Text style={[styles.legendValue, { color: item.color }]}>
                                        {item.value}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </CommonCard>
        </View>
    );
};

const StatCircle = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={styles.statBox}>
        <View style={[styles.circleOuter, { borderColor: color + '55' }]}>
            <View style={[styles.circleInner, { borderColor: color + '33' }]}>
                <Text style={[styles.circleValue, { color }]}>{value}</Text>
                <Text style={styles.circleLabel}>{label}</Text>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    wrapper: { gap: homeLayout.cardsGroupGap },
    loader: { marginVertical: 24 },
    empty: { color: roadmapTheme.textMuted, fontSize: 14, textAlign: 'center' },

    // Stat circles
    circleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    statBox: { alignItems: 'center' },
    circleOuter: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    circleInner: {
        width: CIRCLE_SIZE - 10,
        height: CIRCLE_SIZE - 10,
        borderRadius: (CIRCLE_SIZE - 10) / 2,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    circleValue: {
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 26,
    },
    circleLabel: {
        color: roadmapTheme.textCaption,
        fontSize: 9,
        textAlign: 'center',
        lineHeight: 12,
        paddingHorizontal: 4,
    },

    // Card title row
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    cardTitleIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: roadmapTheme.frostedSurface,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitleIcon: { fontSize: 16 },
    cardTitleTexts: { flex: 1 },
    cardTitle: {
        color: roadmapTheme.textPrimary,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.15,
    },
    cardSubtitle: {
        color: roadmapTheme.textCaption,
        fontSize: 11,
        marginTop: 1,
    },
    yearBadge: {
        backgroundColor: roadmapTheme.frostedSurface,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    yearText: {
        color: roadmapTheme.textMuted,
        fontSize: 11,
        fontWeight: '600',
    },

    // Pie
    pieRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pieCenterWrap: { alignItems: 'center' },
    pieCenterValue: {
        color: roadmapTheme.textPrimary,
        fontSize: 18,
        fontWeight: '800',
    },
    pieCenterLabel: {
        color: roadmapTheme.textCaption,
        fontSize: 10,
    },
    legendList: {
        flex: 1,
        marginLeft: 16,
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 9,
        height: 9,
        borderRadius: 3,
    },
    legendLabel: {
        color: roadmapTheme.textMuted,
        fontSize: 12,
        fontWeight: '500',
    },
    legendValue: {
        fontSize: 13,
        fontWeight: '800',
        marginTop: 1,
    },

});

export default OverviewSection;
