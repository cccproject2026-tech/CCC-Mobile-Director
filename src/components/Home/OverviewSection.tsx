import { useDirectorOverview } from '@/hooks/useProgress';
import { CommonCard, HomeSectionHeader, roadmapTheme } from '@/components/ui/design-system';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

    const barData = data.monthlyData.map(item => ([
        {
            value: item.pastorsCompleted,
            label: item.monthName.substring(0, 3),
            spacing: 2,
            labelTextStyle: { color: '#FFFFFF', fontSize: 10 },
            frontColor: '#7C3AED',
            gradientColor: '#38BDF8',
            showGradient: true,
        },
        {
            value: item.mentorsCompleted,
            frontColor: '#38BDF8',
            gradientColor: '#2DD4BF',
            showGradient: true,
        }
    ])).flat();

    const pieData = [
        { value: data.completedPastors, color: '#38BDF8', text: 'Graduated' },
        { value: data.totalPastors - data.completedPastors, color: '#7C3AED', text: 'In-progress' },
        { value: 0, color: '#2DD4BF', text: 'Ready to Graduate' },
    ];

    return (
        <View style={styles.wrapper}>
            <CommonCard>
                <HomeSectionHeader
                    icon="stats-chart-outline"
                    title="Overview"
                    subtitle="Mentors, pastors, and completion at a glance."
                />
                <View style={styles.circleContainer}>
                    <StatCircle label="Total Mentors" value={data.totalMentors} />
                    <StatCircle label="Total Pastors" value={data.totalPastors} />
                    <StatCircle label="Pastors Completed" value={data.completedPastors} />
                </View>
            </CommonCard>

            <CommonCard>
                <Text style={styles.chartCardTitle}>Graduate Status of Pastors in a Year</Text>
                <View style={styles.chartCardHeader}>
                    <View style={styles.yearBadge}><Text style={styles.yearText}>2025 ⌄</Text></View>
                </View>
                <View style={styles.pieRow}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={SCREEN_WIDTH * 0.18}
                        innerRadius={SCREEN_WIDTH * 0.14}
                        innerCircleColor={'rgba(15, 59, 92, 0.9)'}
                        centerLabelComponent={() => (
                            <Text style={styles.pieCenter}>{data.totalPastors}</Text>
                        )}
                    />
                    <View style={styles.legendContainer}>
                        {pieData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: item.color }]} />
                                <Text style={styles.legendText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </CommonCard>

            <CommonCard>
                <Text style={styles.chartCardTitle}>Monthly Trends of Pastors and Mentors</Text>
                <View style={styles.chartCardHeader}>
                    <View style={styles.barLegend}>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#7C3AED' }]} /><Text style={styles.legendText}>Pastor</Text></View>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#38BDF8' }]} /><Text style={styles.legendText}>Mentor</Text></View>
                    </View>
                    <View style={styles.yearBadge}><Text style={styles.yearText}>Past 12 months ⌄</Text></View>
                </View>

                <View style={styles.chartWrapper}>
                    <BarChart
                        data={barData}
                        width={SCREEN_WIDTH - 120}
                        height={200}
                        barWidth={10}
                        initialSpacing={10}
                        spacing={18}
                        hideRules
                        yAxisThickness={0}
                        xAxisThickness={1}
                        xAxisColor={'rgba(255,255,255,0.4)'}
                        yAxisTextStyle={{ color: '#FFFFFF', fontSize: 12 }}
                        backgroundColor="transparent"
                        noOfSections={5}
                        showFractionalValues={false}
                        xAxisLabelTextStyle={{ color: '#FFFFFF', fontSize: 10, textAlign: 'center' }}
                    />
                </View>
            </CommonCard>
        </View>
    );
};

const StatCircle = ({ label, value }: { label: string; value: number }) => (
    <View style={styles.statBox}>
        <LinearGradient
            colors={["#7C3AED", "#38BDF8"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
        >
            <View style={styles.innerCircle}>
                <Text style={styles.circleLabel}>{label.split(' ').join('\n')}</Text>
                <Text style={styles.circleValue}>{value}</Text>
            </View>
        </LinearGradient>
    </View>
);

const styles = StyleSheet.create({
    wrapper: {
        gap: 22,
    },
    loader: {
        marginVertical: 24,
    },
    empty: {
        color: roadmapTheme.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
    circleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    gradientBorder: {
        width: SCREEN_WIDTH * 0.26,
        height: SCREEN_WIDTH * 0.26,
        borderRadius: (SCREEN_WIDTH * 0.26) / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statBox: { alignItems: 'center' },
    innerCircle: {
        width: (SCREEN_WIDTH * 0.26) - 4,
        height: (SCREEN_WIDTH * 0.26) - 4,
        borderRadius: ((SCREEN_WIDTH * 0.26) - 4) / 2,
        backgroundColor: "rgba(15, 59, 92, 0.95)",
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleLabel: {
        color: roadmapTheme.textMuted,
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 14,
    },
    circleValue: {
        color: roadmapTheme.textPrimary,
        fontSize: 20,
        fontWeight: '800',
        marginTop: 2,
    },
    chartCardTitle: {
        color: roadmapTheme.textPrimary,
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
        letterSpacing: -0.15,
    },
    chartCardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 12,
    },
    yearBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    yearText: {
        color: roadmapTheme.textPrimary,
        fontSize: 11,
        fontWeight: '600',
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pieCenter: {
        color: roadmapTheme.textPrimary,
        fontSize: 16,
        fontWeight: '800',
    },
    legendContainer: {
        flex: 1,
        marginLeft: 16,
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 3,
    },
    legendText: {
        color: roadmapTheme.textPrimary,
        fontSize: 12,
        fontWeight: '500',
    },
    barLegend: {
        flexDirection: 'row',
        flex: 1,
        gap: 15,
        justifyContent: 'flex-start',
    },
});

export default OverviewSection;
