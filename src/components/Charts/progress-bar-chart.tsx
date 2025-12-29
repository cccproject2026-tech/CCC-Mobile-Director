import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Line, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ChartData {
    roadmapsTotal: number;
    roadmapsCompleted: number;
    roadmapsRemaining?: number;
    assessmentsTotal: number;
    assessmentsCompleted: number;
    assessmentsRemaining?: number;
}

interface ProgressChartProps {
    data: ChartData;
    showRemaining: boolean;
}

export const ProgressBarChart: React.FC<ProgressChartProps> = ({ data, showRemaining }) => {
    const maxValue = 5;
    const chartHeight = 200;
    const barWidth = 28;
    const barGap = 6;
    const groupGap = 60;
    const paddingHorizontal = 40;

    const barsPerGroup = showRemaining ? 3 : 2;
    const groupWidth = (barsPerGroup * barWidth) + ((barsPerGroup - 1) * barGap);
    const totalContentWidth = (groupWidth * 2) + groupGap + (paddingHorizontal * 2);
    const chartContentWidth = Math.max(SCREEN_WIDTH - 80, totalContentWidth);

    const calculateHeight = (value: number) => {
        return (value / maxValue) * chartHeight;
    };

    const calculateY = (value: number) => {
        return chartHeight - calculateHeight(value);
    };

    const LegendItem = ({ colors, label }: { colors: string[]; label: string }) => (
        <View style={styles.legendItem}>
            <Svg width={32} height={16}>
                <Defs>
                    <SvgLinearGradient id={`legend-${label}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={colors[0]} stopOpacity="1" />
                        <Stop offset="1" stopColor={colors[1]} stopOpacity="1" />
                    </SvgLinearGradient>
                </Defs>
                <Rect x="0" y="0" width="32" height="16" fill={`url(#legend-${label})`} rx="2" />
            </Svg>
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );

    return (
        <View style={styles.chartContainer}>

            <View style={styles.legendContainer}>
                <LegendItem colors={['#7B8DB8', '#4A5A7F']} label="Total" />
                <LegendItem colors={['#6B8EFF', '#4A5FD9']} label="Completed" />
                {showRemaining && (
                    <LegendItem colors={['#5EC4D3', '#3AA8B8']} label="Remaining" />
                )}
            </View>


            <View style={styles.chartWrapper}>

                <View style={styles.yAxisContainer}>
                    {[5, 4, 3, 2, 1, 0].map((value) => (
                        <Text key={value} style={styles.yAxisLabel}>
                            {value}
                        </Text>
                    ))}
                </View>


                <View style={styles.chartAreaWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ width: chartContentWidth }}
                    >
                        <View>

                            <Svg width={chartContentWidth} height={chartHeight}>
                                <Defs>
                                    <SvgLinearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#7B8DB8" stopOpacity="1" />
                                        <Stop offset="1" stopColor="#4A5A7F" stopOpacity="1" />
                                    </SvgLinearGradient>
                                    <SvgLinearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#6B8EFF" stopOpacity="1" />
                                        <Stop offset="1" stopColor="#4A5FD9" stopOpacity="1" />
                                    </SvgLinearGradient>
                                    <SvgLinearGradient id="remainingGradient" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#5EC4D3" stopOpacity="1" />
                                        <Stop offset="1" stopColor="#3AA8B8" stopOpacity="1" />
                                    </SvgLinearGradient>
                                </Defs>


                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <Line
                                        key={i}
                                        x1="0"
                                        y1={i * (chartHeight / 5)}
                                        x2={chartContentWidth}
                                        y2={i * (chartHeight / 5)}
                                        stroke="#1A5A7F"
                                        strokeWidth="1"
                                    />
                                ))}


                                {(() => {
                                    const startX = (chartContentWidth - totalContentWidth) / 2 + paddingHorizontal;
                                    const roadmapsX = startX;

                                    const roadmapsTotalHeight = calculateHeight(data.roadmapsTotal);
                                    const roadmapsTotalY = calculateY(data.roadmapsTotal);

                                    const roadmapsCompletedX = roadmapsX + barWidth + barGap;
                                    const roadmapsCompletedHeight = calculateHeight(data.roadmapsCompleted);
                                    const roadmapsCompletedY = calculateY(data.roadmapsCompleted);

                                    const roadmapsRemainingX = roadmapsCompletedX + barWidth + barGap;
                                    const roadmapsRemainingHeight = data.roadmapsRemaining ? calculateHeight(data.roadmapsRemaining) : 0;
                                    const roadmapsRemainingY = data.roadmapsRemaining ? calculateY(data.roadmapsRemaining) : chartHeight;

                                    const assessmentsX = roadmapsX + groupWidth + groupGap;

                                    const assessmentsTotalHeight = calculateHeight(data.assessmentsTotal);
                                    const assessmentsTotalY = calculateY(data.assessmentsTotal);

                                    const assessmentsCompletedX = assessmentsX + barWidth + barGap;
                                    const assessmentsCompletedHeight = calculateHeight(data.assessmentsCompleted);
                                    const assessmentsCompletedY = calculateY(data.assessmentsCompleted);

                                    const assessmentsRemainingX = assessmentsCompletedX + barWidth + barGap;
                                    const assessmentsRemainingHeight = data.assessmentsRemaining ? calculateHeight(data.assessmentsRemaining) : 0;
                                    const assessmentsRemainingY = data.assessmentsRemaining ? calculateY(data.assessmentsRemaining) : chartHeight;

                                    return (
                                        <>
                                            <Rect
                                                x={roadmapsX}
                                                y={roadmapsTotalY}
                                                width={barWidth}
                                                height={roadmapsTotalHeight}
                                                fill="url(#totalGradient)"
                                                rx="2"
                                            />
                                            <Rect
                                                x={roadmapsCompletedX}
                                                y={roadmapsCompletedY}
                                                width={barWidth}
                                                height={roadmapsCompletedHeight}
                                                fill="url(#completedGradient)"
                                                rx="2"
                                            />
                                            {showRemaining && data.roadmapsRemaining !== undefined && (
                                                <Rect
                                                    x={roadmapsRemainingX}
                                                    y={roadmapsRemainingY}
                                                    width={barWidth}
                                                    height={roadmapsRemainingHeight}
                                                    fill="url(#remainingGradient)"
                                                    rx="2"
                                                />
                                            )}

                                            <Rect
                                                x={assessmentsX}
                                                y={assessmentsTotalY}
                                                width={barWidth}
                                                height={assessmentsTotalHeight}
                                                fill="url(#totalGradient)"
                                                rx="2"
                                            />
                                            <Rect
                                                x={assessmentsCompletedX}
                                                y={assessmentsCompletedY}
                                                width={barWidth}
                                                height={assessmentsCompletedHeight}
                                                fill="url(#completedGradient)"
                                                rx="2"
                                            />
                                            {showRemaining && data.assessmentsRemaining !== undefined && (
                                                <Rect
                                                    x={assessmentsRemainingX}
                                                    y={assessmentsRemainingY}
                                                    width={barWidth}
                                                    height={assessmentsRemainingHeight}
                                                    fill="url(#remainingGradient)"
                                                    rx="2"
                                                />
                                            )}
                                        </>
                                    );
                                })()}
                            </Svg>


                            <View style={[styles.xAxisContainer, { width: chartContentWidth }]}>
                                <View style={styles.xAxisLabelsWrapper}>
                                    <Text style={styles.xAxisLabel}>Roadmaps</Text>
                                    <Text style={styles.xAxisLabel}>Assessments</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '400',
    },
    chartContainer: {
        width: '100%',
    },
    chartWrapper: {
        flexDirection: 'row',
    },
    yAxisContainer: {
        justifyContent: 'space-between',
        height: 200,
        paddingRight: 12,
        paddingTop: 4,
    },
    yAxisLabel: {
        color: '#8BA5B8',
        fontSize: 12,
        fontWeight: '400',
    },
    chartAreaWrapper: {
        flex: 1,
    },
    xAxisContainer: {
        marginTop: 12,
    },
    xAxisLabelsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
    },
    xAxisLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '400',
        flex: 1,
        textAlign: 'center',
    },
});