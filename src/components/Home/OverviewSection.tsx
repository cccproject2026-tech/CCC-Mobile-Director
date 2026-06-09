import { useDirectorOverview } from '@/hooks/useProgress';
import {
    CommonCard,
    HOME_ICON_COLOR,
    HomeSectionHeader,
    resolveHomeTileAccent,
    roadmapTheme,
} from '@/components/ui/design-system';
import type { HomeTileAccentKey } from '@/components/ui/design-system';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CIRCLE_SIZE = SCREEN_WIDTH * 0.26;

const OVERVIEW_STATS: {
    label: string;
    valueKey: 'totalMentors' | 'totalPastors' | 'completedPastors';
    accentKey: HomeTileAccentKey;
}[] = [
    { label: 'Total Mentors', valueKey: 'totalMentors', accentKey: 'sky' },
    { label: 'Total Pastors', valueKey: 'totalPastors', accentKey: 'violet' },
    { label: 'Completed', valueKey: 'completedPastors', accentKey: 'mint' },
];

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
                {OVERVIEW_STATS.map((stat) => (
                    <StatCircle
                        key={stat.valueKey}
                        label={stat.label}
                        value={data[stat.valueKey]}
                        accentKey={stat.accentKey}
                    />
                ))}
            </View>
        </CommonCard>
    );
};

const StatCircle = ({
    label,
    value,
    accentKey,
}: {
    label: string;
    value: number;
    accentKey: HomeTileAccentKey;
}) => {
    const accent = resolveHomeTileAccent(accentKey);

    return (
        <View style={styles.statBox}>
            <View
                style={[
                    styles.circleOuter,
                    { backgroundColor: accent.tileBg, borderColor: accent.tileBorder },
                ]}
            >
                <View
                    style={[
                        styles.circleInner,
                        { backgroundColor: accent.iconBg, borderColor: accent.tileBorder },
                    ]}
                >
                    <Text style={[styles.circleValue, { color: HOME_ICON_COLOR }]}>{value}</Text>
                    <Text style={styles.circleLabel}>{label}</Text>
                </View>
            </View>
        </View>
    );
};

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
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
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
