import { useDirectorOverview } from '@/hooks/useProgress';
import { CommonCard, HomeSectionHeader, roadmapTheme } from '@/components/ui/design-system';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

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

    return (
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
});

export default OverviewSection;
