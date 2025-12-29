import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');
const PIE_RADIUS = width * 0.20;

interface PieChartData {
    completedPercentage: number;
    remainingPercentage: number;
}

interface ProgressPieChartProps {
    data: PieChartData;
    title?: string;
}

export const ProgressPieChart: React.FC<ProgressPieChartProps> = ({ data, title }) => {
    const pieData = [
        { value: data.completedPercentage, color: '#223568' },
        { value: data.remainingPercentage, color: '#e0e6ed' }
    ];

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.pieWrapper}>
                        <PieChart
                            data={pieData}
                            radius={PIE_RADIUS}
                            innerRadius={0}
                            strokeWidth={0}
                            showText={false}
                        />
                        <View style={[styles.percentBadge, styles.leftBadge]}>
                            <Text style={styles.percentInactive}>
                                {data.remainingPercentage} %
                            </Text>
                        </View>
                        <View style={[styles.percentBadge, styles.rightBadge]}>
                            <Text style={styles.percentActive}>
                                {data.completedPercentage} %
                            </Text>
                        </View>
                    </View>
                    <View style={styles.legendBlock}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#223568' }]} />
                            <Text style={styles.legendText}>Completed Task</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#e0e6ed' }]} />
                            <Text style={styles.legendText}>Remaining Task</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    title: {
        fontSize: 15,
        color: '#e7f6fc',
        fontWeight: '700',
        marginBottom: 8,
    },
    card: {
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        paddingVertical: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieWrapper: {
        position: 'relative',
        width: PIE_RADIUS * 2,
        height: PIE_RADIUS * 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentBadge: {
        position: 'absolute',
        borderRadius: 7,
        paddingHorizontal: 12,
        paddingVertical: 5,
        shadowColor: '#223568',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.16,
        shadowRadius: 5,
        elevation: 2,
    },
    leftBadge: {
        left: -12,
        top: PIE_RADIUS * 0.2,
        backgroundColor: '#fff',
    },
    rightBadge: {
        left: PIE_RADIUS * 0.8,
        top: PIE_RADIUS * 1.18,
        backgroundColor: '#223568',
    },
    percentActive: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    percentInactive: {
        color: '#223568',
        fontWeight: 'bold',
        fontSize: 18,
    },
    legendBlock: {
        marginLeft: 32,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    legendDot: {
        width: 24,
        height: 24,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 0.7,
        borderColor: '#a4aec1',
    },
    legendText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '400',
    },
});
