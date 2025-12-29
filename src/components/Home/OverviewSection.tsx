import { useDirectorOverview } from '@/hooks/useProgress';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OverviewSection = () => {
    const { data, isLoading } = useDirectorOverview();

    if (isLoading) return <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />;
    if (!data) return <Text style={{ color: '#fff' }}>No Data Available</Text>;

    // Prepare Bar Chart Data - Using 3 letters for months
    const barData = data.monthlyData.map(item => ([
        {
            value: item.pastorsCompleted,
            label: item.monthName.substring(0, 3), // Shows "Jan", "Feb", etc.
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
        <ScrollView style={styles.mainScroll} contentContainerStyle={styles.container}>
            {/* Overview Section */}
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.circleContainer}>
                <StatCircle label="Total Mentors" value={data.totalMentors} />
                <StatCircle label="Total Pastors" value={data.totalPastors} />
                <StatCircle label="Pastors Completed" value={data.completedPastors} />
            </View>

            <View style={styles.divider} />

            {/* Graduate Status Section - Title Moved Outside */}
            <Text style={styles.externalCardTitle}>Graduate Status of Pastors in a Year</Text>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.yearBadge}><Text style={styles.yearText}>2025 ⌄</Text></View>
                </View>
                <View style={styles.pieRow}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={SCREEN_WIDTH * 0.18}
                        innerRadius={SCREEN_WIDTH * 0.14}
                        innerCircleColor={'#1E293B'}
                        centerLabelComponent={() => (
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{data.totalPastors}</Text>
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
            </View>

            {/* Monthly Trends Section - Title Moved Outside */}
            <Text style={styles.externalCardTitle}>Monthly Trends of Pastors and Mentors</Text>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.barLegend}>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#7C3AED' }]} /><Text style={styles.legendText}>Pastor</Text></View>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#38BDF8' }]} /><Text style={styles.legendText}>Mentor</Text></View>
                    </View>
                    <View style={styles.yearBadge}><Text style={styles.yearText}>Past 12 months ⌄</Text></View>
                </View>

                <View style={styles.chartWrapper}>
                    <BarChart
                        data={barData}
                        width={SCREEN_WIDTH - 120} // Adjusted for responsiveness
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
            </View>
        </ScrollView>
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
    mainScroll: { flex: 1 },
    container: { paddingBottom: 32 },
    sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    externalCardTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 10 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    circleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    gradientBorder: {
        width: SCREEN_WIDTH * 0.28,
        height: SCREEN_WIDTH * 0.28,
        borderRadius: (SCREEN_WIDTH * 0.28) / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statBox: { alignItems: 'center' },
    innerCircle: {
        width: (SCREEN_WIDTH * 0.28) - 4,
        height: (SCREEN_WIDTH * 0.28) - 4,
        borderRadius: ((SCREEN_WIDTH * 0.28) - 4) / 2,
        backgroundColor: "#176192",
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center' },
    circleValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 15 },
    yearBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    yearText: { color: '#fff', fontSize: 11 },
    chartWrapper: { alignItems: 'center', justifyContent: 'center' },
    pieRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    legendContainer: { flex: 1, marginLeft: 20, gap: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 12, height: 12, borderRadius: 3 },
    legendText: { color: '#FFFFFF', fontSize: 12 },
    barLegend: { flexDirection: 'row', flex: 1, gap: 15, justifyContent: 'flex-start' },
});

export default OverviewSection;